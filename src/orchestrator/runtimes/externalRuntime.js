// AGATHON LABS — External model runtimes (Claude Code / Codex / OpenAI Agents)
//
// Extension seams for real AI execution backends. Each follows the runtime
// contract in runtime.js. A backend becomes live when:
//   1. its env flag is set (e.g. AGATHON_CLAUDE_CODE=1),
//   2. it has a `callModel()` implementation, and
//   3. any extra requirement it declares is met (claude-code needs an API key).
// Otherwise `isAvailable()` returns false and the orchestrator transparently
// falls back to `plan`.
//
// claude-code is implemented (it calls the Anthropic Messages API via
// claudeApi.js). codex and openai-agents are honest stubs: they assemble the
// prompt but do not fake a model response — `status: 'skipped'` — until an
// operator wires their callModel. Never pretend a model ran (Guard requirement).

import { readFile } from 'node:fs/promises';
import { makeHandoff } from './runtime.js';
import { callClaude } from './claudeApi.js';

/**
 * Build the prompt parts that give a backend the agent's behavior.
 * `system` carries the persona/role; `user` carries the task.
 * @returns {Promise<{ system: string, user: string, combined: string }>}
 */
export async function buildAgentPrompt(agent, task, { repoRoot = '.' } = {}) {
  let persona = `(persona file ${agent.persona} not loaded)`;
  try {
    persona = await readFile(`${repoRoot}/${agent.persona}`, 'utf8');
  } catch {
    // Persona file optional at prompt-build time; the path is still recorded.
  }
  const system = [
    `You are ${agent.name}, ${agent.division} of AGATHON LABS.`,
    'Follow AGENTS.md (the constitution) and your persona below.',
    'Report back to Ethan, never directly to Ion. Be concise and show evidence.',
    '',
    '=== PERSONA ===',
    persona.trim(),
  ].join('\n');
  const user = task;
  const combined = `${system}\n\n=== TASK ===\n${user}`;
  return { system, user, combined };
}

/**
 * Build an external runtime adapter.
 * @param {Object} config
 * @param {string} config.name
 * @param {string} config.envFlag
 * @param {string} config.label
 * @param {boolean} [config.requiresApiKey]  Gate availability on ANTHROPIC_API_KEY.
 * @param {(req: {system: string, prompt: string, agent: object, task: string}) => Promise<string|{output: string, note?: string, usage?: object, model?: string}>} [config.callModel]
 */
function makeExternalRuntime({ name, envFlag, label, requiresApiKey = false, callModel }) {
  return {
    name,
    envFlag,
    label,
    requiresApiKey,
    callModel,

    async isAvailable() {
      if (!process.env[envFlag]) return false;
      if (typeof this.callModel !== 'function') return false;
      if (this.requiresApiKey && !process.env.ANTHROPIC_API_KEY) return false;
      return true;
    },

    async run({ agent, task, context = {} }) {
      const built = await buildAgentPrompt(agent, task, context);

      if (typeof this.callModel !== 'function') {
        return {
          runtime: this.name,
          agent: agent.id,
          status: 'skipped',
          output: built.combined,
          handoff: makeHandoff({
            findings: [`${label} backend not implemented; prepared prompt only.`],
            risks: [`Set ${envFlag}=1 and implement callModel() to activate ${label}.`],
            next: 'Orchestrator falls back to the plan runtime.',
          }),
          note: `${label} adapter is a stub (prompt assembled, model not called)`,
        };
      }

      const result = await this.callModel({
        system: built.system,
        prompt: built.user,
        agent,
        task,
      });
      const output = typeof result === 'string' ? result : result.output;
      const meta = typeof result === 'string' ? {} : result;

      return {
        runtime: this.name,
        agent: agent.id,
        status: 'ok',
        output,
        handoff: makeHandoff({
          findings: [`${agent.name} responded via ${label}.`],
          evidence: [`persona:${agent.persona}`, ...(meta.model ? [`model:${meta.model}`] : [])],
          next: 'Ethan consolidates; Guard reviews if delivering an artifact.',
        }),
        note: meta.note || `executed via ${label}${meta.model ? ` (${meta.model})` : ''}`,
      };
    },
  };
}

// --- claude-code: live, backed by the Anthropic Messages API ---
export const claudeCodeRuntime = makeExternalRuntime({
  name: 'claude-code',
  envFlag: 'AGATHON_CLAUDE_CODE',
  label: 'Claude Code',
  requiresApiKey: true,
  async callModel({ system, prompt }) {
    const { text, usage, model } = await callClaude({ system, prompt });
    const tokens = usage?.output_tokens != null ? `, out_tokens:${usage.output_tokens}` : '';
    return { output: text, usage, model, note: `executed via Claude Code (${model}${tokens})` };
  },
});

// --- codex: stub (extension point) ---
export const codexRuntime = makeExternalRuntime({
  name: 'codex',
  envFlag: 'AGATHON_CODEX',
  label: 'Codex',
});

// --- openai-agents: stub (extension point) ---
export const openaiAgentsRuntime = makeExternalRuntime({
  name: 'openai-agents',
  envFlag: 'AGATHON_OPENAI_AGENTS',
  label: 'OpenAI Agents SDK',
});
