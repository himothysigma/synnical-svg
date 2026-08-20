'use client';

import { useState } from 'react';

interface WidgetsPanelProps {
  date: Date;
}

export function WidgetsPanel({ date }: WidgetsPanelProps) {
  const [noteText, setNoteText] = useState("Your text won't erase\nIf you switch to another app");
  
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Get first day of month and total days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  // Empty cells before first day
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="flex flex-col gap-3 items-end">
      {/* Date + Calendar Row */}
      <div className="flex gap-3">
        {/* Date Widget */}
        <div className="bg-black/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-400/80 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-4xl font-light text-white/90">{currentDay}</span>
          </div>
          <p className="text-xs text-blue-300/80 font-medium">{monthNames[currentMonth]}</p>
          <p className="text-lg font-semibold text-white/70">{currentYear}</p>
          <p className="text-xs text-white/40 mt-1">1 {currentDay % 10 === 1 && currentDay !== 11 ? 'st' : currentDay % 10 === 2 && currentDay !== 12 ? 'nd' : currentDay % 10 === 3 && currentDay !== 13 ? 'rd' : 'th'} more</p>
        </div>

        {/* Mini Calendar */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/10">
          <p className="text-[10px] text-red-400/80 font-medium mb-2 text-center uppercase tracking-wider">
            {monthNames[currentMonth].slice(0, 3)} • {currentYear}
          </p>
          
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayOfWeek.map((d, i) => (
              <span key={i} className="text-[9px] text-white/40 text-center font-medium">{d}</span>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <div 
                key={i} 
                className={`
                  w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-medium
                  ${day === currentDay 
                    ? 'bg-red-500 text-white' 
                    : day 
                      ? 'text-white/60 hover:bg-white/10 cursor-pointer' 
                      : 'text-transparent'
                  }
                `}
              >
                {day || ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Widget */}
      <div className="bg-black/20 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 min-w-[220px]">
        <div className="bg-yellow-400 px-4 py-2">
          <p className="text-sm font-semibold text-black/80">Notes</p>
        </div>
        <div className="p-3">
          <p className="text-sm text-white/75 whitespace-pre-line leading-relaxed">
            {noteText}
          </p>
          <p className="text-[10px] text-white/30 mt-3">
            {date.toLocaleDateString('en-US')} {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
