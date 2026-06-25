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

No executable app stack has been committed yet.

Current repository status:

| Area | Status |
| --- | --- |
| App framework | Not selected |
| Language/runtime | Not selected |
| Package manager | Not selected |
| UI framework | Not implemented |
| Backend/API | Not implemented |
| Database | Not implemented |
| AI provider integration | Not implemented |
| News source integration | Not implemented |
| Scheduler | Not implemented |
| Email/LINE delivery | Not implemented |
| Test/lint/build tooling | Not configured |

Recommended MVP stack for Claude Code to confirm before implementation:

- **App:** Next.js + TypeScript
- **UI:** Tailwind CSS
- **Data:** PostgreSQL or SQLite for first local MVP
- **Jobs:** cron-compatible scheduler or hosted scheduled function
- **News sources:** RSS first for low-friction testing, then NewsAPI
- **Delivery:** Email first, LINE after the digest flow is stable

## Setup and Run

There is currently no runnable application.

Until Claude Code creates the app foundation, there are no install, dev, test, build, or start commands.

Expected future commands after app scaffolding:

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

These commands are placeholders and should not be treated as available until `package.json` is added.

## Incomplete Features

The following features are intentionally not implemented yet:

1. user onboarding and category selection;
2. NewsAPI or RSS article collection;
3. scheduled morning collection;
4. AI ranking and summarization;
5. digest preview screen;
6. Email delivery;
7. LINE delivery;
8. user settings and personalization storage;
9. error logging and retry handling;
10. pricing-plan restrictions for Free, Premium, and Pro;
11. lint, format, test, and build configuration;
12. deployment and environment variable documentation.

## Codex Review Role

Claude Code owns app implementation. Codex should act as reviewer and improvement partner.

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
