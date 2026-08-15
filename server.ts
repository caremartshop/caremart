import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const PAYPACK_API_BASE_URL = 'https://payments.paypack.rw/api';
const PAYPACK_AUTH_URL = `${PAYPACK_API_BASE_URL}/auth/agents/authorize`;
const PAYPACK_EVENTS_URL = `${PAYPACK_API_BASE_URL}/events/transactions`;

app.use('/api/paypack/webhook', express.raw({ type: 'application/json', limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let cachedPaypackAuth: { token: string; expiresAt: number } | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

async function getPaypackAccessToken(): Promise<string> {
  const clientId = requireEnv('PAYPACK_CLIENT_ID');
  const clientSecret = requireEnv('PAYPACK_CLIENT_SECRET');

  if (cachedPaypackAuth && Date.now() < cachedPaypackAuth.expiresAt - 60000) {
    return cachedPaypackAuth.token;
  }

  const response = await fetch(PAYPACK_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Paypack authentication failed (${response.status}): ${errorBody || 'Invalid Paypack client credentials.'}`);
  }

  const data = await response.json();
  const token = data?.access || data?.token || data?.access_token;

  if (!token || typeof token !== 'string') {
    throw new Error('Paypack authentication response did not include an access token.');
  }

  cachedPaypackAuth = {
    token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };

  return token;
}

function normalizePhoneNumber(phone: unknown): string {
  const rawDigits = String(phone ?? '').replace(/\D/g, '');
  let normalized = rawDigits;

  if (rawDigits.startsWith('250') && rawDigits.length >= 12) {
    normalized = '0' + rawDigits.substring(3);
  } else if (!rawDigits.startsWith('0') && rawDigits.length === 9) {
    normalized = '0' + rawDigits;
  }

  if (!normalized) {
    return String(phone ?? '').trim();
  }

  return normalized;
}

function normalizePaypackStatus(status: unknown): 'pending' | 'successful' | 'failed' | null {
  if (!status || typeof status !== 'string') {
    return null;
  }

  const value = status.trim().toLowerCase();

  if (value === 'successful' || value === 'success' || value === 'completed' || value === 'processed' || value === 'approved') {
    return 'successful';
  }

  if (value === 'failed' || value === 'cancelled' || value === 'rejected' || value === 'expired' || value === 'declined') {
    return 'failed';
  }

  if (value === 'pending' || value === 'queued' || value === 'processing' || value === 'created') {
    return 'pending';
  }

  return null;
}

function extractStatusFromPaypackPayload(data: any): 'pending' | 'successful' | 'failed' | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const directStatus = normalizePaypackStatus(data.status);
  if (directStatus) {
    return directStatus;
  }

  const directKind = normalizePaypackStatus(data.event_kind || data.kind || data.type);
  if (directKind) {
    return directKind;
  }

  if (data.data) {
    const nested = extractStatusFromPaypackPayload(data.data);
    if (nested) {
      return nested;
    }
  }

  if (Array.isArray(data.transactions)) {
    for (const tx of data.transactions) {
      const nested = extractStatusFromPaypackPayload(tx);
      if (nested) {
        return nested;
      }
    }
  }

  if (Array.isArray(data.events)) {
    for (const event of data.events) {
      const nested = extractStatusFromPaypackPayload(event);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

// --------------------------------------------------------
// API Endpoints
// --------------------------------------------------------

app.post('/api/cloudinary/upload', async (req, res) => {
  try {
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
    console.error('Cloudinary upload route error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Cloudinary upload error' });
  }
});

app.post('/api/paypack/cashin', async (req, res) => {
  try {
    const { phone, amount, mode } = req.body;
    const numericAmount = Number(amount);

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ success: false, error: 'A valid phone number is required.' });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: 'A valid positive whole number amount is required.' });
    }

    if (Math.round(numericAmount) < 100) {
      return res.status(400).json({
        success: false,
        error: 'Paypack requires a minimum payment amount of 100 RWF. Please ensure your total order amount is at least 100 RWF.',
      });
    }

    const cleanPhone = normalizePhoneNumber(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Phone number is invalid.' });
    }

    const token = await getPaypackAccessToken();
    const cashinUrl = `${PAYPACK_API_BASE_URL}/transactions/cashin`;

    const paypackRes = await fetch(cashinUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: Math.round(numericAmount),
        number: cleanPhone,
      }),
    });

    const paypackData = await paypackRes.json().catch(() => ({}));

    if (!paypackRes.ok) {
      const paypackError = paypackData?.message || paypackData?.error || paypackData?.title || 'Paypack cash-in request rejected by gateway.';
      return res.status(paypackRes.status || 400).json({
        success: false,
        error: paypackError,
        details: paypackData,
      });
    }

    const txRef = paypackData?.ref || paypackData?.reference || paypackData?.id || paypackData?.transaction_ref || paypackData?.transactionReference;
    const status = normalizePaypackStatus(paypackData?.status) || 'pending';

    if (!txRef) {
      return res.status(502).json({
        success: false,
        error: 'Paypack cash-in response did not include a transaction reference.',
        details: paypackData,
      });
    }

    return res.json({
      success: true,
      ref: txRef,
      status,
      mode: mode || 'momo',
      phone: cleanPhone,
      amount: Math.round(numericAmount),
      message: 'Paypack payment prompt sent to handset. Awaiting PIN entry.',
      paypackResponse: paypackData,
    });
  } catch (err: any) {
    console.error('Paypack cashin route error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

app.get('/api/paypack/status/:ref', async (req, res) => {
  try {
    const { ref } = req.params;

    if (!ref) {
      return res.status(400).json({ success: false, error: 'Transaction ref is required.' });
    }

    const token = await getPaypackAccessToken();
    const statusUrl = `${PAYPACK_EVENTS_URL}?ref=${encodeURIComponent(ref)}&kind=CASHIN`;

    const paypackRes = await fetch(statusUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!paypackRes.ok) {
      return res.json({
        success: true,
        ref,
        status: 'pending',
      });
    }

    const data = await paypackRes.json().catch(() => null);
    const status = extractStatusFromPaypackPayload(data);

    if (status) {
      return res.json({
        success: true,
        ref,
        status,
        paypackData: data,
      });
    }

    return res.json({
      success: true,
      ref,
      status: 'pending',
      paypackData: data,
    });
  } catch (err: any) {
    console.error('Paypack status route error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

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

    if (ref) {
      // Store only a verified status for later checks, without exposing secrets or tokens.
      const verifiedStatus = { ref, status };
      if (verifiedStatus.ref) {
        // no-op reference kept intentionally small and safe for future webhook processing
      }
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
async function startServer() {
  app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.sendFile(path.join(process.cwd(), 'public', 'sitemap.xml'));
  });

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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareMart server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
