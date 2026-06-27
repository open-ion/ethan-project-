# Skill: Coding
## コード実装・レビュー・デバッグ

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

A structured procedure for writing, reviewing, and debugging code that is correct, secure, and maintainable — without over-engineering or adding unrequested complexity.

Code should solve the stated problem. No more, no less.

---

## When to Use

- Implementing a new feature or fix
- Reviewing existing code for correctness, security, or quality
- Debugging a failing test or broken behavior
- Refactoring code for clarity or performance
- Writing tests for existing functionality
- Evaluating whether a library or approach is the right fit

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Task description | Yes | What needs to be built or fixed |
| Target files / modules | No | Where to make changes |
| Language / runtime | Yes | JavaScript, Python, TypeScript, etc. |
| Existing code context | No | Relevant files or snippets |
| Test requirements | No | Whether tests must be added or updated |
| Security constraints | No | Auth, input validation, data sensitivity |

---

## Outputs

| Output | Description |
|--------|-------------|
| Code changes | Specific diffs or new files |
| Test updates | New or updated tests covering the change |
| Security flags | Any identified risks (injection, XSS, exposed secrets) |
| Incomplete items | Anything intentionally left out of scope |
| Deployment notes | Environment variables, migration steps, or config changes needed |

---

## Procedure

1. **Read before writing.** Understand the existing code before adding to it. Check what already exists.
2. **Confirm the scope.** Implement only what was asked. Do not add features, abstractions, or refactors beyond the task.
3. **Check for security risks.** Before writing user-facing code, consider: SQL injection, XSS, command injection, secret exposure, input validation. See Guard checklist in [`docs/rules/quality-gate.md`](../rules/quality-gate.md).
4. **Write the minimal correct solution.** Prefer simple and readable over clever and compact.
5. **Add or update tests.** If the task changes behavior, verify the change works and does not break existing tests.
6. **Review the diff.** Read your own output before reporting. Check for hardcoded secrets, debug output left in, and unintended side effects.
7. **Document breaking changes.** If environment variables, migrations, or config changes are required, list them explicitly.
8. **Follow git-workflow.** All code changes go on a feature branch. See [`docs/rules/git-workflow.md`](../rules/git-workflow.md).
9. **Report to Ethan.** Include: what changed, files modified, tests status, any security flags, and what was intentionally excluded.

---

## Quality Checklist

- [ ] No hardcoded secrets, API keys, or passwords in code
- [ ] No SQL injection, XSS, or command injection vulnerabilities introduced
- [ ] Input validation exists at system boundaries (user input, external APIs)
- [ ] Existing tests still pass
- [ ] New behavior is covered by tests (or absence of tests is explicitly noted)
- [ ] No features added beyond what was requested
- [ ] No dead code or commented-out blocks left behind
- [ ] Environment variable requirements documented in `.env.example`
- [ ] Feature branch used; no direct commits to main

---

## Related Rules

- [`docs/rules/git-workflow.md`](../rules/git-workflow.md) — branch strategy and sync requirements
- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — security and Guard review triggers
- [`docs/rules/reporting-policy.md`](../rules/reporting-policy.md) — report format to Ethan

---

## Example Usage

```
Ethan → Forge: "RSS fetch スクリプトに retry ロジックを追加して。
               最大3回・指数バックオフ。既存の fetch:rss コマンドに統合。"

Forge uses Coding Skill:
1. Read src/scripts/fetchRss.js before writing anything
2. Scope: retry logic only, no other changes
3. Security: no user input in this path, low risk
4. Implementation: wrap fetch in retry loop with 2s/4s/8s backoff
5. Test: add test for retry behavior
6. Diff review: no secrets, no unintended changes
7. No env var changes needed

Forge → Ethan: files changed, test results, no security flags
```
