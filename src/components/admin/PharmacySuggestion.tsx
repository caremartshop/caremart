import React, { useState } from 'react';
import { Phone, MessageCircle, CheckCircle2, MapPin, AlertCircle, Navigation, X, Loader2 } from 'lucide-react';
import { FulfillmentPharmacy, Order } from '../../types';
import { FulfillmentNetwork } from '../../hooks/useFulfillmentNetwork';
import { useShop } from '../../context/ShopContext';
import { formatDistance, googleMapsLink, haversineKm, rankPharmaciesByDistance, telLink, whatsappLink } from '../../lib/geo';

interface Props {
  order: Order;
  network: FulfillmentNetwork;
  /** Compact layout for the orders table. */
  compact?: boolean;
  onShowOnMap?: (order: Order) => void;
}

/** Message the admin can send a pharmacy over WhatsApp. CareMart is the only brand mentioned. */
function buildPharmacyMessage(order: Order, pharmacy: FulfillmentPharmacy) {
  const items = order.items.map((i) => `• ${i.quantity} × ${i.product.name}`).join('\n');
  const loc = order.deliveryLocation
    ? `\nDelivery area: ${googleMapsLink(order.deliveryLocation.lat, order.deliveryLocation.lng)}`
    : order.shippingAddress?.city
      ? `\nDelivery area: ${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}`
      : '';
  return `Hello ${pharmacy.name}, this is CareMart.\nOrder ${order.id}:\n${items}${loc}\nPlease confirm availability. Thank you.`;
}

export const PharmacySuggestion: React.FC<Props> = ({ order, network, compact, onShowOnMap }) => {
  const { addToast } = useShop();
  const [busy, setBusy] = useState<string | null>(null);
  const { pharmacies, assignments, assignOrder, unassignOrder } = network;

  const location = order.deliveryLocation;
  const ranked = rankPharmaciesByDistance(location, pharmacies, 3);
  const assignment = assignments[order.id];
  const assignedPharmacy = assignment ? pharmacies.find((p) => p.id === assignment.pharmacyId) : undefined;

  const handleAssign = async (pharmacy: FulfillmentPharmacy, distanceKm?: number) => {
    setBusy(pharmacy.id);
    try {
      await assignOrder(order.id, pharmacy, distanceKm);
      addToast('Order Routed', `${order.id} assigned to ${pharmacy.name}.`);
    } catch (e) {
      console.warn('assignOrder error:', e);
      addToast('Assignment Failed', 'Could not save the assignment. Check your connection.', 'info');
    } finally {
      setBusy(null);
    }
  };

  const handleUnassign = async () => {
    setBusy('unassign');
    try {
      await unassignOrder(order.id);
    } finally {
      setBusy(null);
    }
  };

  const ContactButtons = ({ pharmacy }: { pharmacy: FulfillmentPharmacy }) => (
    <div className="flex items-center gap-1.5 flex-wrap">
      <a
        href={telLink(pharmacy.phone)}
        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold inline-flex items-center gap-1"
        title={`Call ${pharmacy.phone}`}
      >
        <Phone className="w-3 h-3" />
        <span>{compact ? 'Call' : pharmacy.phone}</span>
      </a>
      <a
        href={whatsappLink(pharmacy.whatsapp || pharmacy.phone, buildPharmacyMessage(order, pharmacy))}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 text-[10px] font-extrabold inline-flex items-center gap-1"
        title="Send order details on WhatsApp"
      >
        <MessageCircle className="w-3 h-3" />
        <span>WhatsApp</span>
      </a>
    </div>
  );

  // Order already routed to a pharmacy
  if (assignment) {
    const p = assignedPharmacy;
    const dist = p && location ? haversineKm(location, p) : assignment.distanceKm;
    return (
      <div className="space-y-1.5 min-w-[200px]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Assigned
        </p>
        <p className="font-bold text-slate-900 text-xs">
          {assignment.pharmacyName}
          {dist !== undefined && <span className="text-slate-500 font-medium"> · {formatDistance(dist)}</span>}
        </p>
        {p ? (
          <>
            {p.contactPerson && <p className="text-[10px] text-slate-500">Contact: {p.contactPerson}</p>}
            <ContactButtons pharmacy={p} />
          </>
        ) : (
          <p className="text-[10px] text-amber-700 font-bold">Pharmacy was removed from the network</p>
        )}
        <button
          onClick={handleUnassign}
          disabled={busy !== null}
          className="text-[10px] font-bold text-slate-400 hover:text-red-600 inline-flex items-center gap-1 cursor-pointer"
        >
          <X className="w-3 h-3" /> Unassign
        </button>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="space-y-1 min-w-[180px]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> No GPS pin
        </p>
        <p className="text-[10px] text-slate-500 leading-snug">
          Customer address: {order.shippingAddress?.streetAddress || '—'}, {order.shippingAddress?.city || ''}
        </p>
        {order.shippingAddress?.phone && (
          <a href={telLink(order.shippingAddress.phone)} className="text-[10px] font-bold text-red-600 inline-flex items-center gap-1">
            <Phone className="w-3 h-3" /> Ask customer for location
          </a>
        )}
      </div>
    );
  }

  if (ranked.length === 0) {
    return (
      <div className="min-w-[180px]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> No active pharmacy
        </p>
        <p className="text-[10px] text-slate-500">Register pharmacies in the Pharmacy Network tab.</p>
      </div>
    );
  }

  const [best, ...backups] = ranked;

  return (
    <div className="space-y-1.5 min-w-[200px]">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 flex items-center gap-1">
        <Navigation className="w-3 h-3" /> Nearest pharmacy
      </p>
      <p className="font-bold text-slate-900 text-xs">
        {best.pharmacy.name}
        <span className="text-slate-500 font-medium"> · {formatDistance(best.distanceKm)}</span>
      </p>
      {!compact && <p className="text-[10px] text-slate-500">{best.pharmacy.address}</p>}
      {best.pharmacy.contactPerson && <p className="text-[10px] text-slate-500">Contact: {best.pharmacy.contactPerson}</p>}
      <ContactButtons pharmacy={best.pharmacy} />
      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={() => handleAssign(best.pharmacy, best.distanceKm)}
          disabled={busy !== null}
          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-60 text-white text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
        >
          {busy === best.pharmacy.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          Assign
        </button>
        {onShowOnMap && (
          <button
            onClick={() => onShowOnMap(order)}
            className="text-[10px] font-bold text-slate-500 hover:text-red-600 inline-flex items-center gap-1 cursor-pointer"
          >
            <MapPin className="w-3 h-3" /> Map
          </button>
        )}
        <a
          href={googleMapsLink(location.lat, location.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-slate-500 hover:text-red-600"
        >
          Customer pin ↗
        </a>
      </div>

      {backups.length > 0 && (
        <details className="pt-1">
          <summary className="text-[10px] font-bold text-slate-500 cursor-pointer hover:text-slate-900">
            {backups.length} backup option{backups.length > 1 ? 's' : ''}
          </summary>
          <div className="mt-1.5 space-y-2 pl-2 border-l-2 border-slate-100">
            {backups.map(({ pharmacy, distanceKm }) => (
              <div key={pharmacy.id} className="space-y-1">
                <p className="text-[11px] font-bold text-slate-800">
                  {pharmacy.name} <span className="text-slate-500 font-medium">· {formatDistance(distanceKm)}</span>
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <ContactButtons pharmacy={pharmacy} />
                  <button
                    onClick={() => handleAssign(pharmacy, distanceKm)}
                    disabled={busy !== null}
                    className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[10px] font-extrabold cursor-pointer"
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};
