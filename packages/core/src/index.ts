// Pure domain core (ADR-010). No I/O, no network, no model SDKs, no database.
// Selection, risk rules and the compiler arrive in M1/M4.

export const SCHEMA_VERSION = '0.1.0';
export const PLATFORM_PHASE = 'P0';
export const EVIDENCE_STATES = ['CONFIRMED', 'OBSERVED', 'INFERRED', 'ASSUMED', 'UNVERIFIED', 'BLOCKED'] as const;
export type EvidenceState = (typeof EVIDENCE_STATES)[number];
