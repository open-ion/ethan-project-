// AGATHON LABS — Daily AGATHON Brief
//
// First production task for the orchestration OS. Ethan consolidates the day's
// state into one short report for Ion, attributing each section to the
// responsible AI employee. It CONSUMES the AI Handoff Ledger (the latest
// docs/handoff/ entry) so the operating system's own memory feeds the brief —
// closing the loop between Echo/Ledger and Ethan's reporting.
//
// Pure and dependency-free: `buildDailyBrief(facts)` takes gathered facts and
// returns markdown. Fact gathering (git, ledger parse) lives in
// scripts/daily-brief.mjs so this stays unit-testable.

import { getAgent } from './agents.js';

/** Section → responsible AI employee(s). Validated against the registry. */
export const BRIEF_SECTIONS = [
  { key: 'priorities', title: '今日の優先事項', owners: ['pulse', 'nova'] },
  { key: 'progress', title: 'GitHub / Pages / app 進捗', owners: ['forge'] },
  { key: 'routing', title: 'AI社員ルーティング', owners: ['ethan'] },
  { key: 'guard', title: 'Guard 注意点', owners: ['guard'] },
  { key: 'next', title: 'Ionへの次の一手', owners: ['ethan'] },
];

function ownerLabel(ids) {
  return ids.map((id) => getAgent(id)?.name ?? id).join(' / ');
}

function bullets(items, fallback) {
  const list = (items || []).filter(Boolean);
  if (list.length === 0) return `- ${fallback}`;
  return list.map((i) => `- ${i}`).join('\n');
}

/**
 * Build the Daily AGATHON Brief markdown from gathered facts.
 * @param {Object} facts
 * @param {string} [facts.date]
 * @param {string} [facts.branch]
 * @param {string} [facts.latestCommit]   "<sha> <subject>"
 * @param {Object} [facts.ledger]         { file, status, nextSteps[], blockers[] }
 * @param {Object} [facts.ci]             { docsGovernance, updateNewsSchedule }
 * @param {Object} [facts.pages]          { source, note }
 * @returns {string} markdown
 */
export function buildDailyBrief(facts = {}) {
  const date = facts.date || new Date().toISOString().slice(0, 10);
  const branch = facts.branch || '(unknown)';
  const latestCommit = facts.latestCommit || '(none)';
  const ledger = facts.ledger || {};
  const ci = facts.ci || {};
  const pages = facts.pages || {};

  const status = ledger.status || '不明';
  const blockers = ledger.blockers || [];
  const noBlockers = blockers.length === 0 || /none/i.test(blockers.join(' '));

  const out = [];
  out.push(`# Daily AGATHON Brief — ${date}`);
  out.push('');
  out.push('> Ethanがその日のAGATHON LABSの状態を1枚に統合し、Ionへ報告する。各節は担当AI社員に帰属。');
  out.push('');

  // 結論（Ethan）
  out.push('## 結論');
  out.push(
    noBlockers
      ? `現状 ${status}。ブロッカーなし。\`${branch}\` は最新で、運営OSは稼働可能。`
      : `現状 ${status}。未解消ブロッカー ${blockers.length} 件あり（下記 Guard 注意点）。`,
  );
  out.push('');

  // 今日の優先事項（Pulse / Nova）← 最新Ledgerの Next Steps を源泉に
  const sPriorities = BRIEF_SECTIONS[0];
  out.push(`## ${sPriorities.title}（${ownerLabel(sPriorities.owners)}）`);
  out.push(bullets(ledger.nextSteps, '最新Ledgerに Next Steps の記載なし。Ethanが当日分を起票する。'));
  out.push('');

  // 進捗（Forge）
  const sProgress = BRIEF_SECTIONS[1];
  out.push(`## ${sProgress.title}（${ownerLabel(sProgress.owners)}）`);
  out.push(`- ブランチ: \`${branch}\` @ ${latestCommit}`);
  out.push(`- CI(Docs Governance): ${ci.docsGovernance || '未取得'}`);
  out.push(`- 公開(Update News schedule): ${ci.updateNewsSchedule || '未取得'}`);
  out.push(`- Pages: ${pages.note || `Source=${pages.source || '要目視確認'}`}`);
  out.push('');

  // ルーティング（Ethan）
  const sRouting = BRIEF_SECTIONS[2];
  out.push(`## ${sRouting.title}（${ownerLabel(sRouting.owners)}）`);
  out.push('| 項目 | 担当AI |');
  out.push('| --- | --- |');
  for (const s of BRIEF_SECTIONS) {
    if (s.key === 'routing') continue;
    out.push(`| ${s.title} | ${ownerLabel(s.owners)} |`);
  }
  out.push('');

  // Guard 注意点
  const sGuard = BRIEF_SECTIONS[3];
  out.push(`## ${sGuard.title}（${ownerLabel(sGuard.owners)}）`);
  out.push(bullets(noBlockers ? [] : blockers, '特筆すべきリスク・ブロッカーなし。'));
  out.push('');

  // Ionへの次の一手（Ethan）
  const sNext = BRIEF_SECTIONS[4];
  out.push(`## ${sNext.title}（${ownerLabel(sNext.owners)}）`);
  const next = (ledger.nextSteps && ledger.nextSteps[0]) || '当日の依頼をEthanが分解し担当AIへ割り振る。';
  out.push(`- ${next}`);
  if (pages.source !== 'GitHub Actions') {
    out.push('- Settings→Pages の Source = GitHub Actions を1度だけ目視確認（cleanup Step1の確定）。');
  }
  out.push('');
  out.push(`_出典: 最新Ledger ${ledger.file || '(なし)'} / git ${branch}_`);

  return out.join('\n');
}
