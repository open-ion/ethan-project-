# Rule: git-workflow
## Git 運用ルール / Git Workflow

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

Claude Code / Codex / その他 AI の間で Git の作業状態がズレることを防ぐ。  
GitHub main を唯一の正本として扱い、全 AI が同じ状態から作業を開始することを保証する。

---

## When

- 新しい Step・タスクを開始する前
- PR をレビューする前
- ブランチを作成・マージする前
- 前の Step が完了して次の Step へ進む前

---

## Policy

### 1. GitHub main は唯一の正本

```
GitHub main = Single Source of Truth for all repository state
```

- ローカルの状態・別ブランチの状態・古いチェックアウトは正本ではない。
- 作業開始前・レビュー前は必ず main を最新状態に同期する。

### 2. 作業開始前の必須手順

新しいタスクを始める前に必ず以下を実行する：

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b feature/<task-name>
```

- `git fetch origin` を省略しない。
- 古いローカルブランチから直接 checkout しない。
- 推測で「最新だろう」と判断しない。必ず `pull` で確認する。

### 3. PR レビュー前の必須手順

PR の内容をローカルでレビューする場合：

```bash
git fetch origin pull/<PR_NUMBER>/head:pr-<PR_NUMBER>
git checkout pr-<PR_NUMBER>
```

- stale なローカルワークスペースから PR をレビューしない。
- fetch がブロックされている場合、レビューを「partial review（部分確認）」と明示し、全体検証が完了したと主張しない。

### 4. ブランチ運用ルール

| ブランチ戦略 | ルール |
|-------------|--------|
| feature ブランチ | `feature/<task-name>` の形式で main から切る |
| ブランチ間 PR | 一時的な統合目的のみ許可 |
| 最終 PR | 必ず `main` をターゲットにする |

- ブランチ間 PR（例：feature → integration → main）は一時統合にのみ使う。
- 最終的な成果物は必ず main へマージする。

### 5. マージ後の必須手順

PR が main へマージされた後、全 AI が次の作業を始める前に必ず main を sync する：

```bash
git fetch origin
git checkout main
git pull origin main
```

- マージ前の作業ブランチを使い続けてはならない。
- 前の Step のブランチから次の Step を始めてはならない。

### 6. Step 間の作業開始条件

```
前の Step の PR が main へマージ済み
  ↓
全 AI が main を sync する
  ↓
次の Step の作業開始
```

- **PR #14 が main へマージされるまで Step 4 の作業は開始しない。**
- この条件を Ethan が確認し、全 AI に開始の承認を出す。

### 7. fetch がブロックされている場合

ネットワーク制限・CI 環境・プロキシ等で `git fetch` がブロックされる場合：

1. レビューを「partial review」と明記する。
2. fetch できていない範囲を明示する。
3. 全体検証が完了したと Ethan・Ion に報告しない。
4. Ethan は partial review として記録し、Ion への報告に含める。

---

## Exceptions

| 状況 | 例外内容 | 条件 |
|------|----------|------|
| ホットフィックス | main から直接修正ブランチを切る | Ethan の承認が必要 |
| 緊急対応 | 一時的に古いブランチから作業する | 作業完了後に必ず main を rebase または再取得する |

---

## Examples

**正常ケース（Step 開始）：**
```
Ethan: 「PR #14 が main にマージされた。Step 4 開始」
Claude Code:
  git fetch origin
  git checkout main
  git pull origin main
  git checkout -b feature/step4-skills-foundation
→ main の最新状態から Step 4 を開始
```

**違反ケース（禁止）：**
```
Claude Code: 「Step 3 のブランチから直接 Step 4 を開始した」
→ git-workflow 違反。必ず main を sync してから新しいブランチを切る。
```

**partial review ケース：**
```
Codex: 「fetch がブロックされているため、PR #14 のローカル確認は partial review です。
        ファイル内容は GitHub 上で確認済み。ローカル実行確認は未実施。」
→ Ethan はこれを partial review として記録し、Ion への報告に含める。
```

---

## Related Rules

- [`command-chain.md`](command-chain.md) — 指揮命令系統（Ethan が Step 開始の承認を出す）
- [`reporting-policy.md`](reporting-policy.md) — partial review の報告フォーマット
- [`review-policy.md`](review-policy.md) — PR レビューのポリシー
- [`AGENTS.md`](../../AGENTS.md) §11 — 開発運用ルール（GitHub を唯一の正本とする）
