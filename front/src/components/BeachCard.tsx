import { Heart } from 'lucide-react';
import svgPaths from "../imports/svg-aou00tt65r";

interface BeachCardProps {
  name: string;
  address: string;
  distance: string;
  status: 'busy' | 'normal' | 'free';
  onClick?: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (e: React.MouseEvent) => void;
}

export function BeachCard({ name, address, distance, status, onClick, isFavorite, onFavoriteToggle }: BeachCardProps) {
  const statusColors = {
    busy: '#FF0000',
    normal: '#FFEA00',
    free: '#51FF00',
  };

  const getStatusLabel = (status: 'free' | 'normal' | 'busy') => {
    return status === 'busy' ? '혼잡' : status === 'normal' ? '보통' : '여유';
  };

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
            style={{ backgroundColor: statusColors[status] }}
          />
          <span 
            className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[10px] whitespace-nowrap"
            style={{ color: statusColors[status] }}
          >
            {getStatusLabel(status)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-foreground mb-1">{name}</h3>
          <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[12px] text-muted-foreground truncate">
            {address} · {distance}
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
