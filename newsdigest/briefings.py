"""定期ブリーフィング（ChatGPTの「予定済み」相当）。

テーマと頻度を briefings.json に定義しておくと、スケジュールに従って
Claude + Web検索で最新情報を要約生成し、アプリ表示・LINE配信に回す。

- スケジューラ: is_due() で「今日やるべきか」を判定（毎日／平日／毎週◯曜）。
- 生成: source="ai" は Claude の web_search ツールで最新情報を確認して要約。
- フォールバック: APIキーや anthropic が無い／失敗しても落とさず ok=False を返す。

外部依存は anthropic（要約時のみ）。スケジューラ部分は標準ライブラリのみ。
"""

from __future__ import annotations

import datetime as dt
import json
import os
from pathlib import Path

_WEEKDAYS = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}
_WD_JP = ["月", "火", "水", "木", "金", "土", "日"]

_BRIEFING_DEFAULTS = {
    "emoji": "📌",
    "source": "ai",
    "enabled": True,
    "model": "claude-opus-4-8",
    "max_tokens": 3000,
}


# ---------------------------------------------------------------------------
# 読み込み
# ---------------------------------------------------------------------------

def load_briefings(path: str | os.PathLike) -> list[dict]:
    p = Path(path)
    if not p.exists():
        return []
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (ValueError, OSError):
        return []
    items = data.get("briefings", []) if isinstance(data, dict) else []
    result = []
    for raw in items:
        b = dict(_BRIEFING_DEFAULTS)
        b.update(raw)
        b.setdefault("schedule", {"freq": "daily"})
        result.append(b)
    return result


# ---------------------------------------------------------------------------
# スケジュール
# ---------------------------------------------------------------------------

def schedule_label(briefing: dict) -> str:
    sch = briefing.get("schedule", {})
    freq = sch.get("freq", "daily")
    time = sch.get("time", "")
    if freq == "daily":
        base = "毎日"
    elif freq == "weekdays":
        base = "平日"
    elif freq == "weekly":
        days = sch.get("days", [])
        jp = "・".join(_WD_JP[_WEEKDAYS[d]] for d in days if d in _WEEKDAYS)
        base = f"毎週{jp}曜" if jp else "毎週"
    else:
        base = freq
    if time:
        return f"{base} {time}".strip()
    return f"{base}・随時".strip()  # time なし = 速報（毎便）


def parse_slot_hours(slots) -> list[int]:
    """["07:00","14:00","21:00"] → [7,14,21]。"""
    hours = []
    for s in slots or []:
        h = _hour(s)
        if h is not None:
            hours.append(h)
    return hours


def _hour(time_str) -> int | None:
    try:
        return int(str(time_str).split(":")[0])
    except (ValueError, AttributeError):
        return None


def current_slot(now: dt.datetime, slot_hours: list[int]) -> int | None:
    """now に最も近いスロット時刻を返す（cron遅延を吸収）。"""
    if not slot_hours:
        return None
    return min(slot_hours, key=lambda s: abs(now.hour - s))


def is_due(briefing: dict, now: dt.datetime, *, slot_hours: list[int] | None = None) -> bool:
    """now の実行便でこのブリーフィングを生成すべきか。

    曜日（毎日／平日／毎週◯曜）に加え、slot_hours が与えられた場合は時刻スロットも判定:
    - briefing に time があれば、その時刻に最も近いスロットの便でのみ実行。
    - time が無ければ「速報」扱いで毎便実行。
    slot_hours が None のときは曜日のみで判定（手動実行・テスト用）。
    """
    if not briefing.get("enabled", True):
        return False
    sch = briefing.get("schedule", {})
    freq = sch.get("freq", "daily")
    wd = now.weekday()
    if freq == "daily":
        day_ok = True
    elif freq == "weekdays":
        day_ok = wd < 5
    elif freq == "weekly":
        days = sch.get("days", [])
        day_ok = wd in {_WEEKDAYS[d] for d in days if d in _WEEKDAYS}
    else:
        day_ok = False
    if not day_ok:
        return False

    if not slot_hours:
        return True  # スロット情報なし → 曜日のみ
    bh = _hour(sch.get("time"))
    if bh is None:
        return True  # 速報：毎便
    return current_slot(now, slot_hours) == min(
        slot_hours, key=lambda s: abs(bh - s))


# ---------------------------------------------------------------------------
# 生成（Claude + Web検索）
# ---------------------------------------------------------------------------

_SYSTEM = (
    "あなたは、忙しい人のための定期ブリーフィングの編集者です。"
    "Web検索で最新かつ信頼できる情報を確認し、日本語で簡潔にまとめます。"
    "憶測は避け、事実ベースで。前提知識のない読者にも分かる平易な言葉で書いてください。"
)


def _web_search_tool(model: str) -> dict:
    # 新しい dynamic filtering 版は Opus 4.x / Sonnet 4.6 のみ。それ以外は基本版。
    m = model.lower()
    if m.startswith("claude-opus-4") or m.startswith("claude-fable") \
            or m == "claude-sonnet-4-6":
        return {"type": "web_search_20260209", "name": "web_search"}
    return {"type": "web_search_20250305", "name": "web_search"}


def generate_ai_briefing(briefing: dict, now: dt.datetime) -> dict:
    """1件のAIブリーフィングを生成して {ok, body, error} を返す。"""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return {"ok": False, "body": "", "error": "ANTHROPIC_API_KEY 未設定"}
    try:
        import anthropic
    except ImportError:
        return {"ok": False, "body": "", "error": "anthropic 未インストール"}

    model = briefing.get("model", "claude-opus-4-8")
    instruction = briefing.get("instruction", "今日の主要トピック")
    user = (
        f"次のテーマで「{now:%Y年%-m月%-d日}」のブリーフィングを作成してください。\n"
        f"テーマ: {instruction}\n\n"
        "出力形式:\n"
        "1) 冒頭に3行以内の全体まとめ\n"
        "2) その後、重要トピックを最大5件、"
        "「・見出し — 1〜2文の説明（出典: URL）」の箇条書きで\n"
        "必ずWeb検索で最新情報を確認してから書くこと。"
    )

    try:
        client = anthropic.Anthropic()
        messages = [{"role": "user", "content": user}]
        tool = _web_search_tool(model)
        resp = None
        for _ in range(5):  # pause_turn（サーバ側ツールの継続）に対応
            resp = client.messages.create(
                model=model,
                max_tokens=int(briefing.get("max_tokens", 3000)),
                system=_SYSTEM,
                messages=messages,
                tools=[tool],
            )
            if resp.stop_reason == "pause_turn":
                messages = [
                    {"role": "user", "content": user},
                    {"role": "assistant", "content": resp.content},
                ]
                continue
            break
        body = "".join(
            b.text for b in resp.content if getattr(b, "type", None) == "text"
        ).strip()
        # 出典URLが引用メタデータ（citations / web_search結果）で返る場合に備え、
        # 本文に現れていないURLを末尾の「出典」に補う。失敗しても本文は返す。
        body = _append_missing_sources(body, resp.content)
        if not body:
            return {"ok": False, "body": "", "error": "本文が空でした"}
        return {"ok": True, "body": body, "error": None}
    except Exception as err:  # API失敗を握りつぶして配信全体を止めない
        return {"ok": False, "body": "", "error": str(err)}


def _collect_source_urls(content) -> list[str]:
    """応答ブロックから出典URLを集める（citations と web_search 結果）。"""
    urls: list[str] = []
    seen: set[str] = set()

    def add(u):
        if u and isinstance(u, str) and u.startswith("http") and u not in seen:
            seen.add(u)
            urls.append(u)

    for block in content or []:
        # text ブロックに付く citations メタデータ
        for cit in getattr(block, "citations", None) or []:
            add(getattr(cit, "url", None) or (cit.get("url") if isinstance(cit, dict) else None))
        # web_search_tool_result ブロック内の検索結果
        inner = getattr(block, "content", None)
        if isinstance(inner, list):
            for item in inner:
                add(getattr(item, "url", None) or (item.get("url") if isinstance(item, dict) else None))
    return urls


def _append_missing_sources(body: str, content) -> str:
    try:
        urls = [u for u in _collect_source_urls(content) if u not in body]
    except Exception:
        return body
    if not urls:
        return body
    lines = "\n".join(f"・{u}" for u in urls[:5])
    return f"{body}\n\n出典:\n{lines}"


# ---------------------------------------------------------------------------
# まとめて実行
# ---------------------------------------------------------------------------

def run_briefings(
    briefings: list[dict],
    now: dt.datetime,
    *,
    generate: bool = True,
    force: bool = False,
    slot_hours: list[int] | None = None,
    generator=generate_ai_briefing,
) -> list[dict]:
    """有効なブリーフィングそれぞれの結果（表示用）を返す。

    - due（今便で該当）かつ generate=True のとき本文を生成。
    - それ以外は本文なし（アプリでは予定だけ表示）。
    """
    results: list[dict] = []
    for b in briefings:
        if not b.get("enabled", True):
            continue
        due = force or is_due(b, now, slot_hours=slot_hours)
        entry = {
            "id": b.get("id", ""),
            "title": b.get("title", ""),
            "emoji": b.get("emoji", "📌"),
            "source": b.get("source", "ai"),
            "schedule_label": schedule_label(b),
            "instruction": b.get("instruction", ""),
            "due": due,
            "generated_at": now.isoformat(),
            "body": "",
            "ok": None,
            "error": None,
        }
        if due and generate and b.get("source") == "ai":
            gen = generator(b, now)
            entry["body"] = gen.get("body", "")
            entry["ok"] = gen.get("ok")
            entry["error"] = gen.get("error")
        results.append(entry)
    return results
