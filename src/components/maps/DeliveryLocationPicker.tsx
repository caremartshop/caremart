import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import { GeoPoint } from '../../types';
import { KIGALI_CENTER } from '../../lib/geo';
import { pickIcon, OSM_TILE_URL, OSM_ATTRIBUTION } from './mapIcons';

interface Props {
  value?: GeoPoint;
  onChange: (point: GeoPoint) => void;
}

function TapToPlace({ onChange }: { onChange: Props['onChange'] }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng, source: 'map' }) });
  return null;
}

function Recenter({ value }: { value?: GeoPoint }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.setView([value.lat, value.lng], Math.max(map.getZoom(), 16));
  }, [value?.lat, value?.lng]);
  return null;
}

/** Small map where the customer confirms or adjusts their delivery pin (tap or drag). */
const DeliveryLocationPicker: React.FC<Props> = ({ value, onChange }) => {
  const markerRef = useRef<LeafletMarker | null>(null);
  const dragHandlers = useMemo(
    () => ({
      dragend() {
        const m = markerRef.current;
        if (m) {
          const { lat, lng } = m.getLatLng();
          onChange({ lat, lng, source: 'map' });
        }
      },
    }),
    [onChange]
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 relative z-0" style={{ height: 240 }}>
      <MapContainer
        center={value ? [value.lat, value.lng] : KIGALI_CENTER}
        zoom={value ? 16 : 13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
        <TapToPlace onChange={onChange} />
        <Recenter value={value} />
        {value && (
          <>
            {value.source === 'gps' && value.accuracy && value.accuracy < 2000 && (
              <Circle
                center={[value.lat, value.lng]}
                radius={value.accuracy}
                pathOptions={{ color: '#2563eb', weight: 1, fillOpacity: 0.08 }}
              />
            )}
            <Marker
              position={[value.lat, value.lng]}
              icon={pickIcon}
              draggable
              eventHandlers={dragHandlers}
              ref={markerRef}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default DeliveryLocationPicker;
