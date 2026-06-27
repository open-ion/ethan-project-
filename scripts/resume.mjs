// AGATHON LABS — `resume` runner
//
// One command for Claude Code to recover instantly after a usage-limit return
// or a Codex handoff. Automates the documented Recovery Mode (resume.md):
//   sync work -> read latest Ledger -> print the recovery panel -> verify.
//
// Usage:
//   npm run resume          (sync + show recovery panel + governance)
//   npm run resume -- --no-sync   (skip git network ops; just read local state)

import { readFile, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseLedgerSummary } from '../src/orchestrator/ledger.js';

const exec = promisify(execFile);
const noSync = process.argv.includes('--no-sync');

async function run(cmd, args) {
  try {
    const { stdout } = await exec(cmd, args);
    return { ok: true, out: stdout.trim() };
  } catch (e) {
    return { ok: false, out: (e.stderr || e.stdout || e.message || '').trim() };
  }
}

function hr(label = '') {
  return `${'━'.repeat(60)}${label ? `\n${label}` : ''}`;
}

console.log(hr('AGATHON LABS — resume (Recovery Mode)'));

// 1. Sync GitHub state (best-effort; report failures, don't crash).
if (noSync) {
  console.log('• sync skipped (--no-sync)');
} else {
  const steps = [
    ['fetch', ['fetch', 'origin', 'work']],
    ['checkout work', ['checkout', 'work']],
    ['pull --ff-only', ['pull', '--ff-only', 'origin', 'work']],
  ];
  for (const [label, args] of steps) {
    const r = await run('git', args);
    console.log(`• git ${label}: ${r.ok ? 'ok' : `FAILED — ${r.out.split('\n')[0]}`}`);
  }
}

const branch = (await run('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).out || '(unknown)';
const head = (await run('git', ['log', '-1', '--format=%h %s'])).out || '(none)';

// 2. Find and read the latest Ledger.
let ledgerFile = '';
let summary = { status: '', blockers: [], nextSteps: [], nextCommands: '', recovery: {} };
try {
  const files = (await readdir('docs/handoff'))
    .filter((f) => /^\d{4}-\d{2}-\d{2}-\d{4}-[a-z0-9-]+\.md$/.test(f))
    .sort();
  ledgerFile = files.at(-1) ? `docs/handoff/${files.at(-1)}` : '';
  if (ledgerFile) summary = parseLedgerSummary(await readFile(ledgerFile, 'utf8'));
} catch {
  // docs/handoff missing — reported below.
}

// 3. Print the recovery panel.
console.log(`\n${hr('[STATE]')}`);
console.log(`  branch        : ${branch}`);
console.log(`  latest commit : ${head}`);
console.log(`  latest ledger : ${ledgerFile || '(none found)'}`);

if (!ledgerFile) {
  console.log('\n⚠ No timestamped Ledger found in docs/handoff/. Cannot recover context.');
} else {
  console.log(`\n${hr('[RECOVERY]')}`);
  const r = summary.recovery;
  for (const k of ['Repository', 'Branch', 'Latest Commit', 'Changed Files', 'Tests', 'Ready For GitHub Push']) {
    if (r[k]) console.log(`  ${k}: ${r[k]}`);
  }
  console.log(`  Current Status: ${summary.status || '(unset)'}`);
  console.log(`  Blockers: ${summary.blockers.length ? '' : 'none'}`);
  for (const b of summary.blockers) console.log(`    - ${b}`);
  if (r['Exactly What Claude Code Should Do Next']) {
    console.log(`\n  Next (per ledger): ${r['Exactly What Claude Code Should Do Next']}`);
  }
  if (summary.nextSteps.length) {
    console.log('\n  Next Steps:');
    summary.nextSteps.forEach((s, i) => console.log(`    ${i + 1}. ${s}`));
  }
  if (summary.nextCommands) {
    console.log('\n  Next Commands:');
    for (const line of summary.nextCommands.split('\n')) console.log(`    ${line}`);
  }
}

// 4. Verify governance (so resume confirms a clean base before editing).
console.log(`\n${hr('[VERIFY]')}`);
const gov = await run('node', ['scripts/check-docs-governance.mjs']);
console.log(`  docs-governance: ${gov.ok ? 'passed' : `FAILED\n${gov.out}`}`);

console.log(`\n${hr()}`);
console.log('RULE: do not start code edits until the latest Ledger above has been read.');
console.log('Reflect Codex work surgically (only Ledger Changed Files / Files Created). No whole-branch merges.');
