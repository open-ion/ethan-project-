"""パース・絞り込み・出力のオフラインテスト（標準ライブラリのみ）。

ネットワークに出ずに、固定のRSSフィクスチャと擬似フェッチャで検証する。
実行: python -m unittest discover -s tests
"""

from __future__ import annotations

import datetime as dt
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from newsdigest import render  # noqa: E402
from newsdigest.sources import (  # noqa: E402
    GENRES,
    Article,
    collect_genre,
    parse_feed,
)
from newsdigest.summarize import SummaryResult, summarize  # noqa: E402

FIXTURE = (Path(__file__).parent / "fixtures" / "sample_nhk.xml").read_bytes()


def fake_fetcher(_url: str) -> bytes:
    return FIXTURE


class ParseTest(unittest.TestCase):
    def test_parse_basic(self):
        articles = parse_feed(FIXTURE, source="nhk", genre_key="economy")
        self.assertEqual(len(articles), 3)
        first = articles[0]
        self.assertIn("消費者物価指数", first.title)
        self.assertTrue(first.link.startswith("https://"))
        self.assertIsNotNone(first.published)

    def test_html_tags_stripped(self):
        articles = parse_feed(FIXTURE)
        third = next(a for a in articles if "決算" in a.title)
        self.assertNotIn("<b>", third.description)
        self.assertIn("増益", third.description)

    def test_sorted_newest_first(self):
        arts = collect_genre(GENRES["economy"], max_items=5, fetcher=fake_fetcher)
        times = [a.published for a in arts if a.published]
        self.assertEqual(times, sorted(times, reverse=True))

    def test_keyword_filter_prices(self):
        # prices ジャンルは物価関連キーワードで絞り込まれる
        arts = collect_genre(GENRES["prices"], max_items=10, fetcher=fake_fetcher)
        titles = " ".join(a.title for a in arts)
        self.assertIn("消費者物価指数", titles)  # 物価/値上げ を含む
        # 「決算 増益」だけの記事はキーワードに当たらず除外される
        self.assertNotIn("決算 増益が相次ぐ", titles)

    def test_max_items(self):
        arts = collect_genre(GENRES["economy"], max_items=2, fetcher=fake_fetcher)
        self.assertEqual(len(arts), 2)


class RenderTest(unittest.TestCase):
    def _sample(self):
        arts = collect_genre(GENRES["economy"], max_items=3, fetcher=fake_fetcher)
        return {"economy": arts}

    def test_render_html_offline(self):
        data = self._sample()
        # APIキーなし → フォールバック要約
        result = summarize(data, {"summarize": {"enabled": False}})
        self.assertIsInstance(result, SummaryResult)
        self.assertFalse(result.used_llm)
        html_doc = render.render_html(
            data, result, {"genres": ["economy"]},
            generated_at=dt.datetime(2026, 6, 23, 9, 0),
        )
        self.assertIn("<html", html_doc)
        self.assertIn("消費者物価指数", html_doc)
        self.assertIn("経済", html_doc)

    def test_render_markdown_offline(self):
        data = self._sample()
        result = summarize(data, {"summarize": {"enabled": False}})
        md = render.render_markdown(
            data, result, {"genres": ["economy"]},
            generated_at=dt.datetime(2026, 6, 23, 9, 0),
        )
        self.assertIn("# 5分ニュースダイジェスト", md)
        self.assertIn("[消費者物価指数", md)

    def test_empty_genre_renders(self):
        # 記事ゼロでも落ちない
        result = SummaryResult(overall="", by_id={}, used_llm=False)
        html_doc = render.render_html(
            {"sports": []}, result, {"genres": ["sports"]},
            generated_at=dt.datetime(2026, 6, 23, 9, 0),
        )
        self.assertIn("新着なし", html_doc)


if __name__ == "__main__":
    unittest.main()
