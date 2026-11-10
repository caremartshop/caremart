import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * SVG/HTML pin icons. Using divIcon avoids Leaflet's default PNG marker assets,
 * which break under Vite bundling.
 */
const pin = (fill: string, inner: string) =>
  L.divIcon({
    className: 'cm-map-pin',
    html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0z" fill="${fill}" stroke="#fff" stroke-width="2"/>
      ${inner}
    </svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });

/** Pharmacy: green pin with a white cross. */
export const pharmacyIcon = pin('#059669', '<path d="M12.5 8h5v4.5H22v5h-4.5V22h-5v-4.5H8v-5h4.5z" fill="#fff"/>');
/** Inactive pharmacy: grey pin with a white cross. */
export const inactivePharmacyIcon = pin('#94a3b8', '<path d="M12.5 8h5v4.5H22v5h-4.5V22h-5v-4.5H8v-5h4.5z" fill="#fff"/>');
/** Customer order / delivery point: red pin with a white dot. */
export const orderIcon = pin('#dc2626', '<circle cx="15" cy="15" r="5.5" fill="#fff"/>');
/** Location being picked: blue pin. */
export const pickIcon = pin('#2563eb', '<circle cx="15" cy="15" r="5.5" fill="#fff"/>');

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
