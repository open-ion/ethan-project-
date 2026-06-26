// AGATHON LABS — Agent Runtime contract & registry
//
// A "runtime" is an execution backend that actually runs an agent's work:
// the deterministic planner today, and Claude Code / Codex / OpenAI Agents SDK
// later. The orchestrator only depends on this contract, so new backends plug
// in without touching routing logic. This is the extensibility layer.

/**
 * @typedef {Object} RuntimeRequest
 * @property {import('../agents.js').AgentDef} agent  Agent to run.
 * @property {string} task        The (sub)task text for this agent.
 * @property {object} [context]   Shared context (prior outputs, plan, etc.).
 *
 * @typedef {Object} RuntimeResult
 * @property {string} runtime     Runtime name that produced this.
 * @property {string} agent       Agent id.
 * @property {'ok'|'skipped'|'error'} status
 * @property {string} output      Agent-facing result text.
 * @property {object} handoff     Structured handoff (AGENTS.md handoff format).
 * @property {string} [note]      Optional note (e.g. why a fallback was used).
 *
 * Contract every runtime must satisfy:
 *   name: string
 *   async isAvailable(): boolean
 *   async run(request: RuntimeRequest): RuntimeResult
 */

/** Build the standard handoff object so every runtime returns the same shape. */
export function makeHandoff({ findings = [], evidence = [], risks = [], next = '' } = {}) {
  return { findings, evidence, risks, next };
}

const REGISTRY = new Map();

/** Register a runtime implementation. */
export function registerRuntime(runtime) {
  if (!runtime?.name || typeof runtime.run !== 'function') {
    throw new TypeError('runtime must have { name, run() }');
  }
  if (typeof runtime.isAvailable !== 'function') {
    runtime.isAvailable = async () => true;
  }
  REGISTRY.set(runtime.name, runtime);
  return runtime;
}

/** Get a runtime by name (undefined if not registered). */
export function getRuntime(name) {
  return REGISTRY.get(name);
}

/** List registered runtime names. */
export function listRuntimes() {
  return [...REGISTRY.keys()];
}

/**
 * Resolve the runtime to use, falling back to `plan` when the requested one is
 * not registered or not available in this environment.
 * @returns {Promise<{ runtime: object, fellBack: boolean, reason?: string }>}
 */
export async function resolveRuntime(name, fallback = 'plan') {
  const requested = REGISTRY.get(name);
  if (requested && (await requested.isAvailable())) {
    return { runtime: requested, fellBack: false };
  }
  const reason = !requested
    ? `runtime "${name}" is not registered`
    : `runtime "${name}" is not available in this environment`;
  const fb = REGISTRY.get(fallback);
  if (!fb) throw new Error(`${reason}; fallback "${fallback}" also missing`);
  return { runtime: fb, fellBack: true, reason };
}
