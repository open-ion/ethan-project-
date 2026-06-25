# Current State

This file is a short pointer for project status. The detailed review status lives in `docs/review/current-state.md` and `docs/review/claude-code-current-status.md`.

## Current Implementation

- Static News Digest MVP remains the active app foundation.
- Public routes to preserve: `/news/` and `/dashboard/`.
- Category preferences are stored in `localStorage`.
- RSS fetch foundation writes generated data to `src/generated/news.json`.
- RSS source list now uses the current NHK NEWS WEB RSS endpoint and adds Yahoo domestic/business/IT plus ITmedia AI coverage.
- OpenAI API summarization path exists and falls back to source-grounded template summaries when `OPENAI_API_KEY` is not set.
- `importanceScore` is now tuned on a 1-100 scale for disaster/safety, global, Japan-critical, finance, AI, and medical signals, then sorted before output.
- `confidenceReason` explains why confidence is low or high, especially when RSS text is short.
- News Brief cards display importance tier, AI Confidence, source, update time, and confidence reason.
- GitHub Actions workflow exists for scheduled RSS fetch, OpenAI/template summaries, smoke test, build, generated-data commit, artifact upload, and GitHub Pages deploy.

## Live RSS Check

- Public News Brief URL checked: `https://open-ion.github.io/ethan-project-/news/`.
- Local RSS fetch attempts from this container are blocked by the environment/proxy with `fetch failed` / CONNECT 403 behavior. The fetch script still retries, logs source-level errors, skips failed sources, and keeps the overall job alive.
- GitHub Actions should be used as the authoritative real-RSS runtime after merge.

## Next Priority

Run the GitHub Actions workflow in the public repository with `OPENAI_API_KEY` configured, verify live RSS items are summarized with natural `importanceScore` and `confidenceReason`, then tune thresholds based on actual morning output.
