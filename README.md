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

## Documentation

- Product requirements: [`docs/product/requirements.md`](docs/product/requirements.md)
- Current review snapshot: [`docs/review/current-state.md`](docs/review/current-state.md)
- Claude Code handoff: [`docs/handoff/claude-code-handoff.md`](docs/handoff/claude-code-handoff.md)
- Company operating context: [`docs/company/CLAUDE.md`](docs/company/CLAUDE.md)
- Organization structure: [`docs/company/organization.md`](docs/company/organization.md)
- AGATHON Principles: [`docs/company/principles.md`](docs/company/principles.md)
- Department instructions: [`docs/company/departments/`](docs/company/departments/)
- Original file backups: [`docs/_archive/originals/`](docs/_archive/originals/)

---

## AGATHON Voice Reception MVP（AI自動音声受付Webデモ）

AGATHON LABSの最優先事業として、飲食店などの店舗向けに**電話対応・予約受付・営業電話の一次対応をAIが行うWeb版MVP**を追加しました。電話番号連携前の営業デモとして、ブラウザ上でマイク入力またはテキスト入力を使って動作確認できます。

### 起動方法

```bash
npm install
npm run dev
```

起動後、以下を開きます。

- 受付デモ: <http://localhost:3000/voice-reception>
- 管理画面: <http://localhost:3000/admin>

ビルド後の確認:

```bash
npm run build
npm start
```

### 環境変数

現時点のVoice Reception MVPは、営業デモ優先のため外部AI APIやDBを使わず、ブラウザ標準の Web Speech API と `localStorage` で動きます。そのため追加の環境変数は不要です。

将来の本番化で想定する環境変数:

| Variable | Purpose | Status |
| --- | --- | --- |
| `OPENAI_API_KEY` | 自然応答・予約抽出・営業電話判定のAI処理 | 未接続（既存ニュース要約では利用可能） |
| `AI_MODEL` | AI応答モデル指定 | 未接続 |
| `DATABASE_URL` | 予約・会話ログ永続化 | 未実装 |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` | 電話番号連携 | 未実装 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE通知 | 未実装 |
| `GOOGLE_CALENDAR_CLIENT_ID` / `GOOGLE_CALENDAR_CLIENT_SECRET` | Googleカレンダー連携 | 未実装 |

### MVPでできること

- Webブラウザでマイク入力（Web Speech API対応ブラウザ）
- 未対応環境向けのテキスト入力フォールバック
- 店舗スタッフ風の自然な一次応答
- 予約希望日時・人数・名前・電話番号の簡易抽出
- 営業時間・定休日・アクセス・駐車場FAQへの回答
- 営業電話らしい内容を予約と分けて一次対応
- 会話ログを `localStorage` に保存
- 予約情報を構造化して `localStorage` に保存
- 管理画面で予約一覧と会話ログを確認

### 設計判断

- **優先順位A（動くこと）**を満たすため、サーバーDBや外部電話APIはまだ導入していません。
- 音声認識はブラウザ依存の Web Speech API を使い、未対応環境では同じ受付ロジックをテキスト入力で検証できます。
- 保存キーは `agathon-voice-reception-records` に分離し、既存ニュースダッシュボードの保存領域を壊さないようにしています。
- 将来の電話番号連携、LINE通知、Googleカレンダー連携は、現在の `record`（intent / transcript / reply / reservation）をAPI/DBへ移す前提で拡張できます。

### 未実装・技術的負債

- OpenAI等の実AI応答は未接続。現在は営業デモ用のルールベース応答です。
- 予約日時の自然言語パースは簡易正規表現です。本番ではAI抽出とバリデーションが必要です。
- `localStorage` 保存のため、端末をまたいだ管理・共有はできません。
- 認証、店舗ごとの設定、営業時間例外、満席判定、キャンセル対応は未実装です。
- 電話番号連携、LINE通知、Googleカレンダー登録は未実装です。

### 今後の拡張方針

1. 受付ドメインを `conversation`, `reservation`, `notification`, `calendar`, `telephony` に分ける。
2. 予約・ログ保存を `localStorage` からSQLite/PostgreSQLへ移す。
3. OpenAIで会話応答、予約情報抽出、営業電話分類を構造化JSONとして返す。
4. Twilio等で電話番号連携し、Webデモと同じ会話状態管理を使う。
5. LINE通知で新規予約・営業電話メモを店舗スタッフに送る。
6. Googleカレンダーに仮予約イベントを作成し、スタッフ確認後に確定する。
7. 店舗設定（営業時間、定休日、席数、駐車場、アクセス、予約ルール）を管理画面で編集可能にする。

### 2026-06-27 Product Prototype Update

今回の更新で、Voice Reception MVPは単発の技術デモから、販売前提の商品プロトタイプに近づきました。

追加・改善した内容:

- 初回挨拶、聞き返し、予約内容確認、「はい」による仮予約完了までの会話状態管理
- 予約情報: 名前、電話番号、日時、人数、要望、予約ステータス（未確認/確認済み）
- 営業電話ログを予約・通常会話と分離
- 管理画面で予約一覧、会話ログ、営業電話ログ、店舗設定を確認・更新
- 店舗設定: 店舗名、業種、営業時間、定休日、住所、駐車場、FAQ、AI受付の口調
- 店舗設定をAI受付のFAQ回答・挨拶・確認文面へ反映

営業デモでの推奨シナリオ:

1. `/admin` で店舗名、営業時間、定休日、住所、駐車場、FAQ、口調を保存する。
2. `/voice-reception` で「明日の19時に4名で予約したいです。田中です。電話番号は090-1234-5678です。要望は窓側です。」と入力する。
3. AI受付が予約内容を確認したら「はい」と入力し、仮予約完了メッセージを確認する。
4. `/admin` で予約一覧に未確認予約が表示されることを確認し、「確認済み」に変更する。
5. 営業電話例として「SEO集客サービスの営業です」と入力し、営業電話ログに分離されることを確認する。
6. FAQ例として「駐車場はありますか」「定休日はいつですか」と入力し、店舗設定に基づく回答を確認する。

本番化時は、現在の `localStorage` 保存・ルールベース会話を、API/DB/AI抽出へ置き換えます。想定境界は以下です。

- `conversation`: 会話状態、聞き返し、確認、完了
- `reservation`: 予約情報、ステータス、スタッフ確認
- `sales_call`: 営業電話の一次受付、折り返し要否
- `store_settings`: 店舗ごとの営業時間、FAQ、口調、住所、駐車場
- `notification`: LINE通知、メール通知
- `calendar`: Googleカレンダー仮予約/確定登録
- `telephony`: Twilio等の電話番号連携

### Restaurant AI Reception MVP — 今日の完成版

この版では、飲食店向けAI電話受付として「今日デモできる」一連の流れを実装済みです。

デモ可能な流れ:

1. `/voice-reception` で「電話着信を開始」を押す。
2. AIが飲食店スタッフとして挨拶し、用件を確認する。
3. 予約の場合は、名前・人数・日付/時間・電話番号・必要なら席種/要望を取得する。
4. 予約内容を復唱し、「はい」で予約受付を完了する。
5. FAQの場合は、営業時間、定休日、駐車場、席数、支払方法、個室、禁煙/喫煙、テイクアウトなどに回答する。
6. 営業電話の場合は、直接取次ぎせず、必要な場合のみ折り返す形で記録する。
7. 3回聞き取れない、スタッフ希望、想定外、怒り、緊急は「人への転送」として記録する。
8. `/admin` で予約、営業電話、転送、会話ログ、店舗設定を確認する。

追加テスト:

```bash
npm run test:voice
```

`test:voice` は、予約成功、FAQ成功、営業電話成功、人への転送成功、空入力/例外処理成功を検証します。

フォルダ構成（Voice Reception関連）:

```text
src/voice-reception.js        # 受付ロジック、会話状態、予約抽出、FAQ、転送、保存
src/app.js                    # 画面レンダリングとUIイベント
src/styles.css                # 受付・管理画面UI
scripts/voice-reception-test.mjs # 予約/FAQ/営業/転送/例外の動作テスト
```
