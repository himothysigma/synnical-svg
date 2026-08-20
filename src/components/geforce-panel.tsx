/**
 * GeForce NOW Integration Component
 * 
 * #39 - GeForce NOW as first-class Synnical app
 * - Launch handling
 * - Browser/proxy interaction
 * - Authentication state
 * - Fullscreen/app switching
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, ExternalLink, Maximize, Settings, Loader2, Gamepad2, AlertCircle } from 'lucide-react';

interface GeForceGame {
  id: string;
  name: string;
  coverArt?: string;
  provider?: 'geforce' | 'nvidia';
  lastPlayed?: Date;
}

// Sample GeForce NOW games
export const GEFORCE_GAMES: GeForceGame[] = [
  { id: 'cyberpunk2077', name: 'Cyberpunk 2077', provider: 'geforce' },
  { id: 'witcher3', name: 'The Witcher 3: Wild Hunt', provider: 'geforce' },
  { id: 'eldenring', name: 'Elden Ring', provider: 'geforce' },
  { id: 'gta5', name: 'Grand Theft Auto V', provider: 'geforce' },
  { id: 'reddead2', name: 'Red Dead Redemption 2', provider: 'geforce' },
  { id: 'control', name: 'Control', provider: 'geforce' },
];

interface GeForcePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchGame?: (gameId: string) => void;
}

type PanelState = 'library' | 'launching' | 'playing';

export function GeForcePanel({ isOpen, onClose, onLaunchGame }: GeForcePanelProps) {
  const [panelState, setPanelState] = useState<PanelState>('library');
  const [selectedGame, setSelectedGame] = useState<GeForceGame | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for stability
  const gameFrameRef = useRef<HTMLDivElement>(null);

  /**
   * Check NVIDIA/GeForce authentication
   */
  const checkAuthStatus = async () => {
    try {
      // In production, this would check /api/geforce/auth
      const response = await fetch('/api/geforce/status');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      }
    } catch (e) {
      console.error('[GeForce] Auth check failed:', e);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  /**
   * Launch a game via GeForce NOW
   */
  const launchGame = async (game: GeForceGame) => {
    setError(null);
    setSelectedGame(game);
    setPanelState('launching');

    try {
      // Notify parent
      onLaunchGame?.(game.id);

      // In production, this would:
      // 1. Call /api/geforce/launch with game ID
      // 2. Get session URL back
      // 3. Open in embedded browser or proxy
      
      // Simulate launch delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPanelState('playing');

    } catch (e) {
      console.error('[GeForce] Launch failed:', e);
      setError(e instanceof Error ? e.message : 'Failed to launch game');
      setPanelState('library');
    }
  };

  /**
   * Handle fullscreen for game
   */
  const handleFullscreen = () => {
    if (gameFrameRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        gameFrameRef.current.requestFullscreen().catch(console.error);
      }
    }
  };

  /**
   * Exit game/session
   */
  const exitSession = () => {
    setPanelState('library');
    setSelectedGame(null);
    
    // In production, call /api/geforce/end-session
  };

  // Format date
  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#1a1a2e] rounded-2xl border border-white/10 shadow-2xl w-[95%] max-w-5xl h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-green-400" />
            <h2 className="text-lg font-bold text-white">GeForce NOW</h2>
            
            {/* Auth indicator */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              isAuthenticated ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {isAuthenticated ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {panelState === 'library' && (
            /* Game Library View */
            <div className="p-4 h-full overflow-y-auto">
              {/* Error display */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-sm text-red-400">{error}</span>
                  <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-200 mb-2">
                    Connect your NVIDIA account to play games on GeForce NOW.
                  </p>
                  <button
                    onClick={() => window.open('/api/geforce/auth', '_blank')}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Connect Account
                  </button>
                </div>
              )}

              {/* Games Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {GEFORCE_GAMES.map(game => (
                  <button
                    key={game.id}
                    onClick={() => launchGame(game)}
                    disabled={!isAuthenticated}
                    className={`group relative bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all ${
                      !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {/* Cover Art Placeholder */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-green-900/50 to-emerald-900/30 flex items-center justify-center relative">
                      <Gamepad2 className="w-12 h-12 text-white/20 group-hover:text-white/40 transition-colors" />
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" fill="white" />
                      </div>

                      {/* Last played badge */}
                      {game.lastPlayed && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white/70">
                          {formatDate(game.lastPlayed)}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-white truncate">{game.name}</h4>
                      <p className="text-xs text-white/40 mt-0.5">GeForce NOW</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(panelState === 'launching' || panelState === 'playing') && (
            /* Game Session View */
            <div ref={gameFrameRef} className="h-full flex flex-col bg-black">
              {/* Game header bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-black/80 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Loader2 className={`w-4 h-4 text-green-400 ${panelState === 'launching' ? 'animate-spin' : ''}`} />
                  <span className="text-sm text-white/80">
                    {panelState === 'launching' ? `Launching ${selectedGame?.name}...` : selectedGame?.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFullscreen}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4 text-white/60" />
                  </button>
                  
                  <button
                    onClick={exitSession}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded transition-colors"
                  >
                    End Session
                  </button>
                </div>
              </div>

              {/* Game content area */}
              <div className="flex-1 flex items-center justify-center">
                {panelState === 'launching' ? (
                  <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 text-green-400 animate-spin mx-auto" />
                    <div>
                      <p className="text-white font-medium">Starting your session...</p>
                      <p className="text-sm text-white/40 mt-1">
                        Connecting to GeForce NOW servers
                      </p>
                    </div>
                    
                    {/* Simulated progress steps */}
                    <div className="space-y-2 text-left max-w-xs mx-auto">
                      {['Connecting to NVIDIA servers', 'Allocating GPU resources', 'Launching game'].map((step, i) => (
                        <div key={step} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            i <= 1 ? 'bg-green-400' : 'bg-white/20'
                          }`} />
                          <span className={i <= 1 ? 'text-white/80' : 'text-white/40'}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* In production, this would be an iframe or proxy to the actual game stream */
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Gamepad2 className="w-24 h-24 text-green-400 mx-auto opacity-50" />
                      <p className="text-white/60">Game session active</p>
                      <p className="text-sm text-white/30">
                        In production, this would show the actual game stream via Scramjet/Wisp proxy
                      </p>
                      <a
                        href="https://play.geforcenow.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in GeForce NOW
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* #33 - Game focus must NOT hide Synnical chrome outside Games */}
              <div className="px-4 py-2 bg-black/80 border-t border-white/10">
                <p className="text-[10px] text-white/30 text-center">
                  Press ESC or click End Session to return to Synnical
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
