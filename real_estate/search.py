"""物件の収集 — アダプタ式.

収集元は差し替え可能にしてある。今は JSON 投入のみ。
将来 SUUMO / HOME'S / 各社サイトのアダプタを足すなら、
ListingSource を継承して fetch() を実装し、CLI から差し込む。

注意：実サイトの取得は各社の利用規約・robots を必ず確認すること。
公式API・データ提供・提携を優先し、グレーな収集に依存しない設計にする。
"""

import json
from abc import ABC, abstractmethod


class ListingSource(ABC):
    """物件ソースの共通インターフェース."""

    @abstractmethod
    def fetch(self) -> list[dict]:
        ...


class JsonFileSource(ListingSource):
    """JSON ファイルから物件を読む（収集アダプタの出力 or 手動投入）."""

    def __init__(self, path: str):
        self.path = path

    def fetch(self) -> list[dict]:
        with open(self.path, encoding="utf-8") as f:
            return json.load(f)


def load_listings(path: str) -> list[dict]:
    return JsonFileSource(path).fetch()
