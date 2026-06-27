# Tool: RSS Feeds
## ニュース記事収集

---

## Status: 実装済み

実装ファイル: `scripts/fetch-rss.mjs`, `scripts/rss-sources.mjs`  
出力先: `src/generated/news.json`

---

## Purpose

設定された RSS フィードからニュース記事を収集し、カテゴリ別に整理して JSON ファイルに保存する。OpenAI 要約の入力データとなる。

---

## Configuration

| 環境変数 | 必須 | デフォルト | 説明 |
|---------|------|---------|------|
| なし（コード設定） | — | — | ソースは `scripts/rss-sources.mjs` に定義 |

ソースリストの管理: [`docs/rag/news-sources.md`](../rag/news-sources.md)

---

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| RSS URL リスト | `scripts/rss-sources.mjs` | カテゴリ別フィード URL |
| カテゴリフィルター | 設定ファイル | 収集対象カテゴリ |

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| `src/generated/news.json` | JSON array | タイトル・URL・ソース名・カテゴリ・取得時刻を含む記事リスト |

各記事のフィールド:
```json
{
  "title": "記事タイトル",
  "url": "https://...",
  "source": "メディア名",
  "category": "AI・テクノロジー",
  "description": "RSS 概要テキスト",
  "publishedAt": "2026-06-27T06:00:00Z",
  "fetchedAt": "2026-06-27T06:05:00Z"
}
```

---

## Error Handling

| エラー | 対応 |
|--------|------|
| フィード取得失敗 | リトライ最大3回（指数バックオフ）→ そのフィードをスキップ |
| パースエラー | エラーログに記録してスキップ |
| 全フィード失敗 | 前回の `news.json` を保持（上書きしない）→ Ethan へ通知 |
| ネットワーク制限（CI環境等） | GitHub Actions 上での実行に切り替える |

---

## Usage

```bash
npm run fetch:rss
```

ローカル実行はネットワーク・プロキシ設定に依存する。GitHub Actions での定時実行を推奨。

---

## Related

- `scripts/fetch-rss.mjs` — 実装
- `scripts/rss-sources.mjs` — ソースリスト
- [`docs/rag/news-sources.md`](../rag/news-sources.md) — ソース品質基準・Tier 分類
- [`docs/workflows/morning-digest.md`](../workflows/morning-digest.md) — このツールを使うWorkflow
- `.github/workflows/update-news.yml` — 定時実行設定
