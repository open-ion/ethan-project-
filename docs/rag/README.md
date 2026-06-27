# RAG Index
## AGATHON LABS Knowledge Base

---

## Authority Hierarchy

| 優先順位 | ドキュメント | 役割 |
|----------|-------------|------|
| 1st | `AGATHON_CONSTITUTION.md` | 思想・権限の最高位文書（最優先） |
| 2nd | `AGENTS.md` | 組織・連携・運用ルール |
| 3rd | `docs/rules/` | 具体的な運用ルール |
| 4th | `docs/skills/` | 再利用可能な能力定義 |
| 5th | `docs/workflows/` | 繰り返し実行されるプロセス定義 |
| 6th | `docs/rag/` このファイル | AI が参照する知識ベース |

---

## What Is RAG in AGATHON LABS?

RAG（Retrieval-Augmented Generation）は、AI が回答・判断・要約を生成する際に参照する**構造化された知識ベース**。

AGATHON LABS では RAG を「AI が常にアクセスできるコンテキスト情報の集積」として定義する。コードや手順ではなく、**ファクト・プロフィール・判断履歴・業界知識**を格納する。

**RAG はロールではない。** RAG ファイルを追加してもAI社員は増えない。既存のどのAI社員も必要に応じて RAG 情報を参照する。Echo が RAG の管理・更新を担当する。

---

## Knowledge Base Index

| File | 概要 | 担当 AI |
|------|------|---------|
| [`ion-profile.md`](ion-profile.md) | Ion のプロフィール・興味・価値観・判断傾向 | Echo |
| [`agathon-context.md`](agathon-context.md) | AGATHON LABS のプロジェクト文脈・状況・決定履歴 | Echo + Ethan |
| [`news-sources.md`](news-sources.md) | 信頼できるニュースソース・RSS フィード・品質基準 | Nova + Guard |

---

## How AI Employees Use RAG

1. Ethan receives a request from Ion.
2. Relevant RAG files are identified and included as context.
3. AI employees reference RAG content when generating summaries, plans, or responses.
4. RAG content is treated as factual reference — it is not overwritten during a task.
5. When RAG content needs updating, Echo updates the relevant file and reports to Ethan.

---

## RAG Update Policy

- RAG files are updated by Echo after Ion's preferences or decisions change.
- Significant updates require Ethan's acknowledgment before being applied.
- RAG files must not contain hallucinated or unverified information.
- Outdated entries are annotated with a date and "needs review" rather than deleted outright.

---

## RAG vs. Other Layers

| Layer | What it contains | When used |
|-------|-----------------|-----------|
| Rules | How AI must behave | Always enforced |
| Skills | How to do a task | Invoked on demand |
| Workflows | How a process runs | Triggered by event |
| RAG | What AI knows about context | Referenced during generation |
| Tools | What AI can call/execute | Invoked on demand |

---

## Related Documents

- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — Echo reports RAG updates to Ethan
- [`ECHO.md`](../../ECHO.md) — Echo's role as memory and RAG manager
- [`AGATHON_CONSTITUTION.md`](../../AGATHON_CONSTITUTION.md) — accuracy as a foundational value
