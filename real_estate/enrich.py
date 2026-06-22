"""土地勘エンリッチ — 知らない土地でも「妥当かどうか」を判断できる材料を付ける.

相場テーブルと物件家賃を突き合わせ、割安/相場通り/割高を判定する。
これがイオンの「知らない土地だから条件が妥当かわからない」を直接埋める部分。
"""

import json

from .criteria import total_rent


def load_market(path: str) -> dict:
    """相場テーブル。キーは "エリア|間取り"、値は家賃総額の目安。"""
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def market_key(listing: dict) -> str:
    return f"{listing.get('area', '')}|{listing.get('layout', '')}"


def enrich(listing: dict, market: dict) -> None:
    """listing に土地勘情報を付与（破壊的）。"""
    total = total_rent(listing)
    listing["total_rent"] = total

    typical = market.get(market_key(listing))
    if not typical:
        listing["market_note"] = "相場データなし"
        listing["market_deviation"] = None
        return

    dev = (total - typical) / typical  # 正なら相場より高い
    listing["market_deviation"] = round(dev * 100, 1)

    if dev <= -0.10:
        listing["market_note"] = (
            f"相場より{abs(round(dev*100))}%安い（要確認：何か理由があるかも）"
        )
    elif dev >= 0.10:
        listing["market_note"] = f"相場より{round(dev*100)}%高い（割高）"
    else:
        listing["market_note"] = "ほぼ相場通り"
