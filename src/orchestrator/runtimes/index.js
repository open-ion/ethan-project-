// AGATHON LABS — Runtime registration
//
// Registers every execution backend. Import this once to populate the registry.
// Add a new backend = register it here; the orchestrator needs no other change.

import { registerRuntime } from './runtime.js';
import { planRuntime } from './planRuntime.js';
import { claudeCodeRuntime, codexRuntime, openaiAgentsRuntime } from './externalRuntime.js';

registerRuntime(planRuntime);
registerRuntime(claudeCodeRuntime);
registerRuntime(codexRuntime);
registerRuntime(openaiAgentsRuntime);

export * from './runtime.js';
