"""設定読み込みとダイジェスト生成のオーケストレーション。"""

from __future__ import annotations

import datetime as dt
import json
import os
from pathlib import Path

from . import render
from .sources import DEFAULT_GENRE_ORDER, GENRES, Article, collect_genre
from .summarize import summarize

DEFAULT_CONFIG = {
    "genres": DEFAULT_GENRE_ORDER,
    "max_items_per_genre": 5,
    "summarize": {
        "enabled": True,
        # 安価・高速な Haiku を既定に。多数記事の日次要約に最適。
        # 高精度が欲しければ "claude-opus-4-8" に変更可。
        "model": "claude-haiku-4-5",
        "max_items_to_summarize": 5,
    },
    "output": {
        "dir": "apps/news",
        "title": "5分ニュースダイジェスト",
        "timezone": "Asia/Tokyo",
    },
}


def load_config(path: str | os.PathLike | None) -> dict:
    """config.json を読み込む。無ければ既定値。部分指定もマージ。"""
    config = json.loads(json.dumps(DEFAULT_CONFIG))  # deep copy
    if path and Path(path).exists():
        user = json.loads(Path(path).read_text(encoding="utf-8"))
        config = _deep_merge(config, user)
    return config


def _deep_merge(base: dict, override: dict) -> dict:
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(base.get(key), dict):
            base[key] = _deep_merge(base[key], value)
        else:
            base[key] = value
    return base


def _now(config: dict) -> dt.datetime:
    tzname = config.get("output", {}).get("timezone", "Asia/Tokyo")
    try:
        from zoneinfo import ZoneInfo
        return dt.datetime.now(ZoneInfo(tzname))
    except Exception:
        return dt.datetime.now(dt.timezone.utc)


def build_digest(config: dict, *, fetcher=None) -> dict:
    """設定に従って各ジャンルを取得・要約し、出力に必要なデータを返す。"""
    selected = [g for g in (config.get("genres") or DEFAULT_GENRE_ORDER)
                if g in GENRES]
    max_items = int(config.get("max_items_per_genre", 5))

    genres_articles: dict[str, list[Article]] = {}
    for gkey in selected:
        print(f"- 取得中: {GENRES[gkey].label}")
        kwargs = {"max_items": max_items}
        if fetcher is not None:
            kwargs["fetcher"] = fetcher
        genres_articles[gkey] = collect_genre(GENRES[gkey], **kwargs)

    total = sum(len(v) for v in genres_articles.values())
    print(f"- 記事 {total} 件。要約します…")
    result = summarize(genres_articles, config)

    generated_at = _now(config)
    return {
        "genres_articles": genres_articles,
        "summary": result,
        "generated_at": generated_at,
        "total": total,
    }


def write_outputs(config: dict, digest: dict) -> list[Path]:
    """データ（digest.json）と日付アーカイブを書き出す。

    アプリ本体（PWAシェル）は apps/news/ に原本としてコミット済みなので、
    ここではアプリが読み込むデータと静的アーカイブだけを生成する。
    """
    out_dir = Path(config.get("output", {}).get("dir", "apps/news"))
    out_dir.mkdir(parents=True, exist_ok=True)

    ga = digest["generated_at"]
    html_doc = render.render_html(
        digest["genres_articles"], digest["summary"], config, generated_at=ga
    )
    md_doc = render.render_markdown(
        digest["genres_articles"], digest["summary"], config, generated_at=ga
    )

    written: list[Path] = []

    datestr = ga.strftime("%Y-%m-%d")
    # 日付アーカイブはJS不要の静的ページ（パーマリンク／フォールバック）
    archive = out_dir / f"digest-{datestr}.html"
    archive.write_text(html_doc, encoding="utf-8")
    written.append(archive)

    md_path = out_dir / f"digest-{datestr}.md"
    md_path.write_text(md_doc, encoding="utf-8")
    written.append(md_path)

    # 配信（LINE等）用の構造化データ
    json_path = out_dir / "digest.json"
    json_path.write_text(
        json.dumps(_digest_to_dict(config, digest), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    written.append(json_path)

    return written


def _digest_to_dict(config: dict, digest: dict) -> dict:
    """配信用にダイジェストをJSONシリアライズ可能な辞書へ変換。"""
    ga = digest["generated_at"]
    result = digest["summary"]
    genres_out = []
    for gkey in (g for g in (config.get("genres") or DEFAULT_GENRE_ORDER)
                 if g in GENRES):
        articles = digest["genres_articles"].get(gkey, [])
        if not articles:
            continue
        items = []
        for i, art in enumerate(articles):
            items.append({
                "title": art.title,
                "link": art.link,
                "summary": result.by_id.get(f"{gkey}-{i}", art.description),
                "time": art.published_label,
            })
        genres_out.append({
            "key": gkey,
            "label": GENRES[gkey].label,
            "emoji": GENRES[gkey].emoji,
            "items": items,
        })
    return {
        "title": config.get("output", {}).get("title", "5分ニュースダイジェスト"),
        "generated_at": ga.isoformat(),
        "date_label": ga.strftime("%Y-%m-%d"),
        "overall": result.overall,
        "used_llm": result.used_llm,
        "genres": genres_out,
    }

