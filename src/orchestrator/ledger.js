// AGATHON LABS — AI Handoff Ledger reader
//
// Pure parsing helpers for docs/handoff/ ledger files, shared by the Daily
// Brief and the `resume` runner so recovery state is read one way everywhere.

/** Extract the body lines of a "## Heading" section. */
export function extractSection(content, heading) {
  const esc = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headRe = new RegExp(`^##\\s+${esc}\\s*$`);
  const lines = String(content).split('\n');
  const start = lines.findIndex((l) => headRe.test(l));
  if (start === -1) return '';
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join('\n').trim();
}

/** Pull list items ("- x" / "1. x") from a section body. */
export function listItems(body) {
  return String(body)
    .split('\n')
    .map((l) => l.replace(/^\s*(?:[-*]|\d+\.)\s+/, '').trim())
    .filter((l) => l.length > 0 && !l.startsWith('```'));
}

/** Read a single "Label: value" recovery field (first match). */
export function recoveryField(content, label) {
  const line = String(content)
    .split('\n')
    .find((l) => l.startsWith(`${label}:`));
  return line ? line.slice(label.length + 1).trim() : '';
}

/** Extract the first fenced code block under a "## Heading". */
export function sectionCodeBlock(content, heading) {
  const body = extractSection(content, heading);
  const m = body.match(/```[a-z]*\n([\s\S]*?)```/i);
  return m ? m[1].trim() : body;
}

/**
 * Summarize a ledger's recovery-relevant fields for resume/brief.
 * @returns {{status:string, blockers:string[], nextSteps:string[],
 *            nextCommands:string, recovery:Object}}
 */
export function parseLedgerSummary(content) {
  const statusSection = extractSection(content, 'Current Status').split('\n')[0]?.trim();
  const status = statusSection || recoveryField(content, 'Current Status') || '';

  let blockers = listItems(extractSection(content, 'Blockers'));
  if (blockers.length === 0) {
    const v = recoveryField(content, 'Blockers');
    if (v && !/^none$/i.test(v)) blockers = [v];
  }

  const nextSteps = listItems(extractSection(content, 'Next Steps')).slice(0, 8);
  const nextCommands = sectionCodeBlock(content, 'Next Commands') || recoveryField(content, 'Commands Claude Should Run');

  const recovery = {};
  for (const label of [
    'Repository',
    'Branch',
    'Latest Commit',
    'Changed Files',
    'Tests',
    'Ready For GitHub Push',
    'Exactly What Claude Code Should Do Next',
  ]) {
    recovery[label] = recoveryField(content, label);
  }

  return { status, blockers, nextSteps, nextCommands, recovery };
}
