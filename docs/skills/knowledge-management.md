---
name: knowledge-management
purpose: AGATHON LABS全体の知識資産整理・維持
status: Stable
version: 1.0.0
owner: Ethan
dependencies: Sage / Echo / Guard
used_by: Ethan / RAG / Workflows
priority: high
tags: [knowledge, notion, drive, github, rag]
---

# Knowledge Management Skill

## Purpose

AGATHON LABS 全体の知識資産を整理・維持し、Ethan が必要な情報を素早く再利用できるようにする能力。

この Skill は Role ではない。Ethan が必要に応じて選択し、既存の Rules / Workflows / RAG / Tools と組み合わせて使う再利用可能な能力である。

---

## Scope

- NotebookLM
- Notion
- Google Drive
- GitHub
- RAG
- Markdown
- 議事録
- 設計書
- 会話ログ

---

## When to Use

- 情報を整理する。
- タグ付け、分類、階層化を行う。
- 長い資料や会話ログを要約する。
- 重複情報を検出し、整理する。
- 古い情報を更新候補として特定する。
- 関連リンクを整理する。
- 情報の信頼度を管理する。
- 情報源を管理する。
- ナレッジ検索と RAG 利用を最適化する。

---

## Outputs

- 整理対象と情報源一覧
- 分類・タグ・保存先の提案
- 要約と重要ポイント
- 重複・古い情報・矛盾の指摘
- 更新・アーカイブ候補
- RAG / Markdown / Notion / Drive / GitHub への反映方針
- Ethan への引き継ぎ事項

---

## Guardrails

- 情報源を保持する。
- 削除よりアーカイブを優先する。
- 最新版を優先する。
- RAG との整合性を保つ。
- 個人情報・機密情報の保存先と共有範囲を確認する。
- 重要な外部公開・個人情報・高リスク判断が含まれる場合は Guard の確認を挟む。

---

## Relationship to AGATHON OS

- `AGATHON_CONSTITUTION.md` と `AGENTS.md` を最優先する。
- Ethan の指揮命令系統を迂回しない。
- RAG Engineering Skill が検索拡張生成の設計を担当するのに対し、この Skill は知識資産そのものの整理・維持・信頼度管理を担当する。
- Sage が知識を構造化する場面でも、この Skill は保存先、タグ、更新、重複排除、情報源管理を補助する。
- 新しい役職を増やすのではなく、既存体制を強化する能力として使う。

---

## Handoff Notes

- Skill 使用時は、情報源、最新版、アーカイブ判断、RAG 反映可否を Ethan に渡す。
- 古い情報や矛盾は削除せず、原則としてアーカイブ候補として提示する。
- Ion への最終報告は Ethan が統合して行う。
