"""条件の読み込み・ハードフィルタ・スコアリング・緩和提案."""

import json

from . import layout


def load_criteria(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def total_rent(listing: dict) -> int:
    """家賃＋管理費。比較は必ず総額でやる。"""
    return int(listing.get("rent", 0)) + int(listing.get("management_fee", 0))


# --- ハードフィルタ（外せない条件） ---------------------------------------

def hard_failures(listing: dict, hard: dict) -> list[str]:
    """listing が満たせなかった「外せない条件」の理由を返す。空なら合格。"""
    reasons: list[str] = []

    if "max_rent" in hard and total_rent(listing) > hard["max_rent"]:
        reasons.append(
            f"家賃総額{total_rent(listing):,}円 > 上限{hard['max_rent']:,}円"
        )

    if "min_layout" in hard and not layout.meets_min_layout(
        listing.get("layout", ""), hard["min_layout"]
    ):
        reasons.append(
            f"間取り{listing.get('layout', '?')} < 希望{hard['min_layout']}以上"
        )

    if hard.get("parking") and not listing.get("parking"):
        reasons.append("駐車場なし")

    if hard.get("pets_allowed") and not listing.get("pets_allowed"):
        reasons.append("ペット不可")

    if "max_building_age" in hard:
        age = listing.get("building_age")
        if age is not None and age > hard["max_building_age"]:
            reasons.append(f"築{age}年 > 上限{hard['max_building_age']}年")

    commute = hard.get("commute") or {}
    if "max_minutes" in commute:
        mins = listing.get("commute_minutes")
        if mins is None:
            reasons.append("通勤時間が不明")
        elif mins > commute["max_minutes"]:
            reasons.append(
                f"通勤{mins}分 > 上限{commute['max_minutes']}分"
            )

    if not listing.get("available", True):
        reasons.append("募集終了（埋まっている）")

    return reasons


def partition(listings: list[dict], hard: dict):
    """合格／不合格に分ける。不合格には理由を添える。"""
    passed, failed = [], []
    for x in listings:
        reasons = hard_failures(x, hard)
        if reasons:
            failed.append((x, reasons))
        else:
            passed.append(x)
    return passed, failed


# --- スコアリング（あったら嬉しい条件） -----------------------------------

def _value(listing: dict, key: str):
    if key == "total_rent":
        return total_rent(listing)
    return listing.get(key)


def score(listings: list[dict], soft: list[dict]) -> None:
    """各 listing に 0〜100 の score を付与（破壊的）。

    各項目を候補内で min-max 正規化し、重み付き平均で合算する。
    """
    if not listings:
        return

    for x in listings:
        x["_score_parts"] = {}

    total_weight = sum(s.get("weight", 1) for s in soft) or 1

    for s in soft:
        key = s["key"]
        weight = s.get("weight", 1)
        lower_better = s.get("lower_is_better", False)

        vals = [(_value(x, key)) for x in listings]
        nums = [v for v in vals if isinstance(v, (int, float))]
        if not nums:
            continue
        lo, hi = min(nums), max(nums)
        span = (hi - lo) or 1

        for x in listings:
            v = _value(x, key)
            if not isinstance(v, (int, float)):
                norm = 0.5
            else:
                norm = (v - lo) / span
                if lower_better:
                    norm = 1 - norm
            x["_score_parts"][key] = norm * weight

    for x in listings:
        raw = sum(x["_score_parts"].values())
        x["score"] = round(raw / total_weight * 100, 1)

    listings.sort(key=lambda x: x["score"], reverse=True)


# --- 緩和提案（知らない土地で基準がない人向け） ---------------------------

def relax_suggestions(all_listings: list[dict], hard: dict) -> list[str]:
    """「この条件をこう緩めれば+N件」を計算する。

    全滅・少件数のときに、どこが効いているかを示す。
    """
    suggestions = []
    base_pass = sum(1 for x in all_listings if not hard_failures(x, hard))

    # 各ハード条件を1つずつ外して、合格数の増分を見る
    tweaks = {
        "max_rent": "家賃上限",
        "min_layout": "間取り条件",
        "parking": "駐車場必須",
        "pets_allowed": "ペット可必須",
        "max_building_age": "築年数上限",
        "commute": "通勤時間上限",
    }
    for key, label in tweaks.items():
        if key not in hard:
            continue
        relaxed = {k: v for k, v in hard.items() if k != key}
        n = sum(1 for x in all_listings if not hard_failures(x, relaxed))
        gain = n - base_pass
        if gain > 0:
            suggestions.append(f"「{label}」を外すと +{gain}件（{n}件に）")

    return suggestions
