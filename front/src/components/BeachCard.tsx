import { Heart } from 'lucide-react';
import { Beach } from '../types/beach';

interface BeachCardProps {
  beach: Beach;
  onClick?: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (e: React.MouseEvent) => void;
}

const statusColors: Record<string, string> = {
  busy: '#FF0000',
  normal: '#FFEA00',
  free: '#51FF00',
  unknown: '#64748B',
};

const getStatusLabel = (status: Beach['status']) => {
  switch (status) {
    case 'busy':
      return '혼잡';
    case 'normal':
      return '보통';
    case 'free':
      return '여유';
    default:
      return '정보 없음';
  }
};

const formatCoordinates = (latitude: number, longitude: number) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return '좌표 정보 없음';
  }
  return `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`;
};

/* ---------- 날짜 유틸(교체본) ---------- */
const EPOCH_MIN_SECONDS = 946684800;      // 2000-01-01T00:00:00Z
const EPOCH_MAX_SECONDS = 4102444800;     // 2100-01-01T00:00:00Z

const normalizeToDate = (ms: number): Date | null => {
  if (!Number.isFinite(ms)) return null;
  const sec = ms / 1000;
  // 2000~2100 사이만 유효로 본다. (백엔드 이상값 방어)
  if (sec < EPOCH_MIN_SECONDS || sec > EPOCH_MAX_SECONDS) return null;
  const d = new Date(ms);
  return isNaN(d.getTime()) ? null : d;
};

const parseApiDate = (
  value: number | string | Date | null | undefined
): Date | null => {
  if (value == null) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : normalizeToDate(value.getTime());
  }

  if (typeof value === 'number') {
    if (value <= 0) return null; // 0/음수는 없음 처리
    const ms = value < 1e12 ? value * 1000 : value; // 1e12 미만 → epoch seconds로 간주
    return normalizeToDate(ms);
  }

  // "1709459200" 같은 숫자 문자열도 처리
  if (/^\d+$/.test(value)) {
    const n = Number(value);
    if (n <= 0) return null;
    const ms = n < 1e12 ? n * 1000 : n;
    return normalizeToDate(ms);
  }

  // ISO 등 일반 문자열
  const t = Date.parse(value);
  if (Number.isNaN(t)) return null;
  return normalizeToDate(t);
};

const formatUpdatedAt = (
  raw: number | string | Date | null | undefined
): string => {
  const date = parseApiDate(raw);
  if (!date) return '업데이트 정보 없음';

  const text = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);

  return `업데이트: ${text}`;
};
/* -------------------------------------- */


export function BeachCard({ beach, onClick, isFavorite, onFavoriteToggle }: BeachCardProps) {
  const statusColor = statusColors[beach.status] ?? statusColors.unknown;

  return (
    <div
      className="flex items-center gap-4 p-4 bg-card hover:bg-accent transition-colors border-b border-border last:border-b-0"
    >
      <div
        onClick={onClick}
        className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
      >
        {/* Status Indicator with Circle */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className="w-6 h-6 rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: statusColor }}
          />
          <span
            className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[10px] whitespace-nowrap"
            style={{ color: statusColor }}
          >
            {getStatusLabel(beach.status)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-foreground mb-1">{beach.name}</h3>
          <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[12px] text-muted-foreground truncate">
            {beach.code || '코드 정보 없음'} · {formatCoordinates(beach.latitude, beach.longitude)}
          </p>
          <p className="font-['Noto_SANS_KR:Regular',_sans-serif] text-[11px] text-muted-foreground truncate">
            {formatUpdatedAt((beach as any).updatedAt)}
          </p>
        </div>
      </div>

      {/* Favorite Button */}
      <button
        onClick={onFavoriteToggle}
        className="shrink-0 p-2 hover:bg-accent rounded-full transition-colors"
        aria-label={isFavorite ? "찜 해제" : "찜하기"}
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
