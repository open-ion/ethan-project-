# AGATHON LABS — News Digest App

**For the Good of Humanity.**<br>
**人のため、社会のために。**

AGATHON LABS is a human-centered AI organization built around Ion and Ethan. The current product direction is a personal AI news digest app that helps Ion understand important news every morning in roughly five minutes.

## Worldview

- **Ion** is the user, human, and founder.
- **Ethan** is Ion's partner AI and the CEO of AGATHON LABS.
- Ethan oversees all AI employees.
- AI employees work as specialized divisions.
- Ethan consolidates their work and reports the final outcome to Ion.

## Current Product

The next development target is the **News Digest App**.

Purpose:

- collect news from NewsAPI or major media RSS feeds;
- summarize important stories by category;
- personalize the digest using user interests;
- deliver the digest by Email first, then LINE;
- prioritize a no-new-app daily experience.

See [`docs/product/requirements.md`](docs/product/requirements.md) for the full product requirements.

## Technical Stack Status

A small static MVP app is now included so Ion can view the home screen, categories, news list, and news detail pages while Claude Code decides the larger production architecture.

Current repository status:

| Area | Status |
| --- | --- |
| App framework | Lightweight static app with Node.js dev server |
| Language/runtime | JavaScript on Node.js >= 20 |
| Package manager | npm |
| UI framework | Plain HTML/CSS/JavaScript |
| Backend/API | Not implemented |
| Database | Not implemented |
| AI provider integration | OpenAI Responses API summarization path added with template fallback |
| News source integration | RSS fetch foundation added; UI falls back to dummy data |
| Scheduler | Not implemented |
| Email/LINE delivery | Not implemented |
| Test/lint/build tooling | Build script, route-shell build output, and smoke test configured; lint not configured yet |

Future production stack recommendation for Claude Code to confirm before larger implementation:

- **App:** Next.js + TypeScript when the app grows beyond the static MVP
- **UI:** Tailwind CSS or a comparable lightweight styling approach
- **Data:** PostgreSQL or SQLite for first local persistence
- **Jobs:** cron-compatible scheduler or hosted scheduled function
- **News sources:** RSS first for low-friction testing, then NewsAPI
- **Delivery:** Email first, LINE after the digest flow is stable

## Setup and Run

Install dependencies and run the static MVP:

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

Build the static app into `dist/`:

```bash
npm run build
```

Run the built output locally:

```bash
npm start
```

Run the smoke test suite (this also builds `dist/` first):

```bash
npm test
```

There is currently no lint script because framework-level lint tooling has not been selected yet.

## Incomplete Features

Completed in the static MVP:

1. home screen;
2. category list;
3. dummy news list;
4. news detail route;
5. mobile-responsive layout;
6. npm install / dev / build / start commands;
7. smoke test for category data, news data, key render markers, generated JSON loading, route-shell build output, and mobile CSS markers;
8. localStorage category persistence;
9. RSS fetch and OpenAI-backed AI-summary script with safe template fallback;
10. GitHub Actions workflow for scheduled RSS → OpenAI summary → JSON update → Pages deploy automation;
11. source-grounded summary prompt that forbids unsupported facts;
12. tuned importanceScore ranking for disaster/safety, global, Japan-critical, finance, AI, and medical signals;
13. confidenceReason metadata for low-confidence or title-only RSS items;
14. UI display for importance tier, AI Confidence, source, and confidence reason.

Still intentionally not implemented yet:

1. full onboarding UX beyond the saved category checkboxes;
2. production RSS source coverage tuning;
3. verified scheduled morning collection on GitHub Actions in the public repository;
4. production ranking validation with live RSS/OpenAI output beyond the current heuristic;
5. Email delivery;
6. LINE delivery;
7. user settings and personalization storage;
8. error logging and retry handling;
9. pricing-plan restrictions for Free, Premium, and Pro;
10. lint and format configuration;
11. production deployment verification and environment variable documentation beyond `.env.example`.

## Priority Order

Current implementation priority is now user-facing daily usefulness:

1. OpenAI API summarization, RSS real data, and the three digest fields: `summary`, `whyImportant`, `takeaway`.
2. GitHub Actions morning automation from RSS to JSON to GitHub Pages.
3. LINE and Email notifications.
4. DB persistence, user settings, and update history.
5. Free / Premium / Pro billing.

## Live RSS Quality Tuning

The summarization pipeline now prioritizes daily usefulness from real RSS data:

- `importanceScore` is normalized to a 1-100 scale and sorted before JSON output;
- disaster/safety, global, Japan-critical, finance, AI, and medical signals receive higher default priority;
- OpenAI prompts are source-grounded and explicitly forbid unsupported facts or speculation;
- `confidenceReason` explains why AI confidence is high or low;
- the UI surfaces importance tier, AI Confidence, source, update time, and confidence reason for verification.

Local RSS fetching can be blocked by network/proxy policy; GitHub Actions remains the target runtime for real scheduled fetches.

## Data Update Foundation

The current MVP includes a safe foundation for automated news updates without changing the app architecture:

```bash
npm run fetch:rss
npm run summarize
npm test
```

- `npm run fetch:rss` writes RSS output to `src/generated/news.json`.
- `npm run summarize` generates `summary`, `whyImportant`, `takeaway`, `importanceScore`, `confidence`, `readingTime`, `topic`, and `keywords` with OpenAI when `OPENAI_API_KEY` is set, and otherwise uses a safe template fallback.
- `.github/workflows/update-news.yml` runs RSS fetch, OpenAI/template summarization, test, build, generated JSON commit, Pages artifact upload, and GitHub Pages deploy on a daily schedule or manual dispatch.
- `.env.example` documents OpenAI and RSS settings, including `OPENAI_API_KEY`, `AI_MODEL`, `AI_SUMMARY_LIMIT`, retry count, and timeout.

The UI loads `generated/news.json` when it contains items and falls back to sample data when generated data is empty or unavailable.

## Codex Review Role

Claude Code owns app implementation. Codex owns completion quality.

Codex should improve what exists rather than replace it. Codex may complete unfinished pieces, fix bugs, improve UI and responsiveness, fix TypeScript/lint/build issues, update README, add tests, refactor carefully, remove unused code, improve performance and accessibility, create backups, and update documentation.

Codex should not introduce large new features, change architecture, change the technology stack, reorganize directories broadly, or implement auth, payments, production NewsAPI/RSS, production AI summarization, or database design changes without explicit direction.

Codex responsibilities:

- inspect Claude Code changes before modifying them;
- identify incomplete features, quality gaps, and design risks;
- propose improvements before large implementation work;
- make small, high-priority fixes only after confirming existing files;
- preserve important files with backups when needed;
- keep AGATHON LABS context intact.

Current review snapshot: [`docs/review/current-state.md`](docs/review/current-state.md)

## Mission

私たちは、人を置き換えるためではなく、人の可能性を広げるために存在する。

AGATHON LABS exists to expand human possibility through accurate, useful, and humane AI collaboration.

## Organization

- **Founder:** Ion (Human)
- **CEO:** Ethan (Chief Executive AI)

### AI Employees

| AI Employee | Division |
| --- | --- |
| Nova | News Division |
| Forge | Engineering Division |
| Atlas | Research Division |
| Flow | Automation Division |
| Echo | Memory Division |
| Sage | Knowledge Division |
| Vision | Design Division |
| Guard | Security Division |
| Pulse | Scheduling Division |

## Documentation

- Product requirements: [`docs/product/requirements.md`](docs/product/requirements.md)
- Current review snapshot: [`docs/review/current-state.md`](docs/review/current-state.md)
- Claude Code handoff: [`docs/handoff/claude-code-handoff.md`](docs/handoff/claude-code-handoff.md)
- Company operating context: [`docs/company/CLAUDE.md`](docs/company/CLAUDE.md)
- Organization structure: [`docs/company/organization.md`](docs/company/organization.md)
- AGATHON Principles: [`docs/company/principles.md`](docs/company/principles.md)
- Department instructions: [`docs/company/departments/`](docs/company/departments/)
- Original file backups: [`docs/_archive/originals/`](docs/_archive/originals/)

## GitHub Synchronization Procedure

GitHub is the only source of truth for AGATHON LABS repository work. Claude Code, Codex, and human operators should always synchronize through GitHub before treating local files as current.

Before starting work:

```bash
git fetch --prune
git pull --ff-only
git status
git branch --show-current
git log --oneline -5
git remote -v
git rev-parse --abbrev-ref --symbolic-full-name @{u}
```

Before handing work back to Claude Code or Ion:

```bash
npm run check:docs-governance
npm run check:worktree-clean
git status
git push
```

Completion requires both a local commit and a successful push to the configured upstream branch. If `git push` fails, the work is still incomplete and the blocker must be reported with the current branch, latest commit, changed files, remaining issues, and next action.


## Codex to Claude Code Handoff Protocol

GitHub is the only source of truth for AGATHON LABS. Claude Code, Codex, and human operators must synchronize through GitHub so work never depends on one local environment or chat history.

Codex work must be saved to GitHub by one of these methods, in priority order:

1. create a pull request;
2. update an existing pull request;
3. push a work branch;
4. create or update a GitHub Issue containing the diff, full changed file contents when necessary, and continuation steps.

Local-only Codex changes are prohibited. Chat-only reports are prohibited as the sole storage location. If work is not saved in a GitHub PR, branch, commit, or Issue, it is incomplete and should be treated as unavailable.

Before Codex starts work, it must record the repository URL, current branch, intended work branch, latest commit, existing PR status, and diff from the `work` branch. Every Codex handoff must include `repo`, `branch`, `commit`, `PR URL`, and next commands for Claude Code.

### Codex作業完了報告

```md
【Codex作業完了報告】
- Repo：
- Base branch：
- Work branch：
- PR URL：
- Latest commit：
- 変更ファイル：
- 実行したテスト：
- Claude Codeが次にやること：
- 未完了タスク：
- 注意点：
```

### Claude Code復帰手順

```md
【Claude Code復帰手順】
1. GitHubのPR URLを開く
2. branch名を確認
3. git fetch origin
4. git checkout <work-branch>
5. git pull --ff-only
6. 変更ファイル確認
7. テスト実行
8. 必要なら追加修正
9. commit / push / PR更新
```
