# イオンの投資プロジェクト 🦔📈

藤原久敏『年間10％利回りを目指す 攻めのほったらかし投資術』を土台に、イオンの新NISA投資計画と、将来の「イーサン投資一括管理システム」を育てる場所。

## ドキュメント
| ファイル | 中身 |
|---|---|
| [`docs/01_fujiwara-book-summary.md`](docs/01_fujiwara-book-summary.md) | 本の全章まとめ（章ごとのルール＋藤原氏の投資先候補） |
| [`docs/02_investment-plan.md`](docs/02_investment-plan.md) | 実行計画の全体版（枠の整理・判定フロー・フェーズ・配分） |
| [`docs/05_ion-plan-confirmed.md`](docs/05_ion-plan-confirmed.md) | **★イオン専用 確定プラン**（月5万→7万・20年で1800万・毎月の配り方） |
| [`docs/03_candidate-stocks.md`](docs/03_candidate-stocks.md) | 候補銘柄リスト＋**10年配当データに基づく評価** |
| [`docs/06_tax-filing-prep.md`](docs/06_tax-filing-prep.md) | 副業の確定申告・税金・「バレない」住民税対策 |
| [`docs/07_investment-principles.md`](docs/07_investment-principles.md) | **★長期運用の原則**（各資産の収益性×リスク×乱高下／暴落時の行動規範＝お守り） |
| [`docs/04_software-vision.md`](docs/04_software-vision.md) | 一括管理ソフトの構想・ロードマップ |
| [`tools/dashboard.py`](tools/dashboard.py) | **★管理ソフト v0**：家計・防衛資金・NISA枠・確定申告を一画面に |
| [`data/`](data/) | 構造化データ（profile / portfolio / candidates） |

## 📦 アプリ置き場（apps/）と公開ルール

**原本は必ず `apps/<アプリ名>/` に持つ。試作は原本をコピーして新フォルダで。既存アプリは絶対に上書きしない。**

| 場所 | 役割 |
|---|---|
| `apps/<名前>/` | **原本**。git管理＝履歴つきで永久保存。ここが正。 |
| `gh-pages` ブランチ | 原本の**鏡**（自動生成・使い捨て）。`apps/` をまるごと反映。 |
| 公開URL `/<名前>/` | アプリごとに別URL。互いに上書きされない。 |

- トップ一覧：`https://open-ion.github.io/ethan-project-/`
- マネークリップ：`https://open-ion.github.io/ethan-project-/moneyclip/`
- News Brief（ニュースダイジェスト）：`https://open-ion.github.io/ethan-project-/news/`

**新しいアプリの作り方**：`apps/` に新フォルダを作る（既存をコピーするなら `cp -r apps/moneyclip apps/新名`）→ `apps/index.html` に1行リンクを足す → main にpush。既存アプリは別フォルダ＝別URLなので無傷。

### 📎 マネークリップ
副業×確定申告×ほったらかし投資の「お金見える化」アプリ。スマホのホーム画面に入れて使うPWA。

```bash
cd apps/moneyclip && python3 -m http.server 8000
# → スマホ/PCのブラウザで http://<このPCのIP>:8000 を開く
# iPhone Safari/Androidなら「ホーム画面に追加」でアプリとして常駐
```

4画面：
- **ホーム** … 今のフェーズ・防衛資金の進捗・20年見込み・確定申告アラート・次の一手
- **収入** … 本業/副業/バイトを月ごとに打ち込み、推移を棒グラフで見える化
- **投資** … NISA枠の消化・保有管理・候補リスト（藤原3基準つき）
- **税金** … 普通徴収・青色申告の解説・確定申告カウントダウン・準備チェックリスト

データは端末内（localStorage）に保存。バックエンドなし。`apps/moneyclip/` 配下で完結。

### 📰 News Brief（数分でわかるニュース）
「何で見ればいいかすらわからない」を終わらせる、カテゴリ別ニュース＋定期ブリーフィングのPWAアプリ。
スマートニュース風タブUI、アプリ内ジャンル選択、ChatGPTの「予定済み」風の定期ブリーフィング、
1日3便（7/14/21時 JST）の自動更新とLINE配信。詳細は **[`apps/news/README.md`](apps/news/README.md)**。

```bash
# 生成（要約なし=RSS概要 / ANTHROPIC_API_KEY ありで Claude 要約）
python digest.py && python brief.py
cd apps/news && python3 -m http.server 8000   # → http://localhost:8000/
```

アプリ本体は `apps/news/`（静的シェル＝原本）。`digest.py` / `brief.py` が `digest.json` /
`briefings.json` を生成し、ワークフロー（`.github/workflows/digest.yml`）が1日3便で
`apps/` を gh-pages に公開＋LINE配信する。ロジックは `newsdigest/` パッケージ。

## CLI版ダッシュボード（おまけ）
```bash
python3 tools/dashboard.py
```
同じ計算をターミナルで。保有や防衛資金額は `data/profile.json` `data/portfolio.json` を更新。

## 3行サマリー
- **オルカン（eMAXIS Slim 全世界株式）からスタート**は藤原氏の推奨と完全一致。まずこれを軸に。
- **成長投資枠は「超余裕資金（＝ゼロでも生活に影響しないお金）」が出た分だけ。** 大金を待つ必要なし。順番は オルカン→高配当株→優待株→REIT→クラファン。
- 高配当株は **利回り3%超 × 配当性向50%以下 × 減配なし** で選ぶ。第一候補は **三菱HCキャピタル・KDDI・三井物産**。

## 方針
長期・ほったらかし・分散・低コスト。値動きで一喜一憂せず「相場に居続ける」。判断はイオン、監視と作業はイーサン。

⚠️ 本資料は学習・計画用。投資は自己責任で。数値は2023(本)〜2026(調査)時点。売買前に最新値を確認。
