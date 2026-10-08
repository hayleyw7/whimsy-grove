# Whimsy Grove

**Somewhere to put your weird little guys.**

Create a whimsical scene with plants, creatures, weather, and whatever else belongs there.

## What you can do

- Choose an illustrated landscape and arrange plants, creatures, and objects.
- Move, resize, rotate, flip, and duplicate items, with undo and redo.
- Set weather, colors, ambient motion, and optional sound.
- Save scenes to your album and export PNG images or animated GIFs.

The welcome page is public. Opening the editor and saving creations require Google sign-in in the local edition.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm start
```

Open **http://localhost:8000**. Choose **Create your grove** to sign in and open the editor.
Use `localhost`, not `127.0.0.1`, because the OAuth client is registered for that origin.

The included Google OAuth client is configured for local development and remains in testing. Other developers should create their own Google web client and replace the public client ID in `scripts/local-server.mjs`. No client secret is used by the ID-token sign-in flow.

Scenes are stored in `.local-data/` on the machine running the server, separated by verified Google account ID. Back up this directory to preserve saves. Sessions expire after 12 hours or when the server restarts. Dependencies, local saves, environment files, and build output are excluded from Git.

## Hosting

The local server is a development server bound to loopback. Public deployment requires HTTPS, a registered production Google origin, production session handling, and persistent storage.

**GitHub Pages alone cannot run this full app.** It can serve a static welcome page, but cannot run the Node server, validate login sessions, or store private creations. Do not deploy the editor as a static guest-mode workaround. A backend-capable host is required for the complete signed-in experience.

The original Sites deployment uses a Worker with D1 and R2 and platform-provided ChatGPT identity. That deployment is separate from the local Google sign-in server; its existing saves are not imported into this copy.

## Build

```sh
npm run build
```

This builds the original Sites/Worker target into `dist/`; it is not a GitHub Pages export and does not deploy anything. Local development serves the source files directly.

## Project layout

- `public/` — editor, illustrated assets, audio, and client code
- `scripts/welcome-page.mjs` — public welcome page
- `scripts/local-server.mjs` — local Google sign-in, sessions, and protected routing
- `scripts/local-storage.mjs` — local SQLite and thumbnail storage
- `worker/index.js` — account-scoped application API
- `drizzle/` — database migrations
- `docs/` — art records and original implementation notes

See [local setup details](LOCAL_SETUP.md) and [original Sites notes](docs/original-sites-notes.md).

## Source history

The original source and assets were retrieved from the verified Sites repository with its Git history intact. This branch starts from live version 43; later unpublished bunny drafts are retained locally as separate branches and are not part of this release.
