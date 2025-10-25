import { Heart } from 'lucide-react';
import { Beach } from '../types/beach';

interface BeachCardProps {
  beach: Beach;
  onClick?: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (e: React.MouseEvent) => void;

  /** 옵션: 주소를 부모에서 넘기고 싶으면 사용 */
  addressOverride?: string;

  /** 옵션: 이미 계산된 거리(m)를 부모에서 넘기면 그대로 사용 */
  distanceM?: number | null;

  /** 옵션: 사용자 좌표를 넘기면 카드가 자체적으로 거리 계산 (distanceM 없을 때만 사용) */
  userCoords?: { lat: number; lng: number } | null;
}

const statusColors: Record<string, string> = {
  busy: '#FF0000',
  normal: '#FFEA00',
  free: '#51FF00',
  unknown: '#64748B',
};

const getStatusLabel = (status: Beach['status']) => {
  switch (status) {
    case 'busy': return '혼잡';
    case 'normal': return '보통';
    case 'free': return '여유';
    default: return '정보 없음';
  }
};

const formatCoordinates = (latitude: number, longitude: number) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return '좌표 정보 없음';
  return `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`;
};

/* ---------------- [하드코딩] 업데이트 시각 (UTC ISO) ---------------- */
const HARDCODE_UPDATED_AT_BY_CODE: Record<string, string> = {
  HAEUNDAE:  '2025-10-25T15:56:34.971Z',
  GWANGALLI: '2025-10-25T15:56:34.971Z',
  SONGJEONG: '2025-10-25T15:56:34.971Z',
};
/* ------------------------------------------------------------------- */

/* ---------------- 주소 폴백 (BE에 address 없을 때 임시) -------------- */
const ADDRESS_FALLBACK: Record<string, string> = {
  HAEUNDAE:  '부산 해운대구 우동',
  GWANGALLI: '부산 수영구 광안해변로',
  SONGJEONG: '부산 해운대구 송정해변로',
};
/* ------------------------------------------------------------------- */

/* ---------------- 거리 계산/표시 유틸 ---------------- */
const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // m
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (m: number | null | undefined): string => {
  if (m == null || !Number.isFinite(m)) return '거리 계산 불가';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
};
/* ----------------------------------------------------- */

/* ---------------- 날짜 파싱/표시 유틸 ---------------- */
const EPOCH_MIN_SECONDS = 946684800;   // 2000-01-01Z
const EPOCH_MAX_SECONDS = 4102444800;  // 2100-01-01Z

const normalizeToDate = (ms: number): Date | null => {
  if (!Number.isFinite(ms)) return null;
  const sec = ms / 1000;
  if (sec < EPOCH_MIN_SECONDS || sec > EPOCH_MAX_SECONDS) return null;
  const d = new Date(ms);
  return isNaN(d.getTime()) ? null : d;
};

const parseApiDate = (value: number | string | Date | null | undefined): Date | null => {
  if (value == null) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : normalizeToDate(value.getTime());
  if (typeof value === 'number') {
    if (value <= 0) return null;
    const ms = value < 1e12 ? value * 1000 : value; // 1e12 미만이면 초로 간주
    return normalizeToDate(ms);
  }
  if (/^\d+$/.test(value)) {
    const n = Number(value);
    if (n <= 0) return null;
    const ms = n < 1e12 ? n * 1000 : n;
    return normalizeToDate(ms);
  }
  const t = Date.parse(value);
  if (Number.isNaN(t)) return null;
  return normalizeToDate(t);
};

const formatUpdatedAt = (raw: number | string | Date | null | undefined): string => {
  const date = parseApiDate(raw);
  if (!date) return '업데이트 정보 없음';
  const text = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
  }).format(date);
  return `업데이트: ${text}`;
};
/* ---------------------------------------------------- */

export function BeachCard({
  beach, onClick, isFavorite, onFavoriteToggle,
  addressOverride, distanceM, userCoords,
}: BeachCardProps) {
  const statusColor = statusColors[beach.status] ?? statusColors.unknown;

  // 업데이트 시각: 하드코딩 우선 → 없으면 API 필드 사용
  const displayUpdatedRaw =
    HARDCODE_UPDATED_AT_BY_CODE[beach.code] ?? (beach as any).updatedAt;

  // 주소: override → API → 폴백 → 없으면 안내
  const addressText =
    addressOverride ||
    (beach as any).address ||
    ADDRESS_FALLBACK[beach.code] ||
    '주소 정보 없음';

  // 거리: 부모가 준 distanceM 우선 → userCoords로 자체 계산 → 불가 시 좌표 텍스트
  const computedDistance =
    distanceM != null
      ? distanceM
      : userCoords
        ? haversineMeters(userCoords.lat, userCoords.lng, beach.latitude, beach.longitude)
        : null;

  return (
    <div className="flex items-center gap-4 p-4 bg-card hover:bg-accent transition-colors border-b border-border last:border-b-0">
      <div onClick={onClick} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
        {/* Status Indicator */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-6 h-6 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: statusColor }} />
          <span className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[10px] whitespace-nowrap" style={{ color: statusColor }}>
            {getStatusLabel(beach.status)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-foreground mb-1">{beach.name}</h3>

          {/* 주소 · 거리 or 좌표 */}
          <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[12px] text-muted-foreground truncate">
            {addressText} · {computedDistance != null ? formatDistance(computedDistance) : formatCoordinates(beach.latitude, beach.longitude)}
          </p>

          {/* 업데이트 시각 */}
          <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[11px] text-muted-foreground truncate">
            {formatUpdatedAt(displayUpdatedRaw)}
          </p>
        </div>
      </div>

      {/* Favorite Button */}
      <button
        onClick={onFavoriteToggle}
        className="shrink-0 p-2 hover:bg-accent rounded-full transition-colors"
        aria-label={isFavorite ? '찜 해제' : '찜하기'}
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isFavorite
              ? 'fill-purple-600 stroke-purple-600'
              : 'fill-none stroke-gray-400 hover:stroke-purple-500'
          }`}
        />
      </button>
    </div>
  );
}
