'use client';

import { useState } from 'react';

interface ClockWidgetProps {
  date: Date;
}

export function ClockWidget({ date }: ClockWidgetProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const dateString = date.toLocaleDateString('en-US', options);

  return (
    <div className="flex items-start gap-4">
      {/* Quick Action Icons */}
      <div className="flex flex-col gap-3 mt-2">
        <button 
          className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/30 transition-colors"
          title="Refresh"
        >
          <svg className="w-4 h-4 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button 
          className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/30 transition-colors"
          title="Weather"
        >
          <svg className="w-4 h-4 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
        <button 
          className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/30 transition-colors"
          title="Settings"
          onClick={() => setNotesOpen(!notesOpen)}
        >
          <svg className="w-4 h-4 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Clock Display */}
      <div className="bg-black/15 backdrop-blur-md rounded-2xl px-8 py-5 border border-white/10">
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-extralight text-black/85 tracking-wide">
            {hours}:{minutes}
          </span>
          <span className="text-2xl font-light text-black/50">
            {seconds}
          </span>
        </div>
        <p className="text-sm text-black/55 mt-1 font-light tracking-wide">
          {dateString}
        </p>
      </div>
    </div>
  );
}
