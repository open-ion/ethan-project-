"""ダイジェストの出力（HTML / Markdown）。

HTMLはCSSをインライン化した1ファイル完結。スマホでも5分で読めるカード型。
"""

from __future__ import annotations

import datetime as dt
import html

from .sources import GENRES, Article
from .summarize import SummaryResult


def _summary_for(gkey: str, index: int, result: SummaryResult, fallback: str) -> str:
    return result.by_id.get(f"{gkey}-{index}", fallback)


# ---------------------------------------------------------------------------
# HTML
# ---------------------------------------------------------------------------

_CSS = """
:root { --bg:#0f1115; --card:#191c22; --fg:#e7e9ee; --muted:#9aa3b2;
  --accent:#ffb454; --line:#2a2e37; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--fg);
  font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN",
  "Noto Sans JP","Segoe UI",sans-serif; line-height:1.7; }
.wrap { max-width:720px; margin:0 auto; padding:24px 16px 64px; }
header h1 { font-size:1.5rem; margin:0 0 4px; }
header .meta { color:var(--muted); font-size:.85rem; }
.overall { background:var(--card); border-left:4px solid var(--accent);
  border-radius:10px; padding:16px 18px; margin:20px 0; white-space:pre-wrap; }
.overall h2 { margin:0 0 8px; font-size:1rem; color:var(--accent); }
section.genre { margin:28px 0 0; }
section.genre > h2 { font-size:1.15rem; border-bottom:1px solid var(--line);
  padding-bottom:6px; margin:0 0 12px; }
.card { background:var(--card); border-radius:12px; padding:14px 16px;
  margin:10px 0; border:1px solid var(--line); }
.card a.title { color:var(--fg); text-decoration:none; font-weight:600;
  font-size:1.02rem; display:block; }
.card a.title:hover { color:var(--accent); }
.card .sum { color:var(--fg); margin:6px 0 0; }
.card .time { color:var(--muted); font-size:.78rem; margin-top:6px; }
.empty { color:var(--muted); font-style:italic; }
footer { margin-top:40px; color:var(--muted); font-size:.78rem;
  text-align:center; }
nav.toc { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0 0; }
nav.toc a { background:var(--card); border:1px solid var(--line);
  color:var(--fg); text-decoration:none; padding:6px 12px; border-radius:999px;
  font-size:.85rem; }
nav.toc a:hover { border-color:var(--accent); color:var(--accent); }
"""


def _esc(text: str) -> str:
    return html.escape(text, quote=True)


def render_html(
    genres_articles: dict[str, list[Article]],
    result: SummaryResult,
    config: dict,
    *,
    generated_at: dt.datetime,
) -> str:
    title = config.get("output", {}).get("title", "5分ニュースダイジェスト")
    date_label = generated_at.strftime("%Y年%m月%d日 %H:%M")

    parts: list[str] = []
    parts.append("<!DOCTYPE html>")
    parts.append('<html lang="ja"><head><meta charset="utf-8">')
    parts.append(
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
    )
    parts.append(f"<title>{_esc(title)} {generated_at:%Y-%m-%d}</title>")
    parts.append(f"<style>{_CSS}</style></head><body><div class='wrap'>")

    # ヘッダー
    parts.append("<header>")
    parts.append(f"<h1>{_esc(title)}</h1>")
    engine = "Claude要約" if result.used_llm else "見出し+概要"
    parts.append(
        f"<div class='meta'>{_esc(date_label)} 更新 ・ {engine} ・ "
        "出典: NHKニュース</div>"
    )
    parts.append("</header>")

    # 目次
    present = [g for g in _ordered_genres(config) if genres_articles.get(g)]
    if present:
        parts.append("<nav class='toc'>")
        for gkey in present:
            g = GENRES[gkey]
            parts.append(f"<a href='#{gkey}'>{g.emoji} {_esc(g.label)}</a>")
        parts.append("</nav>")

    # 総括
    if result.overall:
        parts.append("<div class='overall'><h2>📌 今日のまとめ</h2>")
        parts.append(_esc(result.overall))
        parts.append("</div>")

    # 各ジャンル
    for gkey in _ordered_genres(config):
        articles = genres_articles.get(gkey, [])
        g = GENRES[gkey]
        parts.append(f"<section class='genre' id='{gkey}'>")
        parts.append(f"<h2>{g.emoji} {_esc(g.label)}</h2>")
        if not articles:
            parts.append("<p class='empty'>新着なし</p>")
        for i, art in enumerate(articles):
            summ = _summary_for(gkey, i, result, art.description)
            parts.append("<div class='card'>")
            parts.append(
                f"<a class='title' href='{_esc(art.link)}' "
                f"target='_blank' rel='noopener'>{_esc(art.title)}</a>"
            )
            if summ:
                parts.append(f"<p class='sum'>{_esc(summ)}</p>")
            if art.published_label:
                parts.append(f"<div class='time'>{_esc(art.published_label)}</div>")
            parts.append("</div>")
        parts.append("</section>")

    parts.append(
        "<footer>自動生成: 5分ニュースダイジェスト ・ "
        "記事の著作権は各報道機関に帰属します。</footer>"
    )
    parts.append("</div></body></html>")
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Markdown（メール / アーカイブ用）
# ---------------------------------------------------------------------------

def render_markdown(
    genres_articles: dict[str, list[Article]],
    result: SummaryResult,
    config: dict,
    *,
    generated_at: dt.datetime,
) -> str:
    title = config.get("output", {}).get("title", "5分ニュースダイジェスト")
    lines: list[str] = []
    lines.append(f"# {title} — {generated_at:%Y/%m/%d %H:%M}")
    lines.append("")
    if result.overall:
        lines.append("## 📌 今日のまとめ")
        lines.append(result.overall)
        lines.append("")
    for gkey in _ordered_genres(config):
        articles = genres_articles.get(gkey, [])
        g = GENRES[gkey]
        lines.append(f"## {g.emoji} {g.label}")
        if not articles:
            lines.append("_新着なし_")
            lines.append("")
            continue
        for i, art in enumerate(articles):
            summ = _summary_for(gkey, i, result, art.description)
            lines.append(f"- **[{art.title}]({art.link})**")
            if summ:
                lines.append(f"  {summ}")
            if art.published_label:
                lines.append(f"  _{art.published_label}_")
        lines.append("")
    lines.append("---")
    lines.append("出典: NHKニュース / 自動生成")
    return "\n".join(lines)


def _ordered_genres(config: dict) -> list[str]:
    from .sources import DEFAULT_GENRE_ORDER
    selected = config.get("genres") or DEFAULT_GENRE_ORDER
    return [g for g in selected if g in GENRES]
