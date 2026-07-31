---
name: rag-engineering
purpose: ナレッジベース、RAG、情報源管理、根拠整理
status: Stable
version: 1.0.0
owner: Ethan
dependencies: Sage / Atlas / Guard
used_by: Ethan / Workflows / RAG
priority: high
tags: [rag, retrieval, knowledge]
---

# RAG Engineering Skill

## Purpose

ナレッジベース、検索拡張生成、情報源管理、回答根拠を設計する能力。

この Skill は Role ではない。Ethan が必要に応じて選択し、既存の Rules / Workflows / RAG / Tools と組み合わせて使う再利用可能な能力である。

---

## When to Use

- 情報源の範囲、更新頻度、信頼度を整理する。
- 検索単位、メタデータ、引用形式を設計する。
- 回答で根拠・推論・未確認事項を分離する。
- RAG品質評価と改善ループを設計する。

---

## Outputs

- 目的と前提
- 整理した論点
- 推奨アクション
- 根拠・参照元
- 未確認事項・リスク
- Ethan への引き継ぎ事項

---

## Guardrails

- 機密情報・個人情報の混入を避ける。
- 出典不明の情報を根拠として扱わない。
- RAGは判断代行ではなく根拠提示の仕組みとして使う。
- 重要な外部公開・個人情報・高リスク判断が含まれる場合は Guard の確認を挟む。

---

## Relationship to AGATHON OS

- `AGATHON_CONSTITUTION.md` と `AGENTS.md` を最優先する。
- Ethan の指揮命令系統を迂回しない。
- 新しい役職を増やすのではなく、既存体制を強化する能力として使う。
- 必要に応じて Atlas / Sage / Forge / Vision / Flow / Guard などの既存機能と連携する。

---

## Handoff Notes

- Skill 使用時は、何を根拠に判断したかを Ethan に渡す。
- 未確認事項は TODO として明記する。
- Ion への最終報告は Ethan が統合して行う。
