# 1000 Monkeys

A reader for your own drafts. Read like a finished book, react and note in place, send accepted changes back to the source (Notion first). Full spec: `docs/project-doc.md`.

## Current phase: Phase 1 (Doug only)
Prove the round trip in a real revision routine. In scope:
- Notion import: top-level toggles become chapters
- Highlight a passage, send it to Notion as a block comment
- Sentence-first custom selection and double-tap likes (must work on a real iPhone)
- Fix page-mode overflow for paragraphs taller than the screen

Out of scope until Phase 1 is in daily use: accounts, billing, beta rounds, troops, variants.

## Rules that don't bend
- The page is the home screen. Everything else is one tap behind it.
- Readers never write to the manuscript. Only author-accepted feedback syncs back.
- Passages get permanent IDs. Feedback carries round, version, reader, passage.
- Notes anchor by quoted text + surrounding words + block ID.
- Custom selection must not break VoiceOver or native copy.
- Respect Reduce Motion. Local-first; no spinners while reading.
- Secrets (Notion token, server credentials) never go in the repo.

## Site layout
- `/` is the public landing page (placeholder for now) with an "Open the reader" / "Log in" button.
- `/app/` is the reader. Keep app links relative to `/app/` so it can later move to its own subdomain (e.g. `app.1000monkeys.io`).
- Phase 1 has no accounts: "Log in" just opens the app. Beta-reader links (Phase 2) open straight into a chapter and never pass through the landing page. See issue #15.

## Hosting
Build phase runs on a Cloudways server (PHP/MySQL stack) under a temporary Cloudways URL. Keep the backend thin and portable so it can move to a bigger server later.

## Working conventions
- Serve: `npm run serve` (port 4173, serves `public/`). Tests: `npm test` (Playwright; in this cloud container prefix with `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`).
- Every change: branch → tests pass → pull request with a plain-English summary for Doug (not a developer; explain what changed and what to check on the phone).
- Known bugs get a `test.fail()` test pointing at their issue; when fixed, remove the `test.fail` line.
- `main` holds reviewed, working code and is what Cloudways deploys. Work happens on branches and reaches `main` only through a pull request.
- Cloudways: Deployment path `public_html/public`, webroot `public_html/public/public`. Varnish is bypassed for this app with a `/*` exclusion.
