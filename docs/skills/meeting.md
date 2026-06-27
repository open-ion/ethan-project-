# Skill: Meeting
## 議事録・アジェンダ・会議ファシリテーション

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

A structured procedure for preparing meeting agendas, capturing decisions and action items during meetings, and producing clear meeting notes that can be acted on immediately after.

A meeting that produces no decisions or no owners is a failed meeting. This Skill ensures every meeting leaves a clear record and clear next steps.

---

## When to Use

- Preparing an agenda before a meeting
- Capturing notes during a live or async meeting
- Producing minutes after a meeting concludes
- Summarizing a conversation thread or discussion into decisions and actions
- Reviewing whether a meeting's outcomes were achieved

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Meeting purpose | Yes | What decision or outcome must this meeting produce |
| Participants | Yes | Who is involved (Ion, Ethan, external parties) |
| Agenda items | No | Topics to cover, with time allocation |
| Pre-meeting materials | No | Documents to review before attending |
| Raw notes or transcript | No | For post-meeting summarization |
| Decisions already made | No | Context that does not need re-debating |

---

## Outputs

| Output | Description |
|--------|-------------|
| Agenda | Ordered list of topics with purpose and time box |
| Meeting notes | What was discussed, by topic |
| Decisions | Specific decisions made, stated unambiguously |
| Action items | Who does what by when (owner + task + deadline) |
| Open questions | Items that could not be resolved and need follow-up |
| Next meeting (if needed) | What triggers the next check-in |

---

## Procedure

### Before the meeting — Agenda preparation

1. **State the meeting objective.** One sentence: "This meeting is done when ___."
2. **List agenda items.** Only include items that require live discussion. Async-appropriate items do not belong in a meeting.
3. **Assign time boxes.** Total time should fit comfortably in the planned session.
4. **Distribute pre-read materials.** If participants need context, share it in advance so meeting time is not spent reading.

### During the meeting — Facilitation and capture

5. **Track decisions in real time.** When a decision is made, write it down immediately as a clear statement, not a topic.
6. **Capture action items as they arise.** Owner + task + deadline for every action. "We should probably..." is not an action item.
7. **Flag open questions.** If something cannot be resolved now, record it explicitly as open.

### After the meeting — Minutes and distribution

8. **Write the meeting notes.** Structured as: decisions → action items → open questions → notes by topic.
9. **Lead with decisions and actions.** The people who were not in the room need decisions and owners, not a transcript.
10. **Report to Ethan.** Deliver notes with any items requiring Ethan's follow-up or Ion's awareness.

---

## Quality Checklist

- [ ] Every decision is stated unambiguously (not "we discussed X")
- [ ] Every action item has an owner and a task (not just a topic)
- [ ] Open questions are recorded separately from decisions
- [ ] Agenda was prepared and shared before the meeting (if applicable)
- [ ] Notes are concise enough to read in 2 minutes
- [ ] Nothing from the meeting requires another meeting to understand
- [ ] Ion-relevant decisions or action items are flagged for Ethan to report

---

## Related Rules

- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — report format to Ethan after meeting
- [`docs/rules/command-chain.md`](../rules/command-chain.md) — only Ethan reports Ion-relevant outcomes to Ion
- [`AGATHON_CONSTITUTION.md`](../../AGATHON_CONSTITUTION.md) — Ion as Final Human Decision Maker; decisions require Ion's confirmation when stakes are high

---

## Example Usage

```
Ion → Ethan: "来週のプロダクト方針を話し合いたい"

Ethan uses Meeting Skill (pre-meeting):
1. Objective: "Decide which features go into the next release sprint"
2. Agenda:
   - [5min] Review current status (Forge update)
   - [15min] Feature priority decision (Ion's call)
   - [5min] Email delivery timeline (Flow update)
   - [5min] Open questions
3. Pre-read: current feature list + README incomplete features section

During meeting, Ethan captures:
- Decision: "Email delivery is priority 1 for next sprint"
- Action: Forge implements Resend integration by [date]
- Action: Flow wires daily schedule by [date]
- Open: LINE delivery timing — defer to post-email-stable

Post-meeting, Ethan → Ion:
## 決定事項
- メール配信を次スプリントの最優先とする

## アクション
- Forge: Resend 統合 — [日付]まで
- Flow: 日次スケジュール配線 — [日付]まで

## 未解決
- LINE配信のタイミング：メール安定後に判断
```
