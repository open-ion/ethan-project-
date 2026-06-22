"""不動産探しAI — 自動物件検索エンジン.

条件を入れると「探す → 条件で絞る → 土地勘で評価 → 比較表」までを回す。
収集(search)はアダプタ式。今はJSON投入、将来SUUMO等の取得を足せる。
"""

__all__ = ["criteria", "enrich", "layout", "report", "search"]
