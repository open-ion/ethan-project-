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

/** Extract the body lines of a "## Heading" section from markdown. */
function section(content, heading) {
  const esc = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headRe = new RegExp(`^##\\s+${esc}\\s*$`);
  const lines = content.split('\n');
  const start = lines.findIndex((l) => headRe.test(l));
  if (start === -1) return '';
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join('\n').trim();
}

/** Pull list items ("- x" or "1. x") from a section body. */
function listItems(body) {
  return body
    .split('\n')
    .map((l) => l.replace(/^\s*(?:[-*]|\d+\.)\s+/, '').trim())
    .filter((l) => l.length > 0 && !l.startsWith('```'));
}

async function loadLatestLedger() {
  const dir = 'docs/handoff';
  let files;
  try {
    files = await readdir(dir);
  } catch {
    return {};
  }
  const ledgers = files
    .filter((f) => /^\d{4}-\d{2}-\d{2}-\d{4}-[a-z0-9-]+\.md$/.test(f))
    .sort();
  const latest = ledgers.at(-1);
  if (!latest) return {};
  const content = await readFile(`${dir}/${latest}`, 'utf8');

  const statusBody = section(content, 'Current Status');
  const status = statusBody.split('\n')[0]?.trim() || '';
  const nextSteps = listItems(section(content, 'Next Steps')).slice(0, 6);
  let blockers = listItems(section(content, 'Blockers'));
  // Recovery field fallback: "Blockers: ..."
  if (blockers.length === 0) {
    const line = content.split('\n').find((l) => l.startsWith('Blockers:'));
    const v = line?.slice('Blockers:'.length).trim();
    if (v && !/^none$/i.test(v)) blockers = [v];
  }
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
