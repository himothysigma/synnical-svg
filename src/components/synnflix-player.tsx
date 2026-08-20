/**
 * SynnFlix Player Component
 * 
 * #27 - Fix movies getting stuck around 8 seconds
 * #26 - Continue Watching removed (no CW state)
 * 
 * Fixes:
 * - Prevents iframe remounting on re-renders
 * - Stable player reference across state changes
 * - Proper error recovery
 * - No unnecessary re-initialization
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Loader2, AlertTriangle } from 'lucide-react';

interface SynnflixPlayerProps {
  src: string;
  title: string;
  type?: 'movie' | 'tv' | 'episode';
  season?: number;
  episode?: number;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

type PlayerState = 'loading' | 'playing' | 'paused' | 'error' | 'ended';

export function SynnflixPlayer({ 
  src, 
  title, 
  type = 'movie',
  onComplete,
  onError 
}: SynnflixPlayerProps) {
  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs to prevent remounting (#27 fix)
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track if we've initialized (prevents re-init loops)
  const initializedRef = useRef(false);

  // Generate stable embed URL
  const getEmbedUrl = useCallback((url: string): string | null => {
    try {
      const urlObj = new URL(url);
      
      // Handle vidking embed URLs (current provider)
      if (urlObj.origin === 'https://www.vidking.net') {
        return url; // Already an embed URL
      }
      
      // Handle YouTube URLs
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        }
      }
      
      // Handle direct video URLs
      if (url.match(/\.(mp4|webm|ogg|m3u8)(\?.*)?$/i)) {
        return url; // Direct video URL
      }
      
      // If already an embed URL pattern
      if (url.includes('/embed/') || url.includes('/player/')) {
        return url;
      }
      
      return url;
    } catch {
      console.error('[SynnFlix] Invalid URL:', url);
      return null;
    }
  }, []);

  const embedUrl = getEmbedUrl(src);

  // Handle iframe load event - CRITICAL for #27 fix
  const handleIframeLoad = useCallback(() => {
    console.log('[SynnFlix] Player iframe loaded');
    
    // Only set playing if we were in loading state
    // This prevents state conflicts from multiple load events
    setPlayerState(prev => prev === 'loading' ? 'playing' : prev);
    initializedRef.current = true;
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error('[SynnFlix] Player iframe error');
    setPlayerState('error');
    const msg = 'Unable to load video. The source may be unavailable.';
    setErrorMessage(msg);
    onError?.(msg);
  }, [onError]);

  // Monitor playback time for progress tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (playerState === 'playing') {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1); // Simulated - real implementation would message iframe
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [playerState]);

  // Toggle play/pause
  const togglePlayPause = () => {
    setPlayerState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Error state with retry
  if (playerState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black min-h-[300px]">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
        <p className="text-white/80 font-medium mb-2">Playback Error</p>
        <p className="text-white/50 text-sm text-center max-w-md mb-4">{errorMessage}</p>
        <button
          onClick={() => {
            setPlayerState('loading');
            setErrorMessage('');
          }}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative bg-black w-full aspect-video group/player">
      {/* Loading State */}
      {playerState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Video Iframe - KEY FIX: Only render once per src to prevent remounting (#27) */}
      {embedUrl && (
        <iframe
          ref={iframeRef}
          key={src} // Key changes when src changes
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      )}

      {/* No embed URL */}
      {!embedUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-white/50">Invalid video source</p>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
        playerState === 'playing' ? 'opacity-0 group-hover/player:opacity-100' : 'opacity-100'
      }`}>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Controls */}
        <div className="relative z-10 p-4">
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/progress">
            <div 
              className="h-full bg-pink-500 rounded-full relative"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-pink-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Skip back */}
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Skip back 10s">
                <SkipBack className="w-5 h-5 text-white" />
              </button>

              {/* Play/Pause */}
              <button 
                onClick={togglePlayPause}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title={playerState === 'playing' ? 'Pause' : 'Play'}
              >
                {playerState === 'playing' || playerState === 'loading' ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-0.5" />
                )}
              </button>

              {/* Skip forward */}
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Skip forward 10s">
                <SkipForward className="w-5 h-5 text-white" />
              </button>

              {/* Time display */}
              <span className="text-xs text-white/70 ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Mute toggle */}
              <button 
                onClick={toggleMute}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>

              {/* Fullscreen */}
              <button 
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Fullscreen"
                onClick={() => {
                  containerRef.current?.requestFullscreen();
                }}
              >
                <Maximize className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Title overlay */}
      <div className="absolute top-4 left-4 z-10 opacity-0 group-hover/player:opacity-100 transition-opacity">
        <h3 className="text-white font-medium drop-shadow-lg">{title}</h3>
        {type === 'tv' && (
          <p className="text-white/60 text-sm">S{season ?? 1}:E{episode ?? 1}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for stable SynnFlix playback
 * Prevents the >8 second bug by managing player lifecycle properly
 */
export function useSynnflixPlayer() {
  const [currentMedia, setCurrentMedia] = useState<{
    src: string;
    title: string;
    type: 'movie' | 'tv';
  } | null>(null);

  const playMedia = useCallback((src: string, title: string, type: 'movie' | 'tv' = 'movie') => {
    setCurrentMedia(prev => {
      // Only update if actually different (prevents remount)
      if (prev?.src === src) return prev;
      return { src, title, type };
    });
  }, []);

  const stopPlayback = useCallback(() => {
    setCurrentMedia(null);
  }, []);

  return {
    currentMedia,
    playMedia,
    stopPlayback,
    isPlaying: currentMedia !== null,
  };
}
