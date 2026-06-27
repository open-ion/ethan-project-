# Workflows Index
## AGATHON LABS Workflow Library

---

## Authority Hierarchy

| 優先順位 | ドキュメント | 役割 |
|----------|-------------|------|
| 1st | `AGATHON_CONSTITUTION.md` | 思想・権限の最高位文書（最優先） |
| 2nd | `AGENTS.md` | 組織・連携・運用ルール |
| 3rd | `docs/rules/` | 具体的な運用ルール |
| 4th | `docs/skills/` | 再利用可能な能力定義 |
| 5th | `docs/workflows/` このファイル | 繰り返し実行されるプロセス定義 |

---

## What Are Workflows?

Workflows are multi-step, repeatable processes that combine Skills and AI employee responsibilities into a defined sequence.

**Workflows are NOT roles.** A Workflow describes how a recurring task gets done — who does what, in what order, and how the result is handed off. Workflows do not create new positions.

**Workflows are NOT Skills.** A Skill is a single-purpose capability. A Workflow orchestrates multiple Skills (and multiple AI employees) toward a complete outcome.

---

## Workflow List

| Workflow | File | 概要 |
|----------|------|------|
| Morning News Digest | [`morning-digest.md`](morning-digest.md) | RSS収集 → AI要約 → ランキング → Ion配信の毎朝自動フロー |
| PR Review | [`pr-review.md`](pr-review.md) | コード変更 → Guard品質チェック → Ethanレビュー → Ion報告 |
| New Feature | [`new-feature.md`](new-feature.md) | Ion要望 → 計画 → 実装 → テスト → マージ → 報告 |

---

## How to Use a Workflow

1. Ethan receives a request that matches a known Workflow.
2. Ethan routes the Workflow to the appropriate AI employees at each step.
3. Each step uses the relevant Skill(s) defined in `docs/skills/`.
4. Each step's output becomes the next step's input.
5. The final output is consolidated by Ethan and reported to Ion.

---

## Workflow vs. Skill vs. Rule

| Type | Purpose | Recurrence | Lives in |
|------|---------|-----------|----------|
| Rule | How all AI must behave; enforced always | Permanent | `docs/rules/` |
| Skill | How to do a specific task; invoked when needed | On-demand | `docs/skills/` |
| Workflow | How a multi-step process runs; repeatable sequence | Recurring | `docs/workflows/` |

---

## Related Documents

- [`docs/skills/README.md`](../skills/README.md) — Skills used within Workflows
- [`docs/rules/role-creation-policy.md`](../rules/role-creation-policy.md) — Workflows before new roles
- [`AGENTS.md`](../../AGENTS.md) — organization and operational rules
- [`AGATHON_CONSTITUTION.md`](../../AGATHON_CONSTITUTION.md) — highest-priority governance
