# Skill: Writing
## 文書・コンテンツ作成

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

A structured procedure for producing written content — documents, summaries, reports, emails, announcements, and long-form text — that is accurate, clear, and appropriate for its audience.

Writing serves communication. Every output should reduce the reader's effort, not add to it.

---

## When to Use

- Drafting documents, READMEs, or specifications
- Writing summaries, reports, or digests
- Composing emails or messages on Ion's behalf
- Creating announcements, blog posts, or public content
- Translating complex technical content into readable prose
- Producing the daily AI news digest for Ion

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Topic / purpose | Yes | What the document is about and why it exists |
| Audience | Yes | Who will read it (Ion, team, public, technical, non-technical) |
| Tone | No | Formal / casual / direct / warm |
| Language | No | Japanese / English / both |
| Length target | No | One-pager / 500 words / full report |
| Source material | No | Facts, data, or research to draw from |
| Format constraints | No | Markdown / plain text / email / slide notes |

---

## Outputs

| Output | Description |
|--------|-------------|
| Draft document | Completed written content ready for review |
| Source references | Links or citations where claims are based on source material |
| Uncertainty flags | Any claims that rely on inference rather than confirmed fact |
| Revision notes | What the author was uncertain about or left open |

---

## Procedure

1. **Confirm the purpose.** State in one sentence what this document must accomplish for its reader.
2. **Identify the audience.** Write to one specific person or group. Adjust vocabulary, length, and detail level accordingly.
3. **Gather source material.** If facts are needed, complete the Research Skill first. Never fabricate figures, names, or events.
4. **Draft the structure.** Decide on outline before prose: sections, flow, key points.
5. **Write the draft.** Lead with the most important point. Cut throat-clearing introductions.
6. **Separate fact from inference.** Do not present inferences as established fact. Label uncertainty explicitly when relevant.
7. **Check accuracy.** Verify that every specific claim is either sourced or flagged as inference.
8. **Review for clarity.** Read the draft as the target audience. Remove anything that slows comprehension.
9. **Flag content for Guard if needed.** Medical, financial, or legal content triggers extended review (see [`docs/rules/quality-gate.md`](../rules/quality-gate.md)).
10. **Report to Ethan.** Deliver the draft with source notes and any revision flags.

---

## Quality Checklist

- [ ] Purpose is clear from the first paragraph
- [ ] Audience is correctly addressed (language, depth, tone)
- [ ] No fabricated facts, statistics, or quotes
- [ ] Factual claims are sourced or flagged as inference
- [ ] No unnecessary filler, preamble, or repetition
- [ ] Medical, financial, or legal advice is appropriately hedged and flagged
- [ ] Japanese content, if included, is accurate and natural
- [ ] Links work and point to correct sources

---

## Related Rules

- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — report format to Ethan
- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — Guard review for sensitive content
- [`AGATHON_CONSTITUTION.md`](../../AGATHON_CONSTITUTION.md) — accuracy, honesty, and source-grounding

---

## Example Usage

```
Ethan → Sage: "Ion 向けの AI ニュースダイジェストを書いて。今日の重要ニュース3本。
               各ニュースに：一言要約・なぜ重要か・忙しい人向けの結論・リンク。"

Sage uses Writing Skill:
1. Purpose: give Ion 5-minute morning news briefing
2. Audience: Ion (busy, wants decisions not just information)
3. Source material: Nova's collected articles for today
4. Structure: opening line + 3 news items in required format
5. Draft written in Japanese, concise, mobile-readable
6. No medical/financial advice; source links included
7. Flagged: one item is single-source, confidence marked MEDIUM

Sage → Ethan: draft + flags
Ethan → Ion: final digest delivered
```
