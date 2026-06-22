"""エントリポイント.

    python -m real_estate.cli
    python -m real_estate.cli --config config/criteria.example.json \\
        --listings data/listings.sample.json --out report.md
"""

import argparse
import os

from . import criteria as crit
from . import enrich as enr
from . import report as rep
from . import search

_HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _default(path: str) -> str:
    return os.path.join(_HERE, path)


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="自動不動産検索エンジン")
    p.add_argument("--config", default=_default("config/criteria.example.json"))
    p.add_argument("--listings", default=_default("data/listings.sample.json"))
    p.add_argument("--market", default=_default("config/market.example.json"))
    p.add_argument("--out", default=None, help="出力先(.md)。未指定なら標準出力")
    args = p.parse_args(argv)

    criteria = crit.load_criteria(args.config)
    listings = search.load_listings(args.listings)
    market = enr.load_market(args.market)

    for x in listings:
        enr.enrich(x, market)

    hard = criteria.get("hard", {})
    passed, failed = crit.partition(listings, hard)
    crit.score(passed, criteria.get("soft", []))

    suggestions = []
    if len(passed) < 3:
        suggestions = crit.relax_suggestions(listings, hard)

    report = rep.build_report(passed, failed, criteria, suggestions)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"レポートを書き出した: {args.out}")
        print(f"合致 {len(passed)}件 / 除外 {len(failed)}件")
    else:
        print(report)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
