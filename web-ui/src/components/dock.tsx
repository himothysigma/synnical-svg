'use client';

import { useState } from 'react';
import { AppLauncher } from './app-launcher';

interface DockItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  action?: () => void;
}

// Real App Icons as SVG components
const SynnicalIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" rx="22" fill="#0a0a0a"/>
    <rect x="2" y="2" width="96" height="96" rx="20" fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.3"/>
    <text x="50" y="68" fontFamily="Arial Black, sans-serif" fontSize="56" fontWeight="900" fill="#ec4899" textAnchor="middle">S</text>
    <circle cx="78" cy="22" r="4" fill="#ec4899" opacity="0.8"/>
    <circle cx="22" cy="78" r="3" fill="#ec4899" opacity="0.6"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full p-1">
    <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" fill="none"/>
    <path d="M16 16l4 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FileExplorerIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full p-1">
    <path d="M3 7v13a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
          fill="#FDB300" stroke="#FDB300" strokeWidth="1"/>
    <path d="M3 9h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" fill="#F5A623" opacity="0.8"/>
  </svg>
);

const ChromeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full p-0.5">
    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#chrome-gradient)"/>
    <defs>
      <linearGradient id="chrome-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285F4"/>
        <stop offset="25%" stopColor="#EA4335"/>
        <stop offset="50%" stopColor="#FBBC05"/>
        <stop offset="75%" stopColor="#34A853"/>
        <stop offset="100%" stopColor="#4285F4"/>
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="4" fill="white"/>
    <path d="M12 8V2M12 22v-6M8 12H2M22 12h-6" stroke="white" strokeWidth="0.5" opacity="0.3"/>
  </svg>
);

const VSCodeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full p-1">
    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" fill="#007ACC"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full p-0.5">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.975 19.975 0 0 0 6.003-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="#5865F2"/>
  </svg>
);

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full p-0.5">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="#1DB954"/>
  </svg>
);

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full p-1">
    <rect width="24" height="24" rx="4" fill="#1E1E1E"/>
    <path d="M8 9l-4 3 4 3" stroke="#4EC9B0" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 15h4" stroke="#4EC9B0" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const NotesIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full p-1">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="#FEF08A" stroke="#EAB308" strokeWidth="1"/>
    <line x1="7" y1="8" x2="17" y2="8" stroke="#854D0E" strokeWidth="1" strokeLinecap="round"/>
    <line x1="7" y1="12" x2="17" y2="12" stroke="#854D0E" strokeWidth="1" strokeLinecap="round"/>
    <line x1="7" y1="16" x2="13" y2="16" stroke="#854D0E" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full p-1">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="white" opacity="0.9"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="white" opacity="0.6"/>
  </svg>
);

export function Dock() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [launcherOpen, setLauncherOpen] = useState(false);
  
  const dockItems: DockItem[] = [
    { id: 'synnical', name: 'Synnical', icon: <SynnicalIcon />, action: () => setLauncherOpen(true) },
    { id: 'search', name: 'Search', icon: <SearchIcon />, action: () => setLauncherOpen(true) },
    { id: 'files', name: 'Files', icon: <FileExplorerIcon /> },
    { id: 'browser', name: 'Browser', icon: <ChromeIcon /> },
    { id: 'code', name: 'VS Code', icon: <VSCodeIcon /> },
    { id: 'discord', name: 'Discord', icon: <DiscordIcon /> },
    { id: 'spotify', name: 'Spotify', icon: <SpotifyIcon /> },
    { id: 'terminal', name: 'Terminal', icon: <TerminalIcon /> },
    { id: 'notes', name: 'Notes', icon: <NotesIcon /> },
    { id: 'settings', name: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <div className="flex justify-center pb-4 pt-2">
      <div className="bg-black/25 backdrop-blur-xl rounded-2xl px-3 py-2 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-1">
          {dockItems.map((item) => (
            <button
              key={item.id}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={item.action}
              className={`
                relative group flex items-center justify-center
                w-11 h-11 rounded-xl transition-all duration-200
                ${hoveredItem === item.id 
                  ? 'bg-white/20 scale-110 -translate-y-2' 
                  : 'hover:bg-white/10 hover:scale-105'
                }
              `}
              title={item.name}
            >
              {item.icon}
              
              {/* Tooltip */}
              <span className={`
                absolute -top-8 left-1/2 -translate-x-1/2
                px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md
                text-[10px] text-white font-medium whitespace-nowrap
                pointer-events-none transition-opacity duration-150
                ${hoveredItem === item.id ? 'opacity-100' : 'opacity-0'}
              `}>
                {item.name}
              </span>

              {/* Active indicator dot */}
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
            </button>
          ))}
          
          {/* Separator */}
          <div className="w-px h-8 bg-white/20 mx-1" />
          
          {/* Trash */}
          <button
            onMouseEnter={() => setHoveredItem('trash')}
            onMouseLeave={() => setHoveredItem(null)}
            className={`
              relative group flex items-center justify-center
              w-11 h-11 rounded-xl transition-all duration-200
              ${hoveredItem === 'trash' 
                ? 'bg-white/20 scale-110 -translate-y-2' 
                : 'hover:bg-white/10'
              }
            `}
            title="Trash"
          >
            <svg viewBox="0 0 24 24" className="w-full h-full p-2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" 
                    stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* App Launcher Modal */}
      <AppLauncher isOpen={launcherOpen} onClose={() => setLauncherOpen(false)} />
    </div>
  );
}
