# AI Handoff Ledger

The AI Handoff Ledger is AGATHON LABS' operational diary for AI-to-AI handoffs. GitHub remains the source of truth for code and files; the Ledger preserves the context needed to resume work quickly: why a change happened, what is complete, what is blocked, and what the next AI should do.

## File Naming

Create one ledger entry for each meaningful AI work session:

```text
docs/handoff/YYYY-MM-DD-HHMM-<agent>.md
```

Examples:

```text
docs/handoff/2026-06-26-2015-codex.md
docs/handoff/2026-06-26-2030-claude-code.md
```

Use lowercase agent names in filenames, such as `codex`, `claude-code`, `atlas`, or `echo`.

## Required Template

```md
# AI Handoff Ledger

## Project

## Repository

## Base Branch

## Working Branch

## Latest Commit

## PR

## Issue

## Agent

Claude Code

or

Codex

## Mission

今回の目的

## Why

なぜこの変更を行ったのか

## Changed Files

変更ファイル一覧

## Summary

何を実装したか

## Tests

実施したテストと結果

## Current Status

Planning / Coding / Testing / Ready for Review / Ready for Push / Completed / Blocked

## Blockers

止まっている理由

## Next AI

Claude Code / Codex / Atlas / Echo / etc.

## Next Steps

次に実行する内容

## Next Commands

次に実行するコマンド

## Notes

注意事項
```

## Operating Rules

- Update the latest Ledger entry at the end of every AI work session.
- If a session changes files, create a new timestamped Ledger entry before final handoff.
- Even when GitHub push fails, record the blocker and next recovery commands in the Ledger.
- Claude Code must read the latest Ledger before resuming work.
- Codex must read the latest Ledger before starting work.
- Code and Ledger must agree on branch, commit, status, and blockers.
- Work without a Ledger update is incomplete.
