import { Order } from '../types';

/**
 * Guest order tracking without exposing the `orders` collection.
 *
 * For each order we write a copy to `order_lookup/{CODE}_{PHONE9}` where CODE is the order ID
 * (and a second doc for the tracking number) and PHONE9 is the last 9 digits of the delivery phone.
 * Firestore rules allow `get` on a single lookup doc but never `list`, so a customer can only
 * open an order when they know both its code and the phone number used.
 */
export const ORDER_LOOKUP_COLLECTION = 'order_lookup';

export const phoneKey = (phone: string) => phone.replace(/\D/g, '').slice(-9);

export const lookupDocId = (code: string, phone: string) => `${code.trim().toUpperCase()}_${phoneKey(phone)}`;

export function lookupDocIds(order: Order): string[] {
  const phone = order.shippingAddress?.phone || '';
  if (phoneKey(phone).length < 9) return [];
  return [lookupDocId(order.id, phone), lookupDocId(order.trackingNumber, phone)];
}

/** Customer-safe copy: no account id, email, or internal GPS routing pin. */
export function toLookupRecord(order: Order): Record<string, any> {
  const { deliveryLocation, userId, userEmail, ...rest } = order;
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
}
