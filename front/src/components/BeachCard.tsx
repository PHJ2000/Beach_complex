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

/* ---- [하드코딩] 해수욕장 코드별 업데이트 시각(UTC ISO) ----
   * KST로 렌더링되므로 UTC로 적어도 화면은 한국시간으로 표시됩니다.
   * 필요하면 아래 값을 바꾸면 됨.
---------------------------------------------------------------- */
const HARDCODE_UPDATED_AT_BY_CODE: Record<string, string> = {
  HAEUNDAE:  '2025-10-25T15:56:34.971Z',
  GWANGALLI: '2025-10-25T15:56:34.971Z',
  SONGJEONG: '2025-10-25T15:56:34.971Z',
};

/* ---------------- 날짜 유틸 ---------------- */
const EPOCH_MIN_SECONDS = 946684800;   // 2000-01-01T00:00:00Z
const EPOCH_MAX_SECONDS = 4102444800;  // 2100-01-01T00:00:00Z

const normalizeToDate = (ms: number): Date | null => {
  if (!Number.isFinite(ms)) return null;
  const sec = ms / 1000;
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
    if (value <= 0) return null;
    const ms = value < 1e12 ? value * 1000 : value; // 1e12 미만이면 초로 간주
    return normalizeToDate(ms);
  }

  // 숫자 문자열(정수)만 초/밀리초로 처리
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
/* ------------------------------------------ */

export function BeachCard({ beach, onClick, isFavorite, onFavoriteToggle }: BeachCardProps) {
  const statusColor = statusColors[beach.status] ?? statusColors.unknown;

  // [핵심] 하드코딩 값이 있으면 그걸 우선 사용, 없으면 원래 updatedAt 사용
  const displayUpdatedRaw =
    HARDCODE_UPDATED_AT_BY_CODE[beach.code] ?? (beach as any).updatedAt;

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
          <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[11px] text-muted-foreground truncate">
            {formatUpdatedAt(displayUpdatedRaw)}
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
