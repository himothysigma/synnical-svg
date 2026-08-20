'use client';

import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';

interface AppLauncherProps {
  isOpen: boolean;
  onClose: () => void;
}

interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  color?: string;
}

const SynnicalIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" rx="22" fill="#0a0a0a"/>
    <rect x="2" y="2" width="96" height="96" rx="20" fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.3"/>
    <text x="50" y="68" fontFamily="Arial Black, sans-serif" fontSize="56" fontWeight="900" fill="#ec4899" textAnchor="middle">S</text>
    <circle cx="78" cy="22" r="4" fill="#ec4899" opacity="0.8"/>
    <circle cx="22" cy="78" r="3" fill="#ec4899" opacity="0.6"/>
  </svg>
);

export function AppLauncher({ isOpen, onClose }: AppLauncherProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const apps: App[] = [
    { id: 'synnflix', name: 'SynnFlix', icon: <SynnicalIcon />, category: 'Entertainment', color: '#ec4899' },
    { id: 'chat', name: 'Messages', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#5865F2"/></svg>
    ), category: 'Social', color: '#5865F2' },
    { id: 'friends', name: 'Friends', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#4CAF50"/></svg>
    ), category: 'Social', color: '#4CAF50' },
    { id: 'browser', name: 'Browser', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-1"><circle cx="12" cy="12" r="10" fill="#4285F4"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#g1)"/><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4285F4"/><stop offset="100%" stopColor="#34A853"/></linearGradient></defs></svg>
    ), category: 'Tools', color: '#4285F4' },
    { id: 'games', name: 'Games', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S19.17 9 20 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#FF5722"/></svg>
    ), category: 'Entertainment', color: '#FF5722' },
    { id: 'music', name: 'Music', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-1"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="#1DB954"/></svg>
    ), category: 'Entertainment', color: '#1DB954' },
    { id: 'code', name: 'VS Code', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-1"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" fill="#007ACC"/></svg>
    ), category: 'Development', color: '#007ACC' },
    { id: 'terminal', name: 'Terminal', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2"><rect width="24" height="24" rx="4" fill="#1E1E1E"/><path d="M8 9l-4 3 4 3" stroke="#4EC9B0" strokeWidth="1.5" fill="none"/><path d="M14 15h4" stroke="#4EC9B0" strokeWidth="1.5"/></svg>
    ), category: 'Development', color: '#1E1E1E' },
    { id: 'files', name: 'Files', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2"><path d="M3 7v13a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" fill="#FDB300"/><path d="M3 9h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" fill="#F5A623" opacity="0.8"/></svg>
    ), category: 'System', color: '#FDB300' },
    { id: 'settings', name: 'Settings', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="white"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="white" opacity="0.6"/></svg>
    ), category: 'System', color: '#6B7280' },
    { id: 'notes', name: 'Notes', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-2"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="#FEF08A" stroke="#EAB308"/><line x1="7" y1="8" x2="17" y2="8" stroke="#854D0E" strokeLinecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke="#854D0E" strokeLinecap="round"/><line x1="7" y1="16" x2="13" y2="16" stroke="#854D0E" strokeLinecap="round"/></svg>
    ), category: 'Productivity', color: '#FEF08A' },
    { id: 'discord', name: 'Discord', icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full p-1"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.975 19.975 0 0 0 6.003-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="#5865F2"/></svg>
    ), category: 'Social', color: '#5865F2' },
  ];

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(apps.map(app => app.category))];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-black/30 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl w-[90%] max-w-3xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                key={isOpen ? 'open' : 'closed'}
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-xl text-white placeholder-white/40 outline-none focus:bg-white/15 transition-colors"
                autoFocus
              />
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
          {searchQuery ? (
            /* Search Results */
            <div className="grid grid-cols-4 gap-4">
              {filteredApps.map(app => (
                <button
                  key={app.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/10 transition-all hover:scale-105 group"
                  onClick={() => {
                    // Handle app launch
                    console.log('Launching:', app.name);
                    onClose();
                  }}
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: app.color || '#333' }}
                  >
                    {app.icon}
                  </div>
                  <span className="text-xs text-white/70 font-medium group-hover:text-white">{app.name}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Categories */
            categories.map(category => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 px-1">
                  {category}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {apps.filter(app => app.category === category).map(app => (
                    <button
                      key={app.id}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/10 transition-all hover:scale-105 group"
                      onClick={() => {
                        console.log('Launching:', app.name);
                        onClose();
                      }}
                    >
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: app.color || '#333' }}
                      >
                        {app.icon}
                      </div>
                      <span className="text-xs text-white/70 font-medium group-hover:text-white">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
