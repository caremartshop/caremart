import { FulfillmentPharmacy, GeoPoint } from '../types';

/** Kigali city centre — default map view. */
export const KIGALI_CENTER: [number, number] = [-1.9441, 30.0619];

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Straight-line (great-circle) distance in kilometres. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export interface RankedPharmacy {
  pharmacy: FulfillmentPharmacy;
  distanceKm: number;
}

/** Active pharmacies sorted nearest-first relative to the given point. */
export function rankPharmaciesByDistance(
  point: GeoPoint | undefined,
  pharmacies: FulfillmentPharmacy[],
  limit = 3
): RankedPharmacy[] {
  if (!point || !isValidCoord(point.lat, point.lng)) return [];
  return pharmacies
    .filter((p) => p.isActive && isValidCoord(p.lat, p.lng))
    .map((pharmacy) => ({ pharmacy, distanceKm: haversineKm(point, pharmacy) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export function isValidCoord(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/** Normalise a Rwandan phone number to international digits (e.g. 0788123456 → 250788123456). */
export function toInternationalDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('250')) return digits;
  if (digits.startsWith('0') && digits.length === 10) return '250' + digits.slice(1);
  if (digits.length === 9 && digits.startsWith('7')) return '250' + digits;
  return digits;
}

export const telLink = (phone: string) => `tel:+${toInternationalDigits(phone)}`;
export const whatsappLink = (phone: string, text?: string) =>
  `https://wa.me/${toInternationalDigits(phone)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
export const googleMapsLink = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
