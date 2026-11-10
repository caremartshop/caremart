import type { Category, Product } from '../types';
import { SUPPORT_EMAIL, SUPPORT_PHONE_E164 } from './contact';

/**
 * Page metadata shared by the browser (in-app navigation) and the server (first HTML response),
 * so Google, WhatsApp and Facebook always see the right title, description, canonical URL and
 * structured data for every page.
 */
export const SITE_URL = 'https://tumacaremart.shop';
export const SITE_NAME = 'CareMart Rwanda';
export const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  image: string;
  type: 'website' | 'product';
  /** Page-specific JSON-LD (the site-wide Organization/WebSite graph lives in index.html). */
  jsonLd: object[];
  /** HTTP status the server should send. */
  status?: number;
}

const INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NOINDEX = 'noindex, follow';

const abs = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`);
const clip = (text: string, max: number) => {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1).replace(/[\s,.;:-]+\S*$/, '') + '…';
};

export const productPath = (p: Pick<Product, 'id' | 'slug'>) => `/product/${encodeURIComponent(p.slug || p.id)}`;
export const categoryPath = (c: Pick<Category, 'slug'>) => `/shop?category=${encodeURIComponent(c.slug)}`;

/** Find a product by id or slug (product URLs use the slug). */
export const findProduct = (products: Product[], ref: string | null | undefined) =>
  ref ? products.find((p) => p.id === ref || p.slug === ref || p.slug === decodeURIComponent(ref)) : undefined;

const page = (
  path: string,
  title: string,
  description: string,
  opts: Partial<Pick<PageMeta, 'robots' | 'jsonLd' | 'status'>> = {}
): PageMeta => ({
  title,
  description,
  canonical: abs(path),
  robots: opts.robots || INDEX,
  image: DEFAULT_IMAGE,
  type: 'website',
  jsonLd: opts.jsonLd || [],
  status: opts.status,
});

const breadcrumb = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

export const HOME_DESCRIPTION =
  'Order health, wellness, intimate care and pharmacy products online in Rwanda. Fast, confidential delivery in Kigali in plain packaging. Pay with MTN MoMo or Airtel Money.';

/** Metadata for app pages that don't depend on catalogue data. */
export function staticPageMeta(pageKey: string): PageMeta {
  switch (pageKey) {
    case 'home':
      return page('/', 'CareMart Rwanda – Online Pharmacy & Health Store, Fast Discreet Delivery', HOME_DESCRIPTION);
    case 'shop':
      return page(
        '/shop',
        'Shop Health, Wellness & Personal Care Products | CareMart Rwanda',
        'Browse health, wellness, intimate care and personal care products with fast, discreet delivery across Kigali. Pay with MTN MoMo or Airtel Money.',
        { jsonLd: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }])] }
      );
    case 'categories':
      return page(
        '/categories',
        'Product Categories | CareMart Rwanda',
        'Explore CareMart categories: sexual wellness, family planning, test kits, menstrual care, skincare and more — delivered discreetly in Rwanda.'
      );
    case 'contact':
      return page(
        '/contact',
        'Contact CareMart – Call or WhatsApp 0781 015 211',
        `Talk to CareMart support 24/7: call or WhatsApp ${SUPPORT_PHONE_E164} or email ${SUPPORT_EMAIL}. Confidential help with orders and delivery in Rwanda.`,
        {
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'ContactPage',
              url: abs('/contact'),
              mainEntity: { '@id': `${SITE_URL}/#organization` },
            },
          ],
        }
      );
    case 'faq':
      return page(
        '/faq',
        'FAQ – Delivery, Payment & Privacy | CareMart Rwanda',
        'Answers about CareMart delivery times in Kigali, discreet packaging, MTN MoMo and Airtel Money payments, and order tracking.'
      );
    case 'tracking':
      return page(
        '/track-order',
        'Track Your Order | CareMart Rwanda',
        'Track your CareMart order with your order ID and phone number. Real-time delivery status across Kigali.'
      );
    case 'privacy':
      return page('/privacy', 'Privacy Policy | CareMart Rwanda', 'How CareMart protects your personal data and keeps every order confidential.');
    case 'terms':
      return page('/terms', 'Terms & Conditions | CareMart Rwanda', 'Terms and conditions for shopping on CareMart (tumacaremart.shop).');
    case 'cart':
      return page('/cart', 'Your Cart | CareMart Rwanda', HOME_DESCRIPTION, { robots: NOINDEX });
    case 'checkout':
      return page('/checkout', 'Secure Checkout | CareMart Rwanda', HOME_DESCRIPTION, { robots: NOINDEX });
    case 'order-success':
      return page('/order-success', 'Order Confirmed | CareMart Rwanda', HOME_DESCRIPTION, { robots: 'noindex, nofollow' });
    case 'login':
      return page('/login', 'Sign In | CareMart Rwanda', HOME_DESCRIPTION, { robots: NOINDEX });
    case 'register':
      return page('/register', 'Create Account | CareMart Rwanda', HOME_DESCRIPTION, { robots: NOINDEX });
    case 'forgot-password':
      return page('/forgot-password', 'Reset Password | CareMart Rwanda', HOME_DESCRIPTION, { robots: NOINDEX });
    case 'profile':
      return page('/profile', 'My Account | CareMart Rwanda', HOME_DESCRIPTION, { robots: 'noindex, nofollow' });
    case 'wishlist':
      return page('/wishlist', 'My Wishlist | CareMart Rwanda', HOME_DESCRIPTION, { robots: 'noindex, nofollow' });
    case 'admin':
      return page('/admin', 'Admin | CareMart', HOME_DESCRIPTION, { robots: 'noindex, nofollow' });
    default:
      return page('/404', 'Page Not Found | CareMart Rwanda', HOME_DESCRIPTION, { robots: 'noindex, follow', status: 404 });
  }
}

export function categoryMeta(category: Category): PageMeta {
  const path = categoryPath(category);
  return page(
    path,
    clip(`${category.name} – Buy Online in Rwanda | CareMart`, 70),
    clip(
      category.description
        ? `${category.description} Fast, discreet delivery in Kigali. Pay with MTN MoMo or Airtel Money.`
        : `Shop ${category.name} online at CareMart Rwanda with fast, discreet delivery in Kigali.`,
      160
    ),
    {
      jsonLd: [
        breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: category.name, path },
        ]),
      ],
    }
  );
}

export function productMeta(product: Product, category?: Category): PageMeta {
  const path = productPath(product);
  const url = abs(path);
  const images = (product.images || []).filter((src) => /^https?:\/\//.test(src));
  const price = Math.round(product.price);

  const productLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: clip(product.description || product.name, 5000),
    sku: product.id,
    url,
    ...(images.length ? { image: images } : { image: [DEFAULT_IMAGE] }),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(category?.name || product.category ? { category: category?.name || product.category } : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'RWF',
      price,
      availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'RWF' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'RW' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' },
        },
      },
    },
  };
  // Note: no aggregateRating — Google only allows ratings from genuine customer reviews.

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    ...(category ? [{ name: category.name, path: categoryPath(category) }] : []),
    { name: product.name, path },
  ];

  return {
    title: clip(`${product.name} – ${price.toLocaleString('en-US')} Frw | CareMart Rwanda`, 70),
    description: clip(
      `${product.description || product.name} Order online with fast, discreet delivery in Kigali. Pay with MTN MoMo or Airtel Money.`,
      160
    ),
    canonical: url,
    robots: INDEX,
    image: images[0] || DEFAULT_IMAGE,
    type: 'product',
    jsonLd: [productLd, breadcrumb(crumbs)],
  };
}

/** Maps a URL path to an app page key (mirrors the client router). Returns null for unknown paths. */
export function pageKeyForPath(pathname: string): string | null {
  const p = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const map: Record<string, string> = {
    '/': 'home',
    '/shop': 'shop',
    '/categories': 'categories',
    '/contact': 'contact',
    '/contact-us': 'contact',
    '/faq': 'faq',
    '/track-order': 'tracking',
    '/tracking': 'tracking',
    '/track': 'tracking',
    '/privacy': 'privacy',
    '/terms': 'terms',
    '/cart': 'cart',
    '/checkout': 'checkout',
    '/order-success': 'order-success',
    '/order-confirmed': 'order-success',
    '/success': 'order-success',
    '/login': 'login',
    '/register': 'register',
    '/forgot-password': 'forgot-password',
    '/profile': 'profile',
    '/wishlist': 'wishlist',
    '/admin': 'admin',
  };
  if (map[p]) return map[p];
  if (p.startsWith('/product/')) return 'product-detail';
  return null;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** JSON inside <script> must not be able to close the tag. */
const safeJson = (o: object) => JSON.stringify(o).replace(/</g, '\\u003c');

/** The block of tags that lives between <!--seo:start--> and <!--seo:end--> in index.html. */
export function renderHeadTags(meta: PageMeta): string {
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  const c = escapeHtml(meta.canonical);
  const img = escapeHtml(meta.image);
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="${meta.robots}" />`,
    `<link rel="canonical" href="${c}" />`,
    `<meta property="og:type" content="${meta.type === 'product' ? 'product' : 'website'}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:url" content="${c}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    ...meta.jsonLd.map((o) => `<script type="application/ld+json" data-page-jsonld>${safeJson(o)}</script>`),
  ].join('\n    ');
}

/** Browser-side: update the same tags after in-app navigation. */
export function applyMetaToDocument(meta: PageMeta) {
  if (typeof document === 'undefined') return;
  document.title = meta.title;
  const setMeta = (attr: 'name' | 'property', key: string, value: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  };
  setMeta('name', 'description', meta.description);
  setMeta('name', 'robots', meta.robots);
  setMeta('property', 'og:type', meta.type === 'product' ? 'product' : 'website');
  setMeta('property', 'og:url', meta.canonical);
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:image', meta.image);
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', meta.description);
  setMeta('name', 'twitter:image', meta.image);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = meta.canonical;

  document.head.querySelectorAll('script[data-page-jsonld]').forEach((el) => el.remove());
  meta.jsonLd.forEach((o) => {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-page-jsonld', '');
    s.textContent = JSON.stringify(o);
    document.head.appendChild(s);
  });
}
