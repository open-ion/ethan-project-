# Current State Review — News Digest App

## Review Position

Claude Code is responsible for creating the application itself. Codex should not compete with that role by starting a large implementation from scratch.

Codex should review, clarify, and make small improvements that help Claude Code implement safely.

## Repository Snapshot

As of this review update, the repository includes a small static MVP app. It is intentionally lightweight so Claude Code can still choose the future production architecture without inheriting a large framework decision.

Observed state:

- `package.json` exists with `dev`, `build`, and `start` scripts;
- `src/` contains a static home screen, category list, dummy news list, and detail-route rendering;
- no framework-specific app directory exists yet;
- no API routes;
- no database schema;
- build script exists;
- lint and test configuration are not configured yet;
- no delivery integration;
- no AI integration.

## Improvement Policy Before Implementation

1. Do not overwrite Claude Code implementation files without reading them first.
2. Back up important files before meaningful edits.
3. Prefer documentation, review notes, and small safe corrections until the app foundation exists.
4. When app code appears, review the existing architecture before adding new dependencies or patterns.
5. Keep the AGATHON LABS model intact: Ethan organizes and reports the digest to Ion.

## Unfinished Features

### App Foundation

- production framework selection;
- environment variable structure;
- deployment target;
- decision on whether to keep the static MVP or migrate to Next.js/TypeScript.

### UI

- saved onboarding flow;
- persisted category selection;
- settings screen;
- admin/operator view for job status;
- further mobile QA on real devices.

### AI Features

- article ranking;
- category-aware summarization;
- source-grounded output;
- medical and financial caution rules;
- Ethan-style final report format;
- prompt separation for Ethan, Nova, Atlas, Sage, Guard, and Flow.

### Data Management

- user preference storage;
- article storage;
- digest storage;
- delivery status storage;
- source reliability metadata;
- deduplication logic.

### Quality Management

- lint configuration;
- formatter configuration;
- unit test setup;
- integration test setup;
- CI workflow;
- error logging and retry policy.

### README / Documentation

- production stack decision needs confirmation;
- environment variables need documentation once integrations begin;
- architecture diagram should be added after production scaffolding;
- API and job flow docs should be added after implementation begins.

## Recommended Next Small Steps

1. Claude Code should review the static MVP and decide whether to keep it temporarily or migrate it into the production stack.
2. Add lint, format, and test scripts after the production framework choice is confirmed.
3. Replace dummy news with a controlled RSS or NewsAPI ingestion prototype.
4. Implement a single-user manual digest generator before scheduled delivery.
5. Add Email delivery before LINE delivery.

## Review Checklist for Future Claude Code Changes

When Claude Code adds app code, Codex should check:

- Does the app run with documented commands?
- Are required environment variables documented?
- Is news collection isolated from summarization and delivery?
- Are source links preserved in every digest item?
- Are medical and financial summaries cautious and non-advisory?
- Are failed collection, summarization, and delivery runs observable?
- Can Ion receive a concise Ethan-style report without opening the app?
