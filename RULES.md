# RULES.md — AGATHON LABS Constitution v1.0 Quick Rules

The authoritative source is `AGATHON_CONSTITUTION.md`.

## 1. Product Isolation

```text
1 Product = 1 GitHub Repository = 1 Vercel Project = 1 Public URL = 1 Original Source
```

No product may share a repository, deployment project, public URL, README, package metadata, UI, CSS, data, components, GitHub Actions, environment variables, or handoff ledger with another product.

## 2. Repository First

Before implementation:

1. Repository
2. GitHub
3. Vercel/deployment project
4. Public URL
5. `CLAUDE.md`
6. `AGENTS.md`
7. `RULES.md`
8. `AI_HANDOFF_LEDGER.md`
9. `README.md`
10. Development

Never build first and split later.

## 3. Required AI Response

For a new product:

> 新しいRepositoryを作成します。

If asked to put a new product in an existing product repository:

> Constitution違反になります。新しいRepositoryを作成します。

## 4. Original Source

Every product has one original source. Do not start from another product copy unless it is converted into a clean original before public delivery.

## 5. Handoff

`AI_HANDOFF_LEDGER.md` must let Claude Code, Codex, ChatGPT, or future AI continue with 100% context.

## 6. Release Checklist

Before public release, check:

- repository name;
- GitHub remote;
- Vercel/deployment project;
- public URL;
- README;
- LICENSE or documented absence;
- `CLAUDE.md` or documented absence;
- `AGENTS.md`;
- `RULES.md`;
- `AI_HANDOFF_LEDGER.md`;
- environment variables;
- deployment result;
- no other product name, URL, README, image, CSS, component, data, route, or artifact.

If contamination is detected, split repositories instead of patching around it.

## 7. Still-Missing System Work

AGATHON still needs automation for repo creation, product registry, contamination scanning, deployment ownership mapping, environment inventory, rollback, shared library governance, cost guardrails, data retention, observability, and prompt/model provenance.
