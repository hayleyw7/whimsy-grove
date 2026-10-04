# Whimsical Grove

A private Sites art toy with 197 placeable illustrations, 36 biomes, and 10 categories. Built-in ChatGPT sign-in protects each account’s creations, favorites, achievements, and prompt progress. The Site identity and URL are retained across updates.

## Editor

Oddities are grouped into Animals, Bones, Characters, Fungi, Magic, Nature, Plants, Props, Sky, and Structures. All is the default, labels are alphabetized, and semantic search retains accurate older names. Short mobile search results fill horizontally. The full mobile catalogue keeps two horizontal rows, while desktop uses three columns with vertical scrolling. Scrollable surfaces have persistent themed indicators.

Items are selected on the canvas. Drag to move, use square corners to resize, use the curved-arrow corner to rotate, or pinch and twist with two fingers. Copy, horizontal and vertical flips, Remove, Undo, Redo, and Full Screen share one compact toolbar. Each gesture is one undo step, with 80 steps and normal redo-branch truncation. Items can reach 300% of the canvas width and extend beyond its bounds. Off-canvas handles hide without clamping. Scene order is insertion order, and duplicate labels use persistent insertion age.

Keyboard users can select items with Enter or Shift+Enter, jump to the first or last with Home or End, and deselect with Escape. Arrows move, plus and minus resize, and brackets rotate. Focused corner controls accept arrow keys. The selected object’s name, position, size, and angle have a persistent screen-reader status. Browser zoom shortcuts retain their normal behavior.

Full Screen uses the browser API when supported and otherwise hides editing controls with an honest fallback. Keep Editing, Escape, and browser Back restore editing without changing the creation. There is no separate Hide Controls or Randomize entry.

## New groves and inspiration

Existing working drafts reopen directly. A fresh visit offers two inspiration prompts plus Free Create as three matching cards. New Prompts refreshes the two suggestions. A second step lets the person keep the suggested biome or choose another. The prompt and biome steps intentionally do not dismiss through in-app Escape or backdrop taps, while ordinary browser navigation and closing remain available.

New first shows its memory confirmation, then saves the current creation to History. Only a verified save opens the prompt chooser. The current creation stays intact until Start Creating commits the new scene. Failure stops the flow, and there is no duplicate History save. A first empty session does not invent a previous-memory confirmation. Inspiration reminders are dismissible and remain part of saved scene state.

Finish Grove reveals the current creation and marks a prompt finished only when the person chooses Finish. There are no item requirements or judging. Each prompt ID counts once, with free replays. Add to Album and Keep Editing leave the creation editable.

## Motion, sound, and downloads

Only biome atmosphere and weather animate. Placed objects and animals remain still. Biomes use suitable leaves, bubbles, ripples, light, mist, snow, embers, sand, or dust. Blank and Void stay plain. Animations is checked when motion is enabled. Unchecking stops scene animation completely. Device reduced-motion preferences override live motion, and hidden tabs or off-screen canvases stop the loop. Ordinary ambient frames reuse a cached static canvas.

PNG is a clear still. GIF is a local, deterministic short loop of the selected biome and weather, with no audio. The bundled MIT-licensed gifenc 1.0.3 encoder streams 24 opaque 400×360 frames at 120 ms per frame into a shared 256-color palette. Encoding has progress, cancellation, and an 8 MiB output limit. An explicit GIF export animates even when live motion is paused. Share uses native PNG sharing where supported and otherwise downloads a PNG with an honest explanation. Filenames are unique.

Original procedural Web Audio provides Gentle, Haunted, and Cosmic ambient music, independent sound effects, and a master mute. Sound & Motion sits at the top of Menu and groups audio settings with the canvas Animations checkbox. Everything starts off. Remembered enabled, unmuted audio resumes on the next trusted click after loading or returning to the tab. Mute and Off interactions do not briefly start sound. Audio uses bounded voices, hidden-tab suspension, and page-exit cleanup. The music choices use the same themed popup style as other controls.

Appearance follows the device’s light or dark preference until the user chooses an override. Explicit choices are remembered. Light mode keeps the original flat background, with a pale lavender loading surface. Functional loading indicators rotate independently of scene motion and stay static when the device requests reduced motion. Older local storage keys are intentionally retained for continuity.

## Storage and progress

The Worker trusts only the Sites-authenticated user header. Every record, thumbnail, list, update, and deletion is owner-scoped. Mutations require a matching Origin and application header. D1 stores scene JSON and metadata, and R2 stores thumbnails. Draft writes include an opaque account scope and idempotent edit ID. Temporary owner-scoped device backups protect pending edits. Cloud read failures do not silently randomize or replace a creation.

Album saves are manual. New and Open verify a History save before replacing current work. Names allow 15 grapheme clusters with a hard input limit and matching server validation. Existing long names are preserved. Album names can be changed independently of History titles. Deletion requires explicit named confirmation and removes the record from both collections when applicable. Gallery sorting preserves the open view and layout. Mobile cards open an action menu, while desktop uses the ellipsis.

Fifteen in-game achievements have visible criteria. Album saves and their credits commit atomically. Milestones count distinct creation lineages and deduplicate matching artwork, including later versions. History autosaves, repeated saves, and renames do not inflate counts. Earned badges, biome visits, and completion records remain after creation deletion. Backfill uses only verifiable existing Album records. Share records use of the Share action, and Download records successful file generation and handoff, without claiming delivery or an operating-system save.

Guest progress is clearly device-local and is not automatically merged into an account. Authenticated progress uses D1, with an owner-scoped pending-event queue for temporary network failures. External repository and itch.io badges are not exposed without real approved launch links.

## Build and verification

Run `npm run build` to copy the client, Worker, hosting manifest, and generated Drizzle migrations into `dist`. Run `npm run db:generate` after schema changes. Applied migrations are immutable. Current additions are 0004 and 0005, with new progress tables only and no production data deletion.

Checks cover SQLite-backed ownership and transaction behavior, duplicate/concurrent saves, lifetime progress, prompt completion, editor gestures, dialog flows, motion gating, GIF decoding, all 36 biomes across 8 palettes, and source accessibility structure. Native asset and assembly renders were visually inspected. The independent source audit verified named dialogs, ARIA references, keyboard selection, 24 px custom scrollbar targets, and stronger dark focus contrast. Additional checks cover short-screen popup geometry, nested focus return, persistent errors, skip links, favorite-heart focus, and forced-color selection cues.

There is no tap-only alternative to move, resize, or rotate an item. Canvas gestures and keyboard editing remain available, and full WCAG conformance is not claimed.

Actual mobile and desktop Lighthouse runs were blocked by the execution environment’s Chromium socket and browser-access restrictions. No Lighthouse score, physical Android test, or authenticated production browser pass is claimed.
