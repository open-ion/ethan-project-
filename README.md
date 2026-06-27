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

- **Ion** is the Owner and Final Human Decision Maker.
- **Ethan** is Ion's right hand, co-operator, partner, sole interface, and the CIO / Chief Intelligence Officer / AGATHON AI Command Center.
- CEO and COO are Executive Support AIs that support Ethan; they are not above Ethan and do not report directly to Ion.
- All AI officers, AI employees, sub-agents, Rules, Skills, RAG, Tools, and Workflows route through Ethan.
- Only Ethan reports the final outcome to Ion.
- Constitution: [`AGATHON_CONSTITUTION.md`](AGATHON_CONSTITUTION.md).

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

- **Owner / Final Human Decision Maker:** Ion (Human)
- **CIO / AGATHON AI Command Center:** Ethan (Chief Intelligence Officer AI)

### Executive AI Council

| Executive Support | Function |
| --- | --- |
| CEO | Strategy review, priority review, and management consultation for Ethan. |
| COO | Task decomposition, operations management, execution support, and bottleneck detection for Ethan. |
| Guard | Quality, security, privacy, accuracy, and risk gate. |

CEO, COO, and Guard support Ethan. They are not above Ethan and do not report directly to Ion.

### Specialized AI Functions

| Specialized Function | Domain |
| --- | --- |
| Nova | News intelligence |
| Forge | Engineering |
| Atlas | Research intelligence |
| Flow | Automation |
| Echo | Memory and context |
| Sage | Knowledge structuring |
| Vision | Design |
| Pulse | Scheduling |

## AGATHON AI Operating Framework

AGATHON LABS v2.0 runs on an Ethan-centered command model. Ethan routes work through the Executive AI Council, Specialized AI Functions, Rules, Skills, RAG, Tools, and Workflows, then consolidates the final report for Ion.

**Governance layers:**

| Layer | File | Purpose |
| --- | --- | --- |
| Constitution | [`AGATHON_CONSTITUTION.md`](AGATHON_CONSTITUTION.md) | Philosophy, authority, and command structure — highest priority |
| Operational rules | [`AGENTS.md`](AGENTS.md) | How AI workers operate day-to-day |
| Rules index | [`docs/rules/README.md`](docs/rules/README.md) | Concrete rules shared by all AI |

- **CIO / Command Center:** [`ETHAN.md`](ETHAN.md)
- **Executive Support AI:** [`CEO.md`](CEO.md) · [`COO.md`](COO.md)
- **Specialized AI Functions:** [`NOVA.md`](NOVA.md) · [`ATLAS.md`](ATLAS.md) · [`SAGE.md`](SAGE.md) · [`ECHO.md`](ECHO.md) · [`FORGE.md`](FORGE.md) · [`VISION.md`](VISION.md) · [`FLOW.md`](FLOW.md) · [`GUARD.md`](GUARD.md) · [`PULSE.md`](PULSE.md)

Reading order: `AGATHON_CONSTITUTION.md` → `AGENTS.md` → relevant role/persona file → root [`CLAUDE.md`](CLAUDE.md) → `docs/company/`.

### Orchestration OS

The operating layer (`src/orchestrator/`) lets Ethan analyze a request, route it to the right support role or specialized function, run a Guard quality gate, and report back — with execution backends that are swappable across Claude Code, Codex, and the OpenAI Agents SDK.

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

## Rules

AGATHON LABS の全 AI が必ず守る最高位の運用ルール。思想・権限は `AGATHON_CONSTITUTION.md`（最優先）、組織・連携は `AGENTS.md` に従う。

能力の拡張は役職追加ではなく Rules / Skills / Workflows / RAG / Tools で行う。

| Rule | 概要 |
| --- | --- |
| [`command-chain`](docs/rules/command-chain.md) | 指揮命令系統。Ion ⇄ Ethan ↔ AI の命令・報告の流れ |
| [`reporting-policy`](docs/rules/reporting-policy.md) | 報告ルール。全 AI は Ethan へ報告。Ethan のみが Ion へ報告する |
| [`ion-facing-interface`](docs/rules/ion-facing-interface.md) | Ion インターフェース。Ion との対話は Ethan のみが担う |
| [`role-creation-policy`](docs/rules/role-creation-policy.md) | 役職追加ルール。新役職はデフォルト禁止。仕組みで拡張する |
| [`review-policy`](docs/rules/review-policy.md) | レビュー方針。通常は Ethan のみ。迷った場合は Guard を加える |
| [`quality-gate`](docs/rules/quality-gate.md) | 品質保証。Guard は管理者ではなく Quality Gate / Risk Gate として機能する |
| [`git-workflow`](docs/rules/git-workflow.md) | Git 運用。GitHub main を唯一の正本とし、全 AI が同じ状態から作業を開始する |

Rules 全体の索引と依存関係: [`docs/rules/README.md`](docs/rules/README.md)

## Skills

Skills は特定のタスクを実行するための再利用可能な能力定義。役職ではなく手順であり、どの AI 社員も必要に応じて使う。

| Skill | 概要 |
| --- | --- |
| [`research`](docs/skills/research.md) | 情報収集・調査・根拠整理 |
| [`writing`](docs/skills/writing.md) | 文書・コンテンツ作成 |
| [`coding`](docs/skills/coding.md) | コード実装・レビュー・デバッグ |
| [`presentation`](docs/skills/presentation.md) | スライド・プレゼン資料作成 |
| [`sales`](docs/skills/sales.md) | 提案・説得・セールスコンテンツ |
| [`planning`](docs/skills/planning.md) | タスク分解・計画・優先順位付け |
| [`meeting`](docs/skills/meeting.md) | 議事録・アジェンダ・会議ファシリテーション |

Skills 全体の索引: [`docs/skills/README.md`](docs/skills/README.md)

## RAG / Knowledge Base

RAG は AI が回答・判断・要約を生成する際に参照する構造化された知識ベース。Echo が管理する。

| File | 概要 |
| --- | --- |
| [`ion-profile`](docs/rag/ion-profile.md) | Ion のプロフィール・興味・価値観・判断傾向 |
| [`agathon-context`](docs/rag/agathon-context.md) | AGATHON LABS のプロジェクト文脈・状況・決定履歴 |
| [`news-sources`](docs/rag/news-sources.md) | 信頼できるニュースソース・RSS フィード・品質基準 |

RAG 全体の索引: [`docs/rag/README.md`](docs/rag/README.md)

## Documentation

- Product requirements: [`docs/product/requirements.md`](docs/product/requirements.md)
- Current review snapshot: [`docs/review/current-state.md`](docs/review/current-state.md)
- Claude Code handoff: [`docs/handoff/claude-code-handoff.md`](docs/handoff/claude-code-handoff.md)
- Company operating context: [`docs/company/CLAUDE.md`](docs/company/CLAUDE.md)
- Organization structure: [`docs/company/organization.md`](docs/company/organization.md)
- AGATHON Principles: [`docs/company/principles.md`](docs/company/principles.md)
- Department instructions: [`docs/company/departments/`](docs/company/departments/)
- Original file backups: [`docs/_archive/originals/`](docs/_archive/originals/)