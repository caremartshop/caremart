import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { Auth, getAuth } from 'firebase-admin/auth';
import { isAdminEmail } from '../src/lib/adminAccess';

/**
 * Server-side Firebase with full privileges (bypasses Firestore rules).
 * Needs FIREBASE_SERVICE_ACCOUNT_KEY: the service-account JSON from
 * Firebase console → Project settings → Service accounts → Generate new private key.
 * The value may be the raw JSON or the JSON base64-encoded.
 */
let app: App | null = null;
let db: Firestore | null = null;

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) {
    throw new Error(
      'Missing FIREBASE_SERVICE_ACCOUNT_KEY. Add the Firebase service-account JSON to your environment variables.'
    );
  }
  const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  const account = JSON.parse(json);
  if (typeof account.private_key === 'string') {
    account.private_key = account.private_key.replace(/\\n/g, '\n');
  }
  return account;
}

function adminApp(): App {
  if (!app) {
    app =
      getApps()[0] ??
      (process.env.FIRESTORE_EMULATOR_HOST
        ? initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-caremart' }) // local emulator testing
        : initializeApp({ credential: cert(loadServiceAccount()) }));
  }
  return app;
}

export function adminDb(): Firestore {
  if (!db) {
    db = getFirestore(adminApp());
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // already initialised elsewhere; writes below strip undefined values themselves
    }
  }
  return db;
}

export function adminAuth(): Auth {
  return getAuth(adminApp());
}

export class HttpError extends Error {
  constructor(public status: number, message: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}

/** Verifies an optional "Authorization: Bearer <Firebase ID token>" header. */
export async function getOptionalUser(authHeader: string | undefined) {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new HttpError(401, 'Malformed Authorization header.');
  try {
    const decoded = await adminAuth().verifyIdToken(match[1]);
    return { uid: decoded.uid, email: decoded.email || undefined };
  } catch {
    throw new HttpError(401, 'Your session has expired. Please sign in again.');
  }
}

export async function requireAdmin(authHeader: string | undefined) {
  const user = await getOptionalUser(authHeader);
  if (!user || !isAdminEmail(user.email)) throw new HttpError(403, 'Admin access required.');
  return user;
}
