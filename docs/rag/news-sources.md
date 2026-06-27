# RAG: News Sources
## 信頼できるニュースソース・RSS フィード・品質基準

---

## Metadata

| Item | Value |
|------|-------|
| 管理担当 | Nova + Guard |
| 最終更新 | 2026-06-27 |
| 更新ルール | 新ソース追加・信頼性評価変更・フィード URL 変更時に Nova が更新。Guard が品質確認。Ethan が承認。 |

---

## ソース品質基準

Guard と Nova が共同で定義したソース評価基準:

| 基準 | 定義 |
|------|------|
| Tier 1（高信頼） | 大手メディア・政府機関・学術機関の公式フィード。ファクトチェック体制あり。 |
| Tier 2（中信頼） | 専門メディア・業界誌。一定の編集基準あり。 |
| Tier 3（要注意） | 個人ブログ・SNS・単一ソース。使用する場合は必ず `confidence: LOW` + `confidenceReason` を明記。 |
| 除外 | 虚偽情報の発信歴があるソース・PR 記事のみのメディア |

---

## 現在設定済みの RSS ソース

参照: `scripts/rss-sources.mjs`

### AI・テクノロジー

| ソース | URL | Tier |
|--------|-----|------|
| TechCrunch | https://techcrunch.com/feed/ | Tier 1 |
| The Verge | https://www.theverge.com/rss/index.xml | Tier 1 |
| Wired | https://www.wired.com/feed/rss | Tier 1 |
| NHK テクノロジー | https://www3.nhk.or.jp/rss/news/cat5.xml | Tier 1 |

### 投資・株式市場

| ソース | URL | Tier |
|--------|-----|------|
| Reuters Business | https://feeds.reuters.com/reuters/businessNews | Tier 1 |
| Bloomberg（RSS未提供の場合は代替） | — | Tier 1 |
| 日経電子版 | — （要購読 / API 検討） | Tier 1 |

### 医療・看護

| ソース | URL | Tier |
|--------|-----|------|
| NHK 健康 | https://www3.nhk.or.jp/rss/news/cat4.xml | Tier 1 |
| MedicalXpress | https://medicalxpress.com/rss-feed/ | Tier 2 |

### ビジネス・スタートアップ

| ソース | URL | Tier |
|--------|-----|------|
| TechCrunch Startups | https://techcrunch.com/category/startups/feed/ | Tier 1 |
| Nikkei（一般ニュース） | — | Tier 1 |

### 政治・経済

| ソース | URL | Tier |
|--------|-----|------|
| NHK 政治 | https://www3.nhk.or.jp/rss/news/cat4.xml | Tier 1 |
| Reuters World | https://feeds.reuters.com/reuters/worldNews | Tier 1 |

---

## Safety ルール（Guard 定義）

1. **医療情報**: 確定的な診断・治療推奨を要約に含めない。「〜と報告されている」「専門家に相談を」を明記する。
2. **金融情報**: 特定銘柄の買い推奨・投資アドバイスとして要約しない。情報提供にとどめる。
3. **単一ソース記事**: `confidence: LOW` + `confidenceReason: "単一ソース"` を必ず付加する。
4. **速報・未確認情報**: `confidence: LOW` + `confidenceReason: "速報・未確認"` を付加する。
5. **PR・プロモーション記事**: 要約対象から除外する。疑わしい場合は `confidence: LOW` とする。

---

## ソース追加プロセス

新しいニュースソースを追加する場合:

1. Nova がソースの Tier 評価と URL を提案する。
2. Guard がソース信頼性を確認する（ファクトチェック体制・過去の問題履歴）。
3. Ethan が承認する。
4. Nova が `scripts/rss-sources.mjs` を更新し、このファイル（`news-sources.md`）も更新する。
5. テスト実行で新ソースが正常に取得できることを確認する。

---

## 除外・要注意リスト

| ソース / 種類 | 理由 |
|--------------|------|
| 匿名ブログ | 責任主体不明 |
| SNS 投稿（Twitter/X 等） | ファクトチェックなし |
| プレスリリースのみのメディア | 一次情報性なし |

---

## 更新ログ

| 日付 | 更新内容 | 更新者 |
|------|---------|--------|
| 2026-06-27 | 初版作成（基本ソースリストと Safety ルール） | Nova + Guard（Claude Code 実装） |
