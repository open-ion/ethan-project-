---
name: business-development
purpose: 新規事業設計、MVP設計、顧客課題・収益モデル整理
status: Stable
version: 1.0.0
owner: Ethan
dependencies: CEO / COO / Atlas
used_by: Ethan / Workflows
priority: high
tags: [business, planning, mvp]
---

# Business Development Skill

## Purpose

新規事業の仮説、MVP、顧客課題、収益モデルを整理する能力。

この Skill は Role ではない。Ethan が必要に応じて選択し、既存の Rules / Workflows / RAG / Tools と組み合わせて使う再利用可能な能力である。

---

## When to Use

- 顧客セグメントと未充足課題を定義する。
- MVPの範囲、検証指標、学習計画を設計する。
- 価格・収益モデル・チャネルを比較する。
- 次に検証すべき最小アクションへ落とし込む。

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

- 大規模実装の前に仮説検証を優先する。
- 市場事実と推測を分ける。
- 会社方針の変更は Ethan 経由で Ion 判断に上げる。
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
