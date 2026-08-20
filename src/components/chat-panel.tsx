/**
 * Chat & Presence System
 * 
 * #36 - Chat/Presence bug fixes
 * - Reconnection handling
 * - Message sending/receiving
 * - Optimistic updates
 * - Duplicate prevention
 * - Who's Online presence
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Users, Wifi, WifiOff, Loader2 } from 'lucide-react';

// #34 - User-friendly status messages (no internal terminology)
export const CONNECTION_STATUS_MESSAGES = {
  connected: 'Connected',
  connecting: 'Connecting...',
  disconnected: 'Disconnected - Reconnecting...',
  offline: 'You appear to be offline',
} as const;

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  isOptimistic?: boolean; // Locally shown before server confirm
  status: 'sending' | 'sent' | 'delivered' | 'error' | 'failed';
}

export interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
}

interface ChatPanelProps {
  currentUserId: string;
  chatPartnerId?: string; // If DM
  channelId?: string;     // If channel
  socketUrl?: string;
}

/**
 * Main Chat Component with robust connection handling (#36)
 */
export function ChatPanel({ 
  currentUserId,
  chatPartnerId,
  channelId,
  socketUrl = '/?XTransformPort=3003', // Default Socket.IO via gateway
}: ChatPanelProps) {
  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'offline'>('connecting');
  
  // Presence state
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [showPresence, setShowPresence] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const messageQueueRef = useRef<string[]>([]); // Queue messages while disconnected
  const sentMessageIdsRef = useRef<Set<string>>(new Set()); // Track sent IDs to prevent duplicates

  // Initialize Socket.IO connection
  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      try {
        setConnectionStatus('connecting');

        // Dynamic import of socket.io-client
        const { io } = await import('socket.io-client');
        
        const socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000,
        });

        socketRef.current = socket;

        // Connection events
        socket.on('connect', () => {
          if (!mounted) return;
          console.log('[Chat] Connected:', socket.id);
          setConnectionStatus('connected');
          
          // Join room/channel
          if (channelId) {
            socket.emit('join:channel', channelId);
          }
          if (chatPartnerId) {
            socket.emit('join:dm', { userId: currentUserId, partnerId: chatPartnerId });
          }

          // Request presence update
          socket.emit('presence:request');

          // Send any queued messages
          while (messageQueueRef.current.length > 0) {
            const queuedMsg = messageQueueRef.current.shift();
            if (queuedMsg) {
              sendMessageToSocket(queuedMsg);
            }
          }
        });

        socket.on('disconnect', (reason) => {
          if (!mounted) return;
          console.log('[Chat] Disconnected:', reason);
          setConnectionStatus('disconnected');
        });

        socket.connect_error = ((error: Error) => {
          if (!mounted) return;
          console.error('[Chat] Connection error:', error);
          
          // Check if actually offline
          if (!navigator.onLine) {
            setConnectionStatus('offline');
          } else {
            setConnectionStatus('disconnected');
          }
        });

        // Message events
        socket.on('message:new', (data: any) => {
          if (!mounted) return;
          
          // #36 - Prevent duplicate messages
          if (sentMessageIdsRef.current.has(data.id)) {
            return;
          }

          const newMessage: ChatMessage = {
            id: data.id,
            senderId: data.senderId,
            senderName: data.senderName || 'Unknown',
            senderAvatar: data.senderAvatar,
            content: data.content,
            timestamp: new Date(data.timestamp),
            isOwn: data.senderId === currentUserId,
            status: 'delivered',
          };

          setMessages(prev => {
            // Check for duplicate in existing messages
            if (prev.some(m => m.id === data.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // Remove optimistic version if exists
          setMessages(prev => prev.filter(m => !m.isOptimistic || m.content !== data.content));
        });

        // Message acknowledgment
        socket.on('message:ack', (data: { tempId: string; realId: string }) => {
          setMessages(prev => prev.map(m => 
            m.id === data.tempId 
              ? { ...m, id: data.realId, status: 'sent' as const, isOptimistic: false }
              : m
          ));
        });

        // Message send error
        socket.on('message:error', (data: { tempId: string; error: string }) => {
          setMessages(prev => prev.map(m => 
            m.id === data.tempId 
              ? { ...m, status: 'error' as const }
              : m
          ));
        });

        // Presence events
        socket('presence:update', (users: PresenceUser[]) => {
          if (mounted) {
            setOnlineUsers(users);
          }
        });

        socket('user:online', (user: PresenceUser) => {
          if (mounted) {
            setOnlineUsers(prev => {
              if (prev.find(u => u.id === user.id)) {
                return prev.map(u => u.id === user.id ? user : u);
              }
              return [...prev, user];
            });
          }
        });

        socket('user:offline', (userId: string) => {
          if (mounted) {
            setOnlineUsers(prev => prev.filter(u => u.id !== userId));
          }
        });

        // Load initial messages
        if (channelId) {
          socket.emit('messages:history', { channelId, limit: 50 });
        }
        if (chatPartnerId) {
          socket.emit('messages:dm-history', { userId: currentUserId, partnerId: chatPartnerId, limit: 50 });
        }

        socket.on('messages:history', (history: any[]) => {
          if (!mounted) return;
          const mapped: ChatMessage[] = history.map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.senderName || 'Unknown',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            isOwn: msg.senderId === currentUserId,
            status: 'delivered' as const,
          }));
          setMessages(mapped);
        });

      } catch (error) {
        console.error('[Chat] Failed to initialize:', error);
        if (mounted) {
          setConnectionStatus('offline');
        }
      }
    };

    initSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUserId, channelId, chatPartnerId, socketUrl]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Send message with optimistic update (#36)
   */
  const handleSend = useCallback(() => {
    const content = inputValue.trim();
    if (!content) return;

    setInputValue('');

    // Create optimistic message
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      senderId: currentUserId,
      senderName: 'You',
      content,
      timestamp: new Date(),
      isOwn: true,
      isOptimistic: true,
      status: 'sending',
    };

    // Add to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    sentMessageIdsRef.current.add(tempId);

    // Try to send via socket
    if (socketRef.current?.connected) {
      sendMessageToSocket(content, tempId);
    } else {
      // Queue for when reconnects
      messageQueueRef.current.push(content);
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, status: 'error' as const } : m
      ));
    }
  }, [inputValue, currentUserId]);

  /**
   * Actually send message through socket
   */
  const sendMessageToSocket = (content: string, tempId?: string) => {
    if (!socketRef.current) return;

    const id = tempId || `msg-${Date.now()}`;
    
    socketRef.current.emit('message:send', {
      id,
      content,
      channelId,
      recipientId: chatPartnerId,
      timestamp: new Date().toISOString(),
    });

    sentMessageIdsRef.current.add(id);
  };

  // Retry failed message
  const retryMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, status: 'sending' as const } : m
      ));
      sendMessageToSocket(message.content, messageId.startsWith('temp-') ? messageId : undefined);
    }
  };

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-white">Messages</h3>
          {/* Connection Status Indicator */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
            connectionStatus === 'connected' ? 'bg-green-500/10 text-green-400' :
            connectionStatus === 'connecting' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {connectionStatus === 'connected' ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {CONNECTION_STATUS_MESSAGES[connectionStatus]}
          </div>
        </div>

        {/* Who's Online Button */}
        <button
          onClick={() => setShowPresence(!showPresence)}
          className={`p-2 rounded-lg transition-colors ${
            showPresence ? 'bg-white/10' : 'hover:bg-white/5'
          }`}
          title="Who's Online"
        >
          <Users className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Presence Panel */}
      {showPresence && (
        <div className="border-b border-white/10 p-4 max-h-40 overflow-y-auto">
          <h4 className="text-xs font-medium text-white/40 uppercase mb-2">
            Online ({onlineUsers.filter(u => u.status === 'online').length})
          </h4>
          <div className="space-y-2">
            {onlineUsers.map(user => (
              <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1a1a2e] ${
                    user.status === 'online' ? 'bg-green-500' :
                    user.status === 'away' ? 'bg-yellow-500' :
                    user.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                </div>
                <span className="text-sm text-white/80">{user.name}</span>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <p className="text-xs text-white/30 text-center py-2">No one online</p>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-white/30 text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                message.isOwn
                  ? 'bg-pink-500/20 text-white rounded-br-md'
                  : 'bg-white/5 text-white/80 rounded-bl-md'
              }`}
            >
              {!message.isOwn && (
                <p className="text-xs text-pink-400 font-medium mb-1">{message.senderName}</p>
              )}
              <p className="text-sm break-words">{message.content}</p>
              
              {/* Status & Time */}
              <div className={`flex items-center gap-2 mt-1 ${message.isOwn ? 'justify-end' : ''}`}>
                <span className="text-[10px] text-white/30">{formatTime(message.timestamp)}</span>
                
                {message.isOwn && (
                  <span className="text-[10px]">
                    {message.status === 'sending' && <Loader2 className="w-3 h-3 inline animate-spin text-white/40" />}
                    {message.status === 'sent' && <span className="text-white/30">✓</span>}
                    {message.status === 'delivered' && <span className="text-white/50">✓✓</span>}
                    {message.status === 'error' && (
                      <button 
                        onClick={() => retryMessage(message.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Failed - Tap to retry
                      </button>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2">
          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-white/40" />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              connectionStatus === 'offline' 
                ? "You're offline..." 
                : connectionStatus === 'disconnected'
                ? "Reconnecting..."
                : "Type a message..."
            }
            disabled={connectionStatus === 'offline'}
            className="flex-1 bg-transparent outline-none text-white placeholder-white/30 text-sm"
          />
          
          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <Smile className="w-5 h-5 text-white/40" />
          </button>
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || connectionStatus === 'offline'}
            className="p-2 bg-pink-500 hover:bg-pink-600 disabled:bg-white/10 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
