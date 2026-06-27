# Claude Code Current Status — News Digest App

## Purpose

This review captures what Claude Code appears to have completed, what is still unfinished, and where the News Digest app is likely stuck.

Codex did not make a large implementation change in this pass. The focus is status confirmation and blocker identification.

## Repository Review Scope

Reviewed areas:

- `package.json`
- `src/`
- `app/`
- `components/`
- `lib/`
- `data/`
- `docs/`
- `README.md`
- local npm commands
- local static routes served by the development server

Observed structure:

- `package.json` exists and defines `dev`, `build`, `start`, and `test` scripts.
- `src/` exists and contains the static MVP files.
- `app/`, `components/`, `lib/`, and root-level `data/` directories do not currently exist.
- `docs/` contains company, product, review, and archive documentation.
- `README.md` documents setup, current stack status, incomplete features, and Codex/Claude Code responsibilities.

## Command Verification

| Command | Result | Notes |
| --- | --- | --- |
| `npm install` | Pass | No dependencies are currently installed beyond the package itself. npm prints an environment warning about `http-proxy`, but installation succeeds. |
| `npm test` | Pass | Runs `node scripts/smoke-test.mjs`; confirms category data, news data, render markers, viewport marker, and mobile CSS markers. |
| `npm run build` | Pass | Runs `scripts/build.mjs` and produces `dist/` by copying `src/`. |
| `PORT=4173 npm run dev` | Pass | Local server starts and serves the static app. |

HTTP checks while dev server was running:

| Path | Result | Meaning |
| --- | --- | --- |
| `/` | 200 HTML | Home route is served. |
| `/?category=ai-technology` | 200 HTML | Category-filter URL is served; filtering is handled client-side. |
| `/news/ai-agents-workflow` | 200 HTML | Detail route is served by the dev server fallback. |
| `/styles.css` | 200 CSS | Stylesheet is served. |
| `/app.js` | 200 JavaScript | App renderer is served. |
| `/data.js` | 200 JavaScript | Dummy data module is served. |

## What Is Working on Screen

### Home Screen

Status: implemented in the static MVP.

Evidence:

- `renderHome()` exists in `src/app.js`.
- The hero section addresses Ion and frames the page as an Ethan report.
- The home view renders the category section and digest section.

### Category List

Status: implemented with dummy category data.

Evidence:

- `src/data.js` defines seven required categories.
- `renderCategoryPills()` and the category card grid render category navigation.
- Category filter URLs use `?category=<categoryId>`.

### News List

Status: implemented with dummy news data.

Evidence:

- `src/data.js` defines five sample news items.
- `renderNewsCard()` renders category, date, title, summary, importance, takeaway, and detail link.
- The digest section shows the filtered or full list.

### News Detail

Status: implemented for known dummy article IDs.

Evidence:

- `renderDetail(newsId)` exists.
- `/news/:id` is handled by the local dev server and rendered client-side.
- The detail view shows one-line summary, why it matters, busy-reader takeaway, and source link.

### Mobile Display

Status: partially implemented.

Evidence:

- `src/styles.css` includes a mobile media query at `max-width: 760px`.
- The detail grid and news list collapse to one column.
- Buttons and pills become full-width on small screens.

Limitation:

- This was confirmed by code inspection and smoke checks, not by a real mobile browser screenshot in this environment.

## What Is Still Not Working or Not Implemented

### Product Features

- Real onboarding flow.
- Persisted category preferences.
- Settings screen.
- Admin/operator job status screen.
- NewsAPI integration.
- RSS integration.
- Scheduled morning collection.
- Real AI ranking.
- Real AI summarization.
- Email delivery.
- LINE delivery.
- User data persistence.
- Delivery status tracking.
- Error logging and retry handling.
- Free/Premium/Pro plan enforcement.

### Engineering / Quality

- Lint configuration.
- Formatter configuration.
- Unit test framework.
- Integration test framework.
- CI workflow.
- Deployment configuration.
- Environment variable documentation for future integrations.
- Accessibility audit beyond basic semantic/source inspection.
- Real browser/mobile visual verification.

## Likely Sticking Points

### 1. Static Hosting and GitHub Pages

Most likely risk if deploying to GitHub Pages:

- asset URLs are root-relative, for example `/styles.css` and `/app.js`;
- GitHub Pages project sites are often served under `/<repo-name>/`, where root-relative assets may point to the domain root instead of the project path;
- direct navigation to `/news/<id>` may 404 on static hosting unless the host is configured to fallback to `index.html` or a `404.html` fallback is added.

Why this matters:

- the local dev server handles `/news/*` by falling back to `index.html`;
- a plain static host may not do that automatically.

### 2. Build / Deploy Gap

The build currently copies `src/` to `dist/`. This is enough for a local static MVP, but it does not yet include:

- GitHub Pages base path handling;
- deploy command;
- CI workflow;
- `404.html` fallback;
- validation that built output works under a subpath.

### 3. Routing Model

The routing is client-side and custom:

- category filtering uses query parameters;
- detail pages use `/news/:id`;
- dev fallback makes detail pages work locally.

Potential issue:

- production static hosting must match the dev server fallback behavior.

### 4. API Not Connected

The app uses dummy local data only. That is expected for the current MVP, but it means:

- no live news updates;
- no NewsAPI/RSS fetch;
- no scheduling;
- no delivery automation.

### 5. Data Structure Is MVP-Only

The current data shape is useful and clear, but still temporary:

- categories and news are hardcoded;
- source reliability is not modeled;
- duplicate detection is not modeled;
- user preferences are not modeled;
- delivery status is not modeled.

### 6. Technology Stack Still Not Final

The current app intentionally avoids a heavy framework. This keeps the MVP simple, but Claude Code still needs to decide whether to:

- keep the static app temporarily;
- migrate to Next.js/TypeScript;
- add a backend/API layer;
- add persistence and scheduled jobs.

## What Claude Code Has Completed

- Static MVP structure.
- Local npm scripts for dev, build, start, and smoke test.
- Home screen.
- Category list.
- Dummy news list.
- News detail rendering.
- Basic mobile responsive CSS.
- Basic smoke testing.
- Product and company documentation.

## What Codex Can Safely Do Next

Codex can work on small completion-quality tasks without changing the architecture:

1. Add a static-hosting-safe fallback such as `404.html` during build.
2. Make asset paths deploy-safe for GitHub Pages project paths.
3. Add a small build-output smoke check after `npm run build`.
4. Improve accessibility labels and focus styles.
5. Add lint/format only if it does not force a framework migration.
6. Update README with deployment caveats once the deploy target is confirmed.

## What Should Wait for Claude Code

Claude Code should own larger implementation decisions:

- production framework choice;
- Next.js/TypeScript migration, if desired;
- NewsAPI/RSS ingestion architecture;
- AI summarization architecture;
- persistence model;
- scheduling system;
- Email/LINE delivery integrations;
- deployment platform decision;
- GitHub Pages vs another host decision.

## Next Highest-Priority Fix

The next highest-priority fix is to make the static build safer for deployment, especially GitHub Pages-style hosting.

Recommended small fix:

- add a `404.html` fallback in `dist/` during build;
- consider relative asset paths or configurable base path;
- add a build-output smoke test that checks `dist/index.html`, `dist/app.js`, `dist/data.js`, and `dist/styles.css` exist.

This is small, does not change the app architecture, and directly addresses the most likely gap between local success and deployed failure.
