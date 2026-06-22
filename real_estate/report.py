"""比較表(Markdown)の生成."""


def _yesno(v) -> str:
    return "あり" if v else "なし"


def build_report(passed, failed, criteria, suggestions) -> str:
    lines: list[str] = []
    hard = criteria.get("hard", {})

    lines.append("# 物件比較レポート")
    lines.append("")
    lines.append(f"- 条件に合致: **{len(passed)}件** / 除外: {len(failed)}件")
    commute = hard.get("commute") or {}
    cond = []
    if "max_rent" in hard:
        cond.append(f"家賃総額 {hard['max_rent']:,}円以下")
    if "min_layout" in hard:
        cond.append(f"{hard['min_layout']}以上")
    if hard.get("parking"):
        cond.append("駐車場あり")
    if "max_minutes" in commute:
        to = commute.get("to", "拠点")
        cond.append(f"{to}まで{commute['max_minutes']}分以内")
    if cond:
        lines.append(f"- 外せない条件: {' / '.join(cond)}")
    lines.append("")

    if passed:
        lines.append("## おすすめ順")
        lines.append("")
        lines.append(
            "| # | 物件 | 家賃総額 | 間取り | 面積 | 築年 | 駐車場 | 通勤 | 相場 | スコア |"
        )
        lines.append("|---|------|---------|-------|------|------|-------|------|------|-------|")
        for i, x in enumerate(passed, 1):
            lines.append(
                f"| {i} | [{x.get('title','')}]({x.get('url','')}) "
                f"| {x.get('total_rent',0):,}円 "
                f"| {x.get('layout','')} "
                f"| {x.get('area_sqm','?')}㎡ "
                f"| 築{x.get('building_age','?')}年 "
                f"| {_yesno(x.get('parking'))} "
                f"| {x.get('commute_minutes','?')}分 "
                f"| {x.get('market_note','-')} "
                f"| {x.get('score','-')} |"
            )
        lines.append("")

        lines.append("## トップ候補のひとこと")
        lines.append("")
        for x in passed[:3]:
            note = x.get("market_note", "")
            lines.append(
                f"- **{x.get('title','')}**（スコア{x.get('score')}）"
                f"：{x.get('address','')} / {note}"
            )
        lines.append("")

    if failed:
        lines.append("## 除外された物件（なぜ外れたか）")
        lines.append("")
        for x, reasons in failed:
            lines.append(f"- {x.get('title','')}：{ '、'.join(reasons) }")
        lines.append("")

    if suggestions:
        lines.append("## 条件アドバイス")
        lines.append("")
        lines.append("今の条件だと取りこぼしている。緩めるならここが効く：")
        for s in suggestions:
            lines.append(f"- {s}")
        lines.append("")

    return "\n".join(lines)
