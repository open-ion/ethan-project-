# Workflow: PR Review
## コード変更レビュー・マージフロー

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

コード変更を main にマージする前に、品質・セキュリティ・設計の一貫性を確認し、Ion が安心してマージを承認できる状態を作る。

---

## Trigger

- 新しい PR が作成された時
- Ethan が PR のレビューを指示した時
- Guard チェックが求められる変更が含まれる時（外部API追加・認証変更・個人情報処理等）

---

## Participants

| AI Employee | Step | Skill Used |
|-------------|------|-----------|
| Forge | 実装確認・技術レビュー | Coding |
| Guard | 品質・セキュリティゲート | — |
| Ethan | 統合レビュー・Ion への報告 | — |
| Ion | 最終マージ承認 | — |

---

## Workflow Steps

### Step 1: 変更内容の把握（Forge）

**担当:** Forge  
**Skill:** Coding  
**入力:** PR の diff・コミット履歴・PR 説明  
**処理:**
1. `git fetch origin pull/<PR_NUMBER>/head:pr-<PR_NUMBER>` で最新取得
2. 変更ファイルのスコープを確認（意図した変更のみか）
3. 実装の正確性を確認（バグ、エッジケース、テスト有無）
4. 既存テストが壊れていないか確認
5. 不要なコード・デバッグ出力が含まれていないか確認

**出力:** 技術レビュー結果（Ethan へ報告）

---

### Step 2: Guard 品質チェック（Guard）

**担当:** Guard  
**トリガー条件（いずれか該当する場合）:**
- 外部 API・メール・LINE 送信などの外部通信を追加
- 認証・認可・セッション処理の変更
- 個人情報・APIキー・シークレットの取り扱い
- 不可逆な操作（削除・課金・外部送信）
- Ethan の任意判断によるエスカレーション

**チェック項目:**
- [ ] APIキー・シークレットがコードにハードコードされていないか
- [ ] XSS・SQLインジェクション・コマンドインジェクションの脆弱性がないか
- [ ] 個人情報がログや公開ファイルに混入していないか
- [ ] 外部通信に適切なエラーハンドリングがあるか
- [ ] `.env.example` が更新されているか

**出力:** Guard Review Result（PASS / CONDITIONAL PASS / NO-GO）  
→ フォーマットは [`docs/rules/quality-gate.md`](../rules/quality-gate.md) §7 に従う

---

### Step 3: Ethan 統合レビュー（Ethan）

**担当:** Ethan  
**入力:** Forge の技術レビュー + Guard レビュー結果  
**処理:**
1. Forge・Guard の結果を統合
2. 設計上の懸念・AGATHON LABS 全体との整合性を確認
3. Ion へのレポートを作成
4. マージ推奨 / 要修正 / Ion 判断必要 のいずれかを判定

**出力:** Ion へのレビューサマリー

---

### Step 4: Ion 承認（Ion）

**担当:** Ion（Final Human Decision Maker）  
**入力:** Ethan のレビューサマリー  
**処理:**
- マージ承認 → Step 5 へ
- 修正指示 → Forge が対応 → Step 1 からやり直し
- 却下 → PR クローズ

---

### Step 5: マージ・同期（Forge + 全 AI）

**担当:** Forge  
**処理:**
1. Ion 承認後にマージ実行
2. main にマージされた後、全 AI が次の作業前に main を sync:
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```

**参照:** [`docs/rules/git-workflow.md`](../rules/git-workflow.md) §5

---

### Step 6: 完了報告（Ethan → Ion）

**担当:** Ethan  
**内容:** マージ完了・次の作業への影響・残タスク

---

## Error Handling

| エラー | 対応 |
|--------|------|
| Guard NO-GO | Forge が修正 → 再レビューループ |
| テスト失敗 | Forge がローカルで再現・修正してから再 PR |
| fetch ブロック | partial review として明記。全体検証完了とは報告しない |

---

## Related Skills

- [`docs/skills/coding.md`](../skills/coding.md) — Forge のレビュー・実装手順

## Related Rules

- [`docs/rules/review-policy.md`](../rules/review-policy.md) — 通常レビューと拡張レビューの基準
- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — Guard チェックリスト
- [`docs/rules/git-workflow.md`](../rules/git-workflow.md) — PR 前後の Git 操作手順
- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — Ion への報告フォーマット
