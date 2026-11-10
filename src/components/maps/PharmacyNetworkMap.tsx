import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { FulfillmentPharmacy, GeoPoint } from '../../types';
import { KIGALI_CENTER, formatDistance, telLink } from '../../lib/geo';
import { pharmacyIcon, inactivePharmacyIcon, orderIcon, pickIcon, OSM_TILE_URL, OSM_ATTRIBUTION } from './mapIcons';

export interface OrderPin {
  orderId: string;
  customerName: string;
  point: GeoPoint;
  /** Pharmacy this order is linked to on the map (assigned one, else nearest). */
  target?: FulfillmentPharmacy;
  distanceKm?: number;
  assigned?: boolean;
}

interface Props {
  pharmacies: FulfillmentPharmacy[];
  orders?: OrderPin[];
  /** When set, clicking the map reports coordinates (used by the pharmacy form). */
  onPick?: (lat: number, lng: number) => void;
  pickedPoint?: { lat: number; lng: number } | null;
  /** Map pans here whenever it changes. */
  focus?: { lat: number; lng: number; zoom?: number } | null;
  height?: number;
}

function ClickToPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FocusController({ focus }: { focus: Props['focus'] }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo([focus.lat, focus.lng], focus.zoom ?? Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [focus?.lat, focus?.lng, focus?.zoom]);
  return null;
}

const PharmacyNetworkMap: React.FC<Props> = ({ pharmacies, orders = [], onPick, pickedPoint, focus, height = 480 }) => {
  return (
    <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-xs relative z-0" style={{ height }}>
      <MapContainer center={KIGALI_CENTER} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
        <FocusController focus={focus} />
        {onPick && <ClickToPick onPick={onPick} />}

        {orders.map((o) =>
          o.target ? (
            <Polyline
              key={`line-${o.orderId}`}
              positions={[
                [o.point.lat, o.point.lng],
                [o.target.lat, o.target.lng],
              ]}
              pathOptions={{ color: o.assigned ? '#059669' : '#dc2626', weight: 2.5, dashArray: o.assigned ? undefined : '6 6', opacity: 0.8 }}
            />
          ) : null
        )}

        {pharmacies.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={p.isActive ? pharmacyIcon : inactivePharmacyIcon}>
            <Popup>
              <div className="text-xs space-y-1 min-w-[160px]">
                <p className="font-extrabold text-slate-900 text-sm">{p.name}</p>
                {!p.isActive && <p className="text-slate-500 font-bold">Inactive</p>}
                <p className="text-slate-600">{p.address}</p>
                {p.contactPerson && <p className="text-slate-600">Contact: {p.contactPerson}</p>}
                <a href={telLink(p.phone)} className="font-bold text-emerald-700">{p.phone}</a>
                {p.openingHours && <p className="text-slate-500">{p.openingHours}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {orders.map((o) => (
          <Marker key={o.orderId} position={[o.point.lat, o.point.lng]} icon={orderIcon}>
            <Popup>
              <div className="text-xs space-y-1 min-w-[160px]">
                <p className="font-extrabold text-slate-900 font-mono">{o.orderId}</p>
                <p className="text-slate-600">{o.customerName}</p>
                {o.target ? (
                  <p className="text-slate-700">
                    {o.assigned ? 'Assigned to' : 'Nearest'}: <b>{o.target.name}</b>
                    {o.distanceKm !== undefined && ` (${formatDistance(o.distanceKm)})`}
                  </p>
                ) : (
                  <p className="text-amber-700 font-bold">No active pharmacy registered</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {pickedPoint && <Marker position={[pickedPoint.lat, pickedPoint.lng]} icon={pickIcon} />}
      </MapContainer>
    </div>
  );
};

export default PharmacyNetworkMap;
