'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Play, Clock, TrendingUp, Youtube, ArrowLeft, Loader2 } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  views: string;
  duration: string;
  uploaded: string;
}

// Simulated YouTube data for browsing (in production, this would use YouTube API or proxy)
const TRENDING_VIDEOS: Video[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up - Rick Astley',
    channel: 'Rick Astley',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    views: '1.4B views',
    duration: '3:33',
    uploaded: '15 years ago'
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Me at the zoo - jawed',
    channel: 'jawed',
    thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    views: '280M views',
    duration: '0:19',
    uploaded: '18 years ago'
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
    channel: 'officialpsy',
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
    views: '4.9B views',
    duration: '4:13',
    uploaded: '12 years ago'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    channel: 'Luis Fonsi',
    thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    views: '8.1B views',
    duration: '4:42',
    uploaded: '8 years ago'
  },
  {
    id: 'RgKAFK5djSk',
    title: 'Wiz Khalifa - See You Again ft. Charlie Puth',
    channel: 'WizKhalifaVEVO',
    thumbnail: 'https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg',
    views: '5.8B views',
    duration: '3:57',
    uploaded: '9 years ago'
  },
  {
    id: 'hT_nvWreIhg',
    title: "Mark Ronson - Uptown Funk ft. Bruno Mars",
    channel: 'MarkRonsonVEVO',
    thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg',
    views: '4.9B views',
    duration: '4:30',
    uploaded: '10 years ago'
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    channel: 'EdSheeran',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    views: '6.2B views',
    duration: '3:54',
    uploaded: '8 years ago'
  },
  {
    id: 'CevxZvSJLk8',
    title: 'Katy Perry - Roar (Official)',
    channel: 'KatyPerry',
    thumbnail: 'https://i.ytimg.com/vi/CevxZvSJLk8/hqdefault.jpg',
    views: '3.6B views',
    duration: '3:59',
    uploaded: '11 years ago'
  }
];

const CATEGORIES = ['All', 'Music', 'Gaming', 'News', 'Sports', 'Learning', 'Entertainment', 'Comedy'];

export function YoutubePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const playerRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedVideo) {
          setSelectedVideo(null);
        } else {
          onClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, selectedVideo, onClose]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay - in production, this would call YouTube API via proxy
    setTimeout(() => {
      const filtered = TRENDING_Videos.filter(v => 
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.channel.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  const displayVideos = searchQuery ? searchResults : TRENDING_VIDEOS;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#0f0f0f] rounded-2xl border border-white/10 shadow-2xl w-[95%] max-w-6xl h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-white/10">
          {selectedVideo ? (
            <>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <span className="text-white font-medium truncate">
                {selectedVideo.title}
              </span>
            </>
          ) : (
            <>
              <Youtube className="w-6 h-6 text-red-500" />
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search YouTube"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-full text-white placeholder-white/40 outline-none focus:bg-white/15 transition-colors text-sm"
                  autoFocus
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedVideo ? (
            /* Video Player View */
            <div className="h-full flex flex-col">
              {/* Player Area */}
              <div ref={playerRef} className="relative bg-black aspect-video w-full max-h-[60vh]">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              {/* Video Info */}
              <div className="p-4 overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                  <span>{selectedVideo.views}</span>
                  <span>{selectedVideo.uploaded}</span>
                </div>
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 font-bold">{selectedVideo.channel[0]}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedVideo.channel}</p>
                    <button className="text-red-400 text-sm font-medium hover:text-red-300">Subscribe</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Browse View */
            <div className="h-full overflow-y-auto p-4">
              {/* Categories */}
              {!searchQuery && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        activeCategory === cat
                          ? 'bg-white text-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Search loading state */}
              {isSearching ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                  <span className="ml-3 text-white/60">Searching...</span>
                </div>
              ) : (
                /* Videos Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayVideos.map(video => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="group text-left rounded-xl overflow-hidden hover:bg-white/5 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect fill="%231a1a1a" width="320" height="180"/><text fill="%23666" font-family="sans-serif" font-size="14" x="16" y="95">Video Thumbnail</text></svg>';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
                          {video.duration}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                          <Play className="w-12 h-12 text-white" fill="white" />
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="pt-3 px-1">
                        <h3 className="text-sm font-medium text-white line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-xs text-white/60">{video.channel}</p>
                        <p className="text-xs text-white/40">{video.views} • {video.uploaded}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Search className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/60">No results found for "{searchQuery}"</p>
                  <p className="text-white/40 text-sm mt-1">Try different keywords</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
