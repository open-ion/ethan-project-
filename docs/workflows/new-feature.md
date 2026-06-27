# Workflow: New Feature
## 新機能開発フロー

---

## Authority Hierarchy

| 優先順位 | ドキュメント | 役割 |
|----------|-------------|------|
| 1st | `AGATHON_CONSTITUTION.md` | 思想・権限の最高位文書（最優先） |
| 2nd | `AGENTS.md` | 組織・連携・運用ルール |
| 3rd | `docs/rules/` | 具体的な運用ルール |
| 4th | `docs/skills/` | 使用するSkillの定義 |
| 5th | このWorkflowファイル | 実行プロセス定義 |

---

## Purpose

Ion の要望を受け取ってから、計画・実装・テスト・マージ・報告までを一貫したプロセスで実行し、完成した機能を Ion に届ける。

---

## Trigger

- Ion が新機能の実装を要望した時
- Ethan が次フェーズの実装を計画する時
- バックログの優先タスクを開始する時

---

## Participants

| AI Employee | Step | Skill Used |
|-------------|------|-----------|
| Ethan | 要件整理・計画・統合報告 | Planning |
| COO | タスク分解・工程管理支援 | Planning |
| Atlas | 技術調査（必要に応じて） | Research |
| Forge | 実装・テスト | Coding |
| Guard | 品質・セキュリティゲート | — |
| Ion | 要件承認・最終マージ承認 | — |

---

## Workflow Steps

### Step 1: 要件の明確化（Ethan）

**担当:** Ethan  
**Skill:** Planning  
**入力:** Ion の要望（自然言語）  
**処理:**
1. 要件を「完了条件」として1文で再定義する
2. スコープを確定する（何をやる / 何をやらない）
3. 不明点があれば Ion に確認する（1回のやりとりで全部聞く）
4. 既存機能への影響を確認する

**出力:** 確定した要件と完了条件  
**Ion 確認が必要なケース:** スコープが大きい / 既存機能の変更を伴う / 外部サービス連携

---

### Step 2: 計画作成（Ethan + COO）

**担当:** Ethan（最終判断）、COO（タスク分解支援）  
**Skill:** Planning  
**入力:** 確定要件  
**処理:**
1. タスクを実行可能な単位に分解する
2. 依存関係と実行順序を決める
3. 並行実行できるタスクを特定する
4. 各タスクの担当 AI と使用 Skill を割り当てる
5. Guard チェックが必要なタスクを特定する

**出力:** 実行計画（タスクリスト・順序・担当・判断ポイント）  
**注意:** 新しい Role の追加を計画に含めない。Skill / Workflow / Tool で解決する。

---

### Step 3: 技術調査（Atlas、必要な場合のみ）

**担当:** Atlas  
**Skill:** Research  
**トリガー:** 新しいライブラリ・API・技術的アプローチの選定が必要な場合  
**処理:**
1. 候補を調査・比較する
2. AGATHON LABS の現在のスタックとの適合性を評価する
3. リスクと推奨案を Ethan へ報告する

**出力:** 技術調査結果（Ethan が計画に反映）

---

### Step 4: 実装（Forge）

**担当:** Forge  
**Skill:** Coding  
**入力:** 実行計画・技術調査結果  
**処理:**
1. `git fetch origin && git checkout main && git pull origin main` で最新 main を取得
2. `git checkout -b feature/<task-name>` でブランチ作成
3. タスクリストに従い実装する（スコープ外の変更をしない）
4. 既存テストが通ることを確認し、必要に応じてテストを追加する
5. `.env.example` を更新する（新しい環境変数があれば）
6. `npm test` で全テスト通過を確認する

**出力:** 実装済みブランチ・テスト結果  
**参照:** [`docs/rules/git-workflow.md`](../rules/git-workflow.md)

---

### Step 5: 品質チェック（Guard）

**担当:** Guard  
**トリガー:** [`docs/rules/review-policy.md`](../rules/review-policy.md) の拡張レビュートリガー条件に該当する場合  
**処理:** PR Review Workflow の Step 2 と同様  
**出力:** PASS / CONDITIONAL PASS / NO-GO

---

### Step 6: PR 作成・レビュー（Forge + Ethan）

**担当:** Forge（PR 作成）、Ethan（レビューサマリー）  
**処理:**
1. Forge が PR を作成する（作成ファイル・変更内容・テスト結果を明記）
2. PR Review Workflow（[`pr-review.md`](pr-review.md)）の Step 3-4 を実行する
3. Ethan が Ion へレビューサマリーを報告する

---

### Step 7: Ion 承認・マージ（Ion）

**担当:** Ion（Final Human Decision Maker）  
**処理:**
- マージ承認 → Forge がマージ実行 → 全 AI が main を sync
- 修正指示 → Step 4 へ戻る

---

### Step 8: 完了報告（Ethan → Ion）

**担当:** Ethan  
**フォーマット:** [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) の Ethan → Ion フォーマット  
**内容:**
- 実装した機能の概要
- 変更したファイル
- テスト結果
- 次の推奨アクション

---

## Error Handling

| エラー | 対応 |
|--------|------|
| 要件が不明確 | Step 1 で Ion に確認（実装開始しない） |
| 実装中にスコープ外の問題を発見 | Ethan に即報告・指示を待つ |
| テスト失敗 | Forge がローカルで修正 → 再テスト → 再 PR |
| Guard NO-GO | Forge が修正 → 再 Guard チェック |

---

## Related Skills

- [`docs/skills/planning.md`](../skills/planning.md) — 計画作成
- [`docs/skills/research.md`](../skills/research.md) — 技術調査
- [`docs/skills/coding.md`](../skills/coding.md) — 実装・テスト

## Related Rules

- [`docs/rules/git-workflow.md`](../rules/git-workflow.md) — ブランチ戦略・マージ手順
- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — Guard チェック基準
- [`docs/rules/role-creation-policy.md`](../rules/role-creation-policy.md) — Skill/Workflow で解決する
- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — Ion への報告フォーマット
