# Skill: Research
## 情報収集・調査・根拠整理

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

A structured procedure for gathering, verifying, and organizing information from multiple sources into a clear, source-grounded output.

Research does not produce opinions — it produces facts, sources, and honest uncertainty assessments.

---

## When to Use

- Ion or Ethan asks "find out about X"
- A task requires background information before implementation begins
- Competing claims need to be evaluated against primary sources
- A decision depends on current, accurate data (market conditions, technical specs, regulations)
- News or events need context before summarization

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Research question | Yes | Clear statement of what needs to be found |
| Scope | Yes | How deep (quick scan / thorough review) |
| Source constraints | No | Preferred sources, excluded sources, date range |
| Output format | No | Summary, table, structured notes |
| Deadline | No | Time available for the research task |

---

## Outputs

| Output | Description |
|--------|-------------|
| Findings summary | Concise answer to the research question |
| Source list | Each claim linked to its source with URL or citation |
| Confidence assessment | HIGH / MEDIUM / LOW with reason |
| Gaps and open questions | What could not be confirmed |
| Recommended next step | If further research is needed, what specifically |

---

## Procedure

1. **Clarify the question.** Restate the research question in one sentence. If ambiguous, flag it before starting.
2. **Identify source types.** Determine which source categories apply: primary sources, official documentation, news, academic, community.
3. **Search broadly first.** Run multiple query angles. Do not stop at the first result.
4. **Triangulate.** Confirm key claims with at least two independent sources. Flag any single-source claims explicitly.
5. **Separate fact from inference.** Label each finding: FACT (directly sourced) / INFERENCE (reasoned from sources) / UNCONFIRMED (single source or uncertain).
6. **Assess confidence.** Rate overall confidence HIGH / MEDIUM / LOW with a one-line reason.
7. **Organize the output.** Lead with the direct answer, then supporting detail, then gaps.
8. **Report to Ethan.** Use the standard reporting format from [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md).

---

## Quality Checklist

- [ ] Every factual claim has a named source
- [ ] No claim is stated as fact without supporting source
- [ ] Competing or contradictory sources are noted, not hidden
- [ ] Confidence level is stated with a reason
- [ ] Gaps and unresolved questions are clearly marked
- [ ] Medical, financial, or legal content is flagged for extra caution
- [ ] Output is concise enough to read in under 5 minutes (unless deep research was requested)

---

## Related Rules

- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — report format to Ethan
- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — when Guard review is needed (e.g., medical/financial findings)
- [`AGATHON_CONSTITUTION.md`](../../AGATHON_CONSTITUTION.md) — accuracy and source-grounding as foundational values

---

## Example Usage

```
Ethan → Atlas: "AI agent framework の主要プレイヤーを調査して。スコープ：現在の主流3〜5件、根拠必須。"

Atlas uses Research Skill:
1. Research question: "Which AI agent frameworks are currently dominant?"
2. Scope: thorough review
3. Sources: official docs, recent tech news, GitHub stars/activity
4. Findings: LangChain, AutoGen, CrewAI, OpenAI Agents SDK — each with source and confidence
5. Gaps: "Market share data unavailable; using GitHub activity as proxy"
6. Confidence: MEDIUM (landscape changing rapidly)

Atlas → Ethan: report in reporting-policy format
Ethan → Ion: consolidated summary
```
