# Synnical SVG

Standalone Synnical OS SVG client built from the current production frontend.

The frontend is distributed through GitHub/jsDelivr.
Accounts, profiles, chat, SynnFlix, uploads, Socket.IO,
Wisp and other server-backed functionality connect to
the normal Synnical backend.

Each SVG filename has its own local storage, authentication token and
Scramjet cookie jar. API calls deliberately omit browser cookies and use the
link's bearer token only. Signing into the same account on another link still
hydrates that account's server-backed app data after the user logs in there.

Run `node scripts/build-svg-client.mjs` with `SYNNICAL_SOURCE_DIR` pointing at
the production Synnical source. The builder merges new generated chunks into
`assets/` so historical immutable CDN releases remain intact.
