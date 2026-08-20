/**
 * Synnical Theme System
 * 
 * #32 - Theme/UI defaults implementation
 * - Default theme = "blood"
 * - Wallpaper should not be transparent
 * - Interactive buttons remain visibly dark blue
 * - Adwaita Sans default UI font (fallback)
 */

'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

// #32 - Theme definitions
export interface SynnicalTheme {
  id: string;
  name: string;
  description: string;
  
  // Colors
  primary: string;        // Main accent color
  secondary: string;      // Secondary accent
  background: string;     // Main background
  surface: string;        // Card/panel background
  text: string;           // Primary text
  textMuted: string;      // Secondary text
  
  // Specific element colors per handoff requirements
  interactiveButton: string; // Dark blue for interactive buttons (#32)
  wallpaperOpacity: number;  // Wallpaper should NOT be transparent (#32)
  
  // CSS custom properties to apply
  cssVars: Record<string, string>;
}

// Predefined themes
export const SYNNTHEMES: Record<string, SynnicalTheme> = {
  blood: {
    id: 'blood',
    name: 'Blood',
    description: 'Deep red and dark theme',
    primary: '#dc2626',       // Red-600
    secondary: '#991b1b',     // Red-800
    background: '#0a0000',    // Near black with red tint
    surface: '#1a0505',       // Dark red-tinted surface
    text: '#fef2f2',          // Red-50
    textMuted: '#f87171',     // Red-400
    interactiveButton: '#1e3a5f', // Dark blue (#32)
    wallpaperOpacity: 0.95,   // Not transparent (#32)
    cssVars: {
      '--synnical-primary': '#dc2626',
      '--synnical-secondary': '#991b1b',
      '--synnical-background': '#0a0000',
      '--synnical-surface': '#1a0505',
      '--synnical-text': '#fef2f2',
      '--synnical-text-muted': '#f87171',
      '--synnical-interactive': '#1e3a5f',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark blue theme',
    primary: '#3b82f6',       // Blue-500
    secondary: '#1e40af',     // Blue-800
    background: '#000510',    // Near black with blue tint
    surface: '#0a1025',       // Dark blue surface
    text: '#eff6ff',          // Blue-50
    textMuted: '#60a5fa',     // Blue-400
    interactiveButton: '#1e3a5f', // Dark blue
    wallpaperOpacity: 0.95,
    cssVars: {
      '--synnical-primary': '#3b82f6',
      '--synnical-secondary': '#1e40af',
      '--synnical-background': '#000510',
      '--synnical-surface': '#0a1025',
      '--synnical-text': '#eff6ff',
      '--synnical-text-muted': '#60a5fa',
      '--synnical-interactive': '#1e3a5f',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Green nature theme',
    primary: '#22c55e',       // Green-500
    secondary: '#166534',     // Green-800
    background: '#000a00',    // Near black with green tint
    surface: '#051a05',       // Dark green surface
    text: '#f0fdf4',          // Green-50
    textMuted: '#4ade80',     // Green-400
    interactiveButton: '#1e3a5f', // Dark blue
    wallpaperOpacity: 0.95,
    cssVars: {
      '--synnical-primary': '#22c55e',
      '--synnical-secondary': '#166534',
      '--synnical-background': '#000a00',
      '--synnical-surface': '#051a05',
      '--synnical-text': '#f0fdf4',
      '--synnical-text-muted': '#4ade80',
      '--synnical-interactive': '#1e3a5f',
    },
  },
  purple_haze: {
    id: 'purple_haze',
    name: 'Purple Haze',
    description: 'Purple accent theme',
    primary: '#a855f7',       // Purple-500
    secondary: '#7e22ce',     // Purple-800
    background: '#080010',    // Near black with purple tint
    surface: '#12081f',       // Dark purple surface
    text: '#faf5ff',          // Purple-50
    textMuted: '#c084fc',     // Purple-400
    interactiveButton: '#1e3a5f', // Dark blue
    wallpaperOpacity: 0.95,
    cssVars: {
      '--synnical-primary': '#a855f7',
      '--synnical-secondary': '#7e22ce',
      '--synnical-background': '#080010',
      '--synnical-surface': '#12081f',
      '--synnical-text': '#faf5ff',
      '--synnical-text-muted': '#c084fc',
      '--synnical-interactive': '#1e3a5f',
    },
  },
  synnical_default: {
    id: 'synnical_default',
    name: 'Synnical Default',
    description: 'Original pink/purple theme',
    primary: '#ec4899',       // Pink-500
    secondary: '#be185d',     // Pink-800
    background: '#03000a',    // Original dark bg
    surface: '#1a0a1e',       // Pink-tinted surface
    text: '#fdf2f8',          // Pink-50
    textMuted: '#f472b6',     // Pink-400
    interactiveButton: '#1e3a5f', // Dark blue
    wallpaperOpacity: 0.95,
    cssVars: {
      '--synnical-primary': '#ec4899',
      '--synnical-secondary': '#be185d',
      '--synnical-background': '#03000a',
      '--synnical-surface': '#1a0a1e',
      '--synnical-text': '#fdf2f8',
      '--synnical-text-muted': '#f472b6',
      '--synnical-interactive': '#1e3a5f',
    },
  },
};

// Theme context
interface ThemeContextType {
  currentTheme: SynnicalTheme;
  themeId: string;
  setTheme: (themeId: string) => void;
  availableThemes: typeof SYNNTHEMES;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// LocalStorage key
const THEME_STORAGE_KEY = 'synnical.theme.v1';

// Default theme per #32
const DEFAULT_THEME_ID = 'blood';

/**
 * Get initial theme from localStorage (called once during initialization)
 */
function getInitialThemeId(): string {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && SYNNTHEMES[saved]) {
      return saved;
    }
  } catch (e) {
    // Silently fail - use default
  }
  return DEFAULT_THEME_ID;
}

/**
 * Theme Provider Component
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(getInitialThemeId);
  const mountedRef = useRef(false);

  // Apply theme CSS variables when theme changes (after mount)
  useEffect(() => {
    mountedRef.current = true;
    
    const theme = SYNNTHEMES[themeId] || SYNNTHEMES[DEFAULT_THEME_ID];
    
    // Apply CSS variables to :root
    const root = document.documentElement;
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Save to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (e) {
      console.warn('[Theme] Failed to save theme:', e);
    }
  }, [themeId]);

  const setTheme = (newThemeId: string) => {
    if (SYNNTHEMES[newThemeId]) {
      setThemeIdState(newThemeId);
    }
  };

  const currentTheme = SYNNTHEMES[themeId] || SYNNTHEMES[DEFAULT_THEME_ID];

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themeId,
      setTheme,
      availableThemes: SYNNTHEMES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 */
export function useSynnicalTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSynnicalTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Theme Applier Component
 * Applies theme classes/styles to children
 */
export function ThemeApplier({ children }: { children: ReactNode }) {
  const { currentTheme } = useSynnicalTheme();

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Font System
 * #32 - Adwaita Sans default UI font
 */
export const FONT_CONFIG = {
  // Primary font stack with Adwaita Sans as preferred
  uiFont: "'Adwaita Sans', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  
  // Monospace font for code/terminal
  monoFont: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  
  // Display font for headings/titles
  displayFont: "'Adwaita Sans', sans-serif",
};

/**
 * Apply fonts globally
 */
export function applyFonts() {
  const root = document.documentElement;
  root.style.setProperty('--font-ui', FONT_CONFIG.uiFont);
  root.style.setProperty('--font-mono', FONT_CONFIG.monoFont);
  root.style.setProperty('--font-display', FONT_CONFIG.displayFont);
}
