// AGATHON LABS — Orchestrator CLI
//
// Usage:
//   npm run orchestrate -- "最新のAIニュースをまとめて"
//   npm run orchestrate -- "ログイン機能を実装して公開して" --runtime=claude-code
//   npm run orchestrate -- "..." --json
//
// Routes an Ion request through Ethan → agents → Guard → report.

import { orchestrate } from '../src/orchestrator/index.js';
import { listRuntimes } from '../src/orchestrator/runtimes/index.js';

const args = process.argv.slice(2);
const runtime = args.find((a) => a.startsWith('--runtime='))?.slice('--runtime='.length) || 'plan';
const asJson = args.includes('--json');
const task = args.filter((a) => !a.startsWith('--')).join(' ').trim();

if (!task) {
  console.error('Usage: npm run orchestrate -- "<task>" [--runtime=plan|claude-code|codex|openai-agents] [--json]');
  console.error(`Available runtimes: ${listRuntimes().join(', ')}`);
  process.exit(1);
}

const result = await orchestrate(task, { runtime });

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  const { plan } = result;
  console.log('━'.repeat(60));
  console.log(`TASK: ${task}`);
  console.log('━'.repeat(60));
  console.log(`\n[ROUTING]  reasoner=${plan.reasoner}  runtime=${result.runtime}${result.runtimeFellBack ? ' (fallback)' : ''}`);
  console.log(`  owner        : ${plan.owner ?? '(clarify needed)'}`);
  console.log(`  collaborators: ${plan.collaborators.join(', ') || '—'}`);
  console.log(`  needsGuard   : ${plan.needsGuard}`);
  if (plan.subtasks.length > 1) {
    console.log('  subtasks     :');
    for (const a of plan.assignments) console.log(`    - [${a.agent ?? '?'}] ${a.subtask}`);
  }
  console.log(`\n[REPORT]\n`);
  console.log(result.report);
  console.log('');
}
