# Current State Review — News Digest App

## Review Position

Claude Code is responsible for creating the application itself. Codex should not compete with that role by starting a large implementation from scratch.

Codex should review, clarify, and make small improvements that help Claude Code implement safely.

## Repository Snapshot

As of this review, the repository contains documentation only. No runnable application code has been committed.

Observed state:

- no `package.json`;
- no app framework files;
- no `src/`, `app/`, or `pages/` application directory;
- no API routes;
- no database schema;
- no lint, format, test, or build configuration;
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

- framework selection;
- runtime and package manager selection;
- environment variable structure;
- development, build, and start commands;
- deployment target.

### UI

- onboarding and category selection screen;
- settings screen;
- digest preview screen;
- admin/operator view for job status;
- mobile-first digest reading layout.

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
- build check;
- CI workflow;
- error logging and retry policy.

### README / Documentation

- stack decision needs confirmation;
- setup commands need replacement once `package.json` exists;
- environment variables need documentation;
- architecture diagram should be added after app scaffolding;
- API and job flow docs should be added after implementation begins.

## Recommended Next Small Steps

1. Claude Code should choose and scaffold the MVP stack.
2. Codex should review the scaffold for consistency with the requirements before feature work expands.
3. Add lint, format, test, and build scripts only after the package manager and framework exist.
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
