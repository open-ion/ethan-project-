# 自動不動産検索エンジン（不動産探しAI）

条件を入れると、**探す → 外せない条件で絞る → 土地勘で評価 → 比較表**までを自動で回す。

「探す → 内見 → ダメ → また探す」の手作業ループと、
「知らない土地だから、その条件で何が妥当かわからない」を解くためのコア。

## 使い方

```bash
# サンプルで動かす
python3 -m real_estate.cli

# 自分の条件・物件で動かす
python3 -m real_estate.cli \
  --config   config/criteria.example.json \
  --listings data/listings.sample.json \
  --market   config/market.example.json \
  --out      report.md
```

依存ゼロ（Python 3 標準ライブラリのみ）。

## できること

- **外せない条件（ハード）でフィルタ** … 落ちた物件は「なぜ落ちたか」も出す
- **あったら嬉しい条件（ソフト）でスコアリング** … 候補内で正規化し重み付き合算
- **土地勘エンリッチ** … 相場と突き合わせ「割安/相場通り/割高」を判定
- **条件アドバイス** … 全滅・少件数のとき「どの条件をどう緩めれば+何件か」を提案

## 設定

`config/criteria.example.json`:

```json
{
  "hard": {
    "max_rent": 70000,
    "min_layout": "1LDK",
    "parking": true,
    "commute": { "to": "旭駅", "max_minutes": 30 }
  },
  "soft": [
    { "key": "total_rent",       "weight": 3, "lower_is_better": true },
    { "key": "commute_minutes",  "weight": 3, "lower_is_better": true },
    { "key": "area_sqm",         "weight": 2, "lower_is_better": false },
    { "key": "building_age",     "weight": 1, "lower_is_better": true }
  ]
}
```

- `hard` … 1つでも外れたら除外（家賃は管理費込みの総額で判定）
- `soft` … `weight` で重み、`lower_is_better` で「小さいほど良い」を指定

## 物件データ（収集アダプタ）

収集元は `real_estate/search.py` のアダプタ式。今は JSON 投入のみ。
SUUMO / HOME'S 等を足すなら `ListingSource` を継承して `fetch()` を実装する。

> 実サイトの取得は各社の利用規約・robots を必ず確認すること。
> 公式API・データ提供・提携を優先し、グレーな収集に依存しない設計にする。

## ロードマップ

- [x] 条件フィルタ・スコアリング・土地勘評価・比較表（このリポジトリ）
- [ ] 収集アダプタ（公式API/提携優先）で「探す」を自動化
- [ ] 定期実行＋新着の差分通知（メール / LINE / Notion）
- [ ] 内見予約の候補日提案・調整
- [ ] 申込ドラフト生成
