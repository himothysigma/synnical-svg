'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Settings, MessageCircle, Users, Shield, Star, Edit2, Camera, LogOut, Copy, Check } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  role?: string;
  messageCount: number;
  friendCount: number;
  isOnline: boolean;
  lastSeen?: string;
  joinDate: string;
}

// Mock user data - in production this comes from API
const MOCK_USER: UserProfile = {
  id: '1',
  username: 'synnical_user',
  displayName: 'Synnical User',
  avatar: undefined,
  banner: undefined,
  bio: 'Welcome to Synnical OS ✨',
  role: 'member',
  messageCount: 142,
  friendCount: 28,
  isOnline: true,
  joinDate: '2024-01-15'
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // If provided, shows that user's profile
}

export function ProfileModal({ isOpen, onClose, userId }: ProfileModalProps) {
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [activeTab, setActiveTab] = useState<'about' | 'activity'>('about');
  const [copiedId, setCopiedId] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key for closing (#20)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click to close (#20)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Copy user ID to clipboard (#35 - ID sharing UX)
  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  // Role badge styling - smaller size per (#21)
  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1.5 py-0.5';
      case 'moderator':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] px-1.5 py-0.5';
      case 'staff':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] px-1.5 py-0.5';
      default:
        return 'bg-white/10 text-white/60 border-white/20 text-[10px] px-1.5 py-0.5';
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-[#1a1a2e] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalSlideIn 0.2s ease-out' }}
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-blue-500/30 relative">
          {user.banner && (
            <img src={user.banner} alt="" className="w-full h-full object-cover" />
          )}
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Avatar & Basic Info */}
        <div className="px-5 pb-4">
          <div className="-mt-10 mb-3 flex items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-[#1a1a2e] overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  user.displayName[0].toUpperCase()
                )}
              </div>
              {/* Online status indicator */}
              <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#1a1a2e] ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>

            {/* Name & Role */}
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{user.displayName}</h2>
              </div>
              <p className="text-sm text-white/60">@{user.username}</p>
              
              {/* Staff Badge - smaller per (#21) */}
              <span className={`inline-flex items-center gap-1 rounded-full border font-medium mt-1 ${getRoleBadgeStyle(user.role)}`}>
                {user.role === 'admin' && <Shield className="w-2.5 h-2.5" />}
                {user.role === 'moderator' && <Star className="w-2.5 h-2.5" />}
                {user.role || 'Member'}
              </span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-white/70 mb-4">{user.bio}</p>
          )}

          {/* Stats Row - using dedicated stats visibility (#19) */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button className="flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <MessageCircle className="w-4 h-4 text-pink-400 mb-1" />
              <span className="text-lg font-bold text-white">{user.messageCount}</span>
              <span className="text-[10px] text-white/40">Messages</span>
            </button>
            <button className="flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Users className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-lg font-bold text-white">{user.friendCount}</span>
              <span className="text-[10px] text-white/40">Friends</span>
            </button>
            <button 
              onClick={copyUserId}
              className="flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
              title="Copy User ID"
            >
              {copiedId ? (
                <Check className="w-4 h-4 text-green-400 mb-1" />
              ) : (
                <Copy className="w-4 h-4 text-white/40 group-hover:text-white/60 mb-1" />
              )}
              <span className="text-[10px] text-white/40">
                {copiedId ? 'Copied!' : 'Copy ID'}
              </span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'about' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/70'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'activity' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/70'
              }`}
            >
              Activity
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'about' ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Status</span>
                <span className={`flex items-center gap-1.5 ${user.isOnline ? 'text-green-400' : 'text-white/60'}`}>
                  <span className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Joined</span>
                <span className="text-white/70">{new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/40 text-center py-4">Activity coming soon</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors text-sm font-medium">
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
            <button className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-in {
          animation: modalSlideIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
