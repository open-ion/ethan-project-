---
name: uiux-design
purpose: 画面設計、UX、カスタマイズ導線、意思決定支援デザイン
status: Stable
version: 1.0.0
owner: Ethan
dependencies: Vision / Forge / Atlas
used_by: Ethan / Workflows
priority: medium
tags: [uiux, design, presentation]
---

# UI/UX Design Skill

## Purpose

画面設計、ユーザー体験、カスタマイズ導線、意思決定を早くするデザイン能力。

この Skill は Role ではない。Ethan が必要に応じて選択し、既存の Rules / Workflows / RAG / Tools と組み合わせて使う再利用可能な能力である。

---

## When to Use

- ユーザーの目的、文脈、迷いを整理する。
- 画面構成、情報優先度、操作導線を設計する。
- カスタマイズ導線と初期設定の負担を減らす。
- 意思決定を早くする表示・比較・要約を作る。

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

- 見た目より意思決定速度を優先する。
- 実装前に情報設計とユーザー価値を確認する。
- 医療・金融など高リスク表示は Guard 確認を挟む。
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
