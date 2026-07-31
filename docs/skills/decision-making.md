---
name: decision-making
purpose: 意思決定支援、優先順位付け、トレードオフ・ROI・リスク分析
status: Stable
version: 1.0.0
owner: Ethan
dependencies: Ethan / CEO / Guard
used_by: Ethan / Workflows
priority: high
tags: [decision, roi, risk, priority]
---

# Decision Making Skill

## Purpose

AI が意思決定支援を行い、Ion がより速く・より根拠ある判断をできるようにする能力。

この Skill は Role ではない。Ethan が必要に応じて選択し、既存の Rules / Workflows / RAG / Tools と組み合わせて使う再利用可能な能力である。

---

## When to Use

- 目的、成功条件、制約条件を明確化する。
- 意思決定フレームワークを選び、論点を整理する。
- 優先順位付けを行う。
- トレードオフを分析する。
- ROI を評価する。
- コスト・時間・品質を比較する。
- リスクを分析する。
- 代替案を提示する。
- 推奨案とその理由を説明する。
- 不確実性、未確認事項、追加検証が必要な点を明示する。

---

## Outputs

- 意思決定の目的と前提
- 判断基準と制約条件
- 比較対象となる選択肢
- コスト・時間・品質・ROI・リスクの比較
- 推奨案と理由
- 不確実性・未確認事項
- Ethan への引き継ぎ事項

---

## Guardrails

- 推測を事実として扱わない。
- 根拠を明示する。
- 複数案がある場合は比較する。
- 最終意思決定者は Ion であることを明示する。
- 重要な外部公開・個人情報・高リスク判断が含まれる場合は Guard の確認を挟む。

---

## Relationship to AGATHON OS

- `AGATHON_CONSTITUTION.md` と `AGENTS.md` を最優先する。
- Ethan の指揮命令系統を迂回しない。
- Ion の時間を増やし、Ion の最終判断を支えるために使う。
- 新しい役職を増やすのではなく、既存体制を強化する能力として使う。
- Business Development Skill が事業仮説を作る場面でも、この Skill は判断基準・比較・推奨理由の整理を担当する。

---

## Handoff Notes

- Skill 使用時は、事実・推論・未確認事項を分けて Ethan に渡す。
- 判断に使った根拠と比較軸を残す。
- Ion への最終報告は Ethan が統合して行う。
