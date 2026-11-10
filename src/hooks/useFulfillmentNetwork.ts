import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FulfillmentPharmacy, OrderFulfillment } from '../types';

const PHARMACIES = 'fulfillment_pharmacies';
const ASSIGNMENTS = 'order_fulfillment';

/** Firestore rejects `undefined`; strip those keys (one level deep is enough for these flat records). */
const clean = <T extends Record<string, any>>(data: T) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as T;

/**
 * Admin-only data for the internal pharmacy routing network.
 * Subscribes only when `enabled` is true, so customer browsers never load this data.
 */
export function useFulfillmentNetwork(enabled: boolean) {
  const [pharmacies, setPharmacies] = useState<FulfillmentPharmacy[]>([]);
  const [assignments, setAssignments] = useState<Record<string, OrderFulfillment>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const unsubPharmacies = onSnapshot(
      collection(db, PHARMACIES),
      (snap) => {
        const list = snap.docs.map((d) => ({ ...(d.data() as FulfillmentPharmacy), id: d.id }));
        list.sort((a, b) => a.name.localeCompare(b.name));
        setPharmacies(list);
        setLoaded(true);
      },
      (err) => {
        console.warn('fulfillment_pharmacies listener error:', err);
        setLoaded(true);
      }
    );
    const unsubAssignments = onSnapshot(
      collection(db, ASSIGNMENTS),
      (snap) => {
        const map: Record<string, OrderFulfillment> = {};
        snap.docs.forEach((d) => {
          map[d.id] = { ...(d.data() as OrderFulfillment), orderId: d.id };
        });
        setAssignments(map);
      },
      (err) => console.warn('order_fulfillment listener error:', err)
    );
    return () => {
      unsubPharmacies();
      unsubAssignments();
    };
  }, [enabled]);

  const savePharmacy = async (data: Omit<FulfillmentPharmacy, 'id' | 'createdAt'>, id?: string) => {
    const pharmacyId = id || `fp-${Date.now()}`;
    const existing = pharmacies.find((p) => p.id === pharmacyId);
    const record: FulfillmentPharmacy = clean({
      ...data,
      id: pharmacyId,
      createdAt: existing?.createdAt || new Date().toISOString(),
    });
    await setDoc(doc(db, PHARMACIES, pharmacyId), record);
    return record;
  };

  const deletePharmacy = (id: string) => deleteDoc(doc(db, PHARMACIES, id));

  const setPharmacyActive = (id: string, isActive: boolean) =>
    setDoc(doc(db, PHARMACIES, id), { isActive }, { merge: true });

  const assignOrder = (orderId: string, pharmacy: FulfillmentPharmacy, distanceKm?: number) => {
    const record: OrderFulfillment = clean({
      orderId,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      distanceKm: distanceKm !== undefined ? Math.round(distanceKm * 100) / 100 : undefined,
      assignedAt: new Date().toISOString(),
    });
    return setDoc(doc(db, ASSIGNMENTS, orderId), record);
  };

  const unassignOrder = (orderId: string) => deleteDoc(doc(db, ASSIGNMENTS, orderId));

  return {
    pharmacies,
    assignments,
    loaded,
    savePharmacy,
    deletePharmacy,
    setPharmacyActive,
    assignOrder,
    unassignOrder,
  };
}

export type FulfillmentNetwork = ReturnType<typeof useFulfillmentNetwork>;
