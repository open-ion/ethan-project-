"""LINE 配信（任意）。

毎朝、生成済みダイジェスト（site/digest.json）の要点を LINE に push する。
LINE Notify は2025年3月で終了したため、現行の LINE Messaging API を使う。

必要な環境変数:
  LINE_CHANNEL_ACCESS_TOKEN  Messaging API チャネルのアクセストークン
  LINE_TO                    送信先のユーザーID / グループID
  SITE_URL                   ダイジェスト全文ページのURL（任意・リンクとして添付）

いずれかが無ければ何もせずスキップする（処理は落とさない）。
外部依存なし（標準ライブラリの urllib のみ）。
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from pathlib import Path

_PUSH_ENDPOINT = "https://api.line.me/v2/bot/message/push"
_TEXT_LIMIT = 4900  # LINEテキストは5000字まで。余裕をもって切る。


def load_digest_json(path: str | os.PathLike) -> dict | None:
    p = Path(path)
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (ValueError, OSError):
        return None


def build_line_text(
    data: dict,
    *,
    site_url: str = "",
    max_headlines_per_genre: int = 1,
) -> str:
    """ダイジェストJSONから、LINEに送る1通分のテキストを組み立てる。

    全カテゴリのトップ見出しを並べた「ダイジェストの予告」。
    本文は site_url のページで読む導線。
    """
    title = data.get("title", "News Brief")
    date_label = _format_date(data.get("date_label", ""))

    lines: list[str] = [f"📰 {title}", date_label, ""]

    overall = (data.get("overall") or "").strip()
    if overall:
        lines.append("📌 今日のまとめ")
        lines.append(overall)
        lines.append("")

    for genre in data.get("genres", []):
        emoji = genre.get("emoji", "")
        label = genre.get("label", "")
        items = genre.get("items", [])[:max_headlines_per_genre]
        if not items:
            continue
        lines.append(f"{emoji} {label}")
        for it in items:
            lines.append(f"・{it.get('title','')}")
        lines.append("")

    if site_url:
        lines.append("▼ 全文・カテゴリ別はこちら")
        lines.append(site_url)

    text = "\n".join(lines).strip()
    if len(text) > _TEXT_LIMIT:
        text = text[:_TEXT_LIMIT].rstrip() + "…"
    return text


def _format_date(iso_or_date: str) -> str:
    # "2026-06-24" → "6月24日"
    try:
        y, m, d = iso_or_date.split("-")[:3]
        return f"{int(m)}月{int(d)}日"
    except (ValueError, AttributeError):
        return iso_or_date


def build_briefing_line_text(entry: dict, *, site_url: str = "") -> str:
    """1件のブリーフィング結果をLINEテキストにする。"""
    emoji = entry.get("emoji", "📌")
    title = entry.get("title", "")
    lines = [f"{emoji} {title}"]
    label = entry.get("schedule_label", "")
    if label:
        lines.append(label)
    lines.append("")
    body = (entry.get("body") or "").strip()
    if body:
        lines.append(body)
    else:
        lines.append("（本文を生成できませんでした）")
    if site_url:
        lines.append("")
        lines.append("▼ 予定済み一覧")
        lines.append(site_url)
    text = "\n".join(lines).strip()
    if len(text) > _TEXT_LIMIT:
        text = text[:_TEXT_LIMIT].rstrip() + "…"
    return text


def send_line(text: str, *, token: str, to: str, timeout: int = 20) -> bool:
    """LINE Messaging API でテキストを push。成功で True。"""
    payload = json.dumps({
        "to": to,
        "messages": [{"type": "text", "text": text}],
    }).encode("utf-8")
    req = urllib.request.Request(
        _PUSH_ENDPOINT,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return 200 <= resp.status < 300
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8", "replace")[:300]
        print(f"  [warn] LINE送信失敗 HTTP {err.code}: {body}")
        return False
    except (urllib.error.URLError, OSError) as err:
        print(f"  [warn] LINE送信失敗: {err}")
        return False


def notify_from_file(
    digest_path: str | os.PathLike,
    *,
    config: dict | None = None,
) -> bool:
    """digest.json と環境変数から LINE 配信を実行する。

    設定不足なら False を返してスキップ（例外は投げない）。
    """
    token = os.environ.get("LINE_CHANNEL_ACCESS_TOKEN")
    to = os.environ.get("LINE_TO")
    if not token or not to:
        print("  [info] LINE未設定（LINE_CHANNEL_ACCESS_TOKEN / LINE_TO）。配信スキップ")
        return False

    data = load_digest_json(digest_path)
    if not data:
        print(f"  [warn] {digest_path} が読めません。LINE配信スキップ")
        return False

    cfg = (config or {}).get("deliver", {}).get("line", {})
    if cfg.get("enabled", True) is False:
        print("  [info] LINE配信は config で無効化されています")
        return False

    site_url = os.environ.get("SITE_URL", "") or (
        (config or {}).get("output", {}).get("site_url", "")
    )
    text = build_line_text(
        data,
        site_url=site_url,
        max_headlines_per_genre=int(cfg.get("max_headlines_per_genre", 1)),
    )
    ok = send_line(text, token=token, to=to)
    print("  [info] LINE配信完了" if ok else "  [warn] LINE配信に失敗しました")
    return ok
