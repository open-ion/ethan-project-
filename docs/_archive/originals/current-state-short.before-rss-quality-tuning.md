# Current State

This file is a short pointer for project status. The detailed review status lives in `docs/review/current-state.md` and `docs/review/claude-code-current-status.md`.

## Current Implementation

- Static News Digest MVP remains the active app foundation.
- Public routes to preserve: `/news/` and `/dashboard/`.
- Category preferences are stored in `localStorage`.
- RSS fetch foundation writes generated data to `src/generated/news.json`.
- OpenAI API summarization path exists and falls back to template summaries when `OPENAI_API_KEY` is not set.
- GitHub Actions workflow exists for scheduled RSS fetch, OpenAI/template summaries, smoke test, build, generated-data commit, artifact upload, and GitHub Pages deploy.

## Next Priority

Run the GitHub Actions workflow in the public repository with `OPENAI_API_KEY` configured, verify RSS data becomes summarized JSON, confirm Pages deploy succeeds, and confirm `/news/`, `/dashboard/`, static assets, and detail routes are live after deployment.
