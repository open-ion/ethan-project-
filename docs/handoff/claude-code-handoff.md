# Claude Code Handoff — AGATHON LABS News Digest

## 1. Handoff Purpose

Claude Code has resumed availability. This document transfers implementation ownership from Codex back to Claude Code while preserving the current public MVP.

The goal is not to restart from zero. The goal is to continue growing the existing public News Brief into a daily-use product that helps Ion understand the world in five minutes every morning.

Public routes that must not break:

- News Brief: `https://open-ion.github.io/ethan-project-/news/`
- Dashboard: `https://open-ion.github.io/ethan-project-/dashboard/`

## 2. Product Goal

Build **News Brief**, an AGATHON LABS news digest app where Ethan reports the most important news to Ion every morning.

Core promise:

> Ion opens the app for five minutes and feels, “Today, this is enough to understand what matters.”

AGATHON LABS worldview to preserve:

- Ion is the human founder/user.
- Ethan is the CEO AI and final reporter to Ion.
- Nova gathers news signals.
- Atlas/Sage help interpret and organize context.
- Guard protects accuracy, source-grounding, and caution.
- Flow/Pulse support automation and daily delivery.

## 3. Current Repository State

Current app foundation:

- Static app under `src/`.
- No framework migration yet.
- Node.js scripts for dev/build/test/RSS/summarization.
- GitHub Pages route-shell build output.
- GitHub Actions workflow for scheduled refresh and Pages deploy.
- Product and company docs under `docs/`.

Important files:

| Area | File |
| --- | --- |
| App shell | `src/index.html` |
| Client logic | `src/app.js` |
| Sample categories/news | `src/data.js` |
| Styling | `src/styles.css` |
| Generated data | `src/generated/news.json` |
| RSS sources | `scripts/rss-sources.mjs` |
| RSS fetch | `scripts/fetch-rss.mjs` |
| OpenAI/template summary | `scripts/summarize-news.mjs` |
| Build | `scripts/build.mjs` |
| Dev server | `scripts/dev-server.mjs` |
| Smoke test | `scripts/smoke-test.mjs` |
| Pages workflow | `.github/workflows/update-news.yml` |
| Product requirements | `docs/product/requirements.md` |
| Current state | `docs/current-state.md` |
| Review state | `docs/review/current-state.md` |

## 4. What Codex Completed

### App / UI

- Home / News Brief display.
- Category list.
- News list.
- News detail route.
- Mobile-responsive static layout.
- `localStorage` category preference persistence.
- Generated JSON loading with sample-data fallback.
- Importance and confidence metadata display in the current app code.

### RSS / AI / Automation

- RSS source list.
- RSS fetch script with timeout, retry, per-source skip, logging, and per-source item limits.
- OpenAI Responses API summarization path.
- Template fallback when `OPENAI_API_KEY` is missing or API summarization fails.
- `summary`, `whyImportant`, `takeaway`, `importanceScore`, `confidence`, `confidenceReason`, `readingTime`, `topic`, and `keywords` support.
- Source-grounded OpenAI prompt rules.
- `importanceScore` ranking policy for disaster/safety, global, Japan-critical, finance, AI, and medical signals.
- Generated items sorted by `importanceScore desc`, then `publishedAt desc`.

### Build / Deploy

- `npm run dev`.
- `npm run build`.
- `npm start` for built output.
- `npm test` smoke checks.
- `dist/` build output with `/news/`, `/dashboard/`, and `404.html` route support.
- GitHub Actions workflow for RSS → summarize → test → build → commit JSON → upload Pages artifact → deploy Pages.

### Documentation

- README.
- Product requirements.
- Company context.
- Current-state docs.
- Review docs.
- Original-file archive snapshots.

## 5. Known Limitations / Risks

### Live RSS validation

Local container RSS fetch attempts can be blocked by the environment/proxy. In that environment, `fetch failed`, timeout, or CONNECT 403 behavior may happen.

Do not treat local RSS failure as proof that production RSS is broken. Use GitHub Actions as the authoritative runtime for live RSS validation.

### Static MVP limitations

The current app is intentionally plain HTML/CSS/JavaScript. It is useful for MVP iteration, but not yet a full production app.

Missing or incomplete:

- Real user accounts.
- DB persistence.
- Email delivery.
- LINE delivery.
- Notification preferences.
- Update history.
- Payment / plan gating.
- ESLint / formatter.
- Unit and integration tests beyond smoke tests.
- Full PWA support.

### Security / accuracy risks

- RSS data is external content; continue avoiding unsupported claims.
- Medical and financial summaries must remain non-advisory.
- Every digest item must preserve the source URL.
- Low-confidence output should remain visibly marked.

## 6. Immediate Next Steps for Claude Code

### Step 1 — Verify public production workflow

1. Confirm repository secret `OPENAI_API_KEY` exists.
2. Manually run `.github/workflows/update-news.yml`.
3. Confirm RSS fetch succeeds in GitHub Actions.
4. Confirm `src/generated/news.json` is updated and committed if changed.
5. Confirm GitHub Pages deploy succeeds.
6. Open:
   - `https://open-ion.github.io/ethan-project-/news/`
   - `https://open-ion.github.io/ethan-project-/dashboard/`
7. Confirm detail routes and assets still load.

### Step 2 — Inspect generated JSON quality

Review the first real generated JSON for:

- Natural ordering by `importanceScore`.
- Disaster/safety/global/Japan-critical news appearing near the top.
- No unsupported facts in `summary`, `whyImportant`, or `takeaway`.
- Reasonable `confidence` values.
- Useful `confidenceReason` text.
- Preserved source URLs.
- No excessive article count for a five-minute digest.

### Step 3 — Tune product quality before new architecture

Before large framework migration, improve daily usefulness:

- Cap or group daily article count if the feed is too long.
- Improve top-story presentation.
- Improve low-confidence warnings.
- Add a digest-level “Ethan’s conclusion” section.
- Add generated timestamp and source health summary to the UI.
- Add Email delivery once the morning JSON is stable.
- Add LINE after Email is reliable.

## 7. Recommended Ownership Split Going Forward

### Claude Code should own

- Main application implementation.
- Architecture decisions.
- Framework migration, if any.
- DB design.
- Email / LINE production integrations.
- Auth, billing, and plan gates.
- Major UI/product flows.

### Codex should support with

- Code review.
- Small bug fixes.
- Build/test/lint fixes.
- Documentation updates.
- Smoke tests and QA checks.
- Accessibility and responsive improvements.
- Safe backup/archive creation.
- Focused refactors that do not change architecture.

## 8. Do Not Break

Claude Code should preserve these unless explicitly changing product direction:

- `/news/` public route.
- `/dashboard/` public route.
- `src/generated/news.json` loading fallback.
- Source URL preservation.
- `summary`, `whyImportant`, `takeaway` fields.
- `importanceScore`, `confidence`, and `confidenceReason` fields.
- `npm install`, `npm test`, `npm run build`, `npm run dev`.
- AGATHON LABS worldview: Ethan reports to Ion.

## 9. Suggested First Claude Code PR

Title:

> Verify live GitHub Actions news refresh and tune generated digest quality

Scope:

- Run/update workflow if needed.
- Inspect real generated JSON.
- Tune RSS sources or scoring thresholds based on actual output.
- Keep UI and routes stable.
- Update README and `docs/current-state.md` with the live verification result.

Avoid in the first PR:

- Framework migration.
- Auth.
- DB.
- Payment.
- Major design rewrite.

## 10. Handoff Checklist

Before Claude Code starts coding:

- [ ] Read `README.md`.
- [ ] Read `docs/current-state.md`.
- [ ] Read `docs/review/current-state.md`.
- [ ] Read `docs/product/requirements.md`.
- [ ] Run `npm install`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Check public `/news/` and `/dashboard/`.
- [ ] Confirm GitHub Actions secrets.
- [ ] Manually run the scheduled news workflow.
