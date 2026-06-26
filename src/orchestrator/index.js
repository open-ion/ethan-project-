// AGATHON LABS — Orchestration OS public API
//
// One import point for the whole operating layer.
//
//   import { orchestrate } from './src/orchestrator/index.js';
//   const result = await orchestrate('最新のAIニュースをまとめて');
//   console.log(result.report);

export { AGENTS, getAgent, routableAgents, orchestrator, qualityGate } from './agents.js';
export { analyzeTask, heuristicReasoner, splitTask } from './analyzer.js';
export { orchestrate, buildReport } from './orchestrator.js';
export {
  registerRuntime,
  getRuntime,
  listRuntimes,
  resolveRuntime,
  makeHandoff,
} from './runtimes/index.js';
