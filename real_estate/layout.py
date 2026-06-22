"""間取りの大小を比較するためのランク付け."""

# 小さい順。1LDK以上、のような「以上」判定に使う。
LAYOUT_ORDER = [
    "1R", "1K", "1DK", "1LDK",
    "2K", "2DK", "2LDK",
    "3K", "3DK", "3LDK",
    "4K", "4DK", "4LDK", "5LDK",
]


def layout_rank(layout: str) -> int:
    """間取り文字列をランク(0始まり)に変換。未知なら-1。"""
    if not layout:
        return -1
    key = layout.strip().upper().replace("ＬＤＫ", "LDK")
    try:
        return LAYOUT_ORDER.index(key)
    except ValueError:
        return -1


def meets_min_layout(layout: str, minimum: str) -> bool:
    """layout が minimum 以上の広さか。"""
    target = layout_rank(minimum)
    if target < 0:
        return True  # 基準が未知なら制約なし扱い
    return layout_rank(layout) >= target
