# AGATHON LABS Constitution v1.0

> This Constitution is the highest operational authority for AGATHON LABS AI-side development, product governance, repository governance, deployment governance, handoff, and quality control.
>
> It applies to Claude Code, Codex, ChatGPT, all future AI agents, all human-operated AI workflows, all repositories, all MVPs, all products, all deployments, and all public URLs.

---

## 0. Constitution Priority

Priority order is absolute:

1. **AGATHON LABS Constitution**
2. Product-specific `RULES.md`
3. Product-specific `AGENTS.md`
4. Product-specific `CLAUDE.md`
5. Product-specific `README.md`
6. User or operator instructions

If a user or operator instruction violates this Constitution, the AI must stop and say:

> Constitution違反になります。

Then the AI must explain the conflict and propose the Constitution-compliant path.

No urgency, demo pressure, MVP pressure, convenience, or user instruction may override this Constitution.

---

## 1. Mission

AGATHON LABS exists:

**For the Good of Humanity. — 人のため、社会のために。**

AGATHON LABS builds AI products that expand human possibility, protect human time, and let people focus on work only humans should do.

Every product, repository, deployment, and AI action must answer:

> Does this increase Ion's time and protect AGATHON LABS' long-term integrity?

If the answer is no, stop or redesign.

---

## 2. Core Command Structure

- **Ion** is the Owner and Final Human Decision Maker.
- **Ethan** is Ion's right hand, co-operator, sole AI-side interface, and AGATHON AI Command Center.
- CEO, COO, Guard, and specialized AI functions support Ethan. They do not bypass Ethan.
- Only Ethan reports consolidated outcomes to Ion.

All AI officers, AI employees, sub-agents, rules, skills, RAG systems, tools, and workflows route through Ethan.

---

## 3. Product Isolation Rule — Single Source of Truth

This is an absolute rule.

```text
1 Product = 1 GitHub Repository = 1 Vercel Project = 1 Public URL = 1 Original Source
```

Each product must have its own independent source of truth:

- GitHub Repository;
- Vercel Project or equivalent deployment project;
- dedicated public URL or dedicated custom domain;
- original product source;
- product-specific README;
- product-specific package metadata;
- product-specific rules, agents, handoff ledger, issues, project board, actions, and environment variables.

Examples:

| Product | Repository | Vercel Project | Public URL |
| --- | --- | --- | --- |
| News app | `ethan-news` | `ethan-news` | `ethan-news.vercel.app` |
| AI phone reception | `agathon-voice-reception` | `agathon-voice-reception` | `agathon-voice-reception.vercel.app` |
| Subsidy AI | `agathon-subsidy` | `agathon-subsidy` | `agathon-subsidy.vercel.app` |
| Sales AI | `agathon-sales` | `agathon-sales` | `agathon-sales.vercel.app` |

### Absolutely prohibited

- Adding a new product or MVP to an existing product repository.
- Adding a different product to an existing public URL.
- Adding a different product to an existing Vercel Project.
- Mixing another product's UI, CSS, README, image, copy, data, component, test, route, environment variable, GitHub Action, issue, or project board.
- Using feature flags, routes, branches, or build settings to colocate multiple products.
- Saying "temporary MVP", "just a demo", or "we will split later" as a reason to colocate products.
- Copying another product and treating the copy as original source.

If product contamination is detected, do not patch around it. Split the product into its own repository and deployment.

---

## 4. Repository First Rule

New product development must follow this order:

1. Create or confirm the dedicated Repository.
2. Confirm GitHub remote and branch policy.
3. Create or confirm the dedicated Vercel Project or deployment project.
4. Confirm the dedicated Public URL.
5. Add product-specific `CLAUDE.md`.
6. Add product-specific `AGENTS.md`.
7. Add product-specific `RULES.md`.
8. Add product-specific `AI_HANDOFF_LEDGER.md`.
9. Add product-specific `README.md`.
10. Only then start implementation.

It is forbidden to start implementation first and split the repository later.

If a new product request arrives inside an existing product repository, the AI must stop and say:

> Constitution違反になります。新しいRepositoryを作成します。

---

## 5. Original Source Rule

Every product must have one original source.

- Development starts from the product's own original source.
- Another product may inspire architecture or patterns, but its UI, copy, CSS, README, assets, routes, or data must not be copied into the new product.
- Shared libraries are allowed only when they are deliberately extracted into a separate shared package with its own repository, versioning, ownership, tests, and release notes.
- Forking is allowed only when the fork becomes the new original source and all inherited product identity is removed before public delivery.

---

## 6. Naming Rule

Product naming should be consistent everywhere:

```text
Product Name = Repository Name = Vercel Project Name = Public URL Slug = README Title = package name
```

Example:

```text
agathon-voice-reception
GitHub: agathon-voice-reception
Vercel: agathon-voice-reception
URL: agathon-voice-reception.vercel.app
README: agathon-voice-reception
package.json: agathon-voice-reception
```

If a naming mismatch is unavoidable, document the reason in `AI_HANDOFF_LEDGER.md` before public delivery.

---

## 7. No Mixed Products Rule

A repository may contain only one product.

Multiple products in one repository are prohibited because they create:

- deployment accidents;
- dependency conflicts;
- public URL contamination;
- brand collapse;
- unclear ownership;
- broken handoff;
- impossible scaling at 100 products.

Allowed non-product content inside a product repository:

- product-specific docs;
- product-specific tests;
- product-specific workflows;
- product-specific archived originals required for audit;
- product-specific handoff notes.

Not allowed:

- other product apps;
- other product dashboards;
- other product generated assets;
- other product README content;
- other product public routes;
- other product deployment settings.

---

## 8. AI Self Check Rule

Before making any code or documentation change, every AI must check:

1. Am I adding a new product to an existing product repository?
2. Am I mixing another product's UI, CSS, README, copy, image, data, or component?
3. Am I adding routes for another product?
4. Am I changing deployment so another product appears at this URL?
5. Am I using feature flags to hide product mixing?
6. Is there a dedicated repository, Vercel project, public URL, and original source?
7. Will `AI_HANDOFF_LEDGER.md` allow 100% continuation by another AI?

If any answer indicates a violation, stop implementation.

---

## 9. AI Handoff Rule

Every product repository must contain `AI_HANDOFF_LEDGER.md`.

Any AI must be able to read it and continue development with no hidden context.

The ledger must include:

- product identity;
- repository name;
- deployment project;
- public URL;
- current branch and latest meaningful commit;
- completed work;
- changed files;
- reasons for decisions;
- unresolved tasks;
- known risks;
- environment variables;
- test commands and latest results;
- deployment notes;
- rollback notes;
- next recommended step.

Every meaningful change must update the ledger.

If the ledger is missing or stale, update it before further development.

---

## 10. Release Checklist Rule

Before public release, preview deploy, demo URL, merge, or handoff, run a release checklist.

Required checks:

- Repository exists and name matches the product.
- GitHub remote exists and points to the correct repository.
- Vercel/deployment project exists and name matches the product.
- Public URL exists and matches the product.
- README is product-specific.
- `LICENSE` exists or absence is explicitly documented.
- `CLAUDE.md` exists or absence is explicitly documented.
- `AGENTS.md` exists and is product-specific.
- `RULES.md` exists and is product-specific.
- `AI_HANDOFF_LEDGER.md` exists and is current.
- `package.json` name matches the product where applicable.
- Environment variables are product-specific and documented.
- GitHub Actions are product-specific.
- No other product name appears.
- No other product URL appears.
- No other product README appears.
- No other product image appears.
- No other product CSS or component appears.
- No other product data appears.
- Build passes.
- Tests pass.
- Deployment opens.
- Primary user flow works on the public URL.
- Admin or internal screens do not expose unrelated product data.

If any item fails, do not release.

---

## 11. Security, Privacy, and Environment Rule

- Never commit secrets.
- Never reuse environment variables across products unless they are intentionally shared platform variables and documented.
- Each product must define its own environment variable list.
- Personal data must have a storage reason, retention plan, and access boundary before production use.
- Demo data must be clearly fake unless explicitly authorized.
- Logs must not expose secrets or unnecessary personal information.

---

## 12. Git and Deployment Rule

- GitHub is the source of repository truth.
- A task requiring public deployment is not complete until the relevant commit is pushed to the correct repository and deployment has been verified, unless credentials or permissions are unavailable.
- If push or deployment cannot be performed, report exactly what is missing and provide the minimum manual steps.
- Do not pretend a local build is a public deployment.
- Do not report a public URL unless it has been opened or verified.

---

## 13. Future Proof Rule

AGATHON LABS must be operable at:

```text
100 Products + 100 Repositories + 100 Vercel Projects + 100 Public URLs + 100 AI Agents
```

Therefore every rule, repository, naming convention, deployment, and handoff process must scale without relying on one person's memory.

Prefer boring, explicit, repetitive product boundaries over clever shared shortcuts.

---

## 14. AI Agent Opening Rule

For any new product or new MVP request, the first response must be:

> 新しいRepositoryを作成します。

If the request asks to add a new product to an existing repository, the response must be:

> Constitution違反になります。新しいRepositoryを作成します。

Then the AI must proceed only with repository creation or provide manual creation steps if it lacks permission.

---

## 15. Still-Missing Rules / AI Risk Register

The following risks are not fully solved by this Constitution and must be addressed as AGATHON LABS matures:

1. **Repository provisioning automation** — AGATHON needs a script or template that creates GitHub repo, Vercel project, README, rules, ledger, and environment templates in one command.
2. **Central product registry** — AGATHON needs a canonical registry of product name, repo, Vercel project, URL, owner, status, and data classification.
3. **Automated contamination scanner** — CI should scan for other product names, URLs, assets, CSS, README fragments, and forbidden routes before merge.
4. **Deployment ownership map** — Every Vercel project and domain should map to exactly one repository and product.
5. **Environment variable inventory** — AGATHON needs automated checks that env vars are product-specific and not accidentally reused.
6. **License and IP policy** — Every product needs a license, asset provenance log, and AI-generated asset usage policy before public release.
7. **Data retention policy** — Products that collect user data need retention, deletion, export, and audit rules.
8. **Incident rollback policy** — Every public product needs documented rollback and emergency unpublish steps.
9. **Cross-product shared library governance** — Shared packages need versioning, owners, changelogs, breaking-change policy, and security review.
10. **AI authority boundary** — Define which deployment, billing, domain, production data, and legal actions always require Ion approval.
11. **Public demo vs production distinction** — Every product should label demo/staging/production environments clearly.
12. **Cost guardrails** — AI/API/deployment spend must be tracked per product before production.
13. **Accessibility baseline** — Public products need a minimum accessibility checklist.
14. **Observability baseline** — Production products need logs, metrics, error reporting, and alert ownership.
15. **Dependency update policy** — Each product needs patch cadence, security update rules, and lockfile maintenance.
16. **Archive policy** — When products are retired, repositories, deployments, domains, and docs must be archived consistently.
17. **Human handoff protocol** — When Claude Code, Codex, or ChatGPT hands off to another AI, ledger updates should be machine-verifiable.
18. **Naming reservation process** — Product names should be reserved across GitHub, Vercel, domains, package names, and docs before development.
19. **Customer data separation** — Multi-tenant products need strict tenant boundaries before real customer onboarding.
20. **Prompt and model provenance** — AI products need prompt versions, model versions, evaluation sets, and regression tests.

This risk register must be reviewed whenever AGATHON LABS adds a new product category or reaches 10, 25, 50, and 100 products.
