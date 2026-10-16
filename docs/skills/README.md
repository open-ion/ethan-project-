# AGATHON LABS — Skills

Skills は Ethan が状況に応じて呼び出す、再利用可能な専門能力である。  
Role（役職）ではなく、Rules / Workflows / RAG / Tools と連携して使う実行能力として定義する。

---

## Skills の位置づけ

- `AGATHON_CONSTITUTION.md` と `AGENTS.md` を最優先する。
- Skills は Ethan の判断で選択・組み合わせる。
- Skills は AI 役職・AI 社員ではない。
- Skills は既存の Rules / Workflows / RAG / Tools と矛盾しない範囲で使う。
- 重要な外部公開、個人情報、医療・法務・財務など高リスク領域では Guard の確認を挟む。

---

## Skill Design Principles

- Skill は Role ではない。
- Skill は再利用可能な能力である。
- Skill は独立性を保つ。
- Skill は責任範囲を限定する。
- Skill は Workflow から呼び出される。
- Skill は Tool を直接管理しない。
- Skill は Rule に従う。

---

## Skill Discovery Rules

1. Ethan は最初にタスクを分類する。
   - 例: Research / Planning / Writing / Coding / Presentation / Sales / Meeting / Decision / Knowledge / Marketing / Medical / Business / Mobile / RAG / Agent Design
2. Ethan は該当カテゴリの Skill のみ読み込む。
3. 必要に応じて複数 Skill を組み合わせる。
   - 例: Business Development + Decision Making + Marketing
4. Rules が Skill より優先される。
5. Workflow は Skill を利用する。
6. RAG は Knowledge 取得専用として扱う。
7. Tool は実行専用として扱う。
8. Skill 同士が重複する場合は、責任範囲が最も狭い Skill を優先する。
9. Role 追加前に、Skill 追加で解決できないか必ず確認する。

---

## Skill Metadata Standard

今後追加・更新する全 Skill は、先頭に以下の共通メタデータを持つ。

```yaml
---
name: skill-slug
purpose: この Skill が解決する目的
status: Stable | Experimental | Deprecated
version: 1.0.0
owner: Ethan
dependencies: Rules / related Skills / RAG / Tools / Workflows
used_by: Ethan / Workflows / RAG / Tools
priority: high | medium | low
tags: [category, domain, capability]
---
```

必須項目:

- `purpose`: Skill の目的。
- `dependencies`: 依存する Rules / Skills / Workflows / RAG / Tools。
- `Guardrails`: 本文内に必ず含める安全・品質・責任境界。

---

## Skill Growth Policy

能力拡張は以下の順序で検討する。

```text
Rules
  ↓
Skills
  ↓
Workflows
  ↓
RAG
  ↓
Tools
  ↓
Role
```

新しい Role を作る前に、必ず以下で解決できないか確認する。

- Skill 追加または既存 Skill の改善
- Workflow 追加または既存 Workflow の改善
- RAG の情報源・検索設計の改善
- Tool 追加または既存 Tool の改善

Role 追加は、`docs/rules/role-creation-policy.md` の条件を満たし、Ethan が Ion 判断へ上げる場合のみ検討する。

---

## Skill Versioning

各 Skill は `version` と `status` を管理する。

| Status | 意味 | 運用 |
| --- | --- | --- |
| `Stable` | 通常運用で使える Skill | README の一覧に掲載し、Workflow から呼び出せる |
| `Experimental` | 検証中の Skill | 使用時に不確実性と検証観点を明示する |
| `Deprecated` | 廃止予定または置換済みの Skill | 新規利用を避け、代替 Skill を案内する |

バージョン更新の目安:

- Patch: 誤字修正、説明補足、リンク更新。
- Minor: Outputs / Guardrails / dependencies の追加。
- Major: 目的・責任範囲・利用条件の変更。

---

## Knowledge Management Integration

`knowledge-management` Skill は、AGATHON LABS の知識資産を整理・維持する中心 Skill として扱う。

対象:

- NotebookLM
- Notion
- Google Drive
- GitHub
- Markdown
- Meeting Notes
- Conversation Logs
- RAG に投入する情報源

主な責任:

- 情報源を保持する。
- 最新版を優先する。
- 削除よりアーカイブを優先する。
- RAG との整合性を保つ。
- 情報の信頼度、重複、古さ、リンク切れを管理する。

---

## Decision Making Integration

`decision-making` Skill は、Ion の最終判断を支える比較・評価・推奨理由の整理を担当する。

主な責任:

- ROI
- Trade-off
- Priority
- Risk
- Alternative
- Evidence
- Uncertainty

意思決定支援では、事実・推論・未確認事項を分け、複数案がある場合は比較し、最終意思決定者が Ion であることを明示する。

---

## Skills 一覧

| Skill | 主な用途 | 連携しやすい機能 |
| --- | --- | --- |
| [`grant-consulting`](grant-consulting.md) | 補助金・助成金リサーチ、申請支援、顧客ヒアリング | Atlas / Flow / Guard |
| [`business-development`](business-development.md) | 新規事業設計、MVP設計、顧客課題・収益モデル整理 | CEO / COO / Atlas |
| [`decision-making`](decision-making.md) | 意思決定支援、優先順位付け、トレードオフ・ROI・リスク分析 | Ethan / CEO / Guard |
| [`marketing`](marketing.md) | 集客導線、LP・広告・投稿文、ターゲット・訴求整理 | Vision / Atlas / Flow |
| [`agent-design`](agent-design.md) | AI社員・サブエージェント設計、責任範囲・連携ルール定義 | Ethan / COO / Guard |
| [`rag-engineering`](rag-engineering.md) | ナレッジベース、RAG、情報源管理、根拠整理 | Sage / Atlas / Guard |
| [`knowledge-management`](knowledge-management.md) | NotebookLM / Notion / Drive / GitHub / RAG などの知識資産整理・維持 | Sage / Echo / Guard |
| [`mobile-development`](mobile-development.md) | iOS・モバイルアプリ、ニュースアプリ改善、パーソナライズ | Forge / Vision / Guard |
| [`uiux-design`](uiux-design.md) | 画面設計、UX、カスタマイズ導線、意思決定支援デザイン | Vision / Forge / Atlas |
| [`medical-knowledge`](medical-knowledge.md) | 看護・医療知識整理、医療コンテンツ作成 | Atlas / Sage / Guard |

---

## Skill 選択基準

1. Ion の時間を増やすかを確認する。
2. Role 追加ではなく Skill で解決できるかを優先する。
3. 必要に応じて複数 Skill を組み合わせる。
4. 根拠・出典・未確認事項を明示する。
5. リスクがある場合は Guard に確認を依頼する。

---

## Handoff Notes

- 本ディレクトリは Domain-Specific Skills の初期セットである。
- 今後 Skill を追加する場合も、役職ではなく再利用可能な能力として定義する。
- Workflows / RAG / Tools が作成された場合は、各 Skill の連携先を更新する。
