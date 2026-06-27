// AGATHON LABS — Task Analyzer (Ethan's reasoning)
//
// Turns a raw Ion request into an executable routing plan:
//   intent → subtasks → owner + collaborators → quality gate → reasoning.
//
// The analysis is done by a pluggable `reasoner`. The default is a
// deterministic heuristic (no API key required). A future LLM-backed reasoner
// (Claude / Codex / OpenAI Agents) only has to implement the same
// `{ name, analyze(task, ctx) }` contract — the orchestrator does not change.

import { routableAgents, qualityGate, getAgent } from './agents.js';

/**
 * @typedef {Object} Assignment
 * @property {string} agent    Agent id.
 * @property {string} subtask  The portion of work assigned.
 * @property {number} score    Relevance score.
 *
 * @typedef {Object} RoutingPlan
 * @property {string} task            Original request.
 * @property {string} intent          One-line restated intent.
 * @property {string[]} subtasks      Decomposed units of work.
 * @property {string|null} owner      Primary agent id (null => needs clarification).
 * @property {string[]} collaborators Supporting agent ids.
 * @property {Assignment[]} assignments Per-subtask routing.
 * @property {boolean} needsGuard     Whether Guard must review before delivery.
 * @property {boolean} clarifyNeeded  True when no agent confidently matches.
 * @property {string} reasoner        Name of the reasoner used.
 * @property {string[]} reasoning     Human-readable rationale lines.
 */

const PUBLISH_SIGNAL = /公開|配信|送信|外部|本番|publish|deploy|納品|個人情報|メール|line/i;
const MEMORY_ONLY = /^(?:.*(?:思い出|履歴|過去|前に(?:言|決|話)|あの時).*)$/;

/** Count how many times an agent's trigger pattern fires in `text`. */
function scoreAgent(agent, text) {
  const global = new RegExp(agent.triggers.source, 'gi');
  const matches = text.match(global);
  return matches ? matches.length : 0;
}

/** Split a request into rough subtasks on Japanese/English clause boundaries. */
export function splitTask(task) {
  return String(task)
    .split(/[\n。．;；]|して、|て、|で、|、また|，また|\bthen\b|\band then\b|してから|した上で/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Rank routable agents by relevance to a piece of text. */
function rankAgents(text) {
  return routableAgents()
    .map((agent) => ({ agent, score: scoreAgent(agent, text) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Default heuristic reasoner. Deterministic, dependency-free.
 * @type {{ name: string, analyze: (task: string, ctx?: object) => Promise<RoutingPlan> }}
 */
export const heuristicReasoner = {
  name: 'heuristic',
  async analyze(task, _ctx = {}) {
    const text = String(task || '').trim();
    const subtasks = splitTask(text);
    const reasoning = [];

    // Per-subtask routing.
    const assignments = subtasks.map((subtask) => {
      const ranked = rankAgents(subtask);
      const best = ranked[0];
      return best
        ? { agent: best.agent.id, subtask, score: best.score }
        : { agent: null, subtask, score: 0 };
    });

    // Whole-task ranking decides the owner.
    const overall = rankAgents(text);
    const owner = overall[0]?.agent.id ?? null;
    const clarifyNeeded = owner === null;

    if (clarifyNeeded) {
      reasoning.push('どのエージェントにも明確に一致しませんでした。Ionへ意図確認を推奨します。');
    } else {
      reasoning.push(`主担当: ${getAgent(owner).name}（一致度 ${overall[0].score}）。`);
    }

    // Collaborators: other matched agents + any agent that owns a subtask.
    const collaboratorIds = new Set();
    for (const r of overall.slice(1)) collaboratorIds.add(r.agent.id);
    for (const a of assignments) if (a.agent && a.agent !== owner) collaboratorIds.add(a.agent);
    collaboratorIds.delete(owner);
    const collaborators = [...collaboratorIds];
    if (collaborators.length) {
      reasoning.push(`連携: ${collaborators.map((id) => getAgent(id).name).join(' / ')}。`);
    }

    // Quality gate: Guard reviews any produced/published artifact before delivery
    // (AGENTS.md §7). Pure internal memory recall does not need it.
    const gate = qualityGate();
    const producesArtifact = owner && owner !== gate.id && owner !== 'echo';
    const memoryOnly = MEMORY_ONLY.test(text) && owner === 'echo';
    const needsGuard =
      !memoryOnly && (PUBLISH_SIGNAL.test(text) || producesArtifact || owner === gate.id);
    if (needsGuard && owner !== gate.id) {
      reasoning.push('成果物の納品前に Guard の品質・リスク確認を通します。');
    }

    const intent = clarifyNeeded
      ? `意図不明確: 「${text}」`
      : `${getAgent(owner).name}主導で「${text}」を遂行する`;

    return {
      task: text,
      intent,
      subtasks,
      owner,
      collaborators,
      assignments,
      needsGuard,
      clarifyNeeded,
      reasoner: this.name,
      reasoning,
    };
  },
};

/**
 * Analyze a task into a routing plan.
 * @param {string} task
 * @param {{ reasoner?: object, context?: object }} [options]
 * @returns {Promise<RoutingPlan>}
 */
export async function analyzeTask(task, { reasoner = heuristicReasoner, context = {} } = {}) {
  if (typeof reasoner?.analyze !== 'function') {
    throw new TypeError('reasoner must implement async analyze(task, ctx)');
  }
  return reasoner.analyze(task, context);
}
