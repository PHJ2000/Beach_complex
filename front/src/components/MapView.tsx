import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Beach } from '@/types/beach';
import L from 'leaflet';

// Vite 번들에서 기본 아이콘 경로 깨짐 방지
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
});


const statusColor = (s: Beach['status']) =>
  s === 'busy' ? '#ef4444' : s === 'normal' ? '#f59e0b' : s === 'free' ? '#22c55e' : '#64748b';

function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  map.flyTo(center, 13, { duration: 0.4 });
  return null;
}

type Props = {
  beaches: Beach[];
  selected?: Beach | null;
  onSelect?: (b: Beach) => void;
};

export default function MapView({ beaches, selected, onSelect }: Props) {
  const center: [number, number] =
    selected
      ? [selected.latitude, selected.longitude]
      : beaches.length
      ? [beaches[0].latitude, beaches[0].longitude]
      : [35.1796, 129.0756]; // 부산 시청 근처 fallback

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ width: '100%', height: 360, borderRadius: 12, overflow: 'hidden' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {selected && <FlyTo center={[selected.latitude, selected.longitude]} />}

      {beaches.map((b) => (
        <CircleMarker
          key={b.id}
          center={[b.latitude, b.longitude]}
          radius={12}
          pathOptions={{ color: statusColor(b.status), fillColor: statusColor(b.status), fillOpacity: 0.85 }}
          eventHandlers={{ click() { onSelect?.(b); } }}
        >
          <Popup>
            <div style={{ fontWeight: 600 }}>{b.name}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {b.code} · {b.latitude.toFixed(3)}, {b.longitude.toFixed(3)}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
