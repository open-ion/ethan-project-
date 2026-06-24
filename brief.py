#!/usr/bin/env python3
"""定期ブリーフィング（予定済み）を実行する。

briefings.json のスケジュールに従い、今日該当するブリーフィングを
Claude + Web検索で生成して <output.dir>/briefings.json に書き出す。
--notify を付けると、生成できたブリーフィングを LINE に配信する。

使い方:
    python brief.py                 # 生成して site/briefings.json を出力
    python brief.py --force         # スケジュール無視で全件生成（テスト用）
    python brief.py --notify        # 生成後、該当分をLINE配信

環境変数:
    ANTHROPIC_API_KEY   AIブリーフィング生成に必要（無ければ本文は空でスキップ）
    LINE_CHANNEL_ACCESS_TOKEN / LINE_TO   --notify 時に必要
    SITE_URL            予定済みページのURL（LINEに添付）
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path

from newsdigest.briefings import load_briefings, run_briefings
from newsdigest.core import load_config
from newsdigest.notify import build_briefing_line_text, send_line


def _now(config: dict) -> dt.datetime:
    tzname = config.get("output", {}).get("timezone", "Asia/Tokyo")
    try:
        from zoneinfo import ZoneInfo
        return dt.datetime.now(ZoneInfo(tzname))
    except Exception:
        return dt.datetime.now(dt.timezone.utc)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="定期ブリーフィングを実行")
    parser.add_argument("--config", default="config.json")
    parser.add_argument("--briefings", default="briefings.json")
    parser.add_argument("--force", action="store_true", help="全件生成（予定無視）")
    parser.add_argument("--notify", action="store_true", help="生成後にLINE配信")
    parser.add_argument("--notify-only", dest="notify_only", action="store_true",
                        help="生成せず、既存の briefings.json を読んでLINE配信のみ")
    parser.add_argument("--generate", dest="generate", action="store_true", default=True)
    parser.add_argument("--no-generate", dest="generate", action="store_false",
                        help="本文生成せず予定だけ書き出す")
    args = parser.parse_args(argv)

    config = load_config(args.config)
    out_dir = Path(config.get("output", {}).get("dir", "site"))
    out_dir.mkdir(parents=True, exist_ok=True)

    now = _now(config)
    out_path = out_dir / "briefings.json"

    # 配信のみ：既存の briefings.json を読んで送るだけ（再生成しない）
    if args.notify_only:
        print("== 予定済みブリーフィング（LINE配信のみ） ==")
        if not out_path.exists():
            print(f"  [warn] {out_path} がありません。配信スキップ")
            return 0
        try:
            existing = json.loads(out_path.read_text(encoding="utf-8"))
        except (ValueError, OSError):
            print("  [warn] briefings.json を読めません。配信スキップ")
            return 0
        _notify(existing.get("briefings", []), config)
        return 0

    briefings = load_briefings(args.briefings)

    print("== 予定済みブリーフィング ==")
    if not briefings:
        print("  [info] briefings.json にブリーフィングがありません")
    results = run_briefings(briefings, now, generate=args.generate, force=args.force)

    for r in results:
        state = "生成" if r["due"] and args.generate else "予定のみ"
        ok = "" if r["ok"] is None else (" ✓" if r["ok"] else f" ✗({r['error']})")
        print(f"  - {r['emoji']} {r['title']} [{r['schedule_label']}] {state}{ok}")

    payload = {"generated_at": now.isoformat(), "briefings": results}
    out_path = out_dir / "briefings.json"
    out_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"  出力: {out_path}")

    if args.notify:
        _notify(results, config)

    return 0


def _notify(results: list[dict], config: dict) -> None:
    token = os.environ.get("LINE_CHANNEL_ACCESS_TOKEN")
    to = os.environ.get("LINE_TO")
    if not token or not to:
        print("  [info] LINE未設定。配信スキップ")
        return
    site_url = os.environ.get("SITE_URL", "")
    sent = 0
    for r in results:
        if r["due"] and r["ok"]:  # 生成できた該当分だけ配信
            text = build_briefing_line_text(r, site_url=site_url)
            if send_line(text, token=token, to=to):
                sent += 1
    print(f"  [info] LINE配信 {sent} 件")


if __name__ == "__main__":
    raise SystemExit(main())
