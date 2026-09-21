# Next Actions

Updated 2026-09-13 at the close of Cycle 0. Latest handoff: `handoffs/2026-09-13-cycle0.md`.

## Product owner (before or during Cycle 1)

1. **Ratify or amend:** G0 and G1 results (`gates/results/`), ADR-010 and ADR-012..ADR-020, and the PRD additions marked "ratify".
2. **OD-8: put the repository under version control** and choose CI (F-0023). Strongly recommended before M1.
3. **Remove the two empty 22-byte update zips** in the repository root (F-0020), or confirm they should stay.
4. **OD-11:** define or drop "Project Genome" (F-0025), and confirm how the separate 1stStep OS Audit product relates to this repository.
5. **Decide OD-6 (AI data policy)** before M3 uses any real user data.
6. **Later decisions:** OD-1 (hosting), OD-2 (search provider), OD-3 (shared identity), OD-4 (email), OD-5 (`/os` routing), OD-7 (error tracking), OD-9 (pricing/budgets), OD-10 (theme).

## Recommended next build cycle — Cycle 1: M1 Core domain engine

- **Objective:** deterministic profile validation, risk ruleset 0.1.0 and `selectModules()` in `packages/core` per `tooling/CAPABILITY_REGISTRY.md`.
- **Entry criteria:** `npm test` green; OD-8 decided (or explicitly deferred).
- **Acceptance:** golden fixtures for all 22 modules; shuffle-invariance property test; core boundary test green; G2 + G4 results recorded.
- **Can run in parallel:** M2 platform skeleton (tenancy, auth on dev transport, Postgres/Drizzle, audit events) if a second workstream is available.
- **Not in Cycle 1:** AI calls, research, compiler templates, UI journey, deployment.

## Housekeeping

- Keep `FILE_INDEX.md` current (`npm run check` enforces it).
- When `packages/schemas` is created in M1, move schema validation from `tools/spec.test.mjs` into it and keep one spec check entry point.
