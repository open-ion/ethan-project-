---
name: mobile-development
purpose: iOS・モバイルアプリ、ニュースアプリ改善、パーソナライズ
status: Stable
version: 1.0.0
owner: Ethan
dependencies: Forge / Vision / Guard
used_by: Ethan / Workflows
priority: medium
tags: [mobile, ios, ux]
---

# Mobile Development Skill

## Purpose

iOS・モバイルアプリ開発、ニュースアプリ改善、パーソナライズ機能を支援する能力。

この Skill は Role ではない。Ethan が必要に応じて選択し、既存の Rules / Workflows / RAG / Tools と組み合わせて使う再利用可能な能力である。

---

## When to Use

- モバイル画面、状態、通知、オフライン体験を設計する。
- ニュースアプリの読みやすさ・保存・パーソナライズを改善する。
- UI/UX設計と実装タスクを接続する。
- 小さく検証できるモバイルMVPへ分解する。

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

- 大きな技術スタック変更は事前確認する。
- 通知・位置情報・個人設定はプライバシーを優先する。
- アクセシビリティとレスポンシブ品質を確認する。
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
