import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ThumbsUp, AlertTriangle, ZoomIn, ZoomOut, Heart } from 'lucide-react';
import { Beach } from '../types/beach';
import { BottomNavigation } from './BottomNavigation';
import { MonthlyHeatmap } from './MonthlyHeatmap';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Toaster } from './ui/sonner';
import svgPaths from "../imports/svg-gmd8e6w0tp";
import imgSubtract1 from "figma:asset/c5afd724d968366ab1d939ebd1fa1377e2d4b2bb.png";
import { imgSubtract } from "../imports/svg-ogxba";

interface BeachDetailViewProps {
  beach: Beach;
  beaches: Beach[];
  onClose: () => void;
  selectedDate: Date | undefined;
  weatherTemp: string;
  onDateChange?: (date: Date | undefined) => void;
  onNavigate?: (view: string) => void;
  onBeachChange?: (beach: Beach) => void;
  favoriteBeaches?: string[];
  onFavoriteToggle?: (beachId: string) => void;
}

const STATUS_COLORS: Record<Beach['status'], string> = {
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

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

function WaveLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#007DFC" />
      <path 
        d="M10 22C12 20 14 20 16 22C18 24 20 24 22 22C24 20 26 20 28 22C29 23 30 23 31 22" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      <path 
        d="M10 27C12 25 14 25 16 27C18 29 20 29 22 27C24 25 26 25 28 27C29 28 30 28 31 27" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloudWeatherIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 50 50" fill="none">
      <path 
        d="M36.4125 20.8333H36.4583C38.9447 20.8333 41.3293 21.8211 43.0875 23.5792C44.8456 25.3374 45.8333 27.7219 45.8333 30.2083C45.8333 32.6947 44.8456 35.0793 43.0875 36.8375C41.3293 38.5956 38.9447 39.5833 36.4583 39.5833H14.5833C11.907 39.5839 9.3331 38.5542 7.39551 36.708C5.45792 34.8617 4.30529 32.3405 4.17668 29.6672C4.04807 26.994 4.95334 24.3738 6.70474 22.35C8.45614 20.3263 10.9193 19.0543 13.5833 18.7979M36.4125 20.8333C36.4417 20.4903 36.4569 20.1431 36.4583 19.7917C36.4629 16.8358 35.325 13.9925 33.2823 11.8559C31.2397 9.71934 28.4504 8.45479 25.4973 8.3265C22.5442 8.19821 19.6558 9.21611 17.4356 11.1675C15.2154 13.1189 13.8351 15.8528 13.5833 18.7979M36.4125 20.8333C36.2028 23.128 35.3061 25.3061 33.8396 27.0833M13.5833 18.7979C13.9125 18.766 14.2458 18.75 14.5833 18.75C16.9292 18.75 19.0937 19.525 20.8333 20.8333" 
        stroke="#007DFC" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2"
      />
    </svg>
  );
}

export function BeachDetailView({ beach, beaches: allBeaches, onClose, selectedDate, weatherTemp, onDateChange, onNavigate, onBeachChange, favoriteBeaches = [], onFavoriteToggle }: BeachDetailViewProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [sheetHeight, setSheetHeight] = useState(220);
  const [isDragging, setIsDragging] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [localDate, setLocalDate] = useState<Date | undefined>(selectedDate);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const sheetContentRef = useRef<HTMLDivElement>(null);
  const monthlyHeatmapRef = useRef<HTMLDivElement>(null);

  const mockWeather = {
    temp: weatherTemp,
    condition: '맑음',
    humidity: '65%',
    wind: '3m/s',
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '날짜';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // Mock data for hourly congestion (0-23 hours)
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    let status: 'free' | 'normal' | 'busy';
    let percentage = 0;
    
    // Simulate realistic beach congestion pattern
    if (hour >= 12 && hour <= 16) {
      status = 'busy';
      percentage = 70 + Math.floor(Math.random() * 30); // 70-100%
    } else if ((hour >= 10 && hour < 12) || (hour > 16 && hour <= 18)) {
      status = 'normal';
      percentage = 40 + Math.floor(Math.random() * 30); // 40-70%
    } else {
      status = 'free';
      percentage = 10 + Math.floor(Math.random() * 30); // 10-40%
    }
    
    return { hour, status, percentage };
  });

  const currentHour = new Date().getHours();

  const mapBounds = useMemo(() => {
    const candidates = allBeaches.filter(
      (item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
    );

    if (candidates.length === 0) {
      return null;
    }

    const latitudes = candidates.map((item) => item.latitude);
    const longitudes = candidates.map((item) => item.longitude);

    return {
      minLat: Math.min(...latitudes),
      maxLat: Math.max(...latitudes),
      minLon: Math.min(...longitudes),
      maxLon: Math.max(...longitudes),
    };
  }, [allBeaches]);

  const computeMarkerPosition = useCallback(
    (target: Beach) => {
      if (!mapBounds) {
        return null;
      }

      if (!Number.isFinite(target.latitude) || !Number.isFinite(target.longitude)) {
        return null;
      }

      const latRange = mapBounds.maxLat - mapBounds.minLat || 1;
      const lonRange = mapBounds.maxLon - mapBounds.minLon || 1;

      const x = ((target.longitude - mapBounds.minLon) / lonRange) * 100;
      const y = ((mapBounds.maxLat - target.latitude) / latRange) * 100;

      return {
        x: clamp(x),
        y: clamp(y),
      };
    },
    [mapBounds]
  );

  const selectedMarkerPosition = useMemo(
    () => computeMarkerPosition(beach) ?? { x: 50, y: 50 },
    [computeMarkerPosition, beach]
  );

  const selectedStatusColor = STATUS_COLORS[beach.status] ?? STATUS_COLORS.unknown;

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startHeight.current = sheetHeight;
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = startY.current - currentY;
    const newHeight = Math.min(Math.max(startHeight.current + diff, 160), 650);
    setSheetHeight(newHeight);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging]);

  // Handle scroll to detect active section
  useEffect(() => {
    const sheetContent = sheetContentRef.current;
    if (!sheetContent) return;

    const handleScroll = () => {
      const monthlySection = monthlyHeatmapRef.current;
      if (!monthlySection) return;

      const scrollTop = sheetContent.scrollTop;
      const monthlyTop = monthlySection.offsetTop - sheetContent.offsetTop - 100;

      if (scrollTop >= monthlyTop) {
        setActiveTab('monthly');
      } else {
        setActiveTab('home');
      }
    };

    sheetContent.addEventListener('scroll', handleScroll);
    return () => sheetContent.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle tab change with scroll
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'home') {
      // Stay on current beach detail view, scroll to top
      sheetContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (tab === 'search') {
      // Go to main search screen
      onClose();
      return;
    }
    
    if (tab === 'events') {
      onNavigate?.('events');
      return;
    }
    
    if (tab === 'mypage') {
      onNavigate?.('mypage');
      return;
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 max-w-[480px] mx-auto">
      {/* Header */}
      <div className="relative bg-card p-3 border-b border-border z-30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            <div className="shrink-0">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#007DFC" />
                <path 
                  d="M10 22C12 20 14 20 16 22C18 24 20 24 22 22C24 20 26 20 28 22C29 23 30 23 31 22" 
                  stroke="white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
                <path 
                  d="M10 27C12 25 14 25 16 27C18 29 20 29 22 27C24 25 26 25 28 27C29 28 30 28 31 27" 
                  stroke="white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[15px] leading-tight text-foreground whitespace-nowrap">비치체크</h1>
              <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[10px] leading-tight text-muted-foreground truncate">
                {beach.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center justify-center gap-1.5 w-[85px] h-[38px] px-2 bg-card dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="#007DFC" strokeWidth="1.5" />
                    <path d="M5 1V4M11 1V4M2 6H14" stroke="#007DFC" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[10px] text-foreground whitespace-nowrap truncate">
                    {formatDate(localDate)}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={localDate}
                  onSelect={(date) => {
                    setLocalDate(date);
                    onDateChange?.(date);
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <button 
              onClick={() => setShowWeather(true)}
              className="flex items-center justify-center gap-1.5 w-[85px] h-[38px] px-2 bg-card dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border"
              title="날씨 보기"
            >
              <svg width="20" height="20" viewBox="0 0 50 50" fill="none" className="shrink-0">
                <path 
                  d="M36.4125 20.8333H36.4583C38.9447 20.8333 41.3293 21.8211 43.0875 23.5792C44.8456 25.3374 45.8333 27.7219 45.8333 30.2083C45.8333 32.6947 44.8456 35.0793 43.0875 36.8375C41.3293 38.5956 38.9447 39.5833 36.4583 39.5833H14.5833C11.907 39.5839 9.3331 38.5542 7.39551 36.708C5.45792 34.8617 4.30529 32.3405 4.17668 29.6672C4.04807 26.994 4.95334 24.3738 6.70474 22.35C8.45614 20.3263 10.9193 19.0543 13.5833 18.7979M36.4125 20.8333C36.4417 20.4903 36.4569 20.1431 36.4583 19.7917C36.4629 16.8358 35.325 13.9925 33.2823 11.8559C31.2397 9.71934 28.4504 8.45479 25.4973 8.3265C22.5442 8.19821 19.6558 9.21611 17.4356 11.1675C15.2154 13.1189 13.8351 15.8528 13.5833 18.7979M36.4125 20.8333C36.2028 23.128 35.3061 25.3061 33.8396 27.0833M13.5833 18.7979C13.9125 18.766 14.2458 18.75 14.5833 18.75C16.9292 18.75 19.0937 19.525 20.8333 20.8333" 
                  stroke="#007DFC" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2"
                />
              </svg>
              <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[10px] text-foreground whitespace-nowrap">
                {weatherTemp}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0 top-[73px] bottom-0 bg-[#E8F4FF] overflow-hidden">
        <TransformWrapper
          initialScale={1.2}
          minScale={0.5}
          maxScale={3}
          initialPositionX={-(selectedMarkerPosition.x - 50) * 5.76}
          initialPositionY={-(selectedMarkerPosition.y - 35) * 7.2}
          wheel={{ step: 0.1 }}
          doubleClick={{ mode: 'zoomIn' }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="w-full h-full"
              >
                <div className="relative w-full h-full min-w-[480px] min-h-[600px]">
                  {/* Map background */}
                  <div className="absolute inset-0 opacity-60">
                    <img 
                      alt="Map" 
                      className="block w-full h-full object-cover blur-[1px]" 
                      src={imgSubtract1}
                      draggable={false}
                    />
                  </div>
                  
                  {/* All beach markers */}
                  {allBeaches.map((b) => {
                    const isSelected = b.id === beach.id;

                    let markerPosition = computeMarkerPosition(b);
                    if (!markerPosition) {
                      if (!isSelected) {
                        return null;
                      }
                      markerPosition = selectedMarkerPosition;
                    }

                    return (
                      <div
                        key={b.id}
                        className="absolute"
                        style={{
                          left: `${markerPosition.x}%`,
                          top: `${markerPosition.y}%`,
                          transform: 'translate(-50%, -100%)',
                        }}
                      >
                        {isSelected ? (
                          // Selected beach - large with pulsing effect
                          <div className="relative">
                            {/* Pulsing circle effect */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#007DFC] rounded-full opacity-20 animate-[ping_2s_ease-in-out_infinite]" />
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#007DFC] rounded-full opacity-30" />
                            
                            {/* Main marker */}
                            <div className="relative w-[50px] h-[60px]">
                              <svg className="absolute inset-0 w-full h-full drop-shadow-lg" fill="none" preserveAspectRatio="none" viewBox="0 0 29 34">
                                <path 
                                  clipRule="evenodd" 
                                  d={svgPaths.p1a91f00} 
                                  fill="#007DFC" 
                                  fillRule="evenodd" 
                                  stroke="#ffffff" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth="2" 
                                />
                              </svg>
                              <div className="absolute left-1/2 top-[16px] -translate-x-1/2 w-[16px] h-[16px]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
                                  <path 
                                    clipRule="evenodd" 
                                    d={svgPaths.p38936340} 
                                    fill="white" 
                                    fillRule="evenodd" 
                                    stroke="white" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                  />
                                </svg>
                              </div>
                            </div>
                            
                            {/* Beach name label */}
                            <div className="absolute top-[70px] left-1/2 -translate-x-1/2 whitespace-nowrap">
                              <div className="bg-white px-4 py-2 rounded-full shadow-lg border-2 border-[#007DFC]">
                                <p className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[#007DFC]">
                                  {b.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Other beaches - smaller markers
                          <div 
                            className="relative group cursor-pointer hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              onBeachChange?.(b);
                            }}
                          >
                            <div className="relative w-[35px] h-[42px]">
                              <svg className="absolute inset-0 w-full h-full drop-shadow-md" fill="none" preserveAspectRatio="none" viewBox="0 0 29 34">
                                <path 
                                  clipRule="evenodd"
                                  d={svgPaths.p1a91f00}
                                  fill={STATUS_COLORS[b.status] ?? STATUS_COLORS.unknown}
                                  fillRule="evenodd"
                                  stroke="#ffffff"
                                  strokeLinecap="round"
                                  strokeLinejoin="round" 
                                  strokeWidth="2" 
                                />
                              </svg>
                              <div className="absolute left-1/2 top-[11px] -translate-x-1/2 w-[11px] h-[11px]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
                                  <path 
                                    clipRule="evenodd" 
                                    d={svgPaths.p38936340} 
                                    fill="white" 
                                    fillRule="evenodd" 
                                    stroke="white" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                  />
                                </svg>
                              </div>
                            </div>
                            
                            {/* Tooltip on hover */}
                            <div className="absolute top-[50px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-lg">
                                <p className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[11px]">
                                  {b.name}
                                </p>
                                <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-gray-900 rotate-45" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TransformComponent>

              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-auto">
                <button
                  onClick={() => zoomIn()}
                  className="w-10 h-10 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center border border-gray-200"
                  title="확대"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="w-10 h-10 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center border border-gray-200"
                  title="축소"
                >
                  <ZoomOut className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="w-10 h-10 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center border border-gray-200"
                  title="내 위치로"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Draggable Bottom Sheet */}
      <div 
        className="absolute left-0 right-0 bg-white rounded-t-[20px] shadow-[0px_-4px_16px_rgba(0,0,0,0.15)] transition-none z-20"
        style={{ 
          bottom: 64,
          height: sheetHeight,
        }}
      >
        {/* Drag Handle */}
        <div 
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing bg-card dark:bg-gray-800 rounded-t-[20px]"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="w-12 h-1.5 bg-muted-foreground rounded-full" />
        </div>

        <div 
          ref={sheetContentRef}
          className="px-4 pt-3 pb-4 overflow-y-auto bg-muted dark:bg-gray-900" 
          style={{ height: sheetHeight - 28 }}
        >
          {/* Current Beach Info - Always visible */}
          <div className="mb-4 bg-card dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedStatusColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-foreground">{beach.name}</h2>
                    {/* Favorite Button */}
                    <button
                      onClick={() => onFavoriteToggle?.(beach.id)}
                      className="shrink-0 p-1 hover:bg-accent rounded-full transition-colors"
                      aria-label={favoriteBeaches.includes(beach.id) ? "찜 해제" : "찜하기"}
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          favoriteBeaches.includes(beach.id)
                            ? 'fill-purple-600 stroke-purple-600' 
                            : 'fill-none stroke-gray-400 hover:stroke-purple-500'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[12px] text-muted-foreground">
                    {beach.code || '코드 정보 없음'} · {formatCoordinates(beach.latitude, beach.longitude)}
                  </p>
                  <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[11px] text-muted-foreground">
                    {formatUpdatedAt(beach.updatedAt)}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[14px]"
                   style={{
                     color: selectedStatusColor
                   }}>
                  {getStatusLabel(beach.status)}
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Times */}
          <div className="mb-4">
            <h3 className="font-['Noto_Sans_KR:Bold',_sans-serif] mb-3 text-foreground">추천시간</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Good Time */}
              <div className="bg-card dark:bg-gray-800 rounded-xl p-3 flex items-center gap-3 shadow-sm border border-border">
                <div className="shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[11px] text-muted-foreground mb-0.5">
                    방문 추천
                  </p>
                  <p className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[13px] text-foreground">
                    16:00~18:00
                  </p>
                </div>
              </div>

              {/* Bad Time */}
              <div className="bg-card dark:bg-gray-800 rounded-xl p-3 flex items-center gap-3 shadow-sm border border-border">
                <div className="shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[11px] text-muted-foreground mb-0.5">
                    혼잡 시간대
                  </p>
                  <p className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[13px] text-foreground">
                    12:00~14:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 24-hour Congestion Prediction */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-foreground">24시간 혼잡도 예측</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[11px] text-muted-foreground">
                  현재 {currentHour}시
                </span>
              </div>
            </div>
            
            <div className="bg-card dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-border">
              {/* Legend at top */}
              <div className="flex items-center justify-center gap-6 mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md" style={{ backgroundColor: STATUS_COLORS.free }} />
                <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[12px] text-foreground">여유 (0-40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md" style={{ backgroundColor: STATUS_COLORS.normal }} />
                <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[12px] text-foreground">보통 (40-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md" style={{ backgroundColor: STATUS_COLORS.busy }} />
                <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[12px] text-foreground">혼잡 (70-100%)</span>
              </div>
            </div>

              {/* Chart */}
              <div className="relative">
                <div className="flex items-end justify-between gap-[2px] h-[180px]">
                  {hourlyData.map((data) => {
                    const isCurrentHour = data.hour === currentHour;
                    const barHeight = (data.percentage / 100) * 160;
                    
                    return (
                      <div 
                        key={data.hour} 
                        className="flex flex-col items-center gap-2 flex-1 relative group"
                      >
                        {/* Hover tooltip */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                            <p className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[12px]">
                              {data.hour}시
                            </p>
                            <p className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[11px]">
                              {getStatusLabel(data.status)} {data.percentage}%
                            </p>
                            <div 
                              className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45"
                            />
                          </div>
                        </div>

                        {/* Bar */}
                        <div
                          className="w-full rounded-t-md transition-all duration-300 hover:opacity-80 relative"
                          style={{
                            backgroundColor: STATUS_COLORS[data.status] ?? STATUS_COLORS.unknown,
                            height: `${barHeight}px`,
                            minHeight: '8px',
                            boxShadow: isCurrentHour ? '0 0 0 2px #007DFC' : 'none',
                          }}
                        >
                          {isCurrentHour && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                              <div className="bg-blue-500 text-white px-2 py-1 rounded text-[10px] font-['Noto_Sans_KR:Bold',_sans-serif]">
                                지금
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Hour label */}
                        <span 
                          className={`font-['Noto_Sans_KR:Medium',_sans-serif] text-[10px] ${
                            isCurrentHour ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-muted-foreground'
                          }`}
                        >
                          {data.hour}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time axis label */}
              <div className="flex items-center justify-center mt-3 pt-3 border-t border-border">
                <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[11px] text-muted-foreground">
                  시간대별 혼잡도 (0시 ~ 23시)
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Heatmap */}
          <div ref={monthlyHeatmapRef} className="mt-4">
            <h3 className="font-['Noto_Sans_KR:Bold',_sans-serif] mb-3 text-foreground">월간 혼잡도</h3>
            <MonthlyHeatmap
              month={localDate?.getMonth() ? localDate.getMonth() + 1 : new Date().getMonth() + 1}
              year={localDate?.getFullYear() || new Date().getFullYear()}
              beachName={beach.name}
              hourlyData={hourlyData}
              onDateSelect={(date) => {
                const newDate = new Date(date.year, date.month - 1, date.date);
                setLocalDate(newDate);
                onDateChange?.(newDate);
              }}
              externalDate={localDate}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Toast Notifications */}
      <Toaster position="top-center" />

      {/* Weather Dialog */}
      <Dialog open={showWeather} onOpenChange={setShowWeather}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle className="font-['Noto_Sans_KR:Bold',_sans-serif]">
              오늘의 날씨
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-full">
              <CloudWeatherIcon />
            </div>
            <div className="text-center space-y-3">
              <div>
                <p className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[12px] text-gray-600 mb-1">
                  날씨
                </p>
                <p className="font-['Noto_Sans_KR:Bold',_sans-serif]">
                  {mockWeather.condition}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <p className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[11px] text-gray-600 mb-1">
                    기온
                  </p>
                  <p className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[14px]">
                    {mockWeather.temp}
                  </p>
                </div>
                <div>
                  <p className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[11px] text-gray-600 mb-1">
                    습도
                  </p>
                  <p className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[14px]">
                    {mockWeather.humidity}
                  </p>
                </div>
                <div>
                  <p className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[11px] text-gray-600 mb-1">
                    풍속
                  </p>
                  <p className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[14px]">
                    {mockWeather.wind}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
