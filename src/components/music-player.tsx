/**
 * Music Player Component
 * 
 * #38 - Music/Spotify player stability
 * - Stable playback
 * - No unnecessary remounts
 * - Error recovery
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Music, ListMusic, Loader2 } from 'lucide-react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // seconds
  coverArt?: string;
  url?: string; // Audio URL
}

// Sample tracks for demo
export const SAMPLE_TRACKS: Track[] = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, coverArt: '/brand/music/soundcloud.svg' },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203 },
  { id: '3', title: 'Stay', artist: 'Kid LAROI & Justin Bieber', album: 'F*CK LOVE 3', duration: 141 },
  { id: '4', title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: 238 },
  { id: '5', title: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR', duration: 178 },
];

interface MusicPlayerProps {
  tracks?: Track[];
  initialTrackId?: string;
  onTrackChange?: (track: Track) => void;
}

type PlaybackState = 'idle' | 'playing' | 'paused' | 'loading' | 'error';

export function MusicPlayer({ 
  tracks = SAMPLE_TRACKS,
  initialTrackId,
  onTrackChange 
}: MusicPlayerProps) {
  // State
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(
    initialTrackId ? tracks.findIndex(t => t.id === initialTrackId) : 0
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [showQueue, setShowQueue] = useState(false);
  
  // Refs for stable audio handling (#38)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackIndexRef = useRef(currentTrackIndex);
  const handleNextRef = useRef<() => void>(() => {});
  const loadTrackRef = useRef<(index: number) => void>(() => {});

  // Update ref when index changes
  useEffect(() => {
    trackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  // Get current track
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  /**
   * Load and play a track - defined early, uses refs for dependencies
   */
  const [loadTrack, setLoadTrack] = useState<((index: number) => void)>(() => {});
  
  /**
   * Next track - defined early, uses ref for loadTrack
   */
  const [handleNext, setHandleNext] = useState<() => void>(() => {});

  // Set up the functions after initial render (avoiding circular deps)
  useEffect(() => {
    // Create loadTrack function that can reference itself via ref
    const createLoadTrack = () => {
      return (index: number) => {
        if (index < 0 || index >= tracks.length) return;

        const track = tracks[index];
        const audio = audioRef.current;

        setPlaybackState('loading');
        setCurrentTrackIndex(index);
        setCurrentTime(0);

        // Set source
        if (track.url && audio) {
          audio.src = track.url;
          audio.load();
        } else {
          // Simulate playback for demo (no real audio)
          setTimeout(() => {
            setDuration(track.duration);
            setPlaybackState('playing');
            
            // Simulate time progression
            const interval = setInterval(() => {
              setCurrentTime(prev => {
                if (prev >= track.duration) {
                  clearInterval(interval);
                  handleNextRef.current();
                  return 0;
                }
                return prev + 1;
              });
            }, 1000);
          }, 500);
        }

        onTrackChange?.(track);
      };
    };

    // Create handleNext function
    const createHandleNext = (lt: (index: number) => void) => {
      return () => {
        let nextIndex: number;

        if (isShuffled) {
          nextIndex = Math.floor(Math.random() * tracks.length);
        } else {
          nextIndex = (currentTrackIndex + 1) % tracks.length;
        }

        if (repeatMode === 'one') {
          nextIndex = currentTrackIndex;
        }

        lt(nextIndex);
      };
    };

    const lt = createLoadTrack();
    const hn = createHandleNext(lt);

    setLoadTrack(() => lt);
    setHandleNext(() => hn);
    loadTrackRef.current = lt;
    handleNextRef.current = hn;

  }, [isShuffled, currentTrackIndex, repeatMode, tracks, onTrackChange]);

  /**
   * Initialize or get audio element
   */
  const getAudioElement = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      
      // Event listeners
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        console.log('[Music] Track loaded:', currentTrack?.title);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        handleNextRef.current();
      });

      audio.addEventListener('error', (e) => {
        console.error('[Music] Audio error:', e);
        setPlaybackState('error');
      });

      audio.addEventListener('canplay', () => {
        if (playbackState === 'loading') {
          setPlaybackState('playing');
          audio.play().catch(console.error);
        }
      });

      audioRef.current = audio;
    }

    return audioRef.current;
  }, [currentTrack?.title, playbackState]);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = () => {
    const audio = audioRef.current;

    if (!audio && !currentTrack.url) {
      // Demo mode - toggle simulated playback
      if (playbackState === 'playing') {
        setPlaybackState('paused');
      } else {
        setPlaybackState('playing');
      }
      return;
    }

    if (playbackState === 'playing') {
      audio?.pause();
      setPlaybackState('paused');
    } else {
      if (audio) {
        audio.play().catch(e => {
          console.error('[Music] Play error:', e);
          setPlaybackState('error');
        });
      }
      setPlaybackState('playing');
    }
  };

  /**
   * Previous track
   */
  const handlePrev = () => {
    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      } else {
        setCurrentTime(0);
      }
      return;
    }

    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = tracks.length - 1;

    loadTrack(prevIndex);
  };

  /**
   * Seek to position
   */
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * (duration || currentTrack.duration);

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  /**
   * Toggle mute
   */
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  /**
   * Change volume
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (newVol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  /**
   * Cycle repeat mode
   */
  const cycleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-[#121212] rounded-xl overflow-hidden">
      {/* Main Player */}
      <div className="p-4 space-y-4">
        {/* Track Info */}
        <div className="flex items-center gap-4">
          {/* Album Art */}
          <div className={`w-16 h-16 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0 ${
            playbackState === 'playing' ? 'animate-pulse-slow' : ''
          }`}>
            {currentTrack?.coverArt ? (
              <img src={currentTrack.coverArt} alt={currentTrack.album} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Music className="w-8 h-8 text-white/50" />
            )}
          </div>

          {/* Title & Artist */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium truncate">{currentTrack?.title || 'No Track'}</h4>
            <p className="text-sm text-white/50 truncate">{currentTrack?.artist || 'Unknown Artist'}</p>
          </div>

          {/* Queue Toggle */}
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-2 rounded-lg transition-colors ${showQueue ? 'bg-white/10' : 'hover:bg-white/5'}`}
            title="Queue"
          >
            <ListMusic className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div 
            className="h-1.5 bg-white/10 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-pink-500 rounded-full relative"
              style={{ width: `${(currentTime / (duration || currentTrack.duration || 1)) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-white/40">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || currentTrack.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsShuffled(!isShuffled)}
              className={`p-2 rounded-lg transition-colors ${isShuffled ? 'text-green-400' : 'text-white/40 hover:text-white/60'}`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>

          {/* Center controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70"
              title="Previous"
            >
              <SkipBack className="w-5 h-5" fill="currentColor" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-3 bg-white rounded-full hover:scale-105 transition-transform"
              title={playbackState === 'playing' ? 'Pause' : 'Play'}
            >
              {playbackState === 'loading' ? (
                <Loader2 className="w-6 h-6 text-black animate-spin" />
              ) : playbackState === 'playing' ? (
                <Pause className="w-6 h-6 text-black" fill="black" />
              ) : (
                <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70"
              title="Next"
            >
              <SkipForward className="w-5 h-5" fill="currentColor" />
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={cycleRepeat}
              className={`p-2 rounded-lg transition-colors ${repeatMode !== 'off' ? 'text-green-400' : 'text-white/40 hover:text-white/60'}`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
            
            {/* Volume */}
            <div className="flex items-center gap-1 group/vol">
              <button
                onClick={toggleMute}
                className="p-2 text-white/40 hover:text-white/60 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <span className="text-xs">🔇</span>
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 opacity-0 group-hover/vol:opacity-100 transition-opacity accent-pink-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div className="border-t border-white/10 p-4 max-h-48 overflow-y-auto">
          <h4 className="text-sm font-medium text-white/60 mb-2">Up Next</h4>
          <div className="space-y-1">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  loadTrack(index);
                  setShowQueue(false);
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  index === currentTrackIndex ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <span className="text-xs text-white/30 w-4">{index + 1}</span>
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                  <Music className="w-4 h-4 text-white/30" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm text-white truncate">{track.title}</p>
                  <p className="text-xs text-white/40 truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-white/30">{formatTime(track.duration)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
