import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';
import type { Category, Product } from '../src/types';
import { adminDb } from './firebaseAdmin';
import {
  PageMeta,
  SITE_URL,
  categoryMeta,
  categoryPath,
  findProduct,
  pageKeyForPath,
  productMeta,
  productPath,
  renderHeadTags,
  staticPageMeta,
} from '../src/lib/seo';

/**
 * Server-rendered <head> for every page URL, plus a live sitemap.
 * The React app still renders the page; this makes sure Google, WhatsApp and Facebook
 * get the correct title, description, canonical URL and Product data in the very first response.
 */

// ---------- HTML template ----------

let template: string | null = null;

function loadTemplate(): string {
  if (template) return template;
  // The build renames dist/index.html -> dist/app-shell.html so Vercel cannot serve it statically
  for (const name of ['app-shell.html', 'index.html']) {
    const file = path.join(process.cwd(), 'dist', name);
    if (fs.existsSync(file)) {
      template = fs.readFileSync(file, 'utf8');
      return template;
    }
  }
  throw new Error('dist/app-shell.html not found — run `npm run build` first.');
}

// ---------- catalogue cache ----------

interface Catalog {
  products: Product[];
  categories: Category[];
  loadedAt: number;
}
const CATALOG_TTL = 5 * 60 * 1000;
let catalog: Catalog | null = null;
let inflight: Promise<Catalog> | null = null;

async function getCatalog(): Promise<Catalog> {
  if (catalog && Date.now() - catalog.loadedAt < CATALOG_TTL) return catalog;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const db = adminDb();
      const [p, c] = await Promise.all([db.collection('products').get(), db.collection('categories').get()]);
      catalog = {
        products: p.docs.map((d) => ({ ...(d.data() as Product), id: d.id })),
        categories: c.docs.map((d) => ({ ...(d.data() as Category), id: d.id })),
        loadedAt: Date.now(),
      };
    } catch (err) {
      console.warn('SEO catalogue load failed (serving generic tags):', (err as Error).message);
      // keep any stale copy; retry in ~1 minute
      catalog = catalog
        ? { ...catalog, loadedAt: Date.now() - CATALOG_TTL + 60_000 }
        : { products: [], categories: [], loadedAt: Date.now() - CATALOG_TTL + 60_000 };
    } finally {
      inflight = null;
    }
    return catalog!;
  })();
  return inflight;
}

const categoryOf = (product: Product, categories: Category[]) =>
  categories.find((c) => c.slug === product.category || c.name === product.category || c.id === product.category);

// ---------- per-URL metadata ----------

type Resolution = { redirect: string } | { meta: PageMeta; noscript: string };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Plain-HTML summary + links, for crawlers and link previews that don't run JavaScript. */
function noscriptBlock(meta: PageMeta, links: { href: string; label: string }[], extra = ''): string {
  const list = links.length
    ? `<ul>${links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul>`
    : '';
  return `<noscript><main><h1>${esc(meta.title)}</h1><p>${esc(meta.description)}</p>${extra}${list}<p><a href="/contact">Contact CareMart</a></p></main></noscript>`;
}

async function resolve(url: URL): Promise<Resolution> {
  const key = pageKeyForPath(url.pathname);
  const productParam = url.searchParams.get('product');

  // Old product links (/shop?product=ID or /?product=ID) -> permanent redirect to the clean URL
  if (productParam && (key === 'shop' || key === 'home')) {
    const { products } = await getCatalog();
    const product = findProduct(products, productParam);
    return { redirect: product ? productPath(product) : '/shop' };
  }

  if (key === 'product-detail') {
    const ref = decodeURIComponent(url.pathname.split('/')[2] || '');
    const { products, categories } = await getCatalog();
    const product = findProduct(products, ref);
    if (!product) {
      // Catalogue unavailable: don't 404 real products, just serve generic tags
      if (products.length === 0) return { meta: { ...staticPageMeta('shop'), canonical: SITE_URL + url.pathname }, noscript: '' };
      const meta = staticPageMeta('not-found');
      return { meta, noscript: noscriptBlock(meta, [{ href: '/shop', label: 'Browse all products' }]) };
    }
    const canonicalPath = productPath(product);
    if (url.pathname !== canonicalPath) return { redirect: canonicalPath }; // e.g. accessed by id
    const meta = productMeta(product, categoryOf(product, categories));
    const price = `<p>Price: ${Math.round(product.price).toLocaleString('en-US')} Frw — ${product.inStock === false ? 'Out of stock' : 'In stock'}</p>`;
    return {
      meta,
      noscript: noscriptBlock(meta, [{ href: '/shop', label: 'More products' }], price),
    };
  }

  if (key === 'shop') {
    const { products, categories } = await getCatalog();
    const slug = url.searchParams.get('category');
    const category = slug ? categories.find((c) => c.slug === slug) : undefined;
    const meta = category ? categoryMeta(category) : staticPageMeta('shop');
    const inView = category ? products.filter((p) => categoryOf(p, categories)?.id === category.id) : products;
    return {
      meta,
      noscript: noscriptBlock(
        meta,
        inView.slice(0, 200).map((p) => ({ href: productPath(p), label: p.name }))
      ),
    };
  }

  if (key === 'home' || key === 'categories') {
    const { products, categories } = await getCatalog();
    const meta = staticPageMeta(key);
    return {
      meta,
      noscript: noscriptBlock(meta, [
        ...categories.map((c) => ({ href: categoryPath(c), label: c.name })),
        ...products.slice(0, 100).map((p) => ({ href: productPath(p), label: p.name })),
      ]),
    };
  }

  if (key) {
    const meta = staticPageMeta(key);
    return { meta, noscript: noscriptBlock(meta, []) };
  }

  const meta = staticPageMeta('not-found');
  return { meta, noscript: noscriptBlock(meta, [{ href: '/', label: 'Go to the CareMart home page' }]) };
}

function injectIntoTemplate(meta: PageMeta, noscript: string): string {
  const html = loadTemplate();
  const head = renderHeadTags(meta);
  return html
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n    ${head}\n    <!--seo:end-->`)
    .replace('<!--ssr:noscript-->', noscript);
}

/** Express handler for every HTML page URL. */
export async function renderPage(req: Request, res: Response) {
  try {
    const url = new URL(req.originalUrl || req.url, SITE_URL);
    const result = await resolve(url);
    if ('redirect' in result) {
      return res.redirect(301, result.redirect);
    }
    const status = result.meta.status || 200;
    res
      .status(status)
      .set('Content-Type', 'text/html; charset=utf-8')
      // Cache at the CDN for 10 minutes, serve stale while refreshing (prices update within minutes)
      .set('Cache-Control', status === 200 ? 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400' : 'public, max-age=0, s-maxage=60')
      .send(injectIntoTemplate(result.meta, result.noscript));
  } catch (err) {
    console.error('renderPage error:', err);
    try {
      res.status(200).set('Content-Type', 'text/html; charset=utf-8').set('Cache-Control', 'no-store').send(loadTemplate());
    } catch {
      res.status(500).send('Temporary error. Please refresh.');
    }
  }
}

// ---------- sitemap ----------

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const day = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
};

export async function renderSitemap(_req: Request, res: Response) {
  const { products, categories } = await getCatalog();
  const today = day();
  const staticPages: [string, string, string][] = [
    ['/', 'daily', '1.0'],
    ['/shop', 'daily', '0.9'],
    ['/categories', 'weekly', '0.8'],
    ['/contact', 'monthly', '0.7'],
    ['/track-order', 'monthly', '0.6'],
    ['/faq', 'monthly', '0.6'],
    ['/privacy', 'yearly', '0.3'],
    ['/terms', 'yearly', '0.3'],
  ];

  const urls: string[] = [
    ...staticPages.map(
      ([p, freq, pri]) => `<url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`
    ),
    ...categories
      .filter((c) => c.slug)
      .map((c) => `<url><loc>${xml(SITE_URL + categoryPath(c))}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
    ...products.map((p) => {
      const images = (p.images || [])
        .filter((src) => /^https?:\/\//.test(src) && !/\.(mp4|webm|mov|m3u8)(\?|$)/i.test(src) && !src.includes('/video/upload/'))
        .slice(0, 5)
        .map((src) => `<image:image><image:loc>${xml(src)}</image:loc><image:title>${xml(p.name)}</image:title></image:image>`)
        .join('');
      return `<url><loc>${xml(SITE_URL + productPath(p))}</loc><lastmod>${day(p.createdAt)}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority>${images}</url>`;
    }),
  ];

  res
    .status(200)
    .set('Content-Type', 'application/xml; charset=utf-8')
    .set('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`
    );
}
