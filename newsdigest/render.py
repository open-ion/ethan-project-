"""ダイジェストの出力（HTML / Markdown）。

HTMLはスマートニュース風のタブ切り替えUI。CSS/JSをインライン化した1ファイル完結で、
依存ゼロ・スマホ最優先。タブをタップ（またはスワイプ）してカテゴリを切り替える。
"""

from __future__ import annotations

import datetime as dt
import html

from .sources import GENRES, Article
from .summarize import SummaryResult

# ジャンルごとのアクセントカラー（タブ下線・カテゴリチップ）
COLORS: dict[str, str] = {
    "trend": "#ff4d4f",
    "politics": "#3b6cf6",
    "economy": "#16a34a",
    "prices": "#f59e0b",
    "medical": "#06b6d4",
    "sports": "#8b5cf6",
    "world": "#0ea5e9",
    "society": "#64748b",
}
_DEFAULT_COLOR = "#ff4d4f"


def _color(gkey: str) -> str:
    return COLORS.get(gkey, _DEFAULT_COLOR)


def _summary_for(gkey: str, index: int, result: SummaryResult, fallback: str) -> str:
    return result.by_id.get(f"{gkey}-{index}", fallback)


def _esc(text: str) -> str:
    return html.escape(text, quote=True)


def _ordered_genres(config: dict) -> list[str]:
    from .sources import DEFAULT_GENRE_ORDER
    selected = config.get("genres") or DEFAULT_GENRE_ORDER
    return [g for g in selected if g in GENRES]


# ---------------------------------------------------------------------------
# HTML（スマートニュース風タブUI）
# ---------------------------------------------------------------------------

_CSS = """
:root { --bg:#eef0f2; --card:#fff; --fg:#16181d; --muted:#73767d;
  --line:#e6e8eb; --accent:#ff4d4f; }
* { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
html,body { margin:0; }
body { background:var(--bg); color:var(--fg);
  font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN",
  "Noto Sans JP","Segoe UI",sans-serif; line-height:1.6;
  -webkit-font-smoothing:antialiased; }
.app { max-width:720px; margin:0 auto; background:var(--bg);
  min-height:100vh; }

/* ヘッダー */
header { position:sticky; top:0; z-index:20; background:#fff;
  border-bottom:1px solid var(--line); padding:12px 16px 0; }
header .row { display:flex; align-items:baseline; justify-content:space-between;
  gap:8px; }
header .brand { font-size:1.15rem; font-weight:800; letter-spacing:.01em; }
header .date { color:var(--muted); font-size:.78rem; white-space:nowrap; }

/* タブ */
nav.tabs { display:flex; gap:2px; overflow-x:auto; scrollbar-width:none;
  margin-top:8px; -ms-overflow-style:none; }
nav.tabs::-webkit-scrollbar { display:none; }
nav.tabs button { flex:0 0 auto; appearance:none; background:none; border:none;
  font:inherit; color:var(--muted); font-weight:700; font-size:.95rem;
  padding:10px 14px 12px; cursor:pointer; position:relative; white-space:nowrap;
  border-bottom:3px solid transparent; }
nav.tabs button[aria-selected="true"] { color:var(--fg); }
nav.tabs button[aria-selected="true"]::after { content:""; position:absolute;
  left:10px; right:10px; bottom:-1px; height:3px; border-radius:3px;
  background:var(--tabcolor,var(--accent)); }

/* パネル / カード */
main { padding:12px 12px 72px; }
.panel { animation:fade .18s ease; }
@keyframes fade { from{opacity:0; transform:translateY(4px);} to{opacity:1;} }
.summary { background:#fff; border-radius:14px; padding:16px 18px;
  margin:4px 0 14px; box-shadow:0 1px 3px rgba(0,0,0,.06);
  border-left:5px solid var(--accent); white-space:pre-wrap; }
.summary h2 { margin:0 0 8px; font-size:.95rem; color:var(--accent);
  letter-spacing:.02em; }
.sectionhead { font-size:.8rem; font-weight:800; color:var(--muted);
  letter-spacing:.08em; margin:18px 4px 8px; }
.card { display:block; background:#fff; border-radius:14px; padding:14px 16px;
  margin:10px 0; box-shadow:0 1px 3px rgba(0,0,0,.06); text-decoration:none;
  color:inherit; transition:transform .08s ease, box-shadow .12s ease; }
.card:active { transform:scale(.99); }
.card:hover { box-shadow:0 3px 10px rgba(0,0,0,.10); }
.card .title { font-weight:700; font-size:1.04rem; line-height:1.45; }
.card .sum { color:#3a3d44; margin:7px 0 0; font-size:.93rem; }
.card .foot { display:flex; align-items:center; gap:8px; margin-top:9px;
  color:var(--muted); font-size:.76rem; }
.chip { display:inline-block; font-weight:800; font-size:.72rem; color:#fff;
  padding:2px 8px; border-radius:999px; }
.empty { color:var(--muted); text-align:center; padding:32px 0; }
footer { color:var(--muted); font-size:.74rem; text-align:center;
  padding:20px 16px 32px; }
.hint { color:var(--muted); font-size:.74rem; text-align:center; margin:2px 0 0; }
"""

_JS = """
(function(){
  var tabs = Array.prototype.slice.call(document.querySelectorAll('nav.tabs button'));
  var panels = {};
  document.querySelectorAll('.panel').forEach(function(p){ panels[p.dataset.panel]=p; });
  var order = tabs.map(function(t){ return t.dataset.tab; });

  function show(key, save){
    tabs.forEach(function(t){
      var on = t.dataset.tab === key;
      t.setAttribute('aria-selected', on ? 'true':'false');
      if(on){ t.scrollIntoView({inline:'center', block:'nearest', behavior:'smooth'});
        document.documentElement.style.setProperty('--accent', t.dataset.color || '#ff4d4f'); }
    });
    Object.keys(panels).forEach(function(k){ panels[k].hidden = (k !== key); });
    if(save){ try{ localStorage.setItem('nd_tab', key); }catch(e){} }
    window.scrollTo(0,0);
  }
  tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.dataset.tab, true); }); });

  // 復元（無ければ先頭=トップ）
  var saved = null; try{ saved = localStorage.getItem('nd_tab'); }catch(e){}
  show((saved && order.indexOf(saved) >= 0) ? saved : order[0], false);

  // スワイプでタブ移動（スマートニュース風）
  var x0=null, y0=null;
  var main = document.querySelector('main');
  main.addEventListener('touchstart', function(e){
    x0=e.touches[0].clientX; y0=e.touches[0].clientY; }, {passive:true});
  main.addEventListener('touchend', function(e){
    if(x0===null) return;
    var dx=e.changedTouches[0].clientX-x0, dy=e.changedTouches[0].clientY-y0;
    if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.6){
      var cur = tabs.findIndex(function(t){ return t.getAttribute('aria-selected')==='true'; });
      var next = cur + (dx<0 ? 1 : -1);
      if(next>=0 && next<order.length) show(order[next], true);
    }
    x0=y0=null;
  }, {passive:true});
})();
"""


def _card_html(art: Article, summary: str, *, show_chip_for: str | None = None) -> str:
    parts = ["<a class='card' href='{}' target='_blank' rel='noopener'>".format(
        _esc(art.link))]
    parts.append(f"<div class='title'>{_esc(art.title)}</div>")
    if summary:
        parts.append(f"<div class='sum'>{_esc(summary)}</div>")
    foot = []
    if show_chip_for and show_chip_for in GENRES:
        g = GENRES[show_chip_for]
        foot.append(
            f"<span class='chip' style='background:{_color(show_chip_for)}'>"
            f"{g.emoji} {_esc(g.label)}</span>"
        )
    if art.published_label:
        foot.append(f"<span>{_esc(art.published_label)}</span>")
    foot.append("<span>NHK</span>")
    parts.append("<div class='foot'>" + "".join(foot) + "</div>")
    parts.append("</a>")
    return "".join(parts)


def render_html(
    genres_articles: dict[str, list[Article]],
    result: SummaryResult,
    config: dict,
    *,
    generated_at: dt.datetime,
) -> str:
    title = config.get("output", {}).get("title", "5分ニュースダイジェスト")
    # %-m はWindowsで使えないため fallback を用意
    try:
        date_label = generated_at.strftime("%-m月%-d日 %H:%M")
    except ValueError:
        date_label = generated_at.strftime("%m月%d日 %H:%M")

    present = [g for g in _ordered_genres(config) if genres_articles.get(g)]

    out: list[str] = []
    out.append("<!DOCTYPE html><html lang='ja'><head><meta charset='utf-8'>")
    out.append("<meta name='viewport' content='width=device-width, initial-scale=1'>")
    out.append("<meta name='theme-color' content='#ffffff'>")
    out.append(f"<title>{_esc(title)} {generated_at:%Y-%m-%d}</title>")
    out.append(f"<style>{_CSS}</style></head><body><div class='app'>")

    # ヘッダー
    out.append("<header><div class='row'>")
    out.append(f"<div class='brand'>📰 {_esc(title)}</div>")
    engine = "AI要約" if result.used_llm else "見出し+概要"
    out.append(f"<div class='date'>{_esc(date_label)}更新 ・ {engine}</div>")
    out.append("</div>")

    # タブ（トップ + 各カテゴリ）
    out.append("<nav class='tabs' role='tablist'>")
    out.append(
        "<button role='tab' data-tab='top' data-color='#ff4d4f'>⭐ トップ</button>"
    )
    for gkey in present:
        g = GENRES[gkey]
        out.append(
            f"<button role='tab' data-tab='{gkey}' data-color='{_color(gkey)}'>"
            f"{g.emoji} {_esc(g.label)}</button>"
        )
    out.append("</nav></header>")

    out.append("<main>")

    # --- トップパネル：今日のまとめ + 各カテゴリのトップ記事 ---
    out.append("<section class='panel' data-panel='top'>")
    if result.overall:
        out.append("<div class='summary'><h2>📌 今日のまとめ</h2>")
        out.append(_esc(result.overall))
        out.append("</div>")
    if present:
        out.append("<div class='sectionhead'>主要トピック</div>")
        for gkey in present:
            art = genres_articles[gkey][0]
            summ = _summary_for(gkey, 0, result, art.description)
            out.append(_card_html(art, summ, show_chip_for=gkey))
    else:
        out.append("<p class='empty'>新着ニュースを取得できませんでした。</p>")
    out.append("<p class='hint'>← タブをタップ／スワイプでカテゴリ切替 →</p>")
    out.append("</section>")

    # --- 各カテゴリパネル ---
    for gkey in present:
        articles = genres_articles[gkey]
        g = GENRES[gkey]
        out.append(f"<section class='panel' data-panel='{gkey}' hidden>")
        for i, art in enumerate(articles):
            summ = _summary_for(gkey, i, result, art.description)
            out.append(_card_html(art, summ))
        if not articles:
            out.append("<p class='empty'>新着なし</p>")
        out.append("</section>")

    out.append("</main>")
    out.append(
        "<footer>自動更新: 5分ニュースダイジェスト ・ 出典: NHKニュース<br>"
        "記事の著作権は各報道機関に帰属します。</footer>"
    )
    out.append(f"<script>{_JS}</script>")
    out.append("</div></body></html>")
    return "\n".join(out)


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
