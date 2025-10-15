import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import svgPaths from "../imports/svg-aou00tt65r";
import developerIcon from 'figma:asset/bae562f0a5cb614be1ddd76987a8beda0506f3a2.png';
import { BottomNavigation } from './BottomNavigation';
import { MyPageCalendar } from './MyPageCalendar';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MyPageViewProps {
  onNavigate: (view: string) => void;
}

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

export function MyPageView({ onNavigate }: MyPageViewProps) {
  const [activeTab, setActiveTab] = useState('mypage');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showWeather, setShowWeather] = useState(false);
  const [peakAvoidNotification, setPeakAvoidNotification] = useState(false);
  const [bookmarkNotification, setBookmarkNotification] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'developer'>('light');

  const mockWeather = {
    temp: '28°C',
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      onNavigate('main');
    } else if (tab === 'search') {
      onNavigate('main');
    } else if (tab === 'events') {
      onNavigate('events');
    }
  };

  // Load settings from localStorage and apply theme
  // This runs every time the component mounts (including when returning to this page)
  useEffect(() => {
    const loadAndApplySettings = () => {
      if (typeof window !== 'undefined') {
        const storedPeak = localStorage.getItem('beachcheck_peak_notification');
        const storedBookmark = localStorage.getItem('beachcheck_bookmark_notification');
        const storedTheme = localStorage.getItem('beachcheck_theme') || 'light';
        
        if (storedPeak !== null) setPeakAvoidNotification(storedPeak === 'true');
        if (storedBookmark !== null) setBookmarkNotification(storedBookmark === 'true');
        
        // Set theme mode state
        const themeValue = storedTheme as 'light' | 'dark' | 'developer';
        setThemeMode(themeValue);
        
        // Apply theme immediately
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

    // Load settings immediately when component mounts
    loadAndApplySettings();
  }, []); // Empty dependency array means this runs on every mount

  // Save settings to localStorage
  const handlePeakNotificationChange = (checked: boolean) => {
    setPeakAvoidNotification(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('beachcheck_peak_notification', checked.toString());
    }
  };

  const handleBookmarkNotificationChange = (checked: boolean) => {
    setBookmarkNotification(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('beachcheck_bookmark_notification', checked.toString());
    }
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'developer') => {
    setThemeMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('beachcheck_theme', mode);
      
      // Apply theme
      const root = document.documentElement;
      const body = document.body;
      
      if (mode === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
      } else if (mode === 'light') {
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

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('themechange'));
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground max-w-[480px] mx-auto pb-20">
      {/* Header */}
      <div className="relative bg-card p-3 border-b border-border">
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
              <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[10px] leading-tight text-muted-foreground whitespace-nowrap">
                부산 해수욕장 혼잡도
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              className="flex items-center justify-center gap-1.5 w-[85px] h-[38px] px-2 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <rect x="2" y="3" width="12" height="11" rx="2" stroke="#007DFC" strokeWidth="1.5" />
                <path d="M5 1V4M11 1V4M2 6H14" stroke="#007DFC" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[10px] text-foreground whitespace-nowrap truncate">
                {formatDate(selectedDate)}
              </span>
            </button>
            
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
      </div>

      {/* Notifications Section */}
      <div className="p-4">
        <h3 className="font-['Noto_Sans_KR:Bold',_sans-serif] mb-4 text-foreground">알림</h3>
        
        <div className="bg-card dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-border border border-border">
          {/* Peak Avoidance Notification */}
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <h4 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[14px] mb-1 text-foreground">
                피크 타임 회피 알림
              </h4>
              <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[12px] text-muted-foreground">
                혼잡 시간대에 알림을 받습니다
              </p>
            </div>
            <Switch
              checked={peakAvoidNotification}
              onCheckedChange={handlePeakNotificationChange}
            />
          </div>

          {/* Bookmark Notification */}
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <h4 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[14px] mb-1 text-foreground">
                지정 날짜 알림
              </h4>
              <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[12px] text-muted-foreground">
                지정한 날짜와 시간에 알림을 받습니다
              </p>
            </div>
            <Switch
              checked={bookmarkNotification}
              onCheckedChange={handleBookmarkNotificationChange}
            />
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="px-4">
        <h3 className="font-['Noto_Sans_KR:Bold',_sans-serif] mb-3 text-foreground">캘린더</h3>
        <MyPageCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      </div>

      {/* Theme Mode Section */}
      <div className="p-4 mt-4">
        <h3 className="font-['Noto_Sans_KR:Bold',_sans-serif] mb-3 text-foreground">
          화면 모드 (라이트 모드 / 다크 모드 / 개발자 모드)
        </h3>
        
        <div className="bg-muted dark:bg-gray-800 rounded-xl p-4 border border-border">
          <div className="flex items-center justify-around">
            {/* Light Mode */}
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all ${
                themeMode === 'light' ? 'bg-blue-500 text-white' : 'hover:bg-accent text-foreground'
              }`}
            >
              <Sun className="w-7 h-7" />
              <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[10px]">
                라이트
              </span>
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all ${
                themeMode === 'dark' ? 'bg-blue-500 text-white' : 'hover:bg-accent text-foreground'
              }`}
            >
              <Moon className="w-7 h-7" />
              <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[10px]">
                다크
              </span>
            </button>

            {/* Developer Mode */}
            <button
              onClick={() => onNavigate('developer')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all hover:bg-accent text-foreground"
            >
              <ImageWithFallback 
                src={developerIcon} 
                alt="개발자 모드" 
                className="w-7 h-7 object-contain"
              />
              <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[10px]">
                개발자
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

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
