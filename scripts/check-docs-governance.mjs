import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

const requiredFiles = [
  'AGENTS.md',
  'ETHAN.md',
  'NOVA.md',
  'FORGE.md',
  'ATLAS.md',
  'FLOW.md',
  'ECHO.md',
  'SAGE.md',
  'VISION.md',
  'GUARD.md',
  'PULSE.md',
];

const requiredAgentSections = [
  '## 1. Role',
  '## 2. Personality',
  '## 3. Mission',
  '## 4. Responsibilities',
  '## 5. Authority',
  '## 6. Collaboration Rules',
  '## 7. Input / Output',
  '## 8. Do / Don',
  '## 9. Escalation',
  '## 10. Example Behavior',
];

const requiredGovernancePhrases = [
  'GitHub is the single source of truth',
  'git fetch',
  'git pull',
  'Work is complete only when changes are committed and pushed',
  'Codex is not a replacement for Claude Code',
  'GitHub PR, branch, commit, or Issue',
  'repo`, `branch`, `commit`, `PR URL`',
  'AI Handoff Ledger',
  'docs/handoff/YYYY-MM-DD-HHMM-<agent>.md',
  'Recovery Mode',
];


const ledgerDirectory = 'docs/handoff';
const ledgerFilePattern = /^\d{4}-\d{2}-\d{2}-\d{4}-[a-z0-9-]+\.md$/;

const requiredRecoveryFields = [
  'Repository:',
  'Branch:',
  'Latest Commit:',
  'Changed Files:',
  'Files Created:',
  'Files Updated:',
  'Files Deleted:',
  'Tests:',
  'Current Status:',
  'Current Progress(%):',
  'Blockers:',
  'Exactly What Claude Code Should Do Next:',
  'Commands Claude Should Run:',
  'Estimated Remaining Work:',
  'Ready For GitHub Push:',
];

const requiredLedgerSections = [
  '# AI Handoff Ledger',
  '## Project',
  '## Repository',
  '## Base Branch',
  '## Working Branch',
  '## Latest Commit',
  '## PR',
  '## Issue',
  '## Agent',
  '## Mission',
  '## Why',
  '## Changed Files',
  '## Summary',
  '## Tests',
  '## Current Status',
  '## Blockers',
  '## Next AI',
  '## Next Steps',
  '## Next Commands',
  '## Notes',
];

function sectionBody(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`));
  return match ? match[1].trim() : '';
}

function fail(message) {
  console.error(`docs-governance check failed: ${message}`);
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    fail(`missing required file: ${file}`);
    continue;
  }

  const content = readFileSync(file, 'utf8');
  for (const heading of requiredAgentSections) {
    if (!content.includes(heading)) {
      fail(`${file} is missing required section: ${heading}`);
    }
  }
}

const agents = readFileSync('AGENTS.md', 'utf8');
for (const phrase of requiredGovernancePhrases) {
  if (!agents.includes(phrase)) {
    fail(`AGENTS.md is missing governance phrase: ${phrase}`);
  }
}


if (!existsSync(ledgerDirectory) || !statSync(ledgerDirectory).isDirectory()) {
  fail('missing handoff ledger directory: docs/handoff');
} else {
  const ledgerFiles = readdirSync(ledgerDirectory)
    .filter((file) => ledgerFilePattern.test(file))
    .sort();

  if (ledgerFiles.length === 0) {
    fail('missing timestamped handoff ledger file in docs/handoff');
  } else {
    const latestLedger = `${ledgerDirectory}/${ledgerFiles.at(-1)}`;
    const ledger = readFileSync(latestLedger, 'utf8');

    for (const section of requiredLedgerSections) {
      if (!ledger.includes(section)) {
        fail(`${latestLedger} is missing required ledger section: ${section}`);
      }
    }

    const requiredNonEmptySections = [
      '## Agent',
      '## Base Branch',
      '## Working Branch',
      '## Latest Commit',
      '## Next Steps',
    ];

    for (const section of requiredNonEmptySections) {
      if (!sectionBody(ledger, section)) {
        fail(`${latestLedger} has an empty required ledger section: ${section}`);
      }
    }


    if (!ledger.includes('# Recovery')) {
      fail(`${latestLedger} is missing required Recovery section: # Recovery`);
    }

    for (const field of requiredRecoveryFields) {
      if (!ledger.includes(field)) {
        fail(`${latestLedger} is missing required Recovery field: ${field}`);
        continue;
      }

      const line = ledger.split('\n').find((entry) => entry.startsWith(field));
      if (!line || !line.slice(field.length).trim()) {
        fail(`${latestLedger} has an empty required Recovery field: ${field}`);
      }
    }
  }
}

const porcelain = execFileSync('git', ['status', '--porcelain'], {
  encoding: 'utf8',
}).trim();

if (process.env.CHECK_WORKTREE_CLEAN === '1' && porcelain.length > 0) {
  fail('working tree has uncommitted changes');
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('docs-governance check passed');
