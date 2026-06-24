# 5分ニュースダイジェスト

世の中のことを、毎朝5分で。政治・経済・物価・医療・スポーツ・国際…
カテゴリ別に主要ニュースを集めて、ニュースに疎い人でも分かる平易な要約にして、
毎朝自動で更新する。自分でニュースサイトを探さなくていい。勝手に届く。

> 「ネットニュース見ようと思っても、何で見ればいいかすらわからない」を終わらせる仕組み。

## できること

- **アプリ形式（PWA）**: ホーム画面に追加すればネイティブアプリのように起動。オフラインでも
  直近のダイジェストが読める。アプリアイコン付き。
- **スマートニュース風タブUI**: 上のタブをタップ／左右スワイプでカテゴリ切替。「トップ」に
  今日のまとめ＋各カテゴリの主要トピック。誰でも迷わず、開いてすぐ読める。
- **アプリ内でジャンルを選べる**: ⚙ から表示カテゴリをオン/オフ。選択は端末に保存される
  （PDF要件「自分が気になるジャンルだけ選べる」をユーザー側で実現）。
- **予定済み（定期ブリーフィング）**: ChatGPTの「予定済みタスク」のように、テーマと頻度を
  決めた定期レポートを自動生成。毎日の「Daily Briefing」、毎週土曜の「週末の読みもの」など。
  Claude + Web検索で最新情報をまとめ、アプリの 📅 画面とLINEに届く。
- **5分で読める**: 1記事1〜2文の平易な要約 ＋ 「今日のまとめ」3行。明るい新聞風・スマホ最優先。
- **1日3便で自動更新**: GitHub Actions が 7:00 / 14:00 / 21:00 (JST) に生成して
  GitHub Pages に公開。ブックマーク1つでOK。
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

# 3. アプリとして開く（fetchを使うのでローカルHTTPサーバ経由で）
cd apps/news && python -m http.server 8000
#   → ブラウザで http://localhost:8000/ を開く
```

`apps/news/index.html` がアプリ本体（`digest.json` を読み込んで表示）。
`apps/news/digest-YYYY-MM-DD.html` / `.md` はJS不要の日付アーカイブ。

> ⚠️ `index.html` を `file://` で直接開くと、ブラウザのセキュリティ制限で `digest.json` を
> 読み込めない。上記のように簡易HTTPサーバ経由（または下記のGitHub Pages）で開くこと。

## アプリとして使う（ホーム画面に追加）

GitHub Pages で公開したURLをスマホのブラウザで開き、

- **iOS (Safari)**: 共有 → 「ホーム画面に追加」
- **Android (Chrome)**: メニュー → 「アプリをインストール」/「ホーム画面に追加」

これでアイコンから起動でき、オフラインでも直近のダイジェストが読める。
アプリ上部の ⚙ から、表示するカテゴリを自分好みに選べる。

## 毎朝自動で届くようにする（GitHub Pages）

このリポジトリにはすでに自動更新ワークフロー（`.github/workflows/digest.yml`）が入っている。
有効化は2ステップ：

1. **Pages を有効化**: リポジトリの `Settings > Pages` で **Source = GitHub Actions** を選択。
2. **（任意）AI要約**: `Settings > Secrets and variables > Actions` に
   `ANTHROPIC_API_KEY` を登録。未登録ならRSS概要で動く。

これで1日3便（7:00 / 14:00 / 21:00 JST）に自動生成され、
`https://<ユーザー名>.github.io/<リポジトリ名>/` で読める。
`Actions` タブの「Run workflow」で即時更新もできる。
配信時刻を変えたいときは `.github/workflows/digest.yml` の cron（UTC表記）と
`config.json` の `schedule.slots` を合わせて編集する。

## 毎朝LINEに届くようにする（任意）

要点（今日のまとめ＋各カテゴリのトップ見出し＋全文ページへのリンク）を毎朝LINEに push する。
※ LINE Notify は2025年3月で終了したため、現行の **LINE Messaging API** を使う。

1. **LINE公式アカウントを作る**: [LINE Developers](https://developers.line.biz/) で
   プロバイダー → **Messaging API チャネル**を作成。
2. **チャネルアクセストークンを発行**: チャネル設定の「Messaging API」タブで
   長期のチャネルアクセストークンを発行 → `LINE_CHANNEL_ACCESS_TOKEN`。
3. **送信先IDを取得**: 自分のLINEで作成した公式アカウントを友だち追加し、
   「Messaging API」タブの **Your user ID**（`U` で始まる文字列）を控える → `LINE_TO`。
   （グループに送るならグループID）
4. **Secretsに登録**: `Settings > Secrets and variables > Actions` に
   `LINE_CHANNEL_ACCESS_TOKEN` と `LINE_TO` を登録。

これで各便（既定はニュースが朝7時、ブリーフィングは各自の時刻）にLINEへ自動で届く。
未登録なら配信はスキップされる（他は通常どおり動く）。

ローカルから手動でテスト送信:

```bash
python digest.py                         # 先に apps/news/digest.json を生成
export LINE_CHANNEL_ACCESS_TOKEN=...      # トークン
export LINE_TO=Uxxxxxxxx                  # 送信先ID
export SITE_URL=https://<ユーザー名>.github.io/<リポジトリ名>/
python notify_line.py
```

## 予定済み（定期ブリーフィング）

ChatGPTの「予定済みタスク」に相当する機能。`briefings.json` にテーマと頻度を書いておくと、
スケジュールに従って **Claude + Web検索** で最新情報を要約生成し、アプリの 📅 画面とLINEに届く。

```json
{
  "briefings": [
    {
      "id": "daily-brief",
      "title": "Daily Briefing",
      "emoji": "📰",
      "source": "ai",
      "enabled": true,
      "schedule": { "freq": "daily", "time": "07:00" },
      "instruction": "AI・テクノロジー、投資・株式市場、看護・医療、ビジネス・スタートアップを中心に、日本語でバランスよく。",
      "model": "claude-opus-4-8"
    },
    {
      "id": "weekend-reads", "title": "週末の読みもの", "emoji": "📖",
      "source": "ai", "enabled": true,
      "schedule": { "freq": "weekly", "days": ["sat"], "time": "09:00" },
      "instruction": "今週話題になった読み応えのある記事を3〜5本、要点つきで。",
      "model": "claude-opus-4-8"
    }
  ]
}
```

- **schedule.freq**: `daily`（毎日）／`weekdays`（平日）／`weekly`＋`days`（例 `["sat"]`）。
- **schedule.time**: 配信する便。`07:00`/`14:00`/`21:00` のいずれか（＝`config.json` の
  `schedule.slots`）。**`time` を省くと「速報」扱いで毎便（7/14/21時すべて）に生成**される。
- **enabled**: `false` でその予定をオフ。
- **instruction**: 何をまとめてほしいかを自由文で。これがそのままブリーフィングのテーマ。
- **model**: 既定 `claude-opus-4-8`。コストを抑えたいなら `claude-sonnet-4-6` / `claude-haiku-4-5`。
  ※Web検索を使うため `ANTHROPIC_API_KEY` が必要（未設定なら本文は空＝予定だけ表示）。

> 便（スロット）は1日3回（7:00 / 14:00 / 21:00 JST）。各ブリーフィングは自分の `time` の便だけ
> 実行され、`time` 省略の速報系は毎便実行される。便の時刻は `config.json` の `schedule.slots`
> と `digest.yml` の cron で決まる。

手動実行:

```bash
python brief.py            # 今日該当分を生成 → apps/news/briefings.json
python brief.py --force    # スケジュール無視で全件生成（テスト用）
python brief.py --notify   # 生成後、該当分をLINE配信
```

各便のワークフローでは、ニュース生成 → ブリーフィング生成 → Pages公開 → LINE配信 の順に自動実行される。

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
  "deliver": { "line": { "enabled": true, "max_headlines_per_genre": 1, "news_at": "07:00" } },
  "schedule": { "slots": ["07:00", "14:00", "21:00"] },
  "output": { "dir": "site", "title": "5分ニュースダイジェスト", "timezone": "Asia/Tokyo", "site_url": "" }
}
```

- **schedule.slots**: 1日の配信便（JST）。`digest.yml` の cron（UTC）と揃えること。
- **deliver.line.news_at**: ニュースをLINEに送る便（既定 `07:00` ＝朝のみ。3便すべて送ると
  煩いので朝1回に絞っている）。`null` にすると毎便送る。ブリーフィングは各自の `time` に従う。

- **genres**: 表示するジャンルと順番。気になるものだけ残せばいい。
  使えるキー: `trend`(主要) / `politics`(政治) / `economy`(経済) / `prices`(物価) /
  `medical`(医療・科学) / `sports`(スポーツ) / `world`(国際) / `society`(社会)
- **max_items_per_genre**: 1ジャンルあたりの記事数。
- **summarize.model**: 要約モデル。既定は安価で速い `claude-haiku-4-5`。
  精度重視なら `claude-opus-4-8` に変更可。
- **summarize.enabled**: `false` で要約OFF（RSS概要のみ）。
- **deliver.line.max_headlines_per_genre**: LINEに載せるカテゴリごとの見出し数。
- **deliver.line.enabled**: `false` でLINE配信OFF。

## 仕組み

```
config.json ──▶ newsdigest.core
                  │
                  ├─ sources.py   NHK RSS をジャンル別に取得・パース（標準ライブラリ）
                  ├─ summarize.py Claude で平易要約（APIキー無ければ自動フォールバック）
                  ├─ render.py    日付アーカイブHTML / Markdown を出力
                  └─ notify.py    LINE Messaging API へ push（標準ライブラリ）
                  ▼
                apps/news/digest.json ─┬─▶ apps/news（PWAアプリ：index.html/app.js/sw.js）
                                  │      ──▶ GitHub Pages（1日3便 cron で自動更新）
                                  └─▶ notify_line.py ──▶ 朝便で LINE に届く

briefings.json ─▶ brief.py ─▶ newsdigest.briefings
                  │             ├─ スケジューラ（毎日／平日／毎週◯曜）
                  │             └─ Claude + Web検索で定期ブリーフィング生成
                  ▼
                apps/news/briefings.json ─┬─▶ 📅 予定済み画面（briefings.html）
                                     └─▶ brief.py --notify-only ──▶ LINE

apps/news/ : アプリ本体（静的シェル＝原本）。digest.py / brief.py が
          digest.json / briefings.json を生成して同じ場所に置き、アプリが描画する。
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
- Slack等への通知: `newsdigest/notify.py` を参考に、Webhookへ送る処理を足せばよい。

---
記事の著作権は各報道機関に帰属します。本ツールは見出しと概要の集約・要約のみを行います。
