# Current State Review — News Digest App

## Review Position

Claude Code is responsible for creating the application itself. Codex should not compete with that role by starting a large implementation from scratch.

Codex should review, clarify, and make small quality improvements that help Claude Code implementation reach completion without replacing its design.

## Repository Snapshot

As of this review update, the repository includes a small static MVP app. It is intentionally lightweight so Claude Code can still choose the future production architecture without inheriting a large framework decision.

Observed state:

- `package.json` exists with `dev`, `build`, and `start` scripts;
- `src/` contains a static home screen, category list, dummy news list, and detail-route rendering;
- no framework-specific app directory exists yet;
- no API routes;
- no database schema;
- build script exists;
- smoke test script exists;
- lint configuration is not configured yet;
- RSS fetch includes timeout, retry, per-source skip, and logging, but production source coverage still needs live tuning;
- generated news JSON can be loaded by the UI;
- no delivery integration;
- OpenAI API summarization path exists for summary metadata, with template fallback when `OPENAI_API_KEY` is not configured.

## Improvement Policy Before Implementation

1. Do not overwrite Claude Code implementation files without reading them first.
2. Back up important files before meaningful edits.
3. Prefer small completion work over new large features.
4. Fix bugs, build errors, UI issues, responsive issues, accessibility gaps, README drift, and missing tests.
5. Avoid architecture changes, stack changes, broad directory moves, auth, payments, production NewsAPI/RSS, production AI summarization, and database design changes unless explicitly requested.
6. Keep the AGATHON LABS model intact: Ethan organizes and reports the digest to Ion.

## Unfinished Features

### App Foundation

- production framework selection;
- environment variable structure;
- deployment target;
- decision on whether to keep the static MVP or migrate to Next.js/TypeScript.

### UI

- saved onboarding flow;
- persisted category selection via localStorage is implemented;
- settings screen;
- admin/operator view for job status;
- further mobile QA on real devices.

### AI Features

- production article ranking;
- category-aware summarization quality tuning;
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
- deduplication logic beyond stable RSS item IDs.

### Quality Management

- lint configuration;
- formatter configuration;
- broader unit test setup;
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
2. Add lint and format scripts after the production framework choice is confirmed.
3. Verify the GitHub Actions RSS → OpenAI summary → JSON → Pages deploy workflow with `OPENAI_API_KEY` configured on the public repository.
4. Expand RSS source coverage carefully without changing the static UI architecture.
5. Add Email delivery before LINE delivery after generated JSON updates are stable.

## Review Checklist for Future Claude Code Changes

When Claude Code adds app code, Codex should check:

- Does the app run with documented commands?
- Are required environment variables documented?
- Is news collection isolated from summarization and delivery?
- Are source links preserved in every digest item?
- Are medical and financial summaries cautious and non-advisory?
- Are failed collection, summarization, and delivery runs observable?
- Can Ion receive a concise Ethan-style report without opening the app?
