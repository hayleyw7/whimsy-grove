# Whimsy Grove

A private Sites art toy with 198 placeable illustrations, 36 biomes, and 10 categories. Built-in ChatGPT sign-in protects each account’s creations, favorites, achievements, and prompt progress. The Site identity and URL are retained across updates.

## Editor

Oddities are grouped into Animals, Bones, Characters, Fungi, Magic, Nature, Plants, Props, Sky, and Structures. All is the default, labels are alphabetized, and semantic search retains accurate older names. Short mobile search results fill horizontally. The full mobile catalogue keeps two horizontal rows, while desktop uses three columns with vertical scrolling. Scrollable surfaces have persistent themed indicators.

Items are selected on the canvas. Drag to move, use square corners to resize, use the curved-arrow corner to rotate, or pinch and twist with two fingers. Copy, horizontal and vertical flips, Remove, Undo, Redo, and Full Screen share one compact toolbar. Each gesture is one undo step, with 80 steps and normal redo-branch truncation. Items can reach 300% of the canvas width and extend beyond its bounds. Off-canvas handles hide without clamping. Scene order is insertion order, and duplicate labels use persistent insertion age.

Keyboard users can select items with Enter or Shift+Enter, jump to the first or last with Home or End, and deselect with Escape. Arrows move, plus and minus resize, and brackets rotate. Focused corner controls accept arrow keys. The selected object’s name, position, size, and angle have a persistent screen-reader status. Browser zoom shortcuts retain their normal behavior.

Full Screen uses the browser API when supported and otherwise hides editing controls with an honest fallback. Keep Editing, Escape, and browser Back restore editing without changing the creation. There is no separate Hide Controls or Randomize entry.

## New groves and inspiration

Existing working drafts reopen directly. A fresh visit offers two inspiration prompts plus Free Create as three matching cards. New Prompts refreshes the two suggestions. A second step lets the person keep the suggested biome or choose another. The prompt and biome steps intentionally do not dismiss through in-app Escape or backdrop taps, while ordinary browser navigation and closing remain available.

New first shows its memory confirmation, then saves the current creation to History. Only a verified save opens the prompt chooser. The current creation stays intact until Start Creating commits the new scene. Failure stops the flow, and there is no duplicate History save. A first empty session does not invent a previous-memory confirmation. Inspiration reminders are dismissible and remain part of saved scene state.

Prompts are optional inspiration. Creations have no finish or win condition. Add to Album uses the ordinary naming and save flow. Existing artwork, earned badges, and historical ledger records are preserved.

## Motion, sound, and downloads

Only biome atmosphere and weather animate. Placed objects and animals remain still. Biomes use suitable leaves, bubbles, ripples, light, mist, snow, embers, sand, or dust. Blank and Void stay plain. Animations is checked when motion is enabled. Unchecking stops scene animation completely. Device reduced-motion preferences set the initial live-motion default. An explicit app choice overrides that default, persists with the scene, and carries into New. Older saved false choices remain off. Hidden tabs or off-screen canvases stop the loop. Ordinary ambient frames reuse a cached static canvas.

PNG is a clear still. GIF is a local, deterministic short loop of the selected biome and weather, with no audio. The bundled MIT-licensed gifenc 1.0.3 encoder streams 24 opaque 400×360 frames at 120 ms per frame into a shared 256-color palette. Encoding has progress, cancellation, and an 8 MiB output limit. An explicit GIF export animates even when live motion is paused. Share uses native PNG sharing where supported and otherwise downloads a PNG with an honest explanation. Filenames are unique.

Original procedural Web Audio provides Gentle, Haunted, and Cosmic ambient music, independent sound effects, and a master mute. Audio settings and the canvas Animations checkbox are grouped at the top of Menu, with an accessible group label and no visible heading. Everything starts off. Remembered enabled, unmuted audio resumes on the next trusted click after loading or returning to the tab. Mute and Off interactions do not briefly start sound. Audio uses bounded voices, hidden-tab suspension, and page-exit cleanup. The music choices use the same themed popup style as other controls.

First visits start in Dark Mode. Explicit returning-user appearance choices are remembered. Light mode keeps the original flat background, with a pale lavender loading surface. Functional loading indicators rotate independently of scene motion and stay static when the device requests reduced motion. Older local storage keys are intentionally retained for continuity.

## Storage and progress

The Worker trusts only the Sites-authenticated user header. Every record, thumbnail, list, update, and deletion is owner-scoped. Mutations require a matching Origin and application header. D1 stores scene JSON and metadata, and R2 stores thumbnails. Draft writes include an opaque account scope and idempotent edit ID. Temporary owner-scoped device backups protect pending edits. Cloud read failures do not silently randomize or replace a creation.

Album saves are manual. New and Open verify a History save before replacing current work. Names allow 15 grapheme clusters with a hard input limit and matching server validation. Existing long names are preserved. Album names can be changed independently of History titles. Deletion requires explicit named confirmation and removes the record from both collections when applicable. Gallery sorting preserves the open view and layout. Mobile cards open an action menu, while desktop uses the ellipsis.

Nineteen in-game achievements have visible criteria. Album saves and their credits commit atomically. Milestones count distinct creation lineages and deduplicate matching artwork, including later versions. History autosaves, repeated saves, and renames do not inflate counts. Earned badges, biome visits, and historical records remain after creation deletion. Backfill uses only verifiable existing Album records. Versioned scans add Night and Day, Secret Garden, Creature Feature, and Weather Watcher without changing artwork or earlier earned badges. Weather and celestial observations are account-scoped and commit atomically with each Album save. Share records use of the Share action, and Download records successful file generation and handoff, without claiming delivery or an operating-system save.

Guest progress is clearly device-local and is not automatically merged into an account. Authenticated progress uses D1, with an owner-scoped pending-event queue for temporary network failures. External repository and itch.io badges are not exposed without real approved launch links.

## Build and verification

Run `npm run build` to copy the client, Worker, hosting manifest, and generated Drizzle migrations into `dist`. Run `npm run db:generate` after schema changes. Applied migrations are immutable. Current additions are 0004 and 0005, with new progress tables only and no production data deletion.

Checks cover SQLite-backed ownership and transaction behavior, duplicate/concurrent saves, lifetime progress, retired completion requests, editor gestures, dialog flows, motion gating, GIF decoding, all 36 biomes across 8 palettes, and source accessibility structure. Native asset and assembly renders were visually inspected. The independent source audit verified named dialogs, ARIA references, keyboard selection, 24 px custom scrollbar targets, and stronger dark focus contrast. Additional checks cover short-screen popup geometry, nested focus return, persistent errors, skip links, favorite-heart focus, and forced-color selection cues.

There is no tap-only alternative to move, resize, or rotate an item. Canvas gestures and keyboard editing remain available, and full WCAG conformance is not claimed.

Actual mobile and desktop Lighthouse runs were blocked by the execution environment’s Chromium socket and browser-access restrictions. No Lighthouse score, physical Android test, or authenticated production browser pass is claimed.

## Illustration consistency

The complete inventory covers all 198 visible stamps and 36 biome choices. Thirty-three existing creatures were revised to match the navy ink, cream highlights, and natural surface textures of the reference animals. The new sitting calico belongs to the same family. Space and Underwater were redrawn while retaining their groundless compositions. The remaining coherent artwork was kept. Existing IDs, default sizes, saved placements, and original asset files remain available.

See [the reusable art direction](docs/art/art-direction.md), [the per-item audit](docs/art/audit-decisions.json), and [production export details](docs/art/exports-manifest.json). Optimized WebP atlases preserve alpha, and source loading skips sheets with no remaining catalogue entries.

The editor reserves a single-line selected-name area and a fixed-height toolbar, so selecting, copying, or deselecting cannot change the canvas card dimensions. Long names are ellipsized, with full labels available to assistive technology and hover titles.

Choosing an idea or Free Create scrolls to the top, and a completed new-grove load stays there. The chooser returns keyboard focus to the canvas without scrolling back to the bottom actions.

Environmental animation samples the existing, palette-rendered scene artwork inside conservative feathered sky, water, lava, steam, and underwater-light masks. It renders beneath a cached static item layer. Existing painted scenery supplies the base motion, supplemented by sparse themed motes in Hell and selected indoor or plain biomes. Cloud and steam advection uses long live periods, while the short GIF blends only the environment layer toward its opening frame. Weather remains deterministic and renders above the scene. Rain uses 72 small, feathered, translucent drops with no stroked outline, falling vertically at 64–88 canvas pixels per second. Staggered fade-in and fade-out close the short loop. Snow and fog keep their prior paths and intensity. Every illustrated open sky has a conservative moving region, including the sky beyond Bridge, Swamp, and Space. Greenhouse and Attic have tiny isolated pane masks whose drift is intentionally faint. All 36 biomes have intentional motion. Blank and Void keep their plain base colors with only a few faint motes. The scene-layer cache is bounded to two entries, with per-source texture work held weakly.

Weather offers Clear, Drizzle, Rain, Flurries, Snow, Mist, Fog, and Wind. The picker selects exactly one effect. Drizzle uses 30 lighter drops, Flurries uses 40 soft flakes, Mist stays low and light, and Wind uses three coordinated sets of trailing gusts. All effects share the live, still, thumbnail, and GIF renderer. New weather identifiers are accepted by both draft and server scene validation, and saved weather observations retain account-scoped achievement behavior.

Hell keeps its existing composition with smoky burgundy and muted plum across its sky and stone, while bright amber stays localized to lava. The prior `bg-hell-v5.webp` remains available. The revised imagegen source and color-edit record are preserved separately.

Fog keeps its three bands, shape, opacity range, and color, with a 30-second live drift cycle instead of three seconds. Its short GIF loop uses a tiny smooth phase excursion no faster than the slower live drift and a closed boundary. Mist and other weather retain their timing.

The Weather list uses the same themed dropdown as Biome, including keyboard navigation, selected context, remembered scroll position, and a persistent overflow indicator. Heavy Rain uses 200 denser, faster vertical drops while the approved Rain is unchanged. Thunderstorm combines heavy rain with a localized, soft lightning pulse once per 12-second live cycle. Its six-second GIF loop spaces one smooth pulse, with bounded frame count and the same file-size cap. Animations off freezes all weather and shows no flashing. Existing weather keys and legacy mixed-weather scenes remain readable.

Slow atmospheric motes cover the six formerly still biomes and supplement Hell, Attic, Greenhouse, and Factory. Hell uses amber embers, Cave uses teal and lavender gem motes, and interiors use soft gray dust. Each mote follows a slow straight drift with a varied long lifespan and gentle fade. Particles render beneath placed items, honor palettes and Animations, and blend into the same short export loop as the scenery.
