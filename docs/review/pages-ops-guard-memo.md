# GitHub Pages Operations Guard Memo

## Project

AGATHON LABS News Digest / MoneyClip GitHub Pages operations.

## Decision Context

Ion has approved proceeding with the GitHub Pages operations stabilization work. Ethan's operating decision is to keep the safer two-stage release model:

- development branch: `work`
- publication branch: default branch
- publication method: merge from `work` to default at intentional release points

## Current Findings

### Pages Deployment

- GitHub Pages deployment is functioning.
- The active publication path is `update-news.yml`.
- `update-news.yml` builds the app, uploads the Pages artifact, and deploys via GitHub Actions.
- MoneyClip is included in the built artifact and does not need a separate live deployment path.

### Nightly Schedule Failure

- The observed nightly failure was in the final `deploy-pages@v4` step.
- The error was an OIDC ID-token request timeout.
- Earlier steps completed, including data generation, tests, build, and artifact upload.
- A manual rerun succeeded with the same workflow configuration.
- Current classification: transient GitHub infrastructure / timing issue, not a repository configuration defect.

### MoneyClip Deployment Duplication

- No active production double deploy is currently required.
- The intended deployment path is `update-news.yml`.
- Older MoneyClip-specific deployment workflow history may remain on old branches.
- Those legacy branch remnants are not an emergency as long as they are not used as active publication branches.

## Guard Risk Assessment

| Area | Risk | Severity | Recommendation |
| --- | --- | --- | --- |
| Nightly OIDC timeout | Occasional deploy failure after successful artifact upload | Low / Medium if repeated | Monitor. Add retry only if repeated. |
| Legacy deployment workflow remnants | Accidental deploy from old branch if pushed | Medium | Document now. Clean only with explicit branch/workflow plan. |
| Switching Pages source | Could interrupt public URL or deployment history | Medium | Do only after Ion approval and rollback plan. |
| Deleting old workflows/branches | Could remove useful audit history or disrupt unknown references | Medium | Do not delete immediately. Inventory first. |
| Work branch as default/publication branch | Development changes could publish too early | Medium | Keep two-stage model for now. |

## Approved Operating Policy

1. Keep `work` as the development branch.
2. Keep default branch as the publication branch for scheduled/deploy workflows.
3. Publish intentionally by merging `work` to default at release points.
4. Keep `update-news.yml` as the single intended Pages deployment path.
5. Do not re-enable, delete, or rewrite legacy deployment workflows without a separate cleanup plan.
6. Monitor the next scheduled run before adding retry logic.

## Next Actions

1. Forge should observe the next scheduled `Update News Digest Data and Pages` run.
2. If the next run succeeds, leave the workflow unchanged.
3. If OIDC timeout repeats, Forge should propose a minimal deploy retry change.
4. Forge should inventory legacy branches containing `deploy-pages.yml` and report cleanup options.
5. Guard should review any cleanup proposal before Ion authorizes execution.

## Ion Approval Status

Ion has approved continuing the work. Destructive actions still require an explicit execution plan:

- branch deletion;
- workflow deletion;
- Pages source switch;
- default branch change;
- any force operation, which remains prohibited.

## Notes

- Force push remains prohibited.
- History rewriting remains prohibited.
- Existing files should not be deleted without a reviewed cleanup plan.
- This memo is a risk and operations record, not an implementation change.

## Codex Branch Reflection Safety Rule (Forge, 2026-06-27)

When reflecting Codex work that was synced via the Codex GitHub App (branches
named like `*-codex/agathon-labs.md`), the branch is based on an **older repo
state**. A full merge of such a branch would DELETE current work (in one
observed case the full diff removed the orchestration OS, the dashboard app,
persona files, and `docs/orchestrator/architecture.md` — about 2,700 deleted
lines).

Mandatory reflection procedure:

1. Never merge a Codex sync branch wholesale.
2. Read the Codex ledger's `Changed Files` / `Files Created` list.
3. Cherry-pick ONLY those net-new files (`git checkout <codex-branch> -- <file>`).
4. Verify core paths are untouched (`git diff --cached --name-only` shows only the intended files).
5. Run `npm run check:docs-governance` and `npm test`; both must pass.
6. Commit and push from the GitHub-connected (Claude Code) environment.

This rule should also be mirrored into `AGENTS.md` / `docs/handoff/README.md`.

## Legacy `deploy-pages.yml` Cleanup Plan (proposed — NOT executed)

Inventory (verified via git, 2026-06-27): legacy `deploy-pages.yml` (push to
`main`, paths `apps/**`, deploys `apps/` to the `gh-pages` branch — old
"deploy from a branch" method) exists on:

- `main` (last commit 2026-06-25)
- `claude/dashboard-mvp` (2026-06-25)
- `claude/news-digest-app-afdoae` (2026-06-25)
- `claude/investment-portfolio-plan-ycuf60` (2026-06-22)

The `gh-pages` branch exists. It is **inert for publishing** while Pages Source
is "GitHub Actions" (the live path is `update-news.yml`). Latent risk only if
Source is switched to a branch, or if `apps/**` is pushed to `main`.

Proposed minimal-risk plan, in priority order (execute only as one Guard-reviewed,
Ion-authorized batch — do not run piecemeal):

1. **Confirm + lock Pages Source = "GitHub Actions"** (Settings → Pages). This
   single settings confirmation neutralizes the entire legacy `gh-pages` path
   without deleting anything. Highest value, lowest risk. (No code change.)
2. Leave the legacy `deploy-pages.yml` files on the non-default project branches
   **as-is** unless those branches are being retired — they belong to separate
   project lines (incl. the investment project on `main`); deleting them is
   cross-scope and reversible only via reflog.
3. Optionally, once Source is confirmed, delete the `gh-pages` branch as the last
   step (reversible via reflog within GC window). Defer unless Ion wants a clean tree.

Recommendation: do **Step 1 only** now (a settings check, not a deletion).
Steps 2–3 are low priority and should wait for an explicit retirement decision
on those branches.
