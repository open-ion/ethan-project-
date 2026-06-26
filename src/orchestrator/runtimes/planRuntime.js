// AGATHON LABS — Plan Runtime (default backend)
//
// Deterministic, dependency-free execution backend. It does not call any model;
// it produces a structured execution plan + handoff for each agent based on the
// agent's persona responsibility. This makes the whole orchestration OS runnable
// today (no API key) and gives real LLM runtimes a reference output shape.

import { makeHandoff } from './runtime.js';

export const planRuntime = {
  name: 'plan',

  async isAvailable() {
    return true;
  },

  async run({ agent, task, context = {} }) {
    const steps = [
      `${agent.name}（${agent.division}）が担当: ${agent.responsibility}`,
      `対象タスク: ${task}`,
      `参照人格: ${agent.persona}`,
    ];
    if (context.owner && context.owner !== agent.id) {
      steps.push(`主担当 ${context.owner} を補佐する連携作業として実行`);
    }

    return {
      runtime: this.name,
      agent: agent.id,
      status: 'ok',
      output: steps.join('\n'),
      handoff: makeHandoff({
        findings: [`「${task}」を ${agent.name} の責任範囲で計画化`],
        evidence: [`persona:${agent.persona}`],
        risks: ['planランタイムは設計のみ。実行は対応ランタイム接続後。'],
        next: `${agent.name} の成果を Ethan が統合し、必要なら Guard 確認へ`,
      }),
      note: 'deterministic plan (no model call)',
    };
  },
};
