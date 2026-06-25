#!/usr/bin/env python3
"""5分ニュースダイジェスト — エントリーポイント。

使い方:
    python digest.py                 # config.json に従って site/ に出力
    python digest.py --config my.json
    python digest.py --print-markdown # 標準出力にMarkdownを表示（保存もする）

ANTHROPIC_API_KEY を環境変数に設定すると Claude による要約が有効になる。
無い場合は各記事のRSS概要をそのまま使う（要約なしでも必ず動く）。
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from newsdigest.core import build_digest, load_config, write_outputs
from newsdigest.render import render_markdown


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="5分ニュースダイジェストを生成")
    parser.add_argument(
        "--config", default="config.json", help="設定ファイル（既定: config.json）"
    )
    parser.add_argument(
        "--print-markdown", action="store_true", help="Markdownを標準出力にも表示"
    )
    args = parser.parse_args(argv)

    config = load_config(args.config)

    print("== 5分ニュースダイジェスト 生成開始 ==")
    digest = build_digest(config)

    if digest["total"] == 0:
        print(
            "[error] 記事を1件も取得できませんでした。"
            "ネットワーク制限がないか確認してください。",
            file=sys.stderr,
        )
        # 空でもページは出す（落とさない）

    written = write_outputs(config, digest)
    print("== 出力完了 ==")
    for path in written:
        print(f"  - {path}")

    if args.print_markdown:
        print("\n" + "=" * 50 + "\n")
        print(render_markdown(
            digest["genres_articles"], digest["summary"], config,
            generated_at=digest["generated_at"],
        ))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
