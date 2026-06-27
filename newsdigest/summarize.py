"""Claude による要約（任意）。

ANTHROPIC_API_KEY が無い・anthropic パッケージが入っていない・API呼び出しが
失敗した — いずれの場合も例外を投げず、RSSの説明文へ自動フォールバックする。
「寝ていても回る」ことが最優先なので、要約が無くてもダイジェストは必ず出る。

ニュースの「見出し+説明」を、ニュースに疎い人でも分かる平易な1〜2文に圧縮し、
さらに今日全体の3行サマリーを生成する。デフォルトは安価で速い Haiku 4.5。
日次バッチで多数の記事を要約する用途に最適。config.json の summarize.model で
"claude-opus-4-8" など他モデルにも変更できる。
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass

from .sources import Article

# 構造化出力のスキーマ。overall（全体3行）と items（記事ごとの1〜2文）。
_SCHEMA = {
    "type": "object",
    "properties": {
        "overall": {
            "type": "string",
            "description": "今日の世の中を3行・各40字以内でまとめた総括。",
        },
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "summary": {
                        "type": "string",
                        "description": "ニュースに疎い人向けの平易な1〜2文の要約。",
                    },
                },
                "required": ["id", "summary"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["overall", "items"],
    "additionalProperties": False,
}

_SYSTEM = (
    "あなたは、ニュースをほとんど見ない人のための要約者です。"
    "専門用語を避け、前提知識ゼロの読者が30秒で『何が起きたか』『なぜ気になるか』を"
    "つかめるように、各ニュースを平易な日本語1〜2文に圧縮してください。"
    "誇張せず、事実ベースで。固有名詞には軽い補足を添えても構いません。"
)


@dataclass
class SummaryResult:
    overall: str
    by_id: dict[str, str]
    used_llm: bool


def _is_enabled(config: dict) -> bool:
    return bool(config.get("summarize", {}).get("enabled", True))


def summarize(
    genres_articles: dict[str, list[Article]],
    config: dict,
) -> SummaryResult:
    """全ジャンルの記事をまとめて要約する。失敗時はフォールバック。"""
    if not _is_enabled(config):
        return _fallback(genres_articles, reason=None)

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _fallback(
            genres_articles,
            reason="ANTHROPIC_API_KEY 未設定のため要約をスキップ（RSS説明文を使用）",
        )

    try:
        import anthropic
    except ImportError:
        return _fallback(
            genres_articles,
            reason="anthropic 未インストールのため要約をスキップ",
        )

    scfg = config.get("summarize", {})
    model = scfg.get("model", "claude-haiku-4-5")
    per_genre = int(scfg.get("max_items_to_summarize", 5))

    # 記事に一意IDを振ってプロンプトを組む
    indexed: dict[str, Article] = {}
    lines: list[str] = []
    from .sources import GENRES
    for gkey, articles in genres_articles.items():
        if not articles:
            continue
        label = GENRES[gkey].label if gkey in GENRES else gkey
        lines.append(f"\n## {label}")
        for i, art in enumerate(articles[:per_genre]):
            aid = f"{gkey}-{i}"
            indexed[aid] = art
            desc = art.description[:200]
            lines.append(f"- id={aid} | 見出し: {art.title}\n  説明: {desc}")

    if not indexed:
        return _fallback(genres_articles, reason="対象記事なし")

    prompt = (
        "次のニュース一覧を要約してください。各 id について平易な1〜2文の要約を作り、"
        "最後に今日全体の総括（overall）を3行でまとめてください。\n"
        + "\n".join(lines)
    )

    try:
        client = anthropic.Anthropic()
        resp = client.messages.create(
            model=model,
            max_tokens=4000,
            system=_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
            output_config={"format": {"type": "json_schema", "schema": _SCHEMA}},
        )
        text = next(
            (b.text for b in resp.content if getattr(b, "type", None) == "text"),
            "",
        )
        data = json.loads(text)
    except Exception as err:  # API失敗・JSON不正など全部フォールバック
        return _fallback(
            genres_articles,
            reason=f"要約API失敗のためフォールバック ({err})",
        )

    by_id: dict[str, str] = {}
    for item in data.get("items", []):
        aid = item.get("id")
        summary = (item.get("summary") or "").strip()
        if aid in indexed and summary:
            by_id[aid] = summary

    # 取りこぼした記事は説明文で補完
    for aid, art in indexed.items():
        by_id.setdefault(aid, _shorten(art.description))

    overall = (data.get("overall") or "").strip()
    return SummaryResult(overall=overall, by_id=by_id, used_llm=True)


def _fallback(
    genres_articles: dict[str, list[Article]],
    *,
    reason: str | None,
) -> SummaryResult:
    if reason:
        print(f"  [info] {reason}")
    by_id: dict[str, str] = {}
    for gkey, articles in genres_articles.items():
        for i, art in enumerate(articles):
            by_id[f"{gkey}-{i}"] = _shorten(art.description)
    return SummaryResult(overall="", by_id=by_id, used_llm=False)


def _shorten(text: str, limit: int = 120) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[:limit].rstrip() + "…"
