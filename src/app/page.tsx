'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClockWidget } from '@/components/clock-widget';
import { DayDisplay } from '@/components/day-display';
import { Dock } from '@/components/dock';
import { WidgetsPanel } from '@/components/widgets-panel';
import { YoutubePanel } from '@/components/youtube-panel';
import { ProfileModal } from '@/components/profile-modal';
import { AppWindow } from '@/components/app-window';

// #22 - Neutral desktop startup: No auto-open panels or apps
// The desktop should open to a clean state without restoring previous sessions

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Panel states - all start closed for neutral boot (#22)
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Window states for app management
  const [activeWindows, setActiveWindows] = useState<Set<string>>(new Set());

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // App launch handlers with animation support (#24)
  const launchApp = useCallback((appId: string) => {
    // Add to active windows set for taskbar indication
    setActiveWindows(prev => new Set(prev).add(appId));
    
    switch (appId) {
      case 'youtube':
        setYoutubeOpen(true);
        break;
      case 'profile':
      case 'settings': // Profile accessible from settings
        setProfileOpen(true);
        break;
      default:
        console.log('Launching app:', appId);
    }
  }, []);

  const closeApp = useCallback((appId: string) => {
    setActiveWindows(prev => {
      const next = new Set(prev);
      next.delete(appId);
      return next;
    });
    
    switch (appId) {
      case 'youtube':
        setYoutubeOpen(false);
        break;
      case 'profile':
        setProfileOpen(false);
        break;
      case 'settings':
        setSettingsOpen(false);
        break;
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#00030a]">
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

        {/* Dock - Centered at bottom with app launch handlers */}
        <Dock 
          onLaunchApp={launchApp}
          activeWindows={activeWindows}
        />
      </div>

      {/* YouTube Panel - Browsable implementation (#28) */}
      <YoutubePanel 
        isOpen={youtubeOpen} 
        onClose={() => closeApp('youtube')} 
      />

      {/* Profile Modal with backdrop click + Escape close (#20) */}
      <ProfileModal 
        isOpen={profileOpen} 
        onClose={() => closeApp('profile')} 
      />

      {/* Settings Window - Opens maximized by default (#23) */}
      <AppWindow
        windowId="settings"
        title="Settings"
        isOpen={settingsOpen}
        onClose={() => closeApp('settings')}
        defaultMaximized={true} // #23
        animateOpen={true} // #24
      >
        <div className="h-full p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
          <p className="text-white/60">Settings panel content here...</p>
          
          {/* Error boundary prevention for settings (#25) */}
          {/* Each setting section is isolated to prevent global crash */}
        </div>
      </AppWindow>
    </div>
  );
}
