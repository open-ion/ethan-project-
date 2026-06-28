# AGENTS.md — AGATHON LABS Operational Rules

> The authoritative source is [`AGATHON_CONSTITUTION.md`](AGATHON_CONSTITUTION.md). If this file conflicts with the Constitution, the Constitution wins.

---

## 0. Reading Order

1. `AGATHON_CONSTITUTION.md`
2. `RULES.md`
3. `AGENTS.md`
4. Product-specific `CLAUDE.md` if present
5. `README.md`
6. `AI_HANDOFF_LEDGER.md`

---

## 1. Non-Negotiable Product Isolation

Before any work, confirm this repository is the correct repository for the product.

```text
1 Product = 1 GitHub Repository = 1 Vercel Project = 1 Public URL = 1 Original Source
```

Do not add a new product or MVP to an existing product repository.

Do not mix UI, CSS, README, assets, routes, data, components, tests, GitHub Actions, Vercel projects, URLs, or environment variables from another product.

Do not use feature flags or routes to colocate products.

If asked to create a new product, start with:

> 新しいRepositoryを作成します。

If asked to add a new product here, respond:

> Constitution違反になります。新しいRepositoryを作成します。

---

## 2. Repository First Workflow

For new products, follow this order before implementation:

1. Repository
2. GitHub remote
3. Vercel/deployment project
4. Public URL
5. `CLAUDE.md`
6. `AGENTS.md`
7. `RULES.md`
8. `AI_HANDOFF_LEDGER.md`
9. `README.md`
10. Implementation

If any required infrastructure is missing and you lack permission to create it, stop and report the minimum manual steps.

---

## 3. Ethan Command Chain

All AI work routes through Ethan, AGATHON AI Command Center.

Only Ethan reports final consolidated outcomes to Ion.

CEO, COO, Guard, and specialized functions support Ethan and do not bypass Ethan.

---

## 4. Before Writing Code

Check:

- Is this the correct product repository?
- Is this a new product that requires a new repository?
- Could this contaminate another product's public URL?
- Does `AI_HANDOFF_LEDGER.md` explain the current state?
- Does this increase Ion's time?
- Is there a simpler, safer approach?

If product isolation is violated, stop.

---

## 5. Hard Rules

- Do not mass-delete existing code without a product-isolation or explicit migration reason.
- Do not hide errors.
- Do not report public deployment unless the public URL was verified.
- Do not commit secrets.
- Do not reuse another product's copy, assets, CSS, or README.
- Do not add another product to this repository.
- Always update `AI_HANDOFF_LEDGER.md` for meaningful changes.
- Always run relevant tests or document why they cannot run.
- Always commit requested changes.

---

## 6. Public Release Gate

Before public release or demo URL delivery, verify:

- correct repository;
- correct GitHub remote;
- correct Vercel/deployment project;
- correct public URL;
- product-specific README;
- product-specific `AGENTS.md`;
- product-specific `RULES.md`;
- current `AI_HANDOFF_LEDGER.md`;
- no other product name, URL, README, image, CSS, component, data, or route;
- build passes;
- tests pass;
- deployment opens;
- primary user flow works.

If any check fails, do not release.

---

## 7. Handoff Format

Every completion should leave enough context for another AI to continue:

```markdown
## 完了したこと
## 変更したファイル
## 変更理由
## 残タスク
## 次にやるべきこと
## Ethanへの引き継ぎ事項
```

---

## 8. Final Response for Code Changes

Use:

```markdown
**Summary**
* ... file citations ...

**Testing**
* ✅ `command`
* ⚠️ `command` (environment limitation)
* ❌ `command` (agent error)
```

File citations must use repository-relative paths.
