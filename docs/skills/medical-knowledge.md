---
name: medical-knowledge
purpose: 看護・医療知識整理、医療コンテンツ作成
status: Stable
version: 1.0.0
owner: Ethan
dependencies: Atlas / Sage / Guard
used_by: Ethan / Workflows
priority: high
tags: [medical, knowledge, guard]
---

# Medical Knowledge Skill

## Purpose

看護・医療知識の整理、医療コンテンツ作成を支援する能力。

この Skill は Role ではない。Ethan が必要に応じて選択し、既存の Rules / Workflows / RAG / Tools と組み合わせて使う再利用可能な能力である。

---

## When to Use

- 看護・医療トピックを学習しやすく整理する。
- 患者向け・学生向け・専門職向けに表現を調整する。
- 医療ニュースや資料の要点と注意点をまとめる。
- 医療コンテンツの根拠、限界、確認事項を明示する。

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

- 診断・治療判断は行わない。
- 医療判断は必ず人間の専門家確認を必須とする。
- 最新の医療情報は信頼できる一次情報・専門機関で確認する。
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
