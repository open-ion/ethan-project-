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
| [`docs/04_software-vision.md`](docs/04_software-vision.md) | 一括管理ソフトの構想・ロードマップ |
| [`tools/dashboard.py`](tools/dashboard.py) | **★管理ソフト v0**：家計・防衛資金・NISA枠・確定申告を一画面に |
| [`data/`](data/) | 構造化データ（profile / portfolio / candidates） |

## 管理ソフトを動かす
```bash
python3 tools/dashboard.py
```
月1回これを開けば、今のフェーズ・防衛資金の進捗・次の一手・確定申告の残り日数が出る。
保有や防衛資金額が変わったら `data/profile.json` `data/portfolio.json` を更新するだけ。

## 3行サマリー
- **オルカン（eMAXIS Slim 全世界株式）からスタート**は藤原氏の推奨と完全一致。まずこれを軸に。
- **成長投資枠は「超余裕資金（＝ゼロでも生活に影響しないお金）」が出た分だけ。** 大金を待つ必要なし。順番は オルカン→高配当株→優待株→REIT→クラファン。
- 高配当株は **利回り3%超 × 配当性向50%以下 × 減配なし** で選ぶ。第一候補は **三菱HCキャピタル・KDDI・三井物産**。

## 方針
長期・ほったらかし・分散・低コスト。値動きで一喜一憂せず「相場に居続ける」。判断はイオン、監視と作業はイーサン。

⚠️ 本資料は学習・計画用。投資は自己責任で。数値は2023(本)〜2026(調査)時点。売買前に最新値を確認。
