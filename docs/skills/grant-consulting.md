---
name: grant-consulting
purpose: 補助金・助成金リサーチ、申請支援、顧客ヒアリング
status: Stable
version: 1.0.0
owner: Ethan
dependencies: Atlas / Flow / Guard
used_by: Ethan / Workflows
priority: medium
tags: [grant, research, application]
---

# Grant Consulting Skill

## Purpose

補助金・助成金の調査、適合判断、申請準備を支援する能力。

この Skill は Role ではない。Ethan が必要に応じて選択し、既存の Rules / Workflows / RAG / Tools と組み合わせて使う再利用可能な能力である。

---

## When to Use

- 公募要領・対象経費・申請条件を整理する。
- 顧客ヒアリングから導入目的・課題・効果を明確化する。
- 申請書、事業計画、見積・体制資料のたたきを作る。
- IT導入補助金、AI導入支援、自治体助成金の候補を比較する。

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

- 制度の最新条件は必ず一次情報で確認する。
- 採択保証や法的・会計的断定をしない。
- 顧客の機密情報・個人情報は最小限に扱う。
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
