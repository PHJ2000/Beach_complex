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

const formatUpdatedAt = (updatedAt: string) => {
  if (!updatedAt) {
    return '업데이트 정보 없음';
  }

  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) {
    return '업데이트 정보 없음';
  }

  return `업데이트: ${parsed.toLocaleString('ko-KR')}`;
};

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
          <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[11px] text-muted-foreground truncate">
            {formatUpdatedAt(beach.updatedAt)}
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
