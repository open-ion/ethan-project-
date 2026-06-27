# Skills Index
## AGATHON LABS Skill Library

---

## Authority Hierarchy

| 優先順位 | ドキュメント | 役割 |
|----------|-------------|------|
| 1st | `AGATHON_CONSTITUTION.md` | 思想・権限の最高位文書（最優先） |
| 2nd | `AGENTS.md` | 組織・連携・運用ルール |
| 3rd | `docs/rules/` | 具体的な運用ルール |
| 4th | `docs/skills/` このファイル | 再利用可能な能力定義 |

---

## What Are Skills?

Skills are reusable capabilities that any AI employee can invoke when needed.

**Skills are NOT roles.** A Skill is a defined procedure — a checklist, a format, a workflow — that any AI can pick up and execute. Skills do not belong to one AI. They do not create new positions in the org chart.

Before adding a new AI role, always ask: can this be solved with a Skill? See [`docs/rules/role-creation-policy.md`](../rules/role-creation-policy.md).

---

## Skill List

| Skill | File | 概要 |
|-------|------|------|
| Research | [`research.md`](research.md) | 情報収集・調査・根拠整理 |
| Writing | [`writing.md`](writing.md) | 文書・コンテンツ作成 |
| Coding | [`coding.md`](coding.md) | コード実装・レビュー・デバッグ |
| Presentation | [`presentation.md`](presentation.md) | スライド・プレゼン資料作成 |
| Sales | [`sales.md`](sales.md) | 提案・説得・セールスコンテンツ |
| Planning | [`planning.md`](planning.md) | タスク分解・計画・優先順位付け |
| Meeting | [`meeting.md`](meeting.md) | 議事録・アジェンダ・会議ファシリテーション |

---

## How to Use a Skill

1. Ethan receives a request from Ion.
2. Ethan identifies which Skill(s) apply.
3. Ethan routes the task to the relevant AI employee, specifying which Skill to use.
4. The AI employee follows the Skill's Procedure and Quality Checklist.
5. The AI employee reports the result back to Ethan.
6. Ethan consolidates and reports to Ion.

Multiple Skills can be combined for complex tasks. Skills do not change the command chain.

---

## Skill vs. Rule vs. Role

| Type | Purpose | Lives in |
|------|---------|----------|
| Role | Ongoing responsibility; permanent AI employee | Root `*.md` persona files |
| Rule | How all AI must behave; enforced at all times | `docs/rules/` |
| Skill | How to do a specific task; invoked when needed | `docs/skills/` |

---

## Related Documents

- [`docs/rules/role-creation-policy.md`](../rules/role-creation-policy.md) — why Skills come before new roles
- [`AGENTS.md`](../../AGENTS.md) — organization and operational rules
- [`AGATHON_CONSTITUTION.md`](../../AGATHON_CONSTITUTION.md) — highest-priority governance document
