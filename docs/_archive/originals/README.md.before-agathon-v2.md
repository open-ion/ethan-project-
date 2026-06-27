# ETHAN — あなた専用AI朝ダッシュボード

**For the Good of Humanity.**<br>
**人のため、社会のために。**

ETHANはニュースアプリではありません。**「5分で今日一日の意思決定を終わらせるAI」**であり、その人による・その人のための・その人の生活をより良くするAI朝ダッシュボードです。

## このアプリの思想

- **その人による** — ユーザータイプ（AI・ビジネス / 投資 / 医療・看護 / サーファー / 学習 / 自由カスタム）で画面が変わる。
- **その人のための** — 全員に同じ画面を見せない。必要な情報だけを選ぶ。
- **その人の生活をより良くする** — ニュースを見せるのではなく、今日どう動くかを決める。
- **5分で今日を決める** — 朝、画面を開けば「今日読むべき3件」「Ethanからの一言」「1日1アイデア」が並ぶ。
- **情報を増やすのではなく、迷いを減らす** — これがETHANの一貫した設計原則。

### SmartNewsとの違い

SmartNewsはニュース・クーポン・ポイント・広告・エンタメを**大量に見せる**情報プラットフォームです。ETHANは違います。ETHANはその人に必要な情報だけを選び、**今日の判断と行動につなげる**AI朝ダッシュボードです。情報の量ではなく、意思決定の速さで勝負します。

### ウィジェット構造（今後の拡張）

トップ画面はウィジェットの集合として設計しています。AIニュース / 投資（日経平均・S&P500・為替）/ 医療・看護 / 天気・風向・風速・波情報・潮汐 / カレンダー / ToDo / Notionメモ / 1日1アイデア / Ethanコメント。現時点では実データのニュース件数以外は placeholder で、天気・波情報・株価などのAPI連携は今後段階的に追加します（DB・認証・外部APIはまだ導入していません。設定は localStorage に保存）。

その土台として、毎朝のニュースは引き続きカテゴリ別に要約して画面下部に表示します（数分で重要ニュースを把握できる従来機能はそのまま維持）。

## Worldview

- **Ion** is the user, human, and founder.
- **Ethan** is Ion's partner AI and the CEO of AGATHON LABS.
- Ethan oversees all AI employees.
- AI employees work as specialized divisions.
- Ethan consolidates their work and reports the final outcome to Ion.

## Current Product

ETHANの中核は上記の**AI朝ダッシュボード**です。その最初の構成要素として、毎朝の**ニュースダイジェスト**（カテゴリ別の要約配信）を実装済みで、ダッシュボード下部に組み込んでいます。

ニュースダイジェスト部分の目的:

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

## AI Workforce Framework

AGATHON LABS runs on an AI employee model. Each AI has a persona file at the repository root defining its Role, Personality, Mission, Responsibilities, Authority, Collaboration Rules, I/O, Do/Don't, Escalation, and Example Behavior. Any AI (Claude Code / Codex) reads these to behave consistently.

- **Constitution (top priority):** [`AGENTS.md`](AGENTS.md)
- **CEO:** [`ETHAN.md`](ETHAN.md)
- **AI employees:** [`NOVA.md`](NOVA.md) · [`ATLAS.md`](ATLAS.md) · [`SAGE.md`](SAGE.md) · [`ECHO.md`](ECHO.md) · [`FORGE.md`](FORGE.md) · [`VISION.md`](VISION.md) · [`FLOW.md`](FLOW.md) · [`GUARD.md`](GUARD.md) · [`PULSE.md`](PULSE.md)

Reading order: `AGENTS.md` → relevant persona file → root [`CLAUDE.md`](CLAUDE.md) → `docs/company/`.

### Orchestration OS

The operating layer (`src/orchestrator/`) lets Ethan analyze a request and
auto-route it to the right AI employees, run a Guard quality gate, and report
back — with execution backends that are swappable across Claude Code, Codex, and
the OpenAI Agents SDK.

```bash
npm run orchestrate -- "競合を調査して、結果をスライドにデザインして、公開して"
npm run test:orchestrator
```

Run it on a real Claude model with the `claude-code` runtime:

```bash
AGATHON_CLAUDE_CODE=1 ANTHROPIC_API_KEY=sk-ant-... \
  npm run orchestrate -- "AIエージェントの最新トレンドを3行で" --runtime=claude-code
```

It also runs in CI via the **AGATHON Orchestrator** workflow
([`.github/workflows/orchestrate.yml`](.github/workflows/orchestrate.yml)) —
manual dispatch with a task input, using the `ANTHROPIC_API_KEY` secret; the
report is written to the job summary.

Architecture and extension points: [`docs/orchestrator/architecture.md`](docs/orchestrator/architecture.md).

## Documentation

- Product requirements: [`docs/product/requirements.md`](docs/product/requirements.md)
- Current review snapshot: [`docs/review/current-state.md`](docs/review/current-state.md)
- Claude Code handoff: [`docs/handoff/claude-code-handoff.md`](docs/handoff/claude-code-handoff.md)
- Company operating context: [`docs/company/CLAUDE.md`](docs/company/CLAUDE.md)
- Organization structure: [`docs/company/organization.md`](docs/company/organization.md)
- AGATHON Principles: [`docs/company/principles.md`](docs/company/principles.md)
- Department instructions: [`docs/company/departments/`](docs/company/departments/)
- Original file backups: [`docs/_archive/originals/`](docs/_archive/originals/)
