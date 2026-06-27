# AGATHON LABS — Rules

Rules は AGATHON LABS の全 AI が必ず守る最高位の運用ルールである。  
思想・権限は `AGATHON_CONSTITUTION.md`（最優先）、組織・連携は `AGENTS.md` に従う。

---

## Authority Hierarchy

```
AGATHON_CONSTITUTION.md   ← 思想・権限の最高位（最優先）
  └── AGENTS.md           ← 組織・連携・運用ルール
        └── docs/rules/   ← 具体的な運用ルール（このディレクトリ）
              └── docs/skills/ / docs/workflows/ / docs/rag/ / docs/tools/
```

---

## 共通原則（全 Rule に適用）

- AGATHON_CONSTITUTION.md を最優先とする（思想・権限・指揮命令系統の正本）
- AGENTS.md は AI が実際に作業するための運用ルール
- Rules は全 AI 共通（例外なし）
- Ethan（CIO）が唯一の AGATHON AI Command Center かつ Ion への唯一の対話窓口
- CEO・COO は Ethan を支援する Executive AI であり、Ethan の上位ではない
- Guard は Quality / Risk Gate として Ethan を支援する
- Ion は Final Human Decision Maker
- Only Ethan reports to Ion

---

## Rules 一覧

| ファイル | タイトル | 概要 |
|----------|---------|------|
| [`command-chain.md`](command-chain.md) | 指揮命令系統 | Ion ⇄ Ethan ↔ AI の命令・報告の流れ |
| [`reporting-policy.md`](reporting-policy.md) | 報告ルール | 誰に・何を・どのフォーマットで報告するか |
| [`ion-facing-interface.md`](ion-facing-interface.md) | Ion インターフェース | Ion との対話は Ethan のみが担う |
| [`role-creation-policy.md`](role-creation-policy.md) | 役職追加ルール | 役職追加禁止の原則と例外条件 |
| [`review-policy.md`](review-policy.md) | レビュー方針 | 通常レビューと拡張レビューの使い分け |
| [`quality-gate.md`](quality-gate.md) | 品質保証 | Guard の Quality Gate / Risk Gate 定義 |
| [`git-workflow.md`](git-workflow.md) | Git 運用ルール | GitHub main を唯一の正本とする Git 作業フロー |

---

## Rules 間の依存関係

```
command-chain.md           ← 最上位。全 Rule の前提となるチェーン定義
  ├── reporting-policy.md  ← チェーンをどう実行するか（報告の詳細）
  ├── ion-facing-interface.md ← チェーンの「Ion 側」の入出力を定義
  ├── review-policy.md     ← チェーンのどこでレビューを挟むか
  │     └── quality-gate.md  ← Guard が行うレビューの内容
  ├── role-creation-policy.md ← チェーンに新しいノードを追加する条件
  └── git-workflow.md      ← 作業開始・PR レビュー・Step 間移行の Git 運用
```

### 依存の方向

| Rule | 依存先 |
|------|--------|
| `reporting-policy` | `command-chain`, `ion-facing-interface` |
| `ion-facing-interface` | `command-chain`, `reporting-policy` |
| `review-policy` | `command-chain`, `quality-gate`, `reporting-policy` |
| `quality-gate` | `review-policy`, `command-chain`, `reporting-policy` |
| `role-creation-policy` | `command-chain`, `review-policy`, `quality-gate` |

---

## 能力拡張の優先順位

AGATHON LABS は役職（AI）を増やすのではなく、以下の順序で能力を拡張する：

```
1. Rules      ← このディレクトリ（完成）
2. Skills     ← docs/skills/（未作成）
3. Workflows  ← docs/workflows/（未作成）
4. RAG        ← docs/rag/（未作成）
5. Tools      ← docs/tools/（未作成）
─────────────────────────────────────
6. 役職追加   ← role-creation-policy.md の全条件を満たす場合のみ
```

---

## 将来追加が推奨される Rules

| 候補ファイル | 内容 |
|-------------|------|
| `escalation-policy.md` | エスカレーション基準の詳細定義 |
| `data-policy.md` | データ取り扱い・保存・削除ルール |
| `communication-protocol.md` | AI 社員間の連携プロトコル詳細 |
| `skill-creation-policy.md` | Skills 追加・廃止ルール |
| `workflow-governance.md` | Workflows 設計・変更・廃止ルール |
| `rag-management-policy.md` | RAG 知識ベースの追加・更新・廃止ルール |
| `tool-usage-policy.md` | Tools の使用条件・承認フロー |
| `incident-response.md` | 障害・インシデント対応フロー |
| `change-management.md` | AGENTS.md・ペルソナファイルの変更管理 |

---

## 読む順番

新しい AI（Claude Code / Codex / その他）がこのディレクトリを読む場合：

1. `AGATHON_CONSTITUTION.md`（最優先）
2. `AGENTS.md`（組織・運用）
3. `command-chain.md`（全体の前提）
4. 担当タスクに関連する Rule を読む
