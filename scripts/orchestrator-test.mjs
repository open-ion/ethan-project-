// AGATHON LABS — Orchestrator smoke test
//
// Dependency-free assertions over routing + pipeline. Run via `npm test` or
// `node scripts/orchestrator-test.mjs`.

import {
  analyzeTask,
  orchestrate,
  AGENTS,
  getAgent,
  listRuntimes,
  resolveRuntime,
} from '../src/orchestrator/index.js';

let passed = 0;
let failed = 0;

function check(name, cond) {
  if (cond) {
    passed += 1;
    console.log(`  ok  - ${name}`);
  } else {
    failed += 1;
    console.error(`  FAIL- ${name}`);
  }
}

// --- Registry integrity ---
check('registry has 10 agents (Ethan + 9 divisions)', AGENTS.length === 10);
check('every agent references a persona file', AGENTS.every((a) => /\.md$/.test(a.persona)));
check('exactly one orchestrator (Ethan)', AGENTS.filter((a) => a.orchestrator).length === 1);
check('exactly one quality gate (Guard)', AGENTS.filter((a) => a.qualityGate).length === 1);

// --- Routing: owner selection ---
const cases = [
  { task: '最新のAIニュースをまとめて', owner: 'nova' },
  { task: '競合の市場規模を調査して根拠を出して', owner: 'atlas' },
  { task: 'ログイン機能を実装して', owner: 'forge' },
  { task: '提案資料のスライドをデザインして', owner: 'vision' },
  { task: '毎朝の配信をGmailで自動化して', owner: 'flow' },
  { task: '入院中の1日のスケジュールを組んで', owner: 'pulse' },
  { task: '公開前にセキュリティと個人情報をチェックして', owner: 'guard' },
  { task: '読んだ本の要点をNotionに整理して', owner: 'sage' },
];
for (const c of cases) {
  // eslint-disable-next-line no-await-in-loop
  const plan = await analyzeTask(c.task);
  check(`route "${c.task.slice(0, 16)}…" → ${c.owner}`, plan.owner === c.owner);
}

// --- Decomposition + collaboration ---
const multi = await analyzeTask('競合を調査して、結果をスライドにデザインして');
check('multi-clause task decomposes into >=2 subtasks', multi.subtasks.length >= 2);
check('multi-clause task pulls in a collaborator', multi.collaborators.length >= 1);

// --- Quality gate logic ---
const publish = await analyzeTask('新機能を実装して本番に公開して');
check('publish/code task requires Guard', publish.needsGuard === true);

// --- Clarification path ---
const vague = await analyzeTask('あれ、よろしく');
check('vague task flags clarifyNeeded', vague.clarifyNeeded === true);

// --- Runtime registry + fallback ---
check('plan runtime registered', listRuntimes().includes('plan'));
check('claude-code runtime registered', listRuntimes().includes('claude-code'));
check('codex runtime registered', listRuntimes().includes('codex'));
check('openai-agents runtime registered', listRuntimes().includes('openai-agents'));
const fb = await resolveRuntime('claude-code');
check('unavailable external runtime falls back to plan', fb.fellBack && fb.runtime.name === 'plan');

// --- End-to-end pipeline ---
const result = await orchestrate('最新のAIニュースをまとめて公開して');
check('orchestrate returns a report', typeof result.report === 'string' && result.report.includes('## 結論'));
check('orchestrate ran owner execution', result.executions.length >= 1);
check('orchestrate ran Guard review for publish task', result.guardReview !== null);
check('report names the owner agent', result.report.includes(getAgent(result.plan.owner).name));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
