# AGATHON LABS — Orchestration OS Architecture

The operating layer that lets **Ethan analyze a request and auto-route it to the
right AI employees**, with execution backends that are swappable across Claude
Code, Codex, and the OpenAI Agents SDK.

Implements the AGATHON LABS reporting flow ([`AGENTS.md`](../../AGENTS.md) §3):

```text
Ion → Ethan(analyze → route) → assigned agents → Guard(quality gate)
    → Ethan(consolidate) → Ion(report)
```

## Pipeline

```text
                       orchestrate(task, { runtime, reasoner })
                                     │
   1. analyzeTask  ───────────────►  │  Ethan's brain (pluggable reasoner)
      (analyzer.js)                  │   → intent, subtasks, owner, collaborators,
                                     │     needsGuard, reasoning
                                     ▼
   2. resolveRuntime ─────────────►  pick execution backend (fallback → plan)
      (runtimes/runtime.js)          │
                                     ▼
   3. dispatch ───────────────────►  owner + collaborators run via runtime
                                     │
                                     ▼
   4. Guard gate ─────────────────►  quality/risk review before delivery
                                     │
                                     ▼
   5. buildReport ────────────────►  Ethan's Ion-facing report (AGENTS.md §8)
```

## Modules

| File | Responsibility |
| --- | --- |
| `src/orchestrator/agents.js` | Data-driven registry of the 10 agents. Adding an agent = one entry. Mirrors the persona `.md` files; persona is behavioral source of truth, registry is the machine index. |
| `src/orchestrator/analyzer.js` | Ethan's reasoning. Decomposes a request and routes each part. Ships a deterministic `heuristicReasoner`; swappable via the `reasoner` contract. |
| `src/orchestrator/runtimes/runtime.js` | Runtime **contract** + registry (`registerRuntime`, `resolveRuntime`, fallback). The extensibility seam. |
| `src/orchestrator/runtimes/planRuntime.js` | Default backend. Deterministic plan, no model call — runs today with no API key. |
| `src/orchestrator/runtimes/externalRuntime.js` | Claude Code / Codex / OpenAI Agents adapters (opt-in stubs). |
| `src/orchestrator/orchestrator.js` | The pipeline + report builder. |
| `src/orchestrator/index.js` | Public API. |
| `scripts/orchestrate.mjs` | CLI. |
| `scripts/orchestrator-test.mjs` | Smoke test (25 checks). |

## Two extension points

### 1. Reasoner (how routing decisions are made)

The analyzer accepts any object implementing:

```js
const myReasoner = {
  name: 'claude-router',
  async analyze(task, ctx) { /* return a RoutingPlan */ },
};
await orchestrate(task, { reasoner: myReasoner });
```

The default `heuristicReasoner` scores agents by keyword triggers — deterministic
and free. An LLM reasoner can replace it without touching the pipeline.

### 2. Runtime (what actually executes an agent)

A runtime is an execution backend implementing:

```js
const myRuntime = {
  name: 'claude-code',
  async isAvailable() { return true; },
  async run({ agent, task, context }) {
    // → { runtime, agent, status, output, handoff, note }
  },
};
registerRuntime(myRuntime);
```

Registered backends:

| Runtime | Status | Activation |
| --- | --- | --- |
| `plan` | active | default, always available |
| `claude-code` | **live** | `AGATHON_CLAUDE_CODE=1` + `ANTHROPIC_API_KEY` |
| `codex` | stub | `AGATHON_CODEX=1` + implement `callModel()` |
| `openai-agents` | stub | `AGATHON_OPENAI_AGENTS=1` + implement `callModel()` |

`resolveRuntime()` falls back to `plan` when the requested backend is not
registered or not available, so the OS never hard-fails on a missing backend.
The remaining external adapters are honest stubs: they assemble the agent prompt
(persona + task) but return `status: 'skipped'` rather than faking a model
response — a Guard requirement (never pretend a model ran).

#### claude-code runtime (live)

`claude-code` calls the **Anthropic Messages API** (`src/orchestrator/runtimes/claudeApi.js`,
dependency-free raw `fetch`, matching `scripts/summarize-news.mjs`). Per dispatched
agent it sends one `POST /v1/messages` with the agent persona as the `system`
prompt and the task as the user message, then returns the model's text as the
agent's output. It checks `stop_reason === "refusal"` before reading content and
surfaces token usage in the handoff note.

```bash
export AGATHON_CLAUDE_CODE=1
export ANTHROPIC_API_KEY=sk-ant-...        # required to actually call the model
npm run orchestrate -- "競合を3社調べて要点を出して" --runtime=claude-code
```

Env: `AGATHON_CLAUDE_MODEL` (default `claude-opus-4-8`), `AGATHON_MAX_TOKENS`
(default 1024), `ANTHROPIC_BASE_URL` (default `https://api.anthropic.com` — override
for a gateway/proxy or a local test server), `AGATHON_TIMEOUT_MS` (default 60000).
If the flag or key is missing, the runtime reports unavailable and the orchestrator
falls back to `plan`.

## Usage

```bash
# Deterministic routing + plan (no API key)
npm run orchestrate -- "最新のAIニュースをまとめて"

# Decomposition + collaboration + Guard gate
npm run orchestrate -- "競合を調査して、結果をスライドにデザインして、公開して"

# Request an external backend (falls back to plan until wired)
npm run orchestrate -- "ログイン機能を実装して" --runtime=claude-code

# Machine-readable output
npm run orchestrate -- "..." --json

# Tests
npm run test:orchestrator
```

## Design rationale

- **Runnable today, extensible tomorrow.** The deterministic core works with no
  API key; real model backends plug into the same contract.
- **Routing ≠ execution.** Deciding *who* does the work (reasoner) is separate
  from *how* it runs (runtime). Either can be upgraded independently.
- **Persona files stay the source of truth.** The registry indexes them; it does
  not replace them. Backends load the persona to get behavior.
- **Guard is structural, not optional.** The quality gate is a pipeline stage,
  matching the constitution.

## Next steps / TODO

- ~~Implement `callModel()` for at least one external runtime (Claude Code first).~~ ✅ `claude-code` is live (Anthropic Messages API).
- Wire `codex` and `openai-agents` `callModel()` the same way.
- Optional LLM reasoner for fuzzier intent than keyword triggers.
- Persist routing decisions to Echo (memory) for traceability.
- Let `needsGuard` consider runtime output, not just the request text.
