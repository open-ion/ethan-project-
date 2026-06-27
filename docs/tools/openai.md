# Tool: OpenAI API
## AI 要約・自然言語生成

---

## Status: 実装済み

実装ファイル: `scripts/summarize-news.mjs`  
環境変数: `OPENAI_API_KEY`, `AI_MODEL`, `AI_SUMMARY_LIMIT`

---

## Purpose

ニュース記事のタイトル・本文から、Ion 向けの要約（`summary` / `whyImportant` / `takeaway`）を生成する。API キーが設定されていない場合はテンプレートフォールバックを使用する。

---

## Configuration

| 環境変数 | 必須 | デフォルト | 説明 |
|---------|------|---------|------|
| `OPENAI_API_KEY` | No | — | 未設定の場合はテンプレートフォールバック |
| `AI_MODEL` | No | `gpt-4o-mini` | 使用するモデル |
| `AI_SUMMARY_LIMIT` | No | `5` | 1回の実行で要約する最大記事数 |

---

## Inputs

| Input | Type | Description |
|-------|------|-------------|
| Article title | string | RSS から取得した記事タイトル |
| Article description | string | RSS の概要テキスト |
| Category | string | ニュースカテゴリ |

---

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `summary` | string | 一言要約（30-50字） |
| `whyImportant` | string | なぜ重要か（1-2文） |
| `takeaway` | string | 忙しい人向けの結論（1文） |
| `confidence` | string | `HIGH` / `MEDIUM` / `LOW` |
| `confidenceReason` | string | 信頼度の理由（LOW の場合必須） |
| `importanceScore` | number | 重要度スコア（1-100） |

---

## Safety Constraints（プロンプトに必ず含める）

- ソース本文にない情報を追加しない（ハルシネーション禁止）
- 医療・金融カテゴリでは確定的なアドバイスを含めない
- 未確認情報は「〜と報告されている」と表現する
- 原文リンクを必ず保持する

---

## Error Handling

| エラー | 対応 |
|--------|------|
| API キー未設定 | テンプレートフォールバックで要約を生成（エラーなし） |
| API レートリミット | 指数バックオフでリトライ（最大3回） |
| API タイムアウト | タイムアウト後にテンプレートフォールバック |
| モデルエラー | エラーログ記録 → Ethan へ報告 |

---

## Related

- `scripts/summarize-news.mjs` — 実装
- `.env.example` — 環境変数ドキュメント
- [`docs/rag/news-sources.md`](../rag/news-sources.md) — Safety ルール
- [`docs/workflows/morning-digest.md`](../workflows/morning-digest.md) — このツールを使うWorkflow
