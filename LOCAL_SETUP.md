# Local setup

Run `npm ci` then `npm start`, and open http://localhost:8000.

This is now the same static, browser-only app deployed to GitHub Pages. No sign-in is required. Saves are held in browser storage, not the filesystem or a cloud account. Different origins (including localhost and GitHub Pages) have separate saves.

The earlier `.local-data/` directory, if present, is left untouched and ignored by Git. Its server-side saves are not automatically imported into browser storage.

See README.md for build and deployment instructions. The original version 43 history and local unpublished version 44/45 branches are preserved.
