import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { checkoutRouter, settleCheckoutByPaypackRef } from './server/checkout';
import { HttpError, requireAdmin } from './server/firebaseAdmin';
import { normalizePaypackStatus } from './server/paypack';
import { renderPage, renderSitemap } from './server/seo';

dotenv.config();

const app = express();
const PORT = 3000;

app.use('/api/paypack/webhook', express.raw({ type: 'application/json', limit: '50mb' }));
// Large limit only for admin media uploads; everything else stays small.
app.use('/api/cloudinary/upload', express.json({ limit: '50mb' }));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ limit: '200kb', extended: true }));

// --------------------------------------------------------
// API Endpoints
// --------------------------------------------------------

app.post('/api/cloudinary/upload', async (req, res) => {
  try {
    await requireAdmin(req.get('authorization'));
    const { file, resourceType = 'auto', folder = 'caremart' } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'File payload is required for Cloudinary upload.' });
    }

    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !apiSecret || !cloudName) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary configuration error: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and CLOUDINARY_CLOUD_NAME must be set.',
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const params = new URLSearchParams();
    params.append('file', file);
    params.append('api_key', apiKey);
    params.append('timestamp', String(timestamp));
    params.append('signature', signature);
    params.append('folder', folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const cloudRes = await fetch(uploadUrl, {
      method: 'POST',
      body: params,
    });

    const data = await cloudRes.json();

    if (cloudRes.ok && (data.secure_url || data.url)) {
      return res.json({
        success: true,
        url: data.secure_url || data.url,
        public_id: data.public_id,
        resource_type: data.resource_type || 'image',
        format: data.format,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        cloud_name: cloudName,
      });
    }

    return res.status(400).json({
      success: false,
      error: data?.error?.message || 'Cloudinary upload failed.',
    });
  } catch (err: any) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    console.error('Cloudinary upload route error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Cloudinary upload error' });
  }
});

// Server-authoritative checkout (prices, Paypack prompt and order creation all happen here)
app.use('/api/checkout', checkoutRouter);

app.post('/api/paypack/webhook', async (req, res) => {
  try {
    const rawBody = req.body;
    const signatureHeader = req.get('x-paypack-signature') || '';
    const webhookSecret = process.env.PAYPACK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({ success: false, error: 'Paypack webhook secret is not configured.' });
    }

    if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing webhook payload.' });
    }

    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    if (!signatureHeader || signatureHeader.length !== expectedSignature.length) {
      return res.status(401).json({ success: false, error: 'Invalid Paypack webhook signature.' });
    }

    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signatureHeader)
    );

    if (!isValidSignature) {
      return res.status(401).json({ success: false, error: 'Invalid Paypack webhook signature.' });
    }

    const payload = JSON.parse(rawBody.toString('utf8') || '{}');
    const ref = payload?.data?.ref || payload?.ref;
    const status = normalizePaypackStatus(payload?.data?.status || payload?.status) || 'pending';

    if (ref && status !== 'pending') {
      // Signature verified: settle the matching checkout (creates the order once paid)
      await settleCheckoutByPaypackRef(String(ref)).catch((e) => console.error('Webhook settle error:', e));
    }

    return res.json({ success: true, received: true, ref, status });
  } catch (err: any) {
    console.error('Paypack webhook error:', err);
    return res.status(400).json({ success: false, error: err.message || 'Invalid Paypack webhook payload.' });
  }
});

// --------------------------------------------------------
// Start Express App & Mount Vite
// --------------------------------------------------------
// Live sitemap (all products + categories) and server-rendered SEO tags for every page URL
app.get('/sitemap.xml', renderSitemap);
app.all('/api/*', (_req, res) => res.status(404).json({ success: false, error: 'Not found.' }));

function registerPageRoutes() {
  const distPath = path.join(process.cwd(), 'dist');
  // index: false so "/" goes through renderPage too
  app.use(express.static(distPath, { index: false, maxAge: '1h' }));
  app.get('*', renderPage);
}

if (process.env.VERCEL) {
  // Vercel serves dist/ assets itself and rewrites page URLs to this function
  app.get('*', renderPage);
}

async function startServer() {
  app.get('/robots.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.sendFile(path.join(process.cwd(), 'public', 'robots.txt'));
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    registerPageRoutes();
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareMart server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
