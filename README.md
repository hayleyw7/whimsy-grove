# Whimsy Grove

**Somewhere to put your weird little guys.**

Create a whimsical scene with plants, creatures, weather, and whatever else belongs there.

[Open Whimsy Grove](https://hayleyw7.github.io/whimsy-grove/)

First-time visitors see the welcome page. Returning visitors in the same browser go straight to their last open grove. Select the Whimsy Grove title to revisit the welcome page; Create a grove then resumes your current creation.

## Browser-only saves

No account or backend is required. Drafts, Album, History, favorites, and achievements are stored in your browser using IndexedDB. The editor uses SQLite compiled to WebAssembly to keep the existing scene validation and achievement rules.

**Saves do not sync between devices or browsers.** Clearing site data, storage eviction, or ending a private browsing session can delete them. Download PNG or GIF images to keep visual copies; these are not editable scene backups. The old local server's saves and the original hosted app's saves are separate and are not automatically imported.

## Editable album backups

In Album, choose **Back up Album** to download a JSON backup. **Import Album** shows a count before merging new groves, skips existing IDs, and preserves the current scene and existing library. Files are limited to 20 MB and 1,000 groves. Backups include Album scenes and thumbnails, not History, preferences, or favorites. Keep backup files somewhere safe before clearing browser data.

## Features

- Illustrated landscapes, plants, creatures, and objects
- Move, resize, rotate, flip, duplicate, undo, and redo
- Weather, palettes, atmospheric motion, and optional sound
- Album, History, favorites, and achievements
- PNG and animated GIF export

## Run locally

Use Node.js 22.13 or newer:

```sh
npm ci
npm start
```

Open http://localhost:8000. The preview is a plain static file server. No Google OAuth setup, secrets, database server, or paid services are needed.

## Build and deploy

```sh
npm run build
```

The complete static site is written to `dist/`. Relative URLs support GitHub Pages project paths. The `.github/workflows/pages.yml` workflow builds and deploys `main` using GitHub Actions. In repository **Settings → Pages**, select **GitHub Actions** as the publishing source.

## Source layout

- `public/` — editor, artwork, audio, and client code
- `scripts/welcome-page.mjs` — public landing page
- `scripts/browser-storage.mjs` — browser persistence adapter
- `worker/index.js` — reused scene validation, collection, and achievement rules, invoked inside the browser; not deployed as a server
- `drizzle/` — SQLite schema migrations bundled at build time
- `docs/` — art records and historical Sites notes

The original Git history is preserved. Historical Sites deployment files and notes are retained for provenance, but are not needed for GitHub Pages. Local data, dependencies, generated migrations, and build output are ignored by Git.

## Credits

I’m an AI assistant, and I wrote this README and the project documentation. Whimsy Grove began as the creator’s first experiment building with an OpenAI dot: a way to see what we could make together.

An AI assistant suggested the initial garden idea and built the original app, including its code, artwork, music, and sound effects. The creator shaped it through prompts, feature requests, and very picky design feedback, with a mobile-first experience that also works on desktop. AI assistance also handled the move to GitHub Pages and browser-only saves.

## Rights and third-party software

**All rights reserved.** Whimsy Grove’s original code, artwork, audio, and documentation are not offered under an open-source license. Reuse, redistribution, modification, or commercial use requires permission from the rights holder, except where applicable law or GitHub’s terms permit otherwise. See [LICENSE](LICENSE).

Third-party software retains its own licenses. The bundled [gifenc](public/vendor/gifenc-LICENSE.md) and [sql.js](public/vendor/sql.js-LICENSE.txt) components are MIT-licensed; those licenses apply to those components, not to Whimsy Grove as a whole. SQLite is in the public domain.
