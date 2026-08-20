/**
 * Full Release Requirements Checklist
 * 
 * #40 - Comprehensive validation before calling SVG Synnical release-ready
 * 
 * This checklist should be completed and all items verified
 * before any production release.
 */

export interface ReleaseChecklistItem {
  id: string;
  category: 'auth' | 'multiuser' | 'profiles' | 'chat' | 'desktop' | 'settings' | 'games' | 'browser' | 'media' | 'shop' | 'svgcdn' | 'errorhandling';
  title: string;
  description: string;
  status: 'pending' | 'passed' | 'failed' | 'skipped' | 'na';
  notes?: string;
}

// #40 - Complete release checklist definition
export const RELEASE_CHECKLIST: ReleaseChecklistItem[] = [
  // AUTH (6 items)
  { id: 'auth-1', category: 'auth', title: 'Register', description: 'Real user signup works end-to-end', status: 'pending' },
  { id: 'auth-2', category: 'auth', title: 'Login', description: 'Real user login works with valid credentials', status: 'pending' },
  { id: 'auth-3', category: 'auth', title: '/api/auth/me', description: 'Auth me endpoint returns correct user data', status: 'pending' },
  { id: 'auth-4', category: 'auth', title: 'Reload persistence', description: 'Authentication survives page reload', status: 'pending' },
  { id: 'auth-5', category: 'auth', title: 'Logout', description: 'Logout removes both backend session and local token', status: 'pending' },
  { id: 'auth-6', category: 'auth', title: 'Session expiration', description: 'Expired tokens are handled gracefully', status: 'pending' },

  // MULTI-USER (4 items)
  { id: 'mu-1', category: 'multiuser', title: 'User A operations', description: 'User A can register, login, and use features independently', status: 'pending' },
  { id: 'mu-2', category: 'multiuser', title: 'User B operations', description: 'User B can operate without seeing User A data', status: 'pending' },
  { id: 'mu-3', category: 'multiuser', title: 'Normal member test', description: 'Normal member has expected permissions/limits', status: 'pending' },
  { id: 'mu-4', category: 'multiuser', title: 'Staff user test', description: 'Staff user has elevated capabilities', status: 'pending' },

  // PROFILES (7 items)
  { id: 'prof-1', category: 'profiles', title: 'Own profile view', description: 'User can view their own profile correctly', status: 'pending' },
  { id: 'prof-2', category: 'profiles', title: 'Other profile view', description: 'User can view another user\'s profile', status: 'pending' },
  { id: 'prof-3', category: 'profiles', title: 'Message count (#19)', description: 'Message counts display correctly with dedicated visibility key', status: 'pending' },
  { id: 'prof-4', category: 'profiles', title: 'Privacy settings', description: 'Profile stats privacy is respected per-user', status: 'pending' },
  { id: 'prof-5', category: 'profiles', title: 'Decorations (#31)', description: 'Avatar decorations display and equip correctly', status: 'pending' },
  { id: 'prof-6', category: 'profiles', title: 'Staff badges (#21)', description: 'Badges are smaller, readable, not intrusive', status: 'pending' },
  { id: 'prof-7', category: 'profiles', title: 'Profile modal UX (#20)', description: 'Backdrop click and Escape key close modal', status: 'pending' },

  // CHAT (8 items)
  { id: 'chat-1', category: 'chat', title: 'Send messages', description: 'Messages send successfully to recipients', status: 'pending' },
  { id: 'chat-2', category: 'chat', title: 'Receive messages', description: 'Incoming messages appear in real-time', status: 'pending' },
  { id: 'chat-3', category: 'chat', title: 'Edit messages', description: 'Message editing works if supported', status: 'pending' },
  { id: 'chat-4', category: 'chat', title: 'Reconnection (#36)', description: 'Chat reconnects after network interruption', status: 'pending' },
  { id: 'chat-5', category: 'chat', title: 'Optimistic updates', description: 'Messages show immediately before server confirm', status: 'pending' },
  { id: 'chat-6', category: 'chat', title: 'No duplicates (#36)', description: 'Same message never appears twice', status: 'pending' },
  { id: 'chat-7', category: 'chat', title: 'Presence', description: 'Who\'s Online shows accurate online users', status: 'pending' },
  { id: 'chat-8', category: 'chat', title: 'Friends list', description: 'Friends display and management works', status: 'pending' },

  // DESKTOP (9 items)
  { id: 'desk-1', category: 'desktop', title: 'Neutral boot (#22)', description: 'Desktop opens neutral, no auto-reopen last app', status: 'pending' },
  { id: 'desk-2', category: 'desktop', title: 'Startup apps', description: 'Explicit startupApps still work when configured', status: 'pending' },
  { id: 'desk-3', category: 'desktop', title: 'Maximized launch (#23)', description: 'New windows open maximized by default', status: 'pending' },
  { id: 'desk-4', category: 'desktop', title: 'Restore window', description: 'Window restore returns to sensible size/position', status: 'pending' },
  { id: 'desk-5', category: 'desktop', title: 'Minimize', description: 'Window minimize works correctly', status: 'pending' },
  { id: 'desk-6', category: 'desktop', title: 'App switching', description: 'Switching between apps works smoothly', status: 'pending' },
  { id: 'desk-7', category: 'desktop', title: 'Launch animation (#24)', description: 'Windows-like open animation plays correctly', status: 'pending' },
  { id: 'desk-8', category: 'desktop', title: 'Reduced motion', description: 'Animations respect prefers-reduced-motion', status: 'pending' },
  { id: 'desk-9', category: 'desktop', title: 'Workspaces', description: 'Workspace switching works if retained', status: 'pending' },

  // SETTINGS (4 items)
  { id: 'set-1', category: 'settings', title: 'Every setting', description: 'All settings save and load correctly', status: 'pending' },
  { id: 'set-2', category: 'settings', title: 'Persistence', description: 'Settings persist across sessions', status: 'pending' },
  { id: 'set-3', category: 'settings', title: 'Invalid values (#25)', description: 'Invalid/stale setting values don\'t crash OS', status: 'pending' },
  { id: 'set-4', category: 'settings', title: 'No global crash (#25)', description: 'Single Settings failure doesn\'t kill entire OS', status: 'pending' },

  // GAMES (16 items)
  { id: 'game-1', category: 'games', title: 'Catalog UI', description: 'Games catalog displays correctly', status: 'pending' },
  { id: 'game-2', category: 'games', title: 'Artwork', description: 'Game artwork loads properly', status: 'pending' },
  { id: 'game-3', category: 'games', title: 'Metadata', description: 'Game metadata displays correctly', status: 'pending' },
  { id: 'game-4', category: 'games', title: 'Favourites', description: 'Favourites system works', status: 'pending' },
  { id: 'game-5', category: 'games', title: 'History', description: 'Game history records correctly', status: 'pending' },
  { id: 'game-6', category: 'games', title: 'Session creation', description: 'Game session creates successfully', status: 'pending' },
  { id: 'game-7', category: 'games', title: 'Authentication', description: 'Stratus auth works for games', status: 'pending' },
  { id: 'game-8', category: 'games', title: 'Queue', description: 'Game queue functions correctly', status: 'pending' },
  { id: 'game-9', category: 'games', title: 'Provider allocation', description: 'Provider allocates game session', status: 'pending' },
  { id: 'game-10', category: 'games', title: 'Start game', description: 'startGame launches successfully', status: 'pending' },
  { id: 'game-11', category: 'games', title: 'Signalling WebSocket', description: 'Game signalling WebSocket connects', status: 'pending' },
  { id: 'game-12', category: 'games', title: 'Embed', description: 'Game embed displays correctly', status: 'pending' },
  { id: 'game-13', category: 'games', title: 'Input capture', description: 'Keyboard/mouse input works in games', status: 'pending' },
  { id: 'game-14', category: 'games', title: 'Fullscreen', description: 'Game fullscreen works', status: 'pending' },
  { id: 'game-15', category: 'games', title: 'Quit session', description: 'quitSession cleans up properly', status: 'pending' },
  { id: 'game-16', category: 'games', title: 'Side panel bug (#33)', description: 'Opening Chat during game doesn\'t hide chrome', status: 'pending' },

  // BROWSER (8 items)
  { id: 'browse-1', category: 'browser', title: 'Scramjet SW', description: 'Service worker registers correctly', status: 'pending' },
  { id: 'browse-2', category: 'browser', title: 'Wisp connection', description: 'Wisp proxy connects for browsing', status: 'pending' },
  { id: 'browse-3', category: 'browser', title: 'Fresh browser', description: 'Fresh browser instance works', status: 'pending' },
  { id: 'browse-4', category: 'browser', title: 'Cached browser', description: 'Browser with cached SW works', status: 'pending' },
  { id: 'browse-5', category: 'browser', title: 'HTTPS sites', description: 'Can browse ordinary HTTPS websites', status: 'pending' },
  { id: 'browse-6', category: 'browser', title: 'Navigation', description: 'Back, forward, refresh work', status: 'pending' },
  { id: 'browse-7', category: 'browser', title: 'URL bar', description: 'URL entry navigates correctly', status: 'pending' },
  { id: 'browse-8', category: 'browser', title: 'New tab', description: 'New tab opens correctly', status: 'pending' },

  // MEDIA (6 items)
  { id: 'media-1', category: 'media', title: 'SynnFlix loads', description: 'SynnFlix panel loads and browses', status: 'pending' },
  { id: 'media-2', category: 'media', title: 'Movies >8s (#27)', description: 'Movie playback continues past 8 seconds', status: 'pending' },
  { id: 'media-3', category: 'media', title: 'YouTube (#28)', description: 'YouTube is browsable, not just paste URL', status: 'pending' },
  { id: 'media-4', category: 'media', title: 'Music (#38)', description: 'Music player works without errors', status: 'pending' },
  { id: 'media-5', category: 'media', title: 'GeForce NOW (#39)', description: 'GeForce NOW launches and runs', status: 'pending' },
  { id: 'media-6', category: 'media', title: 'Continue Watching removed (#26)', description: 'No Continue Watching UI or state exists', status: 'pending' },

  // SHOP (5 items)
  { id: 'shop-1', category: 'shop', title: 'Credits display', description: 'User credits show correctly', status: 'pending' },
  { id: 'shop-2', category: 'shop', title: 'Purchase flow', description: 'Shop purchase deducts credits', status: 'pending' },
  { id: 'shop-3', category: 'shop', title: 'Decoration preview (#31)', description: 'Decorations preview before equipping', status: 'pending' },
  { id: 'shop-4', category: 'shop', title: 'Staff credit controls (#30)', description: 'Staff can add/remove credits with audit', status: 'pending' },
  { id: 'shop-5', category: 'shop', title: 'No double reset (#30)', description: 'Credits have NOT been reset again', status: 'pending' },

  // SVG/CDN (7 items)
  { id: 'svg-1', category: 'svgcdn', title: 'index.svg', description: 'index.svg serves correct content', status: 'passed' }, // Already validated
  { id: 'svg-2', category: 'svgcdn', title: '001-100 aliases', description: 'All 100 synnical-XXX.svg serve identical content', status: 'passed' }, // Already validated
  { id: 'svg-3', category: 'svgcdn', title: 'Pinned commit', description: 'Immutable commit-pinned URL works', status: 'pending' },
  { id: 'svg-4', category: 'svgcdn', title: 'All chunks exist', description: 'Referenced JS/CSS/WASM files exist', status: 'passed' }, // Already validated
  { id: 'svg-5', category: 'svgcdn', title: 'Old assets retained (#15)', description: 'Historical hashed assets not deleted', status: 'pending' },
  { id: 'svg-6', category: 'svgcdn', title: 'Fresh cache', description: 'New build works with empty cache', status: 'pending' },
  { id: 'svg-7', category: 'svgcdn', title: 'Stale cache', description: 'Build works with stale cached version', status: 'pending' },

  // ERROR HANDLING (4 items)
  { id: 'err-1', category: 'errorhandling', title: 'No raw HTML (#13)', description: 'Games never shows raw HTML/Next.js pages', status: 'pending' },
  { id: 'err-2', category: 'errorhandling', title: 'No stack traces', description: 'Users never see raw stack traces', status: 'pending' },
  { id: 'err-3', category: 'errorhandling', title: 'No "Unknown error"', description: 'All errors have meaningful messages', status: 'pending' },
  { id: 'err-4', category: 'errorhandling', title: 'User-friendly language (#34)', description: 'No internal terminology exposed to users', status: 'pending' },
];

// Category labels and colors
export const CHECKLIST_CATEGORIES = {
  auth: { label: 'Auth', color: 'bg-blue-500' },
  multiuser: { label: 'Multi-User', color: 'bg-purple-500' },
  profiles: { label: 'Profiles', color: 'bg-pink-500' },
  chat: { label: 'Chat', color: 'bg-green-500' },
  desktop: { label: 'Desktop', color: 'bg-orange-500' },
  settings: { label: 'Settings', color: 'bg-gray-500' },
  games: { label: 'Games', color: 'bg-red-500' },
  browser: { label: 'Browser', color: 'bg-cyan-500' },
  media: { label: 'Media', color: 'bg-yellow-500' },
  shop: { label: 'Shop', color: 'bg-emerald-500' },
  svgcdn: { label: 'SVG/CDN', color: 'bg-indigo-500' },
  errorhandling: { label: 'Error Handling', color: 'bg-rose-500' },
} as const;

/**
 * Calculate release readiness percentage
 */
export function calculateReadiness(checklist: ReleaseChecklistItem[]): {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  percentage: number;
  ready: boolean;
} {
  const total = checklist.length;
  const passed = checklist.filter(i => i.status === 'passed').length;
  const failed = checklist.filter(i => i.status === 'failed').length;
  const pending = checklist.filter(i => i.status === 'pending').length;
  const skipped = checklist.filter(i => i.status === 'skipped' || i.status === 'na').length;
  
  // Percentage based on non-skipped items
  const actionable = total - skipped;
  const percentage = actionable > 0 ? Math.round((passed / actionable) * 100) : 0;
  
  return {
    total,
    passed,
    failed,
    pending,
    percentage,
    ready: failed === 0 && pending === 0,
  };
}
