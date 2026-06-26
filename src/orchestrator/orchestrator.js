// AGATHON LABS — Orchestrator (the operating OS)
//
// Runs a request through the AGATHON LABS reporting flow (AGENTS.md §3):
//
//   Ion → Ethan(analyze → route) → assigned agents → Guard(quality gate)
//       → Ethan(consolidate) → Ion(report)
//
// Routing (analyzer) and execution (runtimes) are both pluggable, so the same
// pipeline works for the deterministic planner today and for Claude Code /
// Codex / OpenAI Agents tomorrow.

import { getAgent, qualityGate } from './agents.js';
import { analyzeTask } from './analyzer.js';
import { resolveRuntime } from './runtimes/index.js';
import './runtimes/index.js'; // ensure runtimes are registered

/**
 * @typedef {Object} OrchestrationResult
 * @property {import('./analyzer.js').RoutingPlan} plan
 * @property {string} runtime            Runtime actually used.
 * @property {boolean} runtimeFellBack   Whether a fallback runtime was used.
 * @property {object[]} executions       Per-agent runtime results.
 * @property {object|null} guardReview   Guard's review result (or null).
 * @property {string} report             Ethan's Ion-facing report (markdown).
 */

/**
 * Execute one request end-to-end.
 * @param {string} task
 * @param {{ runtime?: string, reasoner?: object, context?: object }} [options]
 * @returns {Promise<OrchestrationResult>}
 */
export async function orchestrate(task, { runtime = 'plan', reasoner, context = {} } = {}) {
  // 1. Ethan analyzes & routes.
  const plan = await analyzeTask(task, { reasoner, context });

  // Resolve execution backend (falls back to `plan` if unavailable).
  const { runtime: backend, fellBack, reason } = await resolveRuntime(runtime);

  // 2. Dispatch owner + collaborators.
  const executions = [];
  if (!plan.clarifyNeeded && plan.owner) {
    const ownerAgent = getAgent(plan.owner);
    executions.push(
      await backend.run({ agent: ownerAgent, task, context: { ...context, owner: plan.owner } }),
    );
    for (const id of plan.collaborators) {
      const a = getAgent(id);
      const sub = plan.assignments.find((x) => x.agent === id)?.subtask || task;
      executions.push(await backend.run({ agent: a, task: sub, context: { ...context, owner: plan.owner } }));
    }
  }

  // 3. Guard quality gate before delivery.
  let guardReview = null;
  if (plan.needsGuard && !plan.clarifyNeeded) {
    const gate = qualityGate();
    if (plan.owner !== gate.id) {
      guardReview = await backend.run({
        agent: gate,
        task: `公開前チェック: ${task}`,
        context: { ...context, reviewing: executions.map((e) => e.agent) },
      });
    }
  }

  // 4 + 5. Ethan consolidates and reports to Ion.
  const report = buildReport({ plan, executions, guardReview, runtime: backend.name, fellBack, reason });

  return {
    plan,
    runtime: backend.name,
    runtimeFellBack: fellBack,
    runtimeFallbackReason: reason,
    executions,
    guardReview,
    report,
  };
}

/** Ethan's Ion-facing report (AGENTS.md §8 format). */
export function buildReport({ plan, executions, guardReview, runtime, fellBack, reason }) {
  const lines = [];
  lines.push('## 結論');
  if (plan.clarifyNeeded) {
    lines.push(`「${plan.task}」は担当が確定できませんでした。意図の確認をお願いします。`);
  } else {
    const owner = getAgent(plan.owner);
    const team = plan.collaborators.map((id) => getAgent(id).name);
    lines.push(
      `${owner.name} 主導${team.length ? `（連携: ${team.join(' / ')}）` : ''}で着手しました。`,
    );
  }

  lines.push('', '## やったこと');
  if (plan.clarifyNeeded) {
    lines.push('- タスク解析を実施（明確な担当一致なし）');
  } else {
    lines.push(`- 意図整理: ${plan.intent}`);
    if (plan.subtasks.length > 1) {
      lines.push(`- タスク分解: ${plan.subtasks.length}件`);
    }
    for (const e of executions) {
      lines.push(`- ${getAgent(e.agent).name}: ${e.status === 'ok' ? '実行' : e.status}`);
    }
    if (guardReview) lines.push('- Guard: 品質・リスク確認を実施');
  }

  lines.push('', '## 根拠 / 確認したこと');
  lines.push(`- ルーティング根拠: ${plan.reasoning.join(' ') || '—'}`);
  lines.push(`- 実行ランタイム: ${runtime}${fellBack ? `（フォールバック: ${reason}）` : ''}`);

  lines.push('', '## 未完了・リスク');
  if (plan.clarifyNeeded) {
    lines.push('- 担当未確定。Ionの意図確認が必要。');
  } else {
    const risks = new Set();
    for (const e of executions) for (const r of e.handoff?.risks || []) risks.add(r);
    if (guardReview) for (const r of guardReview.handoff?.risks || []) risks.add(r);
    if (risks.size === 0) risks.add('特筆すべきリスクなし。');
    for (const r of risks) lines.push(`- ${r}`);
  }

  lines.push('', '## 次の一手（おすすめ）');
  if (plan.clarifyNeeded) {
    lines.push('- 「何を / いつまでに / 誰向けに」を一言もらえれば即割り振ります。');
  } else if (runtime === 'plan') {
    lines.push('- 実モデル実行は対応ランタイム（claude-code / codex / openai-agents）接続後に有効化。');
  } else {
    lines.push('- 成果物をIon承認 → 必要なら本番反映。');
  }

  return lines.join('\n');
}
