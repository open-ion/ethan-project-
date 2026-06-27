# Recovery Mode Resume Guide

Use this file when Claude Code receives the instruction `resume` after a Codex handoff or usage-limit recovery.

## One-Command Resume

```bash
npm run resume
```

This syncs `work` (fetch / checkout / pull --ff-only), finds and prints the
latest Ledger's recovery panel (Repository, Branch, Latest Commit, Changed
Files, Current Status, Blockers, Next Steps, Next Commands), and runs the docs
governance check — so Claude Code is working again within seconds. Use
`npm run resume -- --no-sync` to read local state without touching git. The
rest of this file is the manual procedure the command automates.

## Goal

Restore the full working context within 30 seconds using the AI Handoff Ledger, even when Codex could not push to GitHub.

## Latest Ledger Retrieval

1. Open `docs/handoff/README.md` to confirm the Ledger rules and required template.
2. Find the latest timestamped Ledger file:

```bash
find docs/handoff -maxdepth 1 -type f -name '????-??-??-????-*.md' | sort | tail -1
```

3. Read the latest Ledger before editing code:

```bash
latest_ledger=$(find docs/handoff -maxdepth 1 -type f -name '????-??-??-????-*.md' | sort | tail -1)
sed -n '1,240p' "$latest_ledger"
```

## Recovery Review Order

Read these sections in order:

1. `## Recovery`
2. `Repository`
3. `Branch`
4. `Latest Commit`
5. `Changed Files`
6. `Files Created`
7. `Files Updated`
8. `Files Deleted`
9. `Tests`
10. `Current Status`
11. `Current Progress(%)`
12. `Blockers`
13. `Exactly What Claude Code Should Do Next`
14. `Commands Claude Should Run`
15. `Estimated Remaining Work`
16. `Ready For GitHub Push`

## GitHub Reflection Method

After reading the Ledger:

1. Confirm the repository and branch match the Ledger.
2. Synchronize GitHub state.
3. Apply or verify the changed files described in the Ledger.
4. Run the tests listed in the Ledger.
5. Commit any recovered changes.
6. Update the Ledger with the final commit and status.
7. Push to GitHub.
8. Confirm GitHub Actions.

## Standard Resume Commands

```bash
git fetch origin
git checkout work
git pull --ff-only
latest_ledger=$(find docs/handoff -maxdepth 1 -type f -name '????-??-??-????-*.md' | sort | tail -1)
sed -n '1,240p' "$latest_ledger"
npm run check:docs-governance
npm test
```

## Rule

Claude Code must not start code edits until the latest Ledger has been read and the Recovery section has been summarized.
