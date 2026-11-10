import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import type { CartItem, Coupon, GeoPoint, Order, Product, ShippingAddress } from '../src/types';
import { ORDER_LOOKUP_COLLECTION, lookupDocIds, toLookupRecord } from '../src/lib/orderLookup';
import { HttpError, adminDb, getOptionalUser } from './firebaseAdmin';
import { normalizePhoneNumber, paypackCashin, paypackTransactionStatus } from './paypack';

/**
 * Server-authoritative checkout.
 *
 * 1. POST /api/checkout/start   — server re-prices the cart from Firestore, stores a pending checkout,
 *                                 and sends the Paypack prompt for THAT amount.
 * 2. GET  /api/checkout/status/:checkoutId — polls Paypack; once paid, the server itself creates the order.
 *
 * Browsers can no longer write orders (see firestore.rules), so prices, totals and "paid" status
 * cannot be faked from the client.
 */

const PENDING = 'pending_checkouts';
const MAX_LINES = 50;
const MAX_QTY = 99;
const MIN_PAYPACK_AMOUNT = 100;
const SHIPPING_FEE = 0; // free delivery
const TAX = 0;

type PaymentMethod = Extract<Order['paymentMethod'], 'MTN MoMo (Paypack)' | 'Airtel Money (Paypack)'>;

interface PendingCheckout {
  status: 'awaiting_payment' | 'completed' | 'failed';
  userId: string;
  isGuest: boolean;
  userEmail?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  shippingAddress: ShippingAddress;
  deliveryLocation?: GeoPoint;
  paymentMethod: PaymentMethod;
  paymentPhone: string;
  paypackRef?: string;
  orderId?: string;
  failureReason?: string;
  createdAt: string;
}

/** Firestore rejects `undefined`; remove such keys at any depth. */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripUndefined) as T;
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    ) as T;
  }
  return value;
}

// ---------- validation helpers ----------

const str = (v: unknown, field: string, { required = false, max = 200 } = {}): string | undefined => {
  if (v === undefined || v === null || v === '') {
    if (required) throw new HttpError(400, `${field} is required.`);
    return undefined;
  }
  if (typeof v !== 'string') throw new HttpError(400, `${field} must be text.`);
  const trimmed = v.trim();
  if (required && !trimmed) throw new HttpError(400, `${field} is required.`);
  if (trimmed.length > max) throw new HttpError(400, `${field} is too long.`);
  return trimmed;
};

function parseAddress(raw: any): ShippingAddress {
  if (!raw || typeof raw !== 'object') throw new HttpError(400, 'Shipping address is required.');
  return {
    fullName: str(raw.fullName, 'Full name', { required: true })!,
    streetAddress: str(raw.streetAddress, 'Street address', { required: true })!,
    apartment: str(raw.apartment, 'Apartment'),
    city: str(raw.city, 'City', { required: true })!,
    state: str(raw.state, 'State') || '',
    postalCode: str(raw.postalCode, 'Postal code', { max: 20 }) || '',
    country: 'Rwanda',
    phone: str(raw.phone, 'Phone', { required: true, max: 30 })!,
    deliveryInstructions: str(raw.deliveryInstructions, 'Delivery instructions', { max: 500 }),
  };
}

function parseLocation(raw: any): GeoPoint | undefined {
  if (!raw) return undefined;
  const lat = Number(raw.lat);
  const lng = Number(raw.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined;
  const accuracy = Number(raw.accuracy);
  return {
    lat,
    lng,
    ...(Number.isFinite(accuracy) && accuracy >= 0 ? { accuracy: Math.round(accuracy) } : {}),
    source: raw.source === 'gps' ? 'gps' : 'map',
  };
}

function parseLines(raw: any): { productId: string; quantity: number; selectedVariant?: string }[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new HttpError(400, 'Your cart is empty.');
  if (raw.length > MAX_LINES) throw new HttpError(400, 'Too many items in one order.');
  return raw.map((line: any) => {
    const productId = str(line?.productId, 'Product', { required: true, max: 100 })!;
    const quantity = Number(line?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new HttpError(400, 'Invalid quantity in cart.');
    }
    return { productId, quantity, selectedVariant: str(line?.selectedVariant, 'Variant', { max: 100 }) };
  });
}

// ---------- pricing (the single source of truth) ----------

async function priceCart(lines: ReturnType<typeof parseLines>, couponCode?: string) {
  const db = adminDb();
  const snaps = await db.getAll(...lines.map((l) => db.collection('products').doc(l.productId)));

  const items: CartItem[] = lines.map((line, i) => {
    const snap = snaps[i];
    if (!snap.exists) throw new HttpError(409, 'A product in your cart is no longer available. Please refresh your cart.');
    const product = { ...(snap.data() as Product), id: snap.id };
    if (product.inStock === false) throw new HttpError(409, `${product.name} is out of stock.`);
    if (typeof product.price !== 'number' || !(product.price > 0)) {
      throw new HttpError(409, `${product.name} cannot be purchased right now.`);
    }
    return { product, quantity: line.quantity, ...(line.selectedVariant ? { selectedVariant: line.selectedVariant } : {}) };
  });

  const subtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

  let discount = 0;
  let appliedCode: string | undefined;
  if (couponCode) {
    const all = await db.collection('coupons').get();
    const coupon = all.docs
      .map((d) => d.data() as Coupon)
      .find((c) => c.code?.toUpperCase() === couponCode.toUpperCase() && c.active);
    if (!coupon) throw new HttpError(409, 'This coupon is expired or invalid. Please remove it and try again.');
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      throw new HttpError(409, `Coupon ${coupon.code} requires a minimum spend of ${coupon.minSpend.toLocaleString()} Frw.`);
    }
    const pct = Math.min(100, Math.max(0, Number(coupon.discountPercent) || 0));
    discount = (subtotal * pct) / 100;
    appliedCode = coupon.code;
  }

  const total = Math.round(Math.max(0, subtotal - discount + SHIPPING_FEE + TAX));
  return { items, subtotal, discount, total, couponCode: appliedCode };
}

// ---------- order creation (idempotent) ----------

const randomOrderId = () => 'ORD-' + crypto.randomInt(100000, 1000000);
const randomTracking = () => 'SS-TRK-' + crypto.randomBytes(6).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g, 'X').slice(0, 8);

/** Creates the real order exactly once for a paid checkout. Safe to call repeatedly / concurrently. */
async function finalizeCheckout(checkoutId: string, paidRef: string): Promise<Order> {
  const db = adminDb();
  const pendingRef = db.collection(PENDING).doc(checkoutId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(pendingRef);
    if (!snap.exists) throw new HttpError(404, 'Checkout not found.');
    const pending = snap.data() as PendingCheckout;

    if (pending.status === 'completed' && pending.orderId) {
      const existing = await tx.get(db.collection('orders').doc(pending.orderId));
      return existing.data() as Order;
    }
    if (pending.paypackRef !== paidRef) throw new HttpError(409, 'Payment reference mismatch.');

    // Pick an unused order id
    let orderId = '';
    for (let i = 0; i < 6 && !orderId; i++) {
      const candidate = randomOrderId();
      if (!(await tx.get(db.collection('orders').doc(candidate))).exists) orderId = candidate;
    }
    if (!orderId) throw new HttpError(500, 'Could not allocate an order number. Please contact support.');

    const now = new Date();
    const order: Order = {
      id: orderId,
      userId: pending.userId,
      isGuest: pending.isGuest,
      userEmail: pending.userEmail,
      items: pending.items,
      subtotal: pending.subtotal,
      discount: pending.discount,
      shipping: pending.shipping,
      tax: pending.tax,
      total: pending.total,
      status: 'Processing',
      shippingAddress: pending.shippingAddress,
      deliveryLocation: pending.deliveryLocation,
      paymentMethod: pending.paymentMethod,
      paymentRef: paidRef,
      createdAt: now.toISOString(),
      estimatedDeliveryDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      discretePackaging: true,
      trackingNumber: randomTracking(),
      couponCode: pending.couponCode,
    };

    tx.create(db.collection('orders').doc(orderId), stripUndefined(order));
    for (const id of lookupDocIds(order)) {
      tx.set(db.collection(ORDER_LOOKUP_COLLECTION).doc(id), stripUndefined(toLookupRecord(order)));
    }
    tx.update(pendingRef, { status: 'completed', orderId, completedAt: now.toISOString() });
    return stripUndefined(order);
  });
}

/** Checks Paypack for a pending checkout and finalizes it when paid. */
async function settleCheckout(checkoutId: string, pending: PendingCheckout) {
  if (!pending.paypackRef) return { status: 'pending' as const };
  const { status, amount } = await paypackTransactionStatus(pending.paypackRef);

  if (status === 'successful') {
    if (amount !== null && amount < pending.total) {
      await adminDb().collection(PENDING).doc(checkoutId).update({
        status: 'failed',
        failureReason: `Paid amount ${amount} is less than order total ${pending.total}.`,
      });
      return { status: 'failed' as const, error: 'The amount paid does not match the order total. Please contact support.' };
    }
    const order = await finalizeCheckout(checkoutId, pending.paypackRef);
    return { status: 'successful' as const, order };
  }
  if (status === 'failed') {
    await adminDb().collection(PENDING).doc(checkoutId).update({ status: 'failed', failureReason: 'Payment declined or cancelled.' });
    return { status: 'failed' as const, error: 'Payment was cancelled or declined on the phone.' };
  }
  return { status: 'pending' as const };
}

/** Called from the verified Paypack webhook so paid orders are created even if the customer closed the page. */
export async function settleCheckoutByPaypackRef(ref: string) {
  const db = adminDb();
  const match = await db.collection(PENDING).where('paypackRef', '==', ref).limit(1).get();
  if (match.empty) return;
  const doc = match.docs[0];
  const pending = doc.data() as PendingCheckout;
  if (pending.status !== 'awaiting_payment') return;
  await settleCheckout(doc.id, pending);
}

// ---------- routes ----------

const sendError = (res: Response, err: unknown, context: string) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, error: err.message, ...(err.extra || {}) });
  }
  console.error(`${context} error:`, err);
  return res.status(500).json({ success: false, error: (err as Error)?.message || 'Server error.' });
};

export const checkoutRouter = Router();

checkoutRouter.post('/start', async (req: Request, res: Response) => {
  try {
    const user = await getOptionalUser(req.get('authorization'));
    const body = req.body || {};

    const lines = parseLines(body.items);
    const shippingAddress = parseAddress(body.shippingAddress);
    const deliveryLocation = parseLocation(body.deliveryLocation);
    const couponCode = str(body.couponCode, 'Coupon', { max: 50 });
    const paymentMethod: PaymentMethod = String(body.paymentMethod || '').toLowerCase().includes('airtel')
      ? 'Airtel Money (Paypack)'
      : 'MTN MoMo (Paypack)';

    const paymentPhone = normalizePhoneNumber(str(body.paymentPhone, 'Payment phone', { required: true, max: 30 }));
    if (!/^0\d{9}$/.test(paymentPhone)) throw new HttpError(400, 'Please enter a valid Rwandan mobile money number (e.g. 0788123456).');

    const priced = await priceCart(lines, couponCode);
    if (priced.total < MIN_PAYPACK_AMOUNT) {
      throw new HttpError(400, `Mobile money payments require a total of at least ${MIN_PAYPACK_AMOUNT} Frw.`);
    }

    // If the browser showed a different total (e.g. a price changed), stop before charging.
    const expectedTotal = Number(body.expectedTotal);
    if (Number.isFinite(expectedTotal) && Math.round(expectedTotal) !== priced.total) {
      throw new HttpError(409, `Prices have changed. Your new total is ${priced.total.toLocaleString()} Frw — please review and try again.`, {
        total: priced.total,
      });
    }

    const checkoutId = crypto.randomUUID();
    const pending: PendingCheckout = {
      status: 'awaiting_payment',
      userId: user?.uid || 'guest',
      isGuest: !user,
      userEmail: user?.email,
      items: priced.items,
      subtotal: priced.subtotal,
      discount: priced.discount,
      shipping: SHIPPING_FEE,
      tax: TAX,
      total: priced.total,
      couponCode: priced.couponCode,
      shippingAddress,
      deliveryLocation,
      paymentMethod,
      paymentPhone,
      createdAt: new Date().toISOString(),
    };
    const pendingRef = adminDb().collection(PENDING).doc(checkoutId);
    await pendingRef.set(stripUndefined(pending));

    let ref: string;
    try {
      ({ ref } = await paypackCashin(priced.total, paymentPhone));
    } catch (err) {
      await pendingRef.update({ status: 'failed', failureReason: (err as Error).message });
      throw new HttpError(502, (err as Error).message);
    }
    await pendingRef.update({ paypackRef: ref });

    return res.json({ success: true, checkoutId, ref, total: priced.total, phone: paymentPhone });
  } catch (err) {
    return sendError(res, err, 'checkout/start');
  }
});

checkoutRouter.get('/status/:checkoutId', async (req: Request, res: Response) => {
  try {
    const { checkoutId } = req.params;
    if (!/^[0-9a-f-]{36}$/i.test(checkoutId)) throw new HttpError(400, 'Invalid checkout id.');

    const snap = await adminDb().collection(PENDING).doc(checkoutId).get();
    if (!snap.exists) throw new HttpError(404, 'Checkout not found.');
    const pending = snap.data() as PendingCheckout;

    if (pending.status === 'completed' && pending.orderId) {
      const order = (await adminDb().collection('orders').doc(pending.orderId).get()).data();
      return res.json({ success: true, status: 'successful', order });
    }
    if (pending.status === 'failed') {
      return res.json({ success: true, status: 'failed', error: pending.failureReason || 'Payment failed.' });
    }

    const result = await settleCheckout(checkoutId, pending);
    return res.json({ success: true, ...result });
  } catch (err) {
    return sendError(res, err, 'checkout/status');
  }
});
