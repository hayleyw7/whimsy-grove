# Local Whimsy Grove

Retrieved directly from the verified Sites source repository on 2026-10-08.
The Library archive transfer was unavailable, so this checkout was downloaded
from the original Git repository instead. All 47 existing commits are retained.

- `main`: live v43, `9ba1ed22cc437b289c0d2ed122cf1909a4ceda00`
- `unpublished/bunnies-v45`: saved, unpublished v45, `7ef18198b7dc6f493888ae04a05a38c0eb92b0a4`
- `archive/bunnies-v44`: earlier unpublished v44, `f87741c813e25ecc068e1a6c1300a2b5a3520267`

No remote is configured. No production changes or pushes were made.
Runtime secrets, production saves, and installed dependencies are not included.

## Build

With Node.js installed, from this directory:

```sh
node scripts/build.mjs
```

This build uses Node's built-in modules and needs no dependency installation.
It generates ignored output in `dist/`. The original package and lockfile remain
available if you need development dependencies (`npm ci`).

## Run locally with Google sign-in

Requires Node.js 22.13 or newer (tested with 26.7).

```sh
npm ci
npm start
```

Open **http://localhost:8000** for the welcome page, then choose **Create your grove**. The protected editor is at `/editor`. Open the site (use localhost, not 127.0.0.1). The Google sign-in
client is registered for localhost and localhost:8000. The server listens only
on loopback, verifies Google ID tokens on the server, shows a public welcome page with bundled example scenery, requires sign-in for all
editor and API requests, and uses an HttpOnly session cookie. No OAuth client
secret is needed by this identity-token flow. Sign out using the local editor's
sign-out button. Restarting the server ends login sessions.

Local creations, drafts, favorites, and thumbnails are kept in ignored
`.local-data/`, scoped by the verified Google account ID. Back up this folder
if you want to keep local creations. Existing ChatGPT-hosted data is separate
and is not imported or automatically linked to a Google account.

Google project: `whimsy-grove`. OAuth client: `Whimsy Grove Local`.
Google OAuth currently remains in Testing, with `hmwith@gmail.com` added as a
test user. Other visitors require the appropriate Google configuration before
public release. A production website origin, HTTPS, deployment and production
session/storage setup are still needed for an external public website.

Do not use a plain static server or open `public/index.html` directly: those
bypass the authentication backend. The existing Sites-hosted app is unchanged;
this Node server is for local use and does not publish the Google login flow.

## Verification and Git status

Build and Git integrity passed during import. Local checks cover unauthenticated
editor/API blocking, spoofed account headers, cross-origin sign-in rejection,
invalid Google tokens, storage transactions, and account isolation. The Google
sign-in button was rendered in Chrome. A real user login still needs completion.

Source changes are uncommitted. `LOCAL_SETUP.md` and the local server/storage
scripts are new files. No credentials, dependencies, or local saves should be
committed; the existing `.gitignore` excludes dependencies and local saves.
