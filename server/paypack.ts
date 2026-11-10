const PAYPACK_API_BASE_URL = 'https://payments.paypack.rw/api';
const PAYPACK_AUTH_URL = `${PAYPACK_API_BASE_URL}/auth/agents/authorize`;
const PAYPACK_EVENTS_URL = `${PAYPACK_API_BASE_URL}/events/transactions`;

export type PaypackStatus = 'pending' | 'successful' | 'failed';

let cachedPaypackAuth: { token: string; expiresAt: number } | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export async function getPaypackAccessToken(): Promise<string> {
  const clientId = requireEnv('PAYPACK_CLIENT_ID');
  const clientSecret = requireEnv('PAYPACK_CLIENT_SECRET');

  if (cachedPaypackAuth && Date.now() < cachedPaypackAuth.expiresAt - 60000) {
    return cachedPaypackAuth.token;
  }

  const response = await fetch(PAYPACK_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
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

  cachedPaypackAuth = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
  return token;
}

export function normalizePhoneNumber(phone: unknown): string {
  const rawDigits = String(phone ?? '').replace(/\D/g, '');
  let normalized = rawDigits;
  if (rawDigits.startsWith('250') && rawDigits.length >= 12) {
    normalized = '0' + rawDigits.substring(3);
  } else if (!rawDigits.startsWith('0') && rawDigits.length === 9) {
    normalized = '0' + rawDigits;
  }
  return normalized || String(phone ?? '').trim();
}

export function normalizePaypackStatus(status: unknown): PaypackStatus | null {
  if (!status || typeof status !== 'string') return null;
  const value = status.trim().toLowerCase();
  if (['successful', 'success', 'completed', 'processed', 'approved'].includes(value)) return 'successful';
  if (['failed', 'cancelled', 'rejected', 'expired', 'declined'].includes(value)) return 'failed';
  if (['pending', 'queued', 'processing', 'created'].includes(value)) return 'pending';
  return null;
}

export function extractStatusFromPaypackPayload(data: any): PaypackStatus | null {
  if (!data || typeof data !== 'object') return null;
  const direct = normalizePaypackStatus(data.status) || normalizePaypackStatus(data.event_kind || data.kind || data.type);
  if (direct) return direct;
  if (data.data) {
    const nested = extractStatusFromPaypackPayload(data.data);
    if (nested) return nested;
  }
  for (const list of [data.transactions, data.events]) {
    if (Array.isArray(list)) {
      for (const item of list) {
        const nested = extractStatusFromPaypackPayload(item);
        if (nested) return nested;
      }
    }
  }
  return null;
}

/** Finds the paid amount reported for a given ref anywhere in a Paypack payload, if present. */
export function extractAmountForRef(data: any, ref: string): number | null {
  if (!data || typeof data !== 'object') return null;
  if (data.ref === ref && typeof data.amount === 'number') return data.amount;
  for (const value of Object.values(data)) {
    if (value && typeof value === 'object') {
      const found = extractAmountForRef(value, ref);
      if (found !== null) return found;
    }
  }
  return null;
}

/** Sends the MoMo/Airtel PIN prompt. Amount must come from the server's own price calculation. */
export async function paypackCashin(amount: number, phone: string): Promise<{ ref: string; raw: any }> {
  const token = await getPaypackAccessToken();
  const res = await fetch(`${PAYPACK_API_BASE_URL}/transactions/cashin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount: Math.round(amount), number: phone }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.error || data?.title || 'Paypack cash-in request rejected by gateway.');
  }
  const ref = data?.ref || data?.reference || data?.id || data?.transaction_ref || data?.transactionReference;
  if (!ref) throw new Error('Paypack cash-in response did not include a transaction reference.');
  return { ref: String(ref), raw: data };
}

export async function paypackTransactionStatus(ref: string): Promise<{ status: PaypackStatus; amount: number | null }> {
  const token = await getPaypackAccessToken();
  const res = await fetch(`${PAYPACK_EVENTS_URL}?ref=${encodeURIComponent(ref)}&kind=CASHIN`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { status: 'pending', amount: null };
  const data = await res.json().catch(() => null);
  return { status: extractStatusFromPaypackPayload(data) || 'pending', amount: extractAmountForRef(data, ref) };
}
