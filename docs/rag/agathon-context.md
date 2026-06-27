# RAG: AGATHON Context
## AGATHON LABS のプロジェクト文脈・状況・決定履歴

---

## Metadata

| Item | Value |
|------|-------|
| 管理担当 | Echo + Ethan |
| 最終更新 | 2026-06-27 |
| 更新ルール | 重要な決定・フェーズ移行・アーキテクチャ変更後に Echo が更新。Ethan の確認後に反映。 |

---

## AGATHON LABS とは

AGATHON LABS は Ion が設立した AI company OS。「人のため、社会のために」を使命とし、AI を使って Ion の可能性を広げることを目的とする。

**コアプロダクト:** ETHAN — Ion 専用 AI 朝ダッシュボード。5分で今日の意思決定を終わらせる。

---

## 現在の開発フェーズ

| フェーズ | 状態 | 概要 |
|---------|------|------|
| Step 1/2: Foundation | ✅ 完了 | AGATHON_CONSTITUTION.md・AI ペルソナファイル・AGENTS.md 作成 |
| Step 3: Rules | ✅ 完了 | docs/rules/ — 8 Rules 作成（command-chain / reporting-policy / ion-facing-interface / role-creation-policy / review-policy / quality-gate / git-workflow / builder-handoff） |
| Step 4: Skills | ✅ 完了 | docs/skills/ — 7 Skills 作成（research / writing / coding / presentation / sales / planning / meeting） |
| Step A: Workflows | 🔄 進行中 | docs/workflows/ — 3 Workflows 作成（morning-digest / pr-review / new-feature） |
| Step B: RAG | 🔄 進行中（このファイル） | docs/rag/ — Knowledge Base 作成 |
| Step C: Tools | 🔄 進行中 | docs/tools/ — Tools / Integrations 定義 |

---

## ガバナンス階層

```
AGATHON_CONSTITUTION.md   ← 思想・権限の最高位（最優先）
  └── AGENTS.md           ← 組織・連携・運用ルール
        └── docs/rules/   ← 具体的な運用ルール（8 Rules）
              └── docs/skills/      ← 7 Skills
              └── docs/workflows/   ← 3 Workflows
              └── docs/rag/         ← Knowledge Base（このディレクトリ）
              └── docs/tools/       ← Tools / Integrations（進行中）
```

---

## AI 社員構成

| AI | 役割 | ペルソナファイル |
|----|------|----------------|
| Ethan | CIO / AGATHON AI Command Center | `ETHAN.md` |
| CEO | Executive Strategy Support AI | `CEO.md` |
| COO | Executive Operations Support AI | `COO.md` |
| Nova | News Intelligence | `NOVA.md` |
| Atlas | Research Intelligence | `ATLAS.md` |
| Sage | Knowledge Structuring | `SAGE.md` |
| Echo | Memory and Context | `ECHO.md` |
| Forge | Engineering | `FORGE.md` |
| Vision | Design | `VISION.md` |
| Flow | Automation | `FLOW.md` |
| Guard | Quality / Risk Gate | `GUARD.md` |
| Pulse | Scheduling | `PULSE.md` |

---

## 技術スタック（現在）

| 領域 | 状態 |
|------|------|
| App framework | 軽量 static app + Node.js dev server |
| Language | JavaScript (Node.js >= 20) |
| UI | Plain HTML / CSS / JavaScript |
| AI 連携 | OpenAI API（要約）+ テンプレートフォールバック |
| ニュース収集 | RSS fetch（scripts/fetch-rss.mjs）|
| 自動化 | GitHub Actions（.github/workflows/update-news.yml）|
| DB | 未実装（localStorage のみ）|
| Email 配信 | 未実装 |
| LINE 配信 | 未実装 |

**将来スタック候補（未確定）:** Next.js + TypeScript / PostgreSQL / Resend

---

## 主要な技術的決定

| 日付 | 決定 | 理由 |
|------|------|------|
| 2026-06-27 | Ethan = CIO（CEO ではない） | CEO は別の Executive Support AI として分離 |
| 2026-06-27 | Guard = Quality Gate（管理者ではない） | Stop ではなく Enable のために機能する |
| 2026-06-27 | 能力拡張は Rules → Skills → Workflows → RAG → Tools の順序 | Role 追加を最後の手段にする |
| 2026-06-27 | builder-handoff Rule 追加 | Codex 環境での GitHub 同期不確定問題に対応 |

---

## 重要なリポジトリパス

| パス | 内容 |
|------|------|
| `AGATHON_CONSTITUTION.md` | 最高位ガバナンス文書 |
| `AGENTS.md` | 運用ルール |
| `docs/rules/` | 8 Rules |
| `docs/skills/` | 7 Skills |
| `docs/workflows/` | 3 Workflows |
| `docs/rag/` | Knowledge Base（このディレクトリ）|
| `src/orchestrator/` | Orchestration OS |
| `scripts/` | RSS 取得・AI 要約・ビルドスクリプト |
| `src/generated/news.json` | 毎朝生成されるダイジェストデータ |

---

## 更新ログ

| 日付 | 更新内容 | 更新者 |
|------|---------|--------|
| 2026-06-27 | 初版作成（Step B RAG Foundation） | Echo（Claude Code 実装） |
