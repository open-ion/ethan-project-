# Current State

This file is a short pointer for project status. The detailed review status lives in `docs/review/current-state.md` and `docs/review/claude-code-current-status.md`.

## Current Implementation

- Static News Digest MVP remains the active app foundation.
- Public routes to preserve: `/news/` and `/dashboard/`.
- Category preferences are stored in `localStorage`.
- RSS fetch foundation writes generated data to `src/generated/news.json`.
- AI summary foundation exists as a template fallback script and can later be connected to an API.
- GitHub Actions workflow foundation exists for scheduled RSS fetch, summary preparation, smoke test, build, and generated-data commit.

## Next Priority

Verify the GitHub Actions scheduled update on the public repository and confirm that GitHub Pages serves `/news/`, `/dashboard/`, static assets, and detail routes correctly after build.
