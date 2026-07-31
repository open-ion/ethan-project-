---
name: agent-design
purpose: AI社員・サブエージェント設計、責任範囲、連携ルール定義
status: Stable
version: 1.0.0
owner: Ethan
dependencies: Ethan / COO / Guard
used_by: Ethan / Workflows
priority: high
tags: [agent-design, governance, coordination]
---

# Agent Design Skill

## Purpose

AI社員、サブエージェント、役割・責任範囲・連携ルールを設計する能力。

この Skill は Role ではない。Ethan が必要に応じて選択し、既存の Rules / Workflows / RAG / Tools と組み合わせて使う再利用可能な能力である。

---

## When to Use

- 目的、入力、出力、判断範囲を定義する。
- 既存 Role / Rules / Workflows / RAG / Tools で代替できるか確認する。
- 責任境界、エスカレーション、Guard確認条件を設計する。
- Ethan を中心にした連携フローへ統合する。

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

- Skill と Role を混同しない。
- Ethan を迂回する報告線を作らない。
- 新役職追加は role-creation-policy の条件を満たす場合のみ。
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
