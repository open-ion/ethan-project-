# 5分ニュースダイジェスト

世の中のことを、毎朝5分で。政治・経済・物価・医療・スポーツ・国際…
カテゴリ別に主要ニュースを集めて、ニュースに疎い人でも分かる平易な要約にして、
毎朝自動で更新する。自分でニュースサイトを探さなくていい。勝手に届く。

> 「ネットニュース見ようと思っても、何で見ればいいかすらわからない」を終わらせる仕組み。

## できること

- **カテゴリ別**: 政治・経済・物価・医療・スポーツ・国際・トレンド。気になるジャンルだけ選べる。
- **5分で読める**: 1記事1〜2文の平易な要約 ＋ 「今日のまとめ」3行。スマホ対応のカード表示。
- **毎朝自動**: GitHub Actions が毎朝6時(JST)に生成して GitHub Pages に公開。ブックマーク1つでOK。
- **要約はAI（任意）**: `ANTHROPIC_API_KEY` を入れると Claude が要約。無くてもRSS概要で必ず動く。
- **依存ほぼゼロ**: 取得・整形・出力は Python 標準ライブラリだけ。要約のときだけ `anthropic`。

ニュース元は **NHKニュースの公開RSS**（カテゴリ別）。

## クイックスタート（ローカル）

```bash
# 1. 生成（要約なし。RSS概要をそのまま使う）
python digest.py

# 2. Claude 要約つきで生成
export ANTHROPIC_API_KEY=sk-ant-...
python digest.py

# 出力は site/ に。ブラウザで開く：
open site/index.html        # mac
```

`site/index.html`（最新）と `site/digest-YYYY-MM-DD.html` / `.md`（日付アーカイブ）が作られる。

## 毎朝自動で届くようにする（GitHub Pages）

このリポジトリにはすでに自動更新ワークフロー（`.github/workflows/digest.yml`）が入っている。
有効化は2ステップ：

1. **Pages を有効化**: リポジトリの `Settings > Pages` で **Source = GitHub Actions** を選択。
2. **（任意）AI要約**: `Settings > Secrets and variables > Actions` に
   `ANTHROPIC_API_KEY` を登録。未登録ならRSS概要で動く。

これで毎朝6時(JST)に自動生成され、`https://<ユーザー名>.github.io/<リポジトリ名>/` で読める。
`Actions` タブの「Run workflow」で即時更新もできる。

## 設定（`config.json`）

```json
{
  "genres": ["trend", "politics", "economy", "prices", "medical", "sports", "world"],
  "max_items_per_genre": 5,
  "summarize": {
    "enabled": true,
    "model": "claude-haiku-4-5",
    "max_items_to_summarize": 5
  },
  "output": { "dir": "site", "title": "5分ニュースダイジェスト", "timezone": "Asia/Tokyo" }
}
```

- **genres**: 表示するジャンルと順番。気になるものだけ残せばいい。
  使えるキー: `trend`(主要) / `politics`(政治) / `economy`(経済) / `prices`(物価) /
  `medical`(医療・科学) / `sports`(スポーツ) / `world`(国際) / `society`(社会)
- **max_items_per_genre**: 1ジャンルあたりの記事数。
- **summarize.model**: 要約モデル。既定は安価で速い `claude-haiku-4-5`。
  精度重視なら `claude-opus-4-8` に変更可。
- **summarize.enabled**: `false` で要約OFF（RSS概要のみ）。

## 仕組み

```
config.json ──▶ newsdigest.core
                  │
                  ├─ sources.py   NHK RSS をジャンル別に取得・パース（標準ライブラリ）
                  ├─ summarize.py Claude で平易要約（APIキー無ければ自動フォールバック）
                  └─ render.py    HTML / Markdown を出力
                  ▼
                site/index.html  ──▶ GitHub Pages（毎朝 cron で自動更新）
```

- 物価(`prices`)は経済・暮らしフィードから物価関連キーワードで絞り込んで作っている。
- どこかのフィード取得が失敗しても全体は止まらない。要約APIが落ちてもRSS概要で出る。

## テスト

ネットワークに出ずに、固定フィクスチャで検証：

```bash
python -m unittest discover -s tests
```

## カスタマイズの余地

- ニュース元の追加: `newsdigest/sources.py` の `GENRES` にフィードURLを足すだけ。
- メール配信: `render_markdown()` の出力をSMTPで送る処理を足せば「毎朝メールで届く」も可能。
- LINE / Slack 通知: 同じく Markdown を Webhook に流せばいい。

---
記事の著作権は各報道機関に帰属します。本ツールは見出しと概要の集約・要約のみを行います。
