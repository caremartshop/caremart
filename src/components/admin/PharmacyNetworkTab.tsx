import React, { Suspense, lazy, useMemo, useState } from 'react';
import { Building2, Plus, Edit, Trash2, X, MapPin, Phone, Loader2, Navigation, Lock, Power, Search } from 'lucide-react';
import { FulfillmentPharmacy, Order } from '../../types';
import { FulfillmentNetwork } from '../../hooks/useFulfillmentNetwork';
import { useShop } from '../../context/ShopContext';
import { haversineKm, isValidCoord, rankPharmaciesByDistance, telLink } from '../../lib/geo';
import { PharmacySuggestion } from './PharmacySuggestion';
import type { OrderPin } from '../maps/PharmacyNetworkMap';

const PharmacyNetworkMap = lazy(() => import('../maps/PharmacyNetworkMap'));

interface Props {
  orders: Order[];
  network: FulfillmentNetwork;
}

const OPEN_STATUSES: Order['status'][] = ['Processing', 'Packaging', 'Shipped', 'Out for Delivery'];

const emptyForm = {
  name: '',
  contactPerson: '',
  phone: '',
  whatsapp: '',
  address: '',
  coords: '',
  openingHours: '',
  notes: '',
  isActive: true,
};

/** Parse "lat, lng" (as copied from Google Maps) into numbers. */
function parseCoords(text: string): { lat: number; lng: number } | null {
  const m = text.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  return isValidCoord(lat, lng) ? { lat, lng } : null;
}

const fmtCoords = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

export const PharmacyNetworkTab: React.FC<Props> = ({ orders, network }) => {
  const { addToast } = useShop();
  const { pharmacies, assignments, loaded, savePharmacy, deletePharmacy, setPharmacyActive } = network;

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [search, setSearch] = useState('');
  const [routingFilter, setRoutingFilter] = useState<'unassigned' | 'open' | 'all'>('unassigned');

  const pickedPoint = formOpen ? parseCoords(form.coords) : null;

  const openOrders = useMemo(() => orders.filter((o) => OPEN_STATUSES.includes(o.status)), [orders]);

  const orderPins: OrderPin[] = useMemo(
    () =>
      openOrders
        .filter((o) => o.deliveryLocation && isValidCoord(o.deliveryLocation.lat, o.deliveryLocation.lng))
        .map((o) => {
          const point = o.deliveryLocation!;
          const assignment = assignments[o.id];
          const assigned = assignment ? pharmacies.find((p) => p.id === assignment.pharmacyId) : undefined;
          const nearest = rankPharmaciesByDistance(point, pharmacies, 1)[0];
          const target = assigned || nearest?.pharmacy;
          return {
            orderId: o.id,
            customerName: o.shippingAddress?.fullName || 'Customer',
            point,
            target,
            distanceKm: target ? haversineKm(point, target) : undefined,
            assigned: !!assigned,
          };
        }),
    [openOrders, assignments, pharmacies]
  );

  const routingOrders = useMemo(() => {
    const base = routingFilter === 'all' ? orders : openOrders;
    return routingFilter === 'unassigned' ? base.filter((o) => !assignments[o.id]) : base;
  }, [routingFilter, orders, openOrders, assignments]);

  const filteredPharmacies = pharmacies.filter((p) =>
    `${p.name} ${p.address} ${p.contactPerson || ''} ${p.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = pharmacies.filter((p) => p.isActive).length;
  const openWithoutPin = openOrders.filter((o) => !o.deliveryLocation).length;
  const unassignedOpen = openOrders.filter((o) => !assignments[o.id]).length;

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const startEdit = (p: FulfillmentPharmacy) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      contactPerson: p.contactPerson || '',
      phone: p.phone,
      whatsapp: p.whatsapp || '',
      address: p.address,
      coords: fmtCoords(p.lat, p.lng),
      openingHours: p.openingHours || '',
      notes: p.notes || '',
      isActive: p.isActive,
    });
    setFormOpen(true);
    setFocus({ lat: p.lat, lng: p.lng, zoom: 16 });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, coords: fmtCoords(pos.coords.latitude, pos.coords.longitude) }));
        setFocus({ lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 17 });
        setLocating(false);
      },
      () => {
        setLocating(false);
        addToast('Location unavailable', 'Click the map to place the pharmacy instead.', 'info');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const point = parseCoords(form.coords);
    if (!point) {
      addToast('Location required', 'Click the map or enter coordinates like -1.9441, 30.0619.', 'info');
      return;
    }
    setSaving(true);
    try {
      const saved = await savePharmacy(
        {
          name: form.name.trim(),
          contactPerson: form.contactPerson.trim() || undefined,
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim() || undefined,
          address: form.address.trim(),
          lat: point.lat,
          lng: point.lng,
          openingHours: form.openingHours.trim() || undefined,
          notes: form.notes.trim() || undefined,
          isActive: form.isActive,
        },
        editingId || undefined
      );
      addToast(editingId ? 'Pharmacy Updated' : 'Pharmacy Registered', `${saved.name} is on the network map.`);
      closeForm();
      setFocus({ lat: saved.lat, lng: saved.lng, zoom: 15 });
    } catch (err) {
      console.warn('savePharmacy error:', err);
      addToast('Save Failed', 'Could not save pharmacy. Check your connection and admin access.', 'info');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: FulfillmentPharmacy) => {
    if (!window.confirm(`Remove ${p.name} from the pharmacy network?`)) return;
    try {
      await deletePharmacy(p.id);
      addToast('Pharmacy Removed', `${p.name} removed from the network.`, 'info');
      if (editingId === p.id) closeForm();
    } catch (err) {
      console.warn('deletePharmacy error:', err);
    }
  };

  const inputCls =
    'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs focus:outline-none focus:border-red-600';
  const labelCls = 'block text-slate-700 font-bold mb-1 text-xs';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Navigation className="w-5 h-5 text-red-600" /> Pharmacy Network & Order Routing
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Internal only — customers never see which pharmacy fulfils their order.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register Pharmacy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active pharmacies', value: activeCount, tone: 'text-emerald-700' },
          { label: 'Open orders', value: openOrders.length, tone: 'text-slate-900' },
          { label: 'Open & unassigned', value: unassignedOpen, tone: 'text-red-600' },
          { label: 'Open without GPS pin', value: openWithoutPin, tone: 'text-amber-700' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-600">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600" /> Pharmacy</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400" /> Inactive</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600" /> Open order</span>
          <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-red-600" /> Nearest (suggested)</span>
          <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-emerald-600" /> Assigned</span>
          {formOpen && (
            <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              Click the map to place the pharmacy
            </span>
          )}
        </div>
        <Suspense fallback={<div className="h-[480px] rounded-3xl bg-slate-100 animate-pulse" />}>
          <PharmacyNetworkMap
            pharmacies={pharmacies}
            orders={orderPins}
            onPick={formOpen ? (lat, lng) => setForm((f) => ({ ...f, coords: fmtCoords(lat, lng) })) : undefined}
            pickedPoint={pickedPoint}
            focus={focus}
          />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        {formOpen && (
          <form onSubmit={handleSubmit} className="lg:col-span-2 p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3 self-start">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" /> {editingId ? 'Edit Pharmacy' : 'Register New Pharmacy'}
              </h4>
              <button type="button" onClick={closeForm} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className={labelCls}>Pharmacy name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Pharmacie Conseil Kimihurura" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Phone *</label>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="0788 123 456" />
              </div>
              <div>
                <label className={labelCls}>WhatsApp</label>
                <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputCls} placeholder="Same as phone if empty" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Contact person</label>
              <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className={inputCls} placeholder="Pharmacist / manager name" />
            </div>
            <div>
              <label className={labelCls}>Address / landmark *</label>
              <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} placeholder="KG 7 Ave, near Simba Supermarket" />
            </div>
            <div>
              <label className={labelCls}>Map location * <span className="font-medium text-slate-400">(click the map, or paste from Google Maps)</span></label>
              <div className="flex gap-2">
                <input
                  required
                  value={form.coords}
                  onChange={(e) => setForm({ ...form, coords: e.target.value })}
                  onBlur={() => {
                    const p = parseCoords(form.coords);
                    if (p) setFocus({ ...p, zoom: 16 });
                  }}
                  className={`${inputCls} font-mono ${form.coords && !parseCoords(form.coords) ? 'border-amber-400' : ''}`}
                  placeholder="-1.944100, 30.061900"
                />
                <button
                  type="button"
                  onClick={useMyLocation}
                  title="Use my current location (when you are at the pharmacy)"
                  className="px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Opening hours</label>
              <input value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} className={inputCls} placeholder="Mon–Sat 8:00–22:00, Sun 9:00–18:00" />
            </div>
            <div>
              <label className={labelCls}>Internal notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} placeholder="Commission agreement, stock strengths, best time to call…" />
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-red-600" />
              Active (included in nearest-pharmacy suggestions)
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? 'Save Changes' : 'Register & Add to Map'}
            </button>
          </form>
        )}

        {/* Pharmacy list */}
        <div className={`${formOpen ? 'lg:col-span-3' : 'lg:col-span-5'} p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-extrabold text-slate-900 text-sm">Registered Pharmacies ({pharmacies.length})</h4>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-600" />
            </div>
          </div>

          {!loaded ? (
            <p className="text-xs text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading network…</p>
          ) : pharmacies.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No pharmacies yet. Register your first partner to start routing orders.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${formOpen ? '' : 'md:grid-cols-2 xl:grid-cols-3'} gap-3`}>
              {filteredPharmacies.map((p) => (
                <div key={p.id} className={`p-4 rounded-2xl border ${p.isActive ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-70'} space-y-2`}>
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => setFocus({ lat: p.lat, lng: p.lng, zoom: 16 })} className="text-left cursor-pointer" title="Show on map">
                      <p className="font-extrabold text-slate-900 text-xs hover:text-red-600">{p.name}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {p.address}</p>
                    </button>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${p.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    {p.contactPerson && <p>Contact: <b>{p.contactPerson}</b></p>}
                    <a href={telLink(p.phone)} className="font-bold text-emerald-700 inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {p.phone}</a>
                    {p.openingHours && <p className="text-slate-500">{p.openingHours}</p>}
                    {p.notes && <p className="text-slate-400 italic">{p.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                    <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setPharmacyActive(p.id, !p.isActive)} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer" title={p.isActive ? 'Deactivate' : 'Activate'}><Power className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order routing */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-extrabold text-slate-900 text-sm">Order Routing ({routingOrders.length})</h4>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-[11px] font-bold">
            {([
              ['unassigned', 'Open & unassigned'],
              ['open', 'All open'],
              ['all', 'All orders'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRoutingFilter(key)}
                className={`px-3 py-1.5 cursor-pointer ${routingFilter === key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {routingOrders.length === 0 ? (
          <p className="text-xs text-slate-500 font-medium py-4 text-center">Nothing to route right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {routingOrders.map((o) => (
              <div key={o.id} className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono font-bold text-slate-900 text-xs">{o.id}</p>
                    <p className="text-[11px] text-slate-500">
                      {o.shippingAddress?.fullName} · {o.items.length} item(s) · {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold whitespace-nowrap">{o.status}</span>
                </div>
                <PharmacySuggestion
                  order={o}
                  network={network}
                  onShowOnMap={(ord) =>
                    ord.deliveryLocation && setFocus({ lat: ord.deliveryLocation.lat, lng: ord.deliveryLocation.lng, zoom: 15 })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
