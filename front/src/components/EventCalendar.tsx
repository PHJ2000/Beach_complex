import { useState } from 'react';
import { Event } from '../data/events';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface EventCalendarProps {
  events: Event[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
}

export function EventCalendar({ events, selectedDate, onDateSelect }: EventCalendarProps) {
  const [clickedDate, setClickedDate] = useState<number | null>(null);
  const currentDate = selectedDate || new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarDays = [];
  
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  const getEventsForDate = (day: number) => {
    return events.filter(event => {
      const eventStartDate = new Date(event.date);
      const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;
      const currentDate = new Date(year, month, day);
      
      return currentDate >= new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate()) &&
             currentDate <= new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
    });
  };
  
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const handleDateClick = (day: number) => {
    setClickedDate(clickedDate === day ? null : day);
    onDateSelect(new Date(year, month, day));
  };

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    onDateSelect(newDate);
    setClickedDate(null);
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    onDateSelect(newDate);
    setClickedDate(null);
  };

  return (
    <div className="bg-card dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="이전 달"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        
        <h2 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[24px] tracking-wider text-foreground">
          {monthNames[month]}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="다음 달"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div key={idx} className="text-center">
            <span className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[12px] text-muted-foreground">
              {day}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }
          
          const dayEvents = getEventsForDate(day);
          const today = isToday(day);
          
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`aspect-square flex flex-col items-center justify-start p-1 rounded-lg transition-all hover:bg-accent relative ${
                today ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500' : clickedDate === day ? 'bg-blue-100 dark:bg-blue-900/30' : ''
              }`}
            >
              <span className={`font-['Noto_Sans_KR:Medium',_sans-serif] text-[14px] mb-1 ${
                today ? 'text-white' : day === 7 || day === 14 || day === 21 || day === 28 ? 'text-red-500 dark:text-red-400' : 'text-foreground'
              }`}>
                {day}
              </span>
              
              {dayEvents.length > 0 && (
                <div className="flex flex-col gap-0.5 w-full px-1">
                  {dayEvents.slice(0, 3).map((event, eventIdx) => (
                    <div
                      key={eventIdx}
                      className="w-full h-1 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[8px] text-muted-foreground text-center">+{dayEvents.length - 3}</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {clickedDate !== null && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border-l-4 border-blue-500 relative">
          <button
            onClick={() => setClickedDate(null)}
            className="absolute top-2 right-2 p-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
          
          <h4 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[14px] mb-3 text-foreground">
            {month + 1}월 {clickedDate}일의 행사
          </h4>
          
          {getEventsForDate(clickedDate).length > 0 ? (
            <div className="space-y-2">
              {getEventsForDate(clickedDate).map((event) => (
                <div 
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-card dark:bg-gray-800 rounded-lg border border-border"
                >
                  <div 
                    className="w-1 h-full rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: event.color, minHeight: '40px' }}
                  />
                  <div className="flex-1">
                    <h5 className="font-['Noto_Sans_KR:Bold',_sans-serif] text-[13px] mb-1 text-foreground">
                      {event.title}
                    </h5>
                    <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[11px] text-muted-foreground mb-1">
                      {event.schedule}
                    </p>
                    <p className="font-['Noto_Sans_KR:Medium',_sans-serif] text-[11px] text-blue-600 dark:text-blue-400">
                      {event.recommendedTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-['Noto_Sans_KR:Regular',_sans-serif] text-[12px] text-muted-foreground">
              이 날짜에는 예정된 행사가 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
