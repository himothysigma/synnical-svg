'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { X, Minus, Square, Maximize2, Copy } from 'lucide-react';

export interface WindowState {
  id: string;
  title: string;
  icon?: ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface AppWindowProps {
  windowId: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  isMaximized?: boolean;
  /** If true, window opens maximized (#23) */
  defaultMaximized?: boolean;
  /** Enable Windows-like open animation (#24) */
  animateOpen?: boolean;
  /** Minimum window size */
  minSize?: { width: number; height: number };
}

// Global z-index counter for window stacking
let globalZIndex = 100;

export function AppWindow({
  windowId,
  title,
  icon,
  children,
  isOpen,
  onClose,
  defaultMaximized = true, // #23 - Default to maximized
  animateOpen = true, // #24 - Animation enabled by default
  minSize = { width: 400, height: 300 }
}: AppWindowProps) {
  const [isMaximized, setIsMaximized] = useState(defaultMaximized);
  const [isMinimized, setIsMinimized] = useState(false);
  const [zIndex, setZIndex] = useState(++globalZIndex);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState(minSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; mouseX: number; mouseY: number } | null>(null);

  // Handle opening animation (#24)
  useEffect(() => {
    if (isOpen && animateOpen) {
      setIsOpening(true);
      const timer = setTimeout(() => setIsOpening(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, animateOpen]);

  // Bring to front on click
  const bringToFront = () => {
    setZIndex(++globalZIndex);
  };

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    bringToFront();
    setIsDragging(true);
    dragStartRef.current = {
      x: position.x,
      y: position.y,
      mouseX: e.clientX,
      mouseY: e.clientY
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      
      const deltaX = moveEvent.clientX - dragStartRef.current.mouseX;
      const deltaY = moveEvent.clientY - dragStartRef.current.mouseY;
      
      setPosition({
        x: dragStartRef.current.x + deltaX,
        y: dragStartRef.current.y + deltaY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Toggle maximize (#23)
  const toggleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
    } else {
      // Save current position/size before maximizing
      setIsMaximized(true);
    }
    bringToFront();
  };

  // Toggle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${
        isOpen ? '' : 'hidden'
      }`}
      style={{ zIndex: isOpen ? zIndex : -1 }}
    >
      {/* Window container */}
      <div
        className={`
          fixed bg-[#1a1a2e]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl
          flex flex-col overflow-hidden pointer-events-auto
          ${isMinimized ? 'opacity-0 scale-95' : 'opacity-100'}
          ${isMaximized ? 'inset-4' : ''}
          ${isOpening ? 'window-opening-animation' : ''}
          ${isDragging ? 'cursor-grabbing select-none' : ''}
          transition-all duration-150 ease-out
        `}
        style={
          !isMaximized 
            ? { left: position.x, top: position.y, width: size.width, height: size.height }
            : undefined
        }
        onClick={bringToFront}
      >
        {/* Title Bar */}
        <div
          className="flex items-center h-10 px-3 bg-white/5 border-b border-white/5 cursor-grab shrink-0"
          onMouseDown={handleMouseDown}
          onDoubleClick={toggleMaximize}
        >
          {/* Window Icon */}
          <span className="mr-2 text-white/60">{icon || <Copy className="w-4 h-4" />}</span>
          
          {/* Title */}
          <span className="flex-1 text-sm font-medium text-white/80 truncate">{title}</span>
          
          {/* Window Controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5 text-white/60" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? (
                <Square className="w-3 h-3.5 text-white/60" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-white/60" />
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-1.5 rounded-md hover:bg-red-500/80 hover:text-white transition-colors group"
              title="Close"
            >
              <X className="w-3.5 h-3.5 text-white/60 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-hidden ${!isMinimized ? 'block' : 'hidden'}`}>
          {children}
        </div>
      </div>

      {/* Windows-like open animation styles (#24) */}
      <style jsx global>{`
        @keyframes windowOpen {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .window-opening-animation {
          animation: windowOpen 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .window-opening-animation {
            animation: none;
          }
        }

        /* Synnical animation settings integration */
        .synnical-os-no-animations .window-opening-animation {
          animation: none !important;
        }
      `}</style>
    </div>
  );
}

// Window Manager Hook for managing multiple windows
export function useWindowManager() {
  const [windows, setWindows] = useState<Map<string, WindowState>>(new Map());

  const openWindow = (id: string, title: string, icon?: ReactNode) => {
    setWindows(prev => {
      const newMap = new Map(prev);
      newMap.set(id, {
        id,
        title,
        icon,
        isMinimized: false,
        isMaximized: true, // #23 - Open maximized by default
        zIndex: ++globalZIndex,
        position: { x: 100 + (newMap.size * 30), y: 100 + (newMap.size * 30) },
        size: { width: 800, height: 600 }
      });
      return newMap;
    });
  };

  const closeWindow = (id: string) => {
    setWindows(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => {
      const newMap = new Map(prev);
      const win = newMap.get(id);
      if (win) {
        newMap.set(id, { ...win, isMinimized: !win.isMinimized });
      }
      return newMap;
    });
  };

  return { windows, openWindow, closeWindow, minimizeWindow };
}
