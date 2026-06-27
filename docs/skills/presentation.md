# Skill: Presentation
## スライド・プレゼン資料作成

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

A structured procedure for creating presentation materials — slide decks, pitch documents, and visual summaries — that communicate clearly and move the audience to understand or act.

A good presentation delivers one clear message per slide. Everything else is noise.

---

## When to Use

- Building a product pitch or investor deck
- Creating an internal strategy review presentation
- Summarizing research or project results in visual form
- Preparing a demo or walkthrough for Ion or stakeholders
- Converting a written report into a presentation format

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Objective | Yes | What must the audience think, feel, or do after seeing this? |
| Audience | Yes | Who is in the room (investors, team, client, Ion) |
| Content / data | No | Research, numbers, or material to include |
| Slide count target | No | e.g., 10 slides, 5 minutes |
| Tone | No | Formal / startup / minimal / detailed |
| Format output | No | Markdown outline / slide text / structured notes |

---

## Outputs

| Output | Description |
|--------|-------------|
| Slide outline | Ordered list of slides with title and key message per slide |
| Slide content | Text, talking points, and data per slide |
| Speaker notes | Optional: what to say out loud for each slide |
| Source list | Where data points and claims come from |
| Revision flags | Anything uncertain or requiring Ion's review |

---

## Procedure

1. **Define the single objective.** Write one sentence: "After this presentation, the audience will ___." Everything in the deck must serve that sentence.
2. **Know the audience.** What do they already know? What do they want? What would make them say yes?
3. **Build the narrative arc.** Problem → insight → solution → evidence → call to action. Adjust for context.
4. **Draft the outline first.** One slide title + one key message per slide. No prose yet. Review the flow before writing details.
5. **Write slide content.** One idea per slide. Prefer visuals or short bullets over dense paragraphs.
6. **Add data and sources.** Every figure, statistic, or claim needs a source. No fabricated numbers.
7. **Add speaker notes if requested.** Keep notes conversational, not a script.
8. **Check for consistency.** Terminology, claims, and design references should be consistent across all slides.
9. **Flag anything uncertain.** If a data point is estimated or unconfirmed, mark it explicitly.
10. **Report to Ethan.** Deliver outline or full content with source notes and revision flags.

---

## Quality Checklist

- [ ] Single clear objective stated before writing begins
- [ ] One key message per slide (no slide tries to say two things)
- [ ] No fabricated statistics, quotes, or data
- [ ] All data points are sourced
- [ ] Narrative flows from problem to solution to action
- [ ] Audience-appropriate language and depth
- [ ] No unnecessary jargon or unexplained acronyms
- [ ] Uncertain or estimated figures are flagged
- [ ] Speaker notes (if included) add value beyond what's on the slide

---

## Related Rules

- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — report format to Ethan
- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — Guard review for public or external presentations
- [`AGATHON_CONSTITUTION.md`](../../AGATHON_CONSTITUTION.md) — accuracy and honesty in all outputs

---

## Example Usage

```
Ethan → Vision + Atlas: "AGATHON LABS の製品ピッチデッキを作って。
                         対象：潜在投資家。5分・10スライド以内。
                         ポイント：Ethanダッシュボード・朝のAIニュースダイジェスト・
                         差別化（SmartNewsとの違い）。"

Atlas uses Research Skill → gathers market data, competitor info
Vision uses Presentation Skill:
1. Objective: investor says "I want to know more" after 5 minutes
2. Audience: early-stage investors, tech-savvy
3. Arc: Problem (information overload) → Insight (5-min decision tool) → Product → Traction → Ask
4. Outline drafted: 10 slides, each with one key message
5. Data sourced from Atlas research output
6. Fabricated numbers: none; estimated market size flagged as estimate

Vision + Atlas → Ethan: deck outline + content + source list
Ethan → Ion: final review before external use
```
