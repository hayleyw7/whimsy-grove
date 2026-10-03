# Spooky Grove

An illustrated scene editor hosted privately on OpenAI Sites.

## Editor
- Starts with a blank canvas and no implicit stamp selection.
- Exactly eight alphabetized item collections: Creatures, Plants, Mushrooms, Nature, Bones, Structures, Magic, and Sky. The catalogue contains 98 unique items.
- Place items, move them with a pointer or touch, resize them, remove them, and use 80-step Undo and Redo beside the canvas. Each drag or resize gesture is one step, and a new edit discards the redo branch.
- Twenty-one scene choices. Void is a plain near-black plum field. Space and underwater have no ground.
- Moons, galaxies, eclipses, a satellite, shooting stars, weather, and a tornado stamp. Sky objects are selected as items, with only weather controls at the bottom.
- Download PNG pictures, or use native file sharing where supported.

## Account persistence
The existing Sites dispatcher provides the authenticated user ID. No Google OAuth or app-owned login credentials are used. API requests without this identity are rejected.

D1 stores scene JSON, Album/History metadata, and account-scoped favorite item choices. Favorites is a filter, not a ninth category. R2 stores thumbnails. Every list, read, thumbnail, and update is filtered by the authenticated owner. The frontend never supplies the owner ID. Mutating requests require a matching Origin and an application header.

Every confirmed Clear, Randomize, or Restore first saves and verifies the existing scene in History. Drawing interactions are locked during this operation. If saving fails, the current scene remains unchanged. Album is saved manually, and History records can also appear in Album. Drawings retain editable scene data, not just pictures.

## Source and build
- `public/` contains the client and bundled original artwork.
- `worker/index.js` contains the authenticated API and static asset fallback.
- `db/schema.ts` and the immutable `drizzle/` migrations define storage.
- `npm run build` produces Cloudflare Worker output and client assets.

A server is required for Album and History. The artwork and editor remain portable, but a future itch.io edition needs an explicit persistence plan rather than pretending account saves are device-local.
