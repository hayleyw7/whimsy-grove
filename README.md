# Spooky Grove

An illustrated scene editor hosted privately on OpenAI Sites.

## Editor
- Starts with a blank canvas and no implicit stamp selection.
- Exactly eight item collections, including Sky, with catalogue-wide search.
- Place items, move them with a pointer or touch, resize them, remove them, and undo edits.
- Ten full-scene backgrounds. Space, void, and underwater have no ground.
- Moons, galaxies, shooting stars, weather, and a tornado stamp.
- Download PNG pictures, or use native file sharing where supported.

## Account persistence
The existing Sites dispatcher provides the authenticated user ID. No Google OAuth or app-owned login credentials are used. API requests without this identity are rejected.

D1 stores scene JSON and Album/History metadata. R2 stores thumbnails. Every list, read, thumbnail, and update is filtered by the authenticated owner. The frontend never supplies the owner ID. Mutating requests require a matching Origin and an application header.

Every confirmed Clear, Randomize, or Restore first saves and verifies the existing scene in History. Drawing interactions are locked during this operation. If saving fails, the current scene remains unchanged. Album is saved manually, and History records can also appear in Album. Drawings retain editable scene data, not just pictures.

## Source and build
- `public/` contains the client and bundled original artwork.
- `worker/index.js` contains the authenticated API and static asset fallback.
- `db/schema.ts` and the immutable `drizzle/` migrations define storage.
- `npm run build` produces Cloudflare Worker output and client assets.

A server is required for Album and History. The artwork and editor remain portable, but a future itch.io edition needs an explicit persistence plan rather than pretending account saves are device-local.
