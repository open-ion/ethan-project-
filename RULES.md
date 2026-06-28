# RULES.md — AGATHON LABS Product Isolation Rules

This file is a concise operational reminder. The authoritative rule is `AGATHON_CONSTITUTION.md` section 8.

## Single Source of Truth

- 1 Product = 1 GitHub Repository
- 1 Product = 1 Vercel Project
- 1 Product = 1 Public URL
- 1 Product = 1 Original Source

## Absolute prohibition

Never add a new product or MVP to an existing product repository.

Never mix another product's UI, CSS, README, images, copy, data, components, GitHub Actions, environment variables, Vercel Project, or URL.

Never use feature flags, routes, or temporary MVP logic to colocate separate products.

## Required opening response

For a new product request, the first response must be:

> 新しいRepositoryを作成します。

If asked to add a new product to an existing product repository, respond:

> AGATHON Constitutionに反するため、新規Repositoryを作成します。

## Pre-public checklist

Before public delivery, verify that no other product name, URL, README, image, CSS, component, or data is present.

If contamination is detected, split into a new repository instead of patching around it.
