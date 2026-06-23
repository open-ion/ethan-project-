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

from newsdigest.core import load_config
from newsdigest.notify import notify_from_file


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
        f"{config.get('output', {}).get('dir', 'site')}/digest.json"
    )

    print("== LINE配信 ==")
    notify_from_file(digest_path, config=config)
    return 0  # 設定不足でも 0 で抜ける（ワークフローを止めない）


if __name__ == "__main__":
    raise SystemExit(main())
