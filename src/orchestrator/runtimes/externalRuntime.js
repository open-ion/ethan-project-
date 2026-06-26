// AGATHON LABS — External model runtimes (Claude Code / Codex / OpenAI Agents)
//
// These are the extension seams for real AI execution backends. Each follows
// the runtime contract in runtime.js. They are intentionally NOT wired to a
// live model yet: `isAvailable()` gates on an environment flag, so until an
// operator opts in, the orchestrator transparently falls back to `plan`.
//
// To activate a backend:
//   1. set the documented env flag (e.g. AGATHON_CLAUDE_CODE=1),
//   2. implement `callModel()` in the adapter to load the persona file and
//      invoke the corresponding SDK/CLI,
//   3. return a RuntimeResult with the real model output + handoff.
//
// Keeping these honest (skipped, not faked) is a Guard requirement: we never
// pretend a model ran when it did not.

import { readFile } from 'node:fs/promises';
import { makeHandoff } from './runtime.js';

/** Assemble the system prompt that gives a backend the agent's behavior. */
export async function buildAgentPrompt(agent, task, { repoRoot = '.' } = {}) {
  let persona = `(persona file ${agent.persona} not loaded)`;
  try {
    persona = await readFile(`${repoRoot}/${agent.persona}`, 'utf8');
  } catch {
    // Persona file optional at prompt-build time; the path is still recorded.
  }
  return [
    `You are ${agent.name}, ${agent.division} of AGATHON LABS.`,
    'Follow AGENTS.md (the constitution) and your persona below.',
    'Report back to Ethan, never directly to Ion.',
    '',
    '=== PERSONA ===',
    persona.trim(),
    '',
    '=== TASK ===',
    task,
  ].join('\n');
}

/**
 * Build an external runtime adapter.
 * @param {{ name: string, envFlag: string, label: string }} config
 */
function makeExternalRuntime({ name, envFlag, label }) {
  return {
    name,
    envFlag,
    label,

    async isAvailable() {
      // Opt-in only. Until the operator enables this and implements callModel,
      // the runtime declares itself unavailable so the orchestrator falls back.
      return Boolean(process.env[envFlag]) && typeof this.callModel === 'function';
    },

    /**
     * Extension point. Implement to call the real SDK/CLI and return a string.
     * @param {{ prompt: string, agent: object, task: string }} _req
     * @returns {Promise<string>}
     */
    callModel: undefined,

    async run({ agent, task, context = {} }) {
      const prompt = await buildAgentPrompt(agent, task, context);

      if (typeof this.callModel !== 'function') {
        return {
          runtime: this.name,
          agent: agent.id,
          status: 'skipped',
          output: prompt,
          handoff: makeHandoff({
            findings: [`${label} backend not implemented; prepared prompt only.`],
            risks: [`Set ${envFlag}=1 and implement callModel() to activate ${label}.`],
            next: 'Orchestrator falls back to the plan runtime.',
          }),
          note: `${label} adapter is a stub (prompt assembled, model not called)`,
        };
      }

      const output = await this.callModel({ prompt, agent, task });
      return {
        runtime: this.name,
        agent: agent.id,
        status: 'ok',
        output,
        handoff: makeHandoff({
          findings: [`${label} produced output for ${agent.name}.`],
          evidence: [`persona:${agent.persona}`],
          next: 'Ethan consolidates; Guard reviews if delivering an artifact.',
        }),
        note: `executed via ${label}`,
      };
    },
  };
}

export const claudeCodeRuntime = makeExternalRuntime({
  name: 'claude-code',
  envFlag: 'AGATHON_CLAUDE_CODE',
  label: 'Claude Code',
});

export const codexRuntime = makeExternalRuntime({
  name: 'codex',
  envFlag: 'AGATHON_CODEX',
  label: 'Codex',
});

export const openaiAgentsRuntime = makeExternalRuntime({
  name: 'openai-agents',
  envFlag: 'AGATHON_OPENAI_AGENTS',
  label: 'OpenAI Agents SDK',
});
