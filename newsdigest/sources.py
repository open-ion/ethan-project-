"""ニュースソース（RSS）の定義・取得・パース。

外部依存なし。標準ライブラリの urllib + xml.etree だけで動く。
本番（GitHub Actions など）ではそのまま動作する。社内ネットワークなど
egress が制限された環境ではフィード取得が 403 になることがあるが、
その場合でもパース部分はテストできるよう設計している。

ニュース元は NHK の公開RSS（カテゴリ別・標準RSS 2.0）。
"""

from __future__ import annotations

import dataclasses
import datetime as dt
import email.utils
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from typing import Iterable

# ---------------------------------------------------------------------------
# ジャンル定義
# ---------------------------------------------------------------------------
# key            : config.json で指定する識別子
# label          : 表示名（日本語）
# emoji          : 見出しアイコン
# feeds          : 取得するRSSのURL（複数可・順に結合）
# keywords       : （任意）このキーワードを含む記事だけに絞り込む。
#                  「物価」のように既存カテゴリの一部を切り出すのに使う。


@dataclasses.dataclass(frozen=True)
class Genre:
    key: str
    label: str
    emoji: str
    feeds: tuple[str, ...]
    keywords: tuple[str, ...] = ()


# NHKニュース カテゴリ別RSS
_NHK = "https://www.nhk.or.jp/rss/news/{}.xml"

GENRES: dict[str, Genre] = {
    "trend": Genre(
        "trend", "トレンド・主要", "🔥",
        (_NHK.format("cat0"),),
    ),
    "politics": Genre(
        "politics", "政治", "🏛️",
        (_NHK.format("cat4"),),
    ),
    "economy": Genre(
        "economy", "経済", "💹",
        (_NHK.format("cat5"),),
    ),
    "prices": Genre(
        "prices", "物価・暮らしのお金", "🛒",
        (_NHK.format("cat5"), _NHK.format("cat2")),
        keywords=(
            "物価", "価格", "値上げ", "値下げ", "インフレ", "デフレ",
            "円安", "円高", "賃上げ", "賃金", "家計", "光熱費", "電気料金",
            "ガソリン", "食品", "料金", "コスト", "消費", "金利",
        ),
    ),
    "medical": Genre(
        "medical", "医療・科学", "🩺",
        (_NHK.format("cat3"),),
    ),
    "sports": Genre(
        "sports", "スポーツ", "⚽",
        (_NHK.format("cat7"),),
    ),
    "world": Genre(
        "world", "国際", "🌏",
        (_NHK.format("cat6"),),
    ),
    "society": Genre(
        "society", "社会", "📰",
        (_NHK.format("cat1"),),
    ),
}

DEFAULT_GENRE_ORDER = [
    "trend", "politics", "economy", "prices", "medical", "sports", "world",
]

_USER_AGENT = (
    "Mozilla/5.0 (compatible; NewsDigestBot/1.0; "
    "+https://github.com/open-ion/ethan-project-)"
)


@dataclasses.dataclass
class Article:
    title: str
    link: str
    description: str
    published: dt.datetime | None
    source: str
    genre_key: str

    @property
    def published_label(self) -> str:
        if not self.published:
            return ""
        local = self.published.astimezone()
        return local.strftime("%m/%d %H:%M")


# ---------------------------------------------------------------------------
# 取得
# ---------------------------------------------------------------------------

def fetch_url(url: str, *, timeout: int = 20, retries: int = 3) -> bytes:
    """RSSのバイト列を取得。失敗時は指数バックオフでリトライ。"""
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": _USER_AGENT})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except (urllib.error.URLError, TimeoutError, OSError) as err:
            last_err = err
            if attempt < retries - 1:
                import time
                time.sleep(2 ** attempt)
    raise RuntimeError(f"取得に失敗しました: {url} ({last_err})")


# ---------------------------------------------------------------------------
# パース
# ---------------------------------------------------------------------------

def _localname(tag: str) -> str:
    """名前空間プレフィックスを除いたタグ名を返す。"""
    return tag.rsplit("}", 1)[-1].lower()


def _find_text(item: ET.Element, names: Iterable[str]) -> str:
    wanted = {n.lower() for n in names}
    for child in item:
        if _localname(child.tag) in wanted:
            # itertext() で子要素（生のHTMLタグなど）配下のテキストも結合する。
            text = "".join(child.itertext()).strip()
            if text:
                return text
    return ""


def _parse_date(raw: str) -> dt.datetime | None:
    if not raw:
        return None
    try:
        parsed = email.utils.parsedate_to_datetime(raw)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed
    except (TypeError, ValueError):
        return None


def parse_feed(data: bytes, *, source: str = "", genre_key: str = "") -> list[Article]:
    """RSS 2.0 / Atom のバイト列を Article のリストにする。"""
    try:
        root = ET.fromstring(data)
    except ET.ParseError:
        return []

    articles: list[Article] = []
    for item in root.iter():
        name = _localname(item.tag)
        if name not in ("item", "entry"):
            continue
        title = _find_text(item, ("title",))
        if not title:
            continue
        link = _find_text(item, ("link",))
        if not link:  # Atom は link が属性に入る場合がある
            for child in item:
                if _localname(child.tag) == "link":
                    link = child.attrib.get("href", "")
                    if link:
                        break
        description = _find_text(item, ("description", "summary", "content"))
        published = _parse_date(
            _find_text(item, ("pubdate", "published", "updated", "date"))
        )
        articles.append(
            Article(
                title=_clean(title),
                link=link.strip(),
                description=_clean(description),
                published=published,
                source=source,
                genre_key=genre_key,
            )
        )
    return articles


def _clean(text: str) -> str:
    """説明文の軽い整形（HTMLタグ・余分な空白の除去）。"""
    import html
    import re
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ---------------------------------------------------------------------------
# ジャンル単位の取得
# ---------------------------------------------------------------------------

def collect_genre(
    genre: Genre,
    *,
    max_items: int,
    fetcher=fetch_url,
) -> list[Article]:
    """1ジャンル分の記事を取得・整形して返す。

    fetcher を差し替えればテストやキャッシュ済みデータでも動く。
    """
    collected: list[Article] = []
    seen_titles: set[str] = set()
    for feed_url in genre.feeds:
        try:
            data = fetcher(feed_url)
        except Exception as err:  # 1フィードの失敗で全体を止めない
            print(f"  [warn] {genre.label}: {feed_url} 取得失敗 ({err})")
            continue
        for art in parse_feed(data, source=feed_url, genre_key=genre.key):
            if genre.keywords and not _matches_keywords(art, genre.keywords):
                continue
            key = art.title
            if key in seen_titles:
                continue
            seen_titles.add(key)
            collected.append(art)

    collected.sort(key=lambda a: a.published or dt.datetime.min.replace(
        tzinfo=dt.timezone.utc), reverse=True)
    return collected[:max_items]


def _matches_keywords(article: Article, keywords: tuple[str, ...]) -> bool:
    haystack = f"{article.title} {article.description}"
    return any(kw in haystack for kw in keywords)
