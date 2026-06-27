# Workflow: Morning News Digest
## 毎朝ニュースダイジェスト自動フロー

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

毎朝自動的にニュースを収集し、AI要約・重要度ランキングを経てIonに配信する。Ionが何もしなくても、朝起きた時点でダイジェストが届いている状態を実現する。

---

## Trigger

- **定時実行**: 毎朝設定時刻（デフォルト: 6:00 JST）に自動起動
- **手動実行**: Ethan または Ion が `npm run fetch:rss && npm run summarize` を実行
- **GitHub Actions**: `.github/workflows/update-news.yml` のスケジュールトリガー

---

## Participants

| AI Employee | Step | Skill Used |
|-------------|------|-----------|
| Nova | ニュース収集・ソース監視 | Research |
| Atlas | 重要度判定・背景コンテキスト付加 | Research |
| Sage | カテゴリ整理・説明の平易化 | Writing |
| Flow | スケジューリング・配信自動化 | — |
| Guard | ソース品質・安全性チェック | — |
| Ethan | 最終統合・Ion への配信 | Writing |

---

## Workflow Steps

### Step 1: ニュース収集（Nova）

**担当:** Nova  
**Skill:** Research  
**入力:** RSS ソースリスト（`scripts/rss-sources.mjs`）、カテゴリフィルター  
**処理:**
1. 設定された RSS フィードを並行取得
2. カテゴリ別にフィルタリング（AI・テクノロジー / 投資・株式市場 / 医療・看護 / ビジネス / 政治・経済 / スポーツ / 物価・生活）
3. 重複排除（URL・タイトル類似度チェック）
4. 取得時刻・ソース名・URL を保持

**出力:** 生の記事リスト（`src/generated/news.json` の入力）  
**失敗時:** エラーをログに記録し Ethan へ報告。前回取得データをフォールバックとして使用。

---

### Step 2: 重要度判定・コンテキスト付加（Atlas）

**担当:** Atlas  
**Skill:** Research  
**入力:** Step 1 の生記事リスト  
**処理:**
1. `importanceScore`（1-100）を算出
   - 災害・安全: 最高優先
   - 国際・日本重要ニュース: 高優先
   - 投資・金融・AI・医療: 中高優先
   - その他: 標準スコア
2. ソース信頼性を評価（reputable / unknown）
3. 単一ソース記事に `confidenceReason` を付加
4. 上位記事にコンテキスト情報を追加

**出力:** スコア付き記事リスト  
**注意:** 医療・金融カテゴリは Guard に Safety チェックを依頼する

---

### Step 3: AI 要約生成（Sage）

**担当:** Sage  
**Skill:** Writing  
**入力:** Step 2 のスコア付き記事リスト  
**処理:**
1. 上位 3-5 件を選定
2. 各記事に対して生成:
   - `summary`: 一言要約（30-50字）
   - `whyImportant`: なぜ重要か（1-2文）
   - `takeaway`: 忙しい人向けの結論（1文）
3. ソースリンクを必ず保持
4. ハルシネーション防止: ソース本文にない情報を加えない

**Safety 制約:**
- 医療・金融情報に確定的なアドバイスを含めない
- 未確認情報は「〜と報告されている」と表現
- `confidence`: HIGH / MEDIUM / LOW + `confidenceReason`

**出力:** 完成したダイジェストデータ（`src/generated/news.json`）

---

### Step 4: 品質チェック（Guard）

**担当:** Guard  
**トリガー:** 医療・金融カテゴリが含まれる場合、または新しいソースが初登場した場合  
**チェック項目:**
- [ ] 個人情報・機密情報が混入していないか
- [ ] 医療・金融カテゴリに不適切なアドバイスがないか
- [ ] ソースリンクが全記事に含まれているか
- [ ] ハルシネーションの疑いがある記述がないか

**出力:** PASS / CONDITIONAL PASS / NO-GO  
**NO-GO の場合:** Sage に修正依頼 → 再チェック

---

### Step 5: 配信（Flow + Ethan）

**担当:** Flow（スケジュール・配信自動化）、Ethan（最終統合・報告）  
**入力:** Guard PASS 済みの `src/generated/news.json`  
**処理:**
1. Flow が GitHub Actions でビルド・デプロイを実行
2. Web アプリに最新ダイジェストを反映
3. Email 配信が設定されている場合: Resend / SMTP 経由で送信
4. LINE 配信が設定されている場合: LINE Messaging API 経由で送信
5. Ethan が配信完了を確認

**出力:** Ion へのダイジェスト到達  
**失敗時:** 配信エラーをログに記録 → Ethan に通知 → Ion への報告に含める

---

### Step 6: 完了報告（Ethan → Ion）

**担当:** Ethan  
**フォーマット:** [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) の Ethan → Ion フォーマット  
**内容:**
- 収集記事数・選定記事数
- 配信ステータス（成功 / 失敗 / 部分成功）
- エラーがあれば原因と対処

---

## Error Handling

| エラー | 対応 |
|--------|------|
| RSS 取得失敗 | リトライ最大3回（指数バックオフ）→ 失敗したら前回データを使用 |
| OpenAI API 失敗 | テンプレートフォールバックで要約を生成 |
| Guard NO-GO | 修正後に再実行。2回 NO-GO で Ion にエスカレーション |
| 配信失敗 | エラーログ記録 → Ethan が Ion に翌朝報告 |

---

## Related Skills

- [`docs/skills/research.md`](../skills/research.md) — Nova・Atlas の情報収集
- [`docs/skills/writing.md`](../skills/writing.md) — Sage の要約生成

## Related Rules

- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — Guard チェック基準
- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — Ethan → Ion 報告フォーマット
- [`docs/rules/git-workflow.md`](../rules/git-workflow.md) — GitHub Actions との連携
