# 実装計画 — News Brief ダッシュボード MVP（AGATHON LABS）

> 作成: Ethan ／ 宛先: Ion
> 関連: [`requirements.md`](./requirements.md)

## 1. 全体方針

「まず小さく動くアプリ画面」を最優先。MVP v0 は**静的ダッシュボードアプリ＋サンプルデータ**で
画面表示まで完成させる。実ニュースの取得・AI要約は v0.1（次段階）で `data.json` を自動生成して
差し替える。アプリ側は最初から `data.json` を読む設計なので、後段の差し替えで画面コードは無改修。

```
[v0 今回]   apps/dashboard/（静的UI） ── fetch ──▶ data.json（サンプル）
[v0.1 次]  RSS取得 → Claude要約 → data.json 生成（上書き） → 既存UIがそのまま表示
[v0.2 後]  GitHub Actions で毎朝自動生成 → gh-pages 公開（Ion はアプリを開くだけ）
```

## 2. 技術スタック（提案と理由）

### フロントエンド：依存ゼロのバニラ HTML / CSS / JS
- **理由**：本リポジトリの規約が「`apps/<名前>/` に静的アプリ原本 → `gh-pages` ミラー公開」。
  React 等はビルド工程・依存・学習コストが増え MVP の「すぐ開けて動く」に反する。
  既存の `apps/moneyclip` `apps/news` も同方式で、一貫性が保てる。
- データは `data.json` を `fetch` して描画。スマホ最優先・明るいテーマ。

### ニュース取得：**RSS を採用**（NewsAPI ではなく）
| | RSS | NewsAPI |
|---|---|---|
| コスト | 無料・無制限 | 無料枠は開発限定（100req/日・24h遅延・商用不可） |
| 鍵 | 不要 | APIキー必須 |
| 実装 | すぐ・安定 | 鍵管理・制限対応が必要 |
| カテゴリ | Google News RSS の検索クエリで自在 | カテゴリ/キーワード可だが制限内 |

- **結論：RSS。** 単一ユーザーMVPで「まず確実に動く」ことを優先。鍵不要・無制限・即実装。
- **Google News RSS（検索クエリ）** を採用：`https://news.google.com/rss/search?q=<クエリ>&hl=ja&gl=JP&ceid=JP:ja`
  カテゴリごとに日本語クエリを当て、ランキング済み・重複排除済みの記事を取得。`<link>` に
  元記事（媒体）への遷移URLが入るため**元記事URLを保持**できる。
- カテゴリ→クエリ（v0.1で使用）：
  - AI・テクノロジー：`AI OR 生成AI OR 半導体 OR テクノロジー`
  - 投資・株式市場：`株式市場 OR 日経平均 OR 投資 OR 為替`
  - 医療・看護：`医療 OR 看護 OR ヘルスケア OR 病院`
  - ビジネス・スタートアップ：`スタートアップ OR 資金調達 OR 起業 OR 新規事業`
- 取得・パースは既存 `newsdigest/sources.py`（標準ライブラリのみの RSS パーサ）を再利用。

### AI要約：Anthropic Claude
- `anthropic` SDK（既存 `requirements.txt` に既載）。**構造化出力**で以下を必ず返す：
  見出し / 一言要約 / なぜ重要か / 忙しい人向け結論 / 元記事URL / 出典 / カテゴリ。
- 既定モデルは `claude-opus-4-8`（単一ユーザー・日次・低ボリュームなので品質優先）。
  コストを抑えるなら `claude-sonnet-4-6` / `claude-haiku-4-5` に変更可（env）。
- 鍵が無い・失敗時は、取得した記事の見出し＋概要にフォールバック（画面は必ず出す）。

### データ生成（v0.1）：Python パイプライン
```
newsbrief/
  categories.py   4固定カテゴリ＋Google Newsクエリ
  fetch.py        newsdigest.sources を使い各カテゴリの候補記事を取得
  summarize.py    Claude構造化要約 → 1記事=指定5項目
  build.py        全体の重要トップ3-5本＋カテゴリ別を組み立て data.json を出力
run_dashboard.py  CLI：取得→要約→ apps/dashboard/data.json 上書き
```
出力先は `apps/dashboard/data.json`（アプリが読む場所）。

### 公開（v0.2）：GitHub Actions → gh-pages
- 既存 `news-schedule.yml`（デフォルトブランチ設置・main をcheckout）と同方式で、毎朝
  `run_dashboard.py` を実行 → `apps/` を `gh-pages` にミラー。Ion はアプリを開くだけ。

## 3. ファイル構成（今回 v0 で作るもの）

```
apps/dashboard/
  index.html        ダッシュボード画面
  styles.css        スタイル（明るい・スマホ最優先）
  app.js            data.json を読み描画（トップ重要＋カテゴリ別）
  data.json         サンプルニュースデータ（v0.1 で自動生成に差し替え）
  manifest.webmanifest（任意・ホーム追加用。アイコンは次段階で付与可）
apps/index.html      ランチャーに News Brief ダッシュボードのリンクを1行追加（バックアップ済み）
docs/product/requirements.md / implementation-plan.md（本書）
```

## 4. 実行方法

```bash
# ローカル（fetch を使うので簡易HTTPサーバ経由で開く）
cd apps/dashboard && python3 -m http.server 8000
#   → ブラウザで http://localhost:8000/

# 本番（v0.2 で自動化）：gh-pages 公開 → https://open-ion.github.io/ethan-project-/dashboard/
```
> `file://` 直開きは fetch 制限で `data.json` を読めない。HTTPサーバ経由か Pages で開く。

## 5. ロードマップ
- **v0（今回）**：静的ダッシュボード＋サンプルデータで画面表示。
- **v0.1**：`newsbrief/` パイプラインで RSS取得→Claude要約→`data.json` 自動生成。
- **v0.2**：GitHub Actions で毎朝自動生成＋公開（Pages）。PWA化（manifest＋アイコン）でホーム追加。
- **将来**：配信（Email/LINE）再検討、カテゴリのカスタマイズ、既読・お気に入り等。

## 6. 既知の制約・判断
- 「今日の重要ニュース3〜5本」は**カテゴリ横断のトップ**として上部に出し、各カテゴリ別セクションも
  併置する（全体を5分→気になる分野を深掘り、の体験）。要件の解釈として明記。
- Google News RSS の `<link>` は記事への遷移URL（媒体へリダイレクト）。MVPではこれを詳細リンクに用いる。
- 本サンドボックスは外部ネットワーク非到達のため、v0.1 の実取得はネット環境（GitHub Actions等）で実行する。
