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
| AI provider integration | Not implemented |
| News source integration | Dummy data only |
| Scheduler | Not implemented |
| Email/LINE delivery | Not implemented |
| Test/lint/build tooling | Build script and smoke test configured; lint not configured yet |

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

Run the smoke test suite:

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
7. smoke test for category data, news data, key render markers, and mobile CSS markers.

Still intentionally not implemented yet:

1. real onboarding and saved category preferences;
2. NewsAPI or RSS article collection;
3. scheduled morning collection;
4. real AI ranking and summarization;
5. Email delivery;
6. LINE delivery;
7. user settings and personalization storage;
8. error logging and retry handling;
9. pricing-plan restrictions for Free, Premium, and Pro;
10. lint and format configuration;
11. deployment and environment variable documentation.

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
- Company operating context: [`docs/company/CLAUDE.md`](docs/company/CLAUDE.md)
- Organization structure: [`docs/company/organization.md`](docs/company/organization.md)
- AGATHON Principles: [`docs/company/principles.md`](docs/company/principles.md)
- Department instructions: [`docs/company/departments/`](docs/company/departments/)
- Original file backups: [`docs/_archive/originals/`](docs/_archive/originals/)
