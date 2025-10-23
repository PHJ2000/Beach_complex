import { Home, Calendar, User, Search } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'search', label: '검색', icon: Search },
    { id: 'events', label: '주변행사', icon: Calendar },
    { id: 'mypage', label: '마이페이지', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card dark:bg-gray-800 border-t border-border shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] max-w-[480px] mx-auto z-40">
      <div className="flex items-center justify-around px-4 py-2 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1 min-w-[60px]"
            >
              <Icon 
                className={`w-5 h-5 ${isActive ? 'text-[#007DFC]' : 'text-muted-foreground'}`}
                fill={isActive && tab.id === 'home' ? '#007DFC' : 'none'}
              />
              <span 
                className={`font-['Noto_Sans_KR:Bold',_sans-serif] text-[10px] ${
                  isActive ? 'text-[#007DFC]' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
