import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

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
];

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
