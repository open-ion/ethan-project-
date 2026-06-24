#!/usr/bin/env python3
"""生成済みダイジェストを LINE に配信する。

先に digest.py を実行して site/digest.json を作っておくこと。
GitHub Actions では Pages デプロイ後にこのスクリプトを実行する
（リンク先ページが確実に公開されてから通知するため）。

環境変数:
    LINE_CHANNEL_ACCESS_TOKEN  必須
    LINE_TO                    必須（送信先ユーザー/グループID）
    SITE_URL                   任意（全文ページURL）

未設定なら何もせず終了する（エラーにしない）。
"""

from __future__ import annotations

import argparse
import datetime as dt

from newsdigest.briefings import current_slot, parse_slot_hours
from newsdigest.core import load_config
from newsdigest.notify import notify_from_file


def _now(config: dict) -> dt.datetime:
    tzname = config.get("output", {}).get("timezone", "Asia/Tokyo")
    try:
        from zoneinfo import ZoneInfo
        return dt.datetime.now(ZoneInfo(tzname))
    except Exception:
        return dt.datetime.now(dt.timezone.utc)


def _should_send_now(config: dict) -> bool:
    """ニュースのLINEを今便で送るか。

    deliver.line.news_at が設定されていれば、そのスロットの便だけ送る
    （既定 "07:00" = 朝のみ。1日3便でもニュースは朝1回に絞る）。
    null/空なら毎便送る。
    """
    news_at = config.get("deliver", {}).get("line", {}).get("news_at", "07:00")
    if not news_at:
        return True
    slot_hours = parse_slot_hours(
        config.get("schedule", {}).get("slots", ["07:00", "14:00", "21:00"])
    )
    if not slot_hours:
        return True
    target = parse_slot_hours([news_at])
    cur = current_slot(_now(config), slot_hours)
    return bool(target) and cur == min(slot_hours, key=lambda s: abs(target[0] - s))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ダイジェストをLINEへ配信")
    parser.add_argument("--config", default="config.json")
    parser.add_argument(
        "--digest", default=None,
        help="digest.json のパス（既定: <output.dir>/digest.json）",
    )
    args = parser.parse_args(argv)

    config = load_config(args.config)
    digest_path = args.digest or (
        f"{config.get('output', {}).get('dir', 'apps/news')}/digest.json"
    )

    print("== LINE配信 ==")
    if not _should_send_now(config):
        print("  [info] このスロットはニュースLINE対象外（news_at 設定）。スキップ")
        return 0
    notify_from_file(digest_path, config=config)
    return 0  # 設定不足でも 0 で抜ける（ワークフローを止めない）


if __name__ == "__main__":
    raise SystemExit(main())
