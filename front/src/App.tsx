import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Heart } from 'lucide-react';
import svgPaths from "./imports/svg-aou00tt65r";
import { BeachCard } from './components/BeachCard';
import { HashtagChip } from './components/HashtagChip';
import { BeachDetailView } from './components/BeachDetailView';
import { EventsView } from './components/EventsView';
import { MyPageView } from './components/MyPageView';
import { DeveloperModeView } from './components/DeveloperModeView';
import { BottomNavigation } from './components/BottomNavigation';
import { fetchBeaches, Beach } from './api/beaches';
import { Calendar } from './components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';

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
    <svg width="32" height="32" viewBox="0 0 50 50" fill="none">
      <path 
        d={svgPaths.p2a8354c0} 
        stroke="#007DFC" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2"
      />
    </svg>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showWeather, setShowWeather] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);
  const [lastSelectedBeach, setLastSelectedBeach] = useState<Beach | null>(null);
  const [currentView, setCurrentView] = useState<'main' | 'events' | 'mypage' | 'developer'>('main');
  const [activeTab, setActiveTab] = useState('search'); // Start with search tab active
  const [favoriteBeaches, setFavoriteBeaches] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDataReady = !isLoading && !error;

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('beachcheck_favorites');
    if (savedFavorites) {
      setFavoriteBeaches(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('beachcheck_favorites', JSON.stringify(favoriteBeaches));
  }, [favoriteBeaches]);

  const loadBeaches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchBeaches();
      setBeaches(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(message);
      setBeaches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBeaches();
  }, [loadBeaches]);

  // Load and apply theme on mount
  useEffect(() => {
    const applyTheme = () => {
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('beachcheck_theme') || 'light';
        const root = document.documentElement;
        const body = document.body;
        
        if (storedTheme === 'dark') {
          root.classList.add('dark');
          body.classList.add('dark');
        } else if (storedTheme === 'light') {
          root.classList.remove('dark');
          body.classList.remove('dark');
        } else {
          // Developer mode - same as system mode
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
            body.classList.add('dark');
          } else {
            root.classList.remove('dark');
            body.classList.remove('dark');
          }
        }
      }
    };

    applyTheme();

    // Listen for storage changes (when theme is changed in MyPageView)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'beachcheck_theme') {
        applyTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-page theme changes
    const handleThemeChange = () => {
      applyTheme();
    };

    window.addEventListener('themechange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  const hashtags = [
    { id: 'trending', label: '#요즘 뜨는 해수욕장' },
    { id: 'popular', label: '#사람들이 많이 가는 곳' },
    { id: 'festival', label: '#축제하는 곳' },
  ];

  const toggleFavorite = (beachId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDataReady) {
      return;
    }

    const beachIdStr = String(beachId);
    setFavoriteBeaches(prev => {
      if (prev.includes(beachIdStr)) {
        return prev.filter(id => id !== beachIdStr);
      } else {
        return [...prev, beachIdStr];
      }
    });
  };

  const filteredBeaches = useMemo(() => {
    if (!beaches.length) {
      return [];
    }

    return beaches.filter((beach) => {
      const matchesSearch = beach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           beach.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !activeTag || beach.tags.includes(activeTag);
      const matchesFavorite = !showFavoritesOnly || favoriteBeaches.includes(String(beach.id));
      return matchesSearch && matchesTag && matchesFavorite;
    });
  }, [beaches, searchQuery, activeTag, showFavoritesOnly, favoriteBeaches]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return '날짜';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const mockWeather = {
    temp: '28°C',
    condition: '맑음',
    humidity: '65%',
    wind: '3m/s',
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      // Go to BeachDetailView (시작화면2) with last selected beach
      const beachToSelect = lastSelectedBeach || beaches[0];
      if (beachToSelect) {
        setSelectedBeach(beachToSelect);
        setLastSelectedBeach(beachToSelect);
      }
      setCurrentView('main');
    } else if (tab === 'search') {
      // Go to main search screen (시작화면1)
      setCurrentView('main');
      setSelectedBeach(null);
    } else if (tab === 'events') {
      setCurrentView('events');
      setSelectedBeach(null);
    } else if (tab === 'mypage') {
      setCurrentView('mypage');
      setSelectedBeach(null);
    }
  };

  // Show events view
  if (currentView === 'events') {
    return (
      <EventsView 
        onNavigate={(view) => {
          if (view === 'main') {
            setCurrentView('main');
            setSelectedBeach(null);
            setActiveTab('search');
          } else {
            setCurrentView(view as 'main' | 'events' | 'mypage' | 'developer');
            setSelectedBeach(null);
          }
        }}
      />
    );
  }

  // Show my page view
  if (currentView === 'mypage') {
    return (
      <MyPageView 
        onNavigate={(view) => {
          if (view === 'main') {
            setCurrentView('main');
            setSelectedBeach(null);
            setActiveTab('search');
          } else if (view === 'developer') {
            setCurrentView('developer');
            setSelectedBeach(null);
          } else {
            setCurrentView(view as 'main' | 'events' | 'mypage' | 'developer');
            setSelectedBeach(null);
          }
        }}
      />
    );
  }

  // Show developer mode view
  if (currentView === 'developer') {
    return (
      <DeveloperModeView 
        onNavigate={(view) => {
          if (view === 'main') {
            setCurrentView('main');
            setSelectedBeach(null);
            setActiveTab('search');
          } else {
            setCurrentView(view as 'main' | 'events' | 'mypage' | 'developer');
            setSelectedBeach(null);
          }
        }}
      />
    );
  }

  // Show beach detail view when a beach is selected
  if (selectedBeach) {
    return (
      <BeachDetailView
        beach={selectedBeach}
        onClose={() => {
          setSelectedBeach(null);
          setActiveTab('search'); // Set active tab to search when closing detail view
        }}
        selectedDate={selectedDate}
        weatherTemp={mockWeather.temp}
        onDateChange={setSelectedDate}
        onNavigate={(view) => {
          if (view === 'events') {
            setCurrentView('events');
            setSelectedBeach(null);
            setActiveTab('events');
          } else if (view === 'mypage') {
            setCurrentView('mypage');
            setSelectedBeach(null);
            setActiveTab('mypage');
          }
        }}
        onBeachChange={(newBeach) => {
          setSelectedBeach(newBeach);
          setLastSelectedBeach(newBeach);
        }}
        favoriteBeaches={favoriteBeaches}
        onFavoriteToggle={(beachId) => {
          if (!isDataReady) return;
          const beachIdStr = String(beachId);
          setFavoriteBeaches(prev => {
            if (prev.includes(beachIdStr)) {
              return prev.filter(id => id !== beachIdStr);
            } else {
              return [...prev, beachIdStr];
            }
          });
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-background max-w-[480px] mx-auto pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-[#E8F4FF] to-[#F5F5F5] dark:from-gray-900 dark:to-gray-800 p-3 pb-5">
        {/* Logo and Date/Weather */}
        <div className="flex items-center justify-between gap-2 mb-5">
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
              <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[10px] leading-tight text-muted-foreground whitespace-nowrap">
                부산 해수욕장 혼잡도
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center justify-center gap-1.5 w-[85px] h-[38px] px-2 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="#007DFC" strokeWidth="1.5" />
                    <path d="M5 1V4M11 1V4M2 6H14" stroke="#007DFC" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[10px] text-foreground whitespace-nowrap truncate">
                    {formatDate(selectedDate)}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <button 
              onClick={() => setShowWeather(true)}
              className="flex items-center justify-center gap-1.5 w-[85px] h-[38px] px-2 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border"
              title="날씨 보기"
            >
              <svg width="20" height="20" viewBox="0 0 50 50" fill="none" className="shrink-0">
                <path 
                  d={svgPaths.p2a8354c0} 
                  stroke="#007DFC" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2"
                />
              </svg>
              <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[10px] text-foreground whitespace-nowrap">
                {mockWeather.temp}
              </span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative bg-card rounded-[10px] border-2 border-[#007dfc] p-3 flex items-center justify-between shadow-sm">
          <input
            type="text"
            placeholder="해수욕장 이름을 검색하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 outline-none bg-transparent font-['Noto_Sans_KR:Regular',_sans-serif] text-[13px] text-foreground placeholder:text-muted-foreground"
          />
          <Search className="w-[18px] h-[18px] text-[#007DFC]" />
        </div>

        {/* Hashtags */}
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {/* Favorite Filter Button */}
          <button
            onClick={() => {
              if (!isDataReady) return;
              setShowFavoritesOnly(!showFavoritesOnly);
              if (!showFavoritesOnly) {
                setActiveTag(null); // Clear other filters when showing favorites
              }
            }}
            disabled={!isDataReady}
            className={`shrink-0 flex items-center justify-center w-[36px] h-[36px] rounded-full transition-all border-2 ${
              showFavoritesOnly
                ? 'bg-purple-600 border-purple-600'
                : 'bg-card border-border hover:border-purple-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="찜한 해수욕장"
          >
            <Heart
              className={`w-4 h-4 ${
                showFavoritesOnly
                  ? 'fill-white stroke-white'
                  : 'fill-purple-600 stroke-purple-600'
              }`}
            />
          </button>

          {hashtags.map((tag) => (
            <HashtagChip
              key={tag.id}
              label={tag.label}
              isActive={activeTag === tag.id}
              onClick={() => {
                if (!isDataReady) return;
                setActiveTag(activeTag === tag.id ? null : tag.id);
                if (activeTag !== tag.id) {
                  setShowFavoritesOnly(false); // Clear favorites filter when selecting hashtag
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Beach List */}
      <div className="divide-y divide-border">
        {isLoading && (
          <div className="p-8 text-center">
            <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-muted-foreground">데이터를 불러오는 중입니다...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center space-y-4">
            <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-muted-foreground">{error}</p>
            <button
              onClick={loadBeaches}
              className="inline-flex items-center justify-center rounded-md bg-[#007DFC] px-4 py-2 text-white hover:bg-[#0063c9] transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {isDataReady && filteredBeaches.map((beach) => (
          <BeachCard
            key={beach.id}
            name={beach.name}
            address={beach.address}
            distance={beach.distance}
            status={beach.status}
            isFavorite={favoriteBeaches.includes(String(beach.id))}
            onFavoriteToggle={(e) => toggleFavorite(beach.id, e)}
            onClick={() => {
              if (!isDataReady) return;
              setSelectedBeach(beach);
              setLastSelectedBeach(beach);
              setActiveTab('home'); // Set active tab to home when selecting a beach
            }}
          />
        ))}
      </div>

      {isDataReady && filteredBeaches.length === 0 && (
        <div className="p-8 text-center">
          <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-muted-foreground">
            검색 결과가 없습니다.
          </p>
        </div>
      )}

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

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}