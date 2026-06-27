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
  callClaude,
  extractText,
  buildAgentPrompt,
  claudeCodeRuntime,
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

// --- claude-code runtime: Anthropic API client (hermetic, injected fetch) ---
check('extractText concatenates text blocks', extractText({ content: [
  { type: 'text', text: 'Hello ' }, { type: 'thinking', thinking: 'x' }, { type: 'text', text: 'world' },
] }) === 'Hello world');

const built = await buildAgentPrompt(getAgent('forge'), 'add a login form');
check('buildAgentPrompt puts persona in system, task in user',
  built.system.includes('Forge') && built.user === 'add a login form');

// Fake Anthropic endpoint — proves request shape + response parsing without network.
let capturedReq = null;
const fakeFetch = async (url, init) => {
  capturedReq = { url, headers: init.headers, body: JSON.parse(init.body) };
  return {
    ok: true,
    async json() {
      return { model: 'claude-opus-4-8', stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'pong' }], usage: { output_tokens: 1 } };
    },
  };
};
const called = await callClaude({ prompt: 'ping', system: 'be terse', apiKey: 'test-key',
  baseUrl: 'http://mock.local', fetchImpl: fakeFetch });
check('callClaude returns parsed text', called.text === 'pong');
check('callClaude targets /v1/messages', capturedReq.url === 'http://mock.local/v1/messages');
check('callClaude sends x-api-key + anthropic-version headers',
  capturedReq.headers['x-api-key'] === 'test-key' && capturedReq.headers['anthropic-version'] === '2023-06-01');
check('callClaude sends model + user message', capturedReq.body.model === 'claude-opus-4-8'
  && capturedReq.body.messages[0].role === 'user' && capturedReq.body.messages[0].content === 'ping');

// Refusal must be detected before reading content.
let refusalCaught = false;
try {
  await callClaude({ prompt: 'x', apiKey: 'k', baseUrl: 'http://m', fetchImpl: async () => ({
    ok: true, async json() { return { stop_reason: 'refusal', stop_details: { category: 'cyber' }, content: [] }; },
  }) });
} catch (e) { refusalCaught = /refused/.test(e.message); }
check('callClaude throws on stop_reason refusal', refusalCaught);

// Missing API key is a clear error, not a silent empty call.
let noKeyCaught = false;
try {
  await callClaude({ prompt: 'x', apiKey: '', fetchImpl: async () => ({ ok: true, async json() { return {}; } }) });
} catch (e) { noKeyCaught = /ANTHROPIC_API_KEY/.test(e.message); }
check('callClaude throws when API key missing', noKeyCaught);

// Availability gating (no flag / no key in test env → unavailable → falls back).
const wasAvailable = await claudeCodeRuntime.isAvailable();
check('claude-code unavailable without flag+key in test env', wasAvailable === false);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
