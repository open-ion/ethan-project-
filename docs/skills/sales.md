# Skill: Sales
## 提案・説得・セールスコンテンツ

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

A structured procedure for creating sales content, proposals, and persuasive communication that accurately represents what AGATHON LABS offers and moves a prospect toward a clear decision.

Sales is honest persuasion. The goal is a good match between what we offer and what the other person needs — not manipulation or overpromising.

---

## When to Use

- Writing a sales email or outreach message
- Creating a proposal or offer document
- Drafting landing page copy or product descriptions
- Preparing objection responses
- Building a pricing or plan comparison page
- Writing follow-up messages after a demo or call

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Target audience | Yes | Who is the prospect (individual, company, role) |
| Offer | Yes | What is being proposed or sold |
| Objective | Yes | What action should the prospect take |
| Pain points | No | What problem does the prospect have |
| Competitive context | No | What alternatives exist; how we differ |
| Tone | No | Direct / warm / professional / startup |
| Length / format | No | Email / landing page / one-pager / proposal |

---

## Outputs

| Output | Description |
|--------|-------------|
| Sales content draft | The email, proposal, copy, or document |
| Value proposition | One clear sentence on why this offer matters to this person |
| Objection map | Likely objections and how to address them |
| Call to action | Explicit next step for the prospect |
| Accuracy flags | Any claim that cannot be substantiated or is aspirational |

---

## Procedure

1. **Define the audience precisely.** Name the job title, concern, and goal of the person receiving this. Vague audiences produce vague copy.
2. **State the value proposition in one sentence.** Lead with the benefit, not the product. What does this person get?
3. **Connect to a real pain.** Identify one specific problem this person has. The offer should solve it. Do not invent problems.
4. **Write the content.** Lead with the value, then the evidence, then the action.
5. **Be accurate.** Every claim about the product, results, or capabilities must be true. Mark aspirational or future features as such.
6. **Add a clear call to action.** One CTA per message. What exactly should they do next?
7. **Anticipate objections.** Write out the top 3 objections and have a one-line answer to each.
8. **Check tone match.** Does this sound like something AGATHON LABS would say? Does it match the audience's context?
9. **Flag for Guard if needed.** If the content makes specific performance claims, pricing guarantees, or legal representations, request Guard review.
10. **Report to Ethan.** Deliver the draft with value proposition, objection map, and any accuracy flags.

---

## Quality Checklist

- [ ] Value proposition is clear in the first two sentences
- [ ] Audience is specific (not "everyone" or "businesses")
- [ ] No fabricated testimonials, case studies, or metrics
- [ ] Future or aspirational claims are labeled as such
- [ ] Single clear call to action
- [ ] No manipulative language, false urgency, or misleading comparisons
- [ ] Tone matches AGATHON LABS voice (direct, human, no fluff)
- [ ] Legal or performance claims flagged for Guard review

---

## Related Rules

- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — Guard review for external public content
- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — report format to Ethan
- [`AGATHON_CONSTITUTION.md`](../../AGATHON_CONSTITUTION.md) — honesty and human-first values

---

## Example Usage

```
Ethan → Sage: "ETHANプレミアムプランの紹介メールを書いて。
               対象：現在無料プランを使っている個人ユーザー。
               アクション：プレミアムへのアップグレード。"

Sage uses Sales Skill:
1. Audience: free-plan individual user who already sees value
2. Offer: ETHAN Premium — ¥980/月, all categories, deeper summaries
3. Pain: free plan limits to 3 categories; they want more
4. Value proposition: "あなたが気にしているすべてのカテゴリを、毎朝5分でカバーする"
5. CTA: "今すぐアップグレード" with direct link
6. Objections: price concern → "コーヒー1杯分で毎日の情報整理を自動化"
7. Accuracy: ¥980 pricing confirmed; no fabricated usage stats

Sage → Ethan: draft + value prop + objection map
Ethan → Ion: review before sending
```
