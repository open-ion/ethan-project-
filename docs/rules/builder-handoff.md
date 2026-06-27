# Rule: builder-handoff
## Temporary Builder ハンドオフ / Source of Truth Documentation

---

## Authority Hierarchy（全 Rule に共通）

| 優先順位 | ドキュメント | 役割 |
|----------|-------------|------|
| 1st | `AGATHON_CONSTITUTION.md` | 思想・権限の最高位文書（最優先） |
| 2nd | `AGENTS.md` | 組織・連携・運用ルール |
| 3rd | `docs/rules/` このファイル | 具体的な運用ルール |

> **共通原則**
> - AGATHON_CONSTITUTION.md を最優先とする
> - AGENTS.md は運用ルール
> - Rules は全 AI 共通（例外なし）
> - Ethan（CIO）が唯一の AGATHON AI Command Center
> - Ion は Final Human Decision Maker
> - Only Ethan reports to Ion

---

## Purpose

Claude Code が使用制限などで一時的に利用できない場合、Codex または他の AI が Temporary Builder として実装を担当する。

Temporary Builder 環境では GitHub との同期（fetch / pull / clone）が失敗するケースがあり、「どこに最新の成果物があるのか」が不明になるリスクがある。

このルールは、Temporary Builder が作業完了後に **必ず成果物の保存場所（Source of Truth）を明記する** ことを義務化し、Claude Code またはEthan が次に作業を再開する際に状態を確実に引き継げることを保証する。

---

## When

- Codex または他の AI が Temporary Builder として実装作業を行った後
- GitHub 同期（fetch / pull / push）が不確実または未確認のまま作業が進んだ後
- Claude Code から Temporary Builder へ、または Temporary Builder から Claude Code へ引き継ぐ前

---

## Policy

### 1. Temporary Builder の定義

Temporary Builder とは、Claude Code が利用できない期間に一時的に実装作業を担当する AI（主に Codex）を指す。

Temporary Builder は Lead Developer（Claude Code）を代替するが、権限・責任は一時的なものであり、Claude Code が戻り次第、Lead Developer の立場は Claude Code に戻る。

### 2. ハンドオフ報告の必須項目

Temporary Builder が作業を完了した場合、または作業を中断した場合、**以下の全項目を必ず報告する**：

| 項目 | 必須 | 内容 |
|------|------|------|
| Repository | Yes | 作業を行ったリポジトリ名・URL |
| Branch | Yes | 作業ブランチ名 |
| 保存場所（Folder / File） | Yes | 主な変更・追加ファイルのパス一覧 |
| GitHub 同期済みか | Yes | `Verified` / `Not verified` のいずれかを明記 |
| Commit Hash | Yes（存在する場合） | 最後のコミットのハッシュ（short SHA可） |
| Claude Code が次に見るべき場所 | Yes | 作業再開時の起点（ブランチ・ファイル・コマンドなど） |

### 3. GitHub 同期が確認できていない場合の必須表記

GitHub への push / fetch / pull が確認できていない場合、ハンドオフ報告に以下を **そのまま** 含める：

```
GitHub synchronization not verified.
Current implementation is stored here: [Branch / File / Path]
```

この表記を省略してはならない。「たぶん同期されている」という推測で `Verified` と報告することも禁止する。

### 4. partial handoff（部分引き継ぎ）

作業が完了していない状態で引き継ぐ場合、ハンドオフ報告に以下を追加する：

- 完了した作業
- 未完了の作業（具体的に）
- 次の担当者が最初に行うべきアクション

### 5. Claude Code 復帰時の手順

Claude Code が Temporary Builder から作業を引き継ぐ際は、必ず以下を実行する：

```bash
git fetch origin
git checkout main
git pull origin main
```

ハンドオフ報告の `GitHub 同期済みか` が `Not verified` の場合は、Ethan に状態を報告してから作業を開始する。推測で「同期済みだろう」と判断してはならない。

### 6. Ethan への報告

Temporary Builder のハンドオフ報告は Ethan へ提出する。Ethan は以下を判断する：

- ハンドオフ報告が完全か
- GitHub 同期が未確認の場合、Claude Code 再開前に何をすべきか
- Ion への報告が必要な重大リスクがないか

---

## Handoff Report Format

Temporary Builder が作業完了または中断時に提出するフォーマット：

```markdown
## Temporary Builder Handoff Report

**Builder:** [Codex / その他]
**Date:** YYYY-MM-DD
**Task:** [作業の概要]

### Source of Truth

| Item | Value |
| --- | --- |
| Repository | [repo name or URL] |
| Branch | [branch name] |
| Folder / File | [主な変更ファイルのパス一覧] |
| GitHub Sync | Verified / Not verified |
| Commit Hash | [short SHA or "no commit"] |
| Next entry point for Claude Code | [branch / file / command] |

### GitHub Sync Status

<!-- 同期できている場合 -->
GitHub push confirmed. Branch is up to date with remote.

<!-- 同期できていない場合（必須表記） -->
GitHub synchronization not verified.
Current implementation is stored here: [Branch / File / Path]

### Completed Work
- ...

### Incomplete Work
- ...

### Risks / Notes
🔴 / 🟡 / 🟢 [リスクがあれば記載]

### Recommended First Action for Claude Code
[次の担当者が最初に行うべきアクション]
```

---

## Exceptions

| 状況 | 例外内容 | 条件 |
|------|----------|------|
| 完全なGitHub同期が確認済み | 保存場所の詳細記載を簡略化可 | push確認・Commit Hash明記が必須 |
| 自動化タスクのみ（コードなし） | 保存場所の記載を省略可 | 成果物がドキュメントやJSONのみで、リポジトリへのpushが確認済みの場合 |

---

## Examples

**同期済みのケース（正常）：**
```
## Temporary Builder Handoff Report
Builder: Codex
Date: 2026-01-15
Task: Implement retry logic in fetch-rss.mjs

| Repository | open-ion/ethan-project- |
| Branch     | feature/retry-logic     |
| Files      | scripts/fetch-rss.mjs   |
| GitHub Sync | Verified               |
| Commit Hash | a3f9c12                |
| Next entry | git checkout feature/retry-logic |

GitHub push confirmed. Branch is up to date with remote.
Completed: retry logic (3 attempts, exponential backoff)
Incomplete: none
```

**同期未確認のケース（必須表記あり）：**
```
## Temporary Builder Handoff Report
Builder: Codex
Date: 2026-01-15
Task: Draft summarize-news.mjs refactor

| Repository | open-ion/ethan-project-     |
| Branch     | feature/summarize-refactor  |
| Files      | scripts/summarize-news.mjs  |
| GitHub Sync | Not verified               |
| Commit Hash | b7d2e45                    |
| Next entry | Verify push before merging  |

GitHub synchronization not verified.
Current implementation is stored here: feature/summarize-refactor / scripts/summarize-news.mjs

🟡 Claude Codeは作業開始前にgit fetchで同期状態を確認してください。
Recommended: git fetch origin && git log origin/feature/summarize-refactor
```

**違反ケース（禁止）：**
```
Codex: 「実装が完了しました。」
→ builder-handoff 違反。Source of Truth と GitHub 同期状態の明記なし。
   Claude Code は「どこにある実装か」を知ることができない。
```

---

## Related Rules

- [`git-workflow.md`](git-workflow.md) — GitHub main を唯一の正本とする Git 作業フロー（本ルールはその補完）
- [`reporting-policy.md`](reporting-policy.md) — Temporary Builder → Ethan への報告フォーマット
- [`command-chain.md`](command-chain.md) — Temporary Builder の指揮命令系統上の位置付け
- [`AGENTS.md`](../../AGENTS.md) §11 — Lead Developer 運用ルールと Codex Fallback 定義
