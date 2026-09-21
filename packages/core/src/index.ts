// Pure domain core (ADR-010). No I/O, no network, no model SDKs, no database.
export { SCHEMA_VERSION, PLATFORM_PHASE, COMPILER_VERSION, RISK_RULESET_VERSION, EVIDENCE_STATES } from './types.ts';
export type { EvidenceState, Profile, CompileRequest, CompileResult, IntakeForm, Artifact, SelectionResult } from './types.ts';
export { validateProfile } from './validate-profile.ts';
export { classifyRisk } from './classify-risk.ts';
export { selectModules } from './select-modules.ts';
export { buildProfile, deriveName } from './profile-from-idea.ts';
export { compileProjectOs, renderUntrusted } from './compile.ts';
export { buildZip, zipFileNames } from './zip.ts';
export { runCompile, zipCompile } from './run-compile.ts';
