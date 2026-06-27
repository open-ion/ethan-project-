# Skill: Planning
## タスク分解・計画・優先順位付け

---

## Authority Hierarchy

| 優先順位 | ドキュメント | 役割 |
|----------|-------------|------|
| 1st | `AGATHON_CONSTITUTION.md` | 思想・権限の最高位文書（最優先） |
| 2nd | `AGENTS.md` | 組織・連携・運用ルール |
| 3rd | `docs/rules/` | 具体的な運用ルール |
| 4th | このSkillファイル | 実行手順 |

---

## Purpose

A structured procedure for decomposing goals into executable tasks, ordering them by priority, identifying dependencies, and producing a clear action plan that can be handed off and tracked.

Planning converts ambiguous intentions into specific, sequenced steps with owners and expected outputs.

---

## When to Use

- Ion gives a goal that needs to be broken into work
- A project is starting and the execution path is unclear
- Multiple tasks exist and priority order must be decided
- A deadline or constraint requires capacity to be sequenced
- Ethan needs to route work across multiple AI employees
- A previous plan needs to be updated after a blocker or scope change

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Goal or objective | Yes | What success looks like in concrete terms |
| Constraints | No | Deadline, budget, dependencies, blockers |
| Resources available | No | Which AI employees or tools are available |
| Existing work | No | What is already done; what must not change |
| Priority criteria | No | What matters most (speed / quality / cost / risk) |

---

## Outputs

| Output | Description |
|--------|-------------|
| Task breakdown | Ordered list of specific, actionable tasks |
| Dependencies | Which tasks must complete before others begin |
| Owners | Which AI employee or role handles each task |
| Expected outputs | What each task produces when done |
| Risks | What could block or delay the plan |
| First action | Immediate next step, ready to execute |

---

## Procedure

1. **Restate the goal as a concrete outcome.** "The goal is done when ___." Vague goals produce vague plans.
2. **List all required tasks.** Brain-dump every task needed to reach the outcome. Do not order yet.
3. **Identify dependencies.** Which tasks block others? Mark the dependency chain. Parallel work that can run simultaneously is valuable.
4. **Assign owners.** Match each task to the AI employee best suited to it by role and Skill. Do not assign tasks to non-existent roles.
5. **Order by priority and dependency.** Critical path first. Tasks with no blockers can run in parallel.
6. **Estimate scope (not time).** Label each task: Quick (< 1 step) / Medium (2-5 steps) / Large (requires its own planning).
7. **Identify risks.** What is most likely to break this plan? What is the mitigation?
8. **Define the first action.** Make the plan executable immediately by specifying exactly what happens next.
9. **Report to Ethan.** Deliver the plan in a format that Ethan can use to route work to AI employees.

---

## Quality Checklist

- [ ] Goal is stated as a concrete, verifiable outcome
- [ ] Every task is specific enough to execute (not "work on X")
- [ ] Dependencies are identified and the critical path is clear
- [ ] No task is assigned to a role that does not exist
- [ ] Parallel tasks are identified and flagged (efficiency gain)
- [ ] At least one risk is named, even if small
- [ ] First action is immediately executable
- [ ] Plan does not gold-plate: no tasks beyond what the goal requires

---

## Related Rules

- [`docs/rules/command-chain.md`](../rules/command-chain.md) — how Ethan routes tasks to AI employees
- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — report format to Ethan
- [`docs/rules/role-creation-policy.md`](../rules/role-creation-policy.md) — do not create new roles to fill planning gaps

---

## Example Usage

```
Ion → Ethan: "メール配信機能を実装してほしい"

Ethan uses Planning Skill:
1. Goal: "morning digest emails sent to Ion's inbox on schedule"
2. Tasks identified:
   - Forge: integrate email provider (Resend or SMTP)
   - Flow: wire email trigger into daily automation
   - Guard: review email delivery for privacy risks
   - Forge: add delivery failure logging
3. Dependencies: email provider → automation trigger → Guard review → logging
4. Owners: Forge (implementation), Flow (automation), Guard (review)
5. Risks: email API rate limits; LINE not in scope for this step
6. First action: Forge starts with email provider selection and .env config

Ethan → AI employees: routed tasks
Ethan → Ion: "メール配信機能のプランを組みました。4ステップ・Forgeから着手します。"
```
