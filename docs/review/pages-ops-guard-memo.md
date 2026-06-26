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
