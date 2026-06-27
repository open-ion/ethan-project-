// AGATHON LABS — Daily AGATHON Brief CLI
//
// Gathers real repo facts (git + the latest AI Handoff Ledger) and prints the
// Daily AGATHON Brief. First production task of the orchestration OS.
//
// Usage:
//   npm run brief
//   npm run brief -- --json
//   CI_DOCS_GOVERNANCE=success CI_UPDATE_NEWS=monitoring PAGES_SOURCE="GitHub Actions" npm run brief

import { readFile, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { buildDailyBrief } from '../src/orchestrator/dailyBrief.js';
import { parseLedgerSummary } from '../src/orchestrator/ledger.js';

const exec = promisify(execFile);
const args = process.argv.slice(2);
const asJson = args.includes('--json');

async function git(cmdArgs, fallback = '') {
  try {
    const { stdout } = await exec('git', cmdArgs);
    return stdout.trim();
  } catch {
    return fallback;
  }
}

async function loadLatestLedger() {
  const dir = 'docs/handoff';
  let files;
  try {
    files = await readdir(dir);
  } catch {
    return {};
  }
  const latest = files
    .filter((f) => /^\d{4}-\d{2}-\d{2}-\d{4}-[a-z0-9-]+\.md$/.test(f))
    .sort()
    .at(-1);
  if (!latest) return {};
  const { status, nextSteps, blockers } = parseLedgerSummary(await readFile(`${dir}/${latest}`, 'utf8'));
  return { file: `${dir}/${latest}`, status, nextSteps, blockers };
}

const facts = {
  date: new Date().toISOString().slice(0, 10),
  branch: await git(['rev-parse', '--abbrev-ref', 'HEAD'], '(unknown)'),
  latestCommit: await git(['log', '-1', '--format=%h %s'], '(none)'),
  ledger: await loadLatestLedger(),
  ci: {
    docsGovernance: process.env.CI_DOCS_GOVERNANCE || '直近 success（手動確認推奨）',
    updateNewsSchedule: process.env.CI_UPDATE_NEWS || '監視中（次回scheduleの成否を確認）',
  },
  pages: {
    source: process.env.PAGES_SOURCE || '要目視確認',
    note: process.env.PAGES_NOTE || '',
  },
};

const brief = buildDailyBrief(facts);

if (asJson) {
  console.log(JSON.stringify({ facts, brief }, null, 2));
} else {
  console.log(brief);
}
