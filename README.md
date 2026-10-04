# Spooky Grove

An illustrated scene editor hosted privately on OpenAI Sites.

## Editor
- Starts with a blank canvas. Tapping an oddity thumbnail adds it directly in the center with a brief confirmation. Canvas taps select placed items for editing. The interface defaults to dark mode and remembers the light/dark choice on the current device.
- Exactly eight item categories in a themed dropdown, with alphabetized oddities: Creatures, Plants, Mushrooms, Nature, Bones, Structures, Magic, and Sky. The catalogue contains 141 unique items.
- Place items, move them with a pointer or touch, resize them up to 300% of canvas width, flip them horizontally or vertically, remove them, and use 80-step Undo and Redo beside the canvas. Each drag or resize gesture is one step, and a new edit discards the redo branch. Placed items remain selectable in an alphabetized dropdown, with numbered suffixes for duplicates. Blank touch gestures scroll the page, while gestures beginning on the selected illustration drag it.
- Twenty-six scene choices. All world art is free of sun and moon discs so celestial objects can be placed independently. Void is a plain near-black plum field. Space and underwater have no ground.
- Moons, galaxies, eclipses, a satellite, shooting stars, weather, and a tornado stamp. Sky objects are selected as items, with only weather controls at the bottom.
- Eight three-color swatch moods include a full-scene black-and-white treatment. Oddities, Color mood, and Weather use matching collapsible panels.
- World, category, placed-item, and Album-sort menus share themed popups with keyboard navigation and preserved scroll position. New oddities stack above older ones in the scene array, screen rendering, PNG export, and saved scenes.
- Save, Download, and Share sit in one matching action row. Album supports chronological, reverse chronological, alphabetical, and reverse alphabetical sorting across all pages. Clicking an Album or History thumbnail saves the current creation to History before opening it for editing, and a failed save blocks replacement.

## Account persistence
The existing Sites dispatcher provides the authenticated user ID. Built-in ChatGPT sign-in is used. No Google OAuth or app-owned login credentials are used. The private Site access boundary is unchanged. API requests without this identity are rejected.

D1 stores scene JSON, Album/History metadata, account-scoped favorite item choices, and transactional naming counters. History names are Auto save 1, Auto save 2, and so on. Manual Album names start at Grove 1. Album titles can be renamed independently of History titles. Creation timestamps remain separate metadata. Counter increments and record inserts are a single D1 transaction, so simultaneous saves cannot reuse a number, failed saves do not consume one, and deletion never resets the sequence. Favorites is a filter, not a ninth category. R2 stores thumbnails. Every list, read, thumbnail, and update is filtered by the authenticated owner. The frontend never supplies the owner ID. Mutating requests require a matching Origin and an application header.

Every confirmed Clear, Randomize, or Edit first saves and verifies the existing scene in History. Editing interactions are locked during this operation. If saving fails, the current scene remains unchanged. Album is saved manually, and History records can also appear in Album. Creations retain editable scene data, not just pictures. Individual saved records can be permanently deleted only after a themed confirmation names the target and affected collections. Server-side deletion checks owner, collection membership, confirmation, and the current title. Removing a record deletes it from both Album and History when present in both, and removes its thumbnail. A thumbnail cleanup failure is reported without misrepresenting the outcome.

The editor supports anonymous play when hosted with public access, but this deployment remains private. Save, Album, History, synced Favorites, Clear, and Randomize prompt anonymous visitors to sign in. Download and Share work without an app account. A pending login draft stays in tab-scoped session storage and is restored before editing is enabled after returning from sign-in. Drafts are not cloud saves. Loading operations show a spinner and a specific status, including loading favorite oddities, saving to Album, loading worlds, and editing saved creations.

## Source and build
- `public/` contains the client and bundled original artwork.
- `worker/index.js` contains the authenticated API and static asset fallback.
- `db/schema.ts` and the immutable `drizzle/` migrations define storage.
- `npm run build` produces Cloudflare Worker output and client assets.

A server is required for Album and History. The artwork and editor remain portable, but a future itch.io edition needs an explicit persistence plan rather than pretending account saves are device-local.
