# Continue Watching Removal Guide (#26)

## Product Decision
**LATEST: REMOVE CONTINUE WATCHING COMPLETELY**

Do NOT repair it. Do NOT resurrect it.

## What to Remove

### 1. UI Components
- [ ] Continue Watching rail/sidebar in SynnFlix panel
- [ ] Desktop widget for Continue Watching
- [ ] CW-specific resume/retry UI elements

### 2. LocalStorage Keys
```javascript
// REMOVE these keys from any code that references them:
localStorage.removeItem('synnflix.continue.v1');  // Found in synnflix-panel JS
// Any other CW-related localStorage keys
```

### 3. State Management
- [ ] Remove `continueWatching` state from SynnFlix panel
- [ ] Remove CW-related Redux/Zustand store slices
- [ ] Remove CW context providers

### 4. Events & Handlers
- [ ] Remove CW-specific event handlers (playback progress for CW)
- [ ] Remove CW tracking on video complete/pause
- [ ] Remove CW data sync events

### 5. API Calls (if backend-specific)
- [ ] Remove `/api/synnflix/continue` endpoints (if they exist)
- [ ] Remove CW progress saving calls
- [ ] Remove CW list fetching

### 6. Settings
- [ ] Remove "Continue Watching" toggle in Settings (if exists)
- [ ] Remove CW privacy settings

### 7. Tests
- [ ] Remove tests exclusively for Continue Watching
- [ ] Remove CW test fixtures/mocks

## What NOT to Remove

⚠️ **DO NOT delete unrelated media history/playback data:**
- General watch history (if used for recommendations)
- Playback position saving for manual resume
- User's "Watched" list
- Favorites/bookmarks
- Play count statistics

Normal SynnFlix playback must continue working after CW removal.

## Files Identified with Continue Watching References

### SVG Assets (in /home/z/my-project/assets/)
1. **synnflix-panel-BE98KW41.js** - Main SynnFlix panel
   - Contains: `S='synnflix.continue.v1'` (localStorage key)
   
2. **synnflix-panel-DuPpH0L_.js** - Alternative/older version
   
3. **synnflix-panel-B6h1Mwoe.js** - Another version
   
4. **bundle.js** - Main bundle
   
5. **synnical-settings-app-Be0leRiM.js** - Settings app

## Implementation Steps for SVG Repo

1. Clone synnical-svg repo
2. Find all CW references: `grep -r "continue" --include="*.ts" --include="*.tsx"`
3. Remove CW components
4. Remove CW from SynnFlix panel
5. Remove localStorage usage
6. Build new SVG
7. Validate no CW references remain
8. Push to GitHub
9. Update assets folder

## Verification Checklist

After removal, verify:
- [ ] SynnFlix home/browse works
- [ ] Video player works
- [ ] Playback continues past 8 seconds (#27)
- [ ] No CW references in browser console
- [ ] Build passes TypeScript checks
- [ ] All 100 SVG aliases still work (#14)
