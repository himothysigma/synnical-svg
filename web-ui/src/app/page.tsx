'use client';

import { useState, useEffect } from 'react';
import { ClockWidget } from '@/components/clock-widget';
import { DayDisplay } from '@/components/day-display';
import { Dock } from '@/components/dock';
import { WidgetsPanel } from '@/components/widgets-panel';

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Wallpaper Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/wallpaper-sakura-samurai.png)' }}
      />
      
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Center - Day Display */}
        <div className="flex-1 flex items-center justify-center">
          <DayDisplay date={currentTime} />
        </div>

        {/* Bottom Section: Clock + Widgets + Dock */}
        <div className="pb-6 px-8">
          <div className="flex items-end justify-between">
            
            {/* Left - Clock Widget */}
            <ClockWidget date={currentTime} />

            {/* Center spacer for visual balance */}

            {/* Right - Widgets Panel */}
            <WidgetsPanel date={currentTime} />
          </div>
        </div>

        {/* Dock - Centered at bottom */}
        <Dock />
      </div>
    </div>
  );
}
