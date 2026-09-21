# Next Actions

Updated 2026-09-21 at the close of Cycle 1 (thin vertical). Latest handoff: `handoffs/2026-09-21-cycle1.md`.

## Product owner

1. **Ratify or amend:** G0 and G1 results (`gates/results/`), ADR-010 and ADR-012..ADR-020, and the PRD additions marked "ratify".
2. **OD-8:** git is initialized and this repo is on GitHub; choose/confirm CI (F-0023) if not already running.
3. **OD-11:** define or drop "Project Genome" (F-0025), and confirm how the separate 1stStep OS Audit product relates to this repository.
4. **Decide OD-6 (AI data policy)** before M3 uses any real user data.
5. **Later decisions:** OD-1 (hosting), OD-2 (search provider), OD-3 (shared identity), OD-4 (email), OD-5 (`/os` routing), OD-7 (error tracking), OD-9 (pricing/budgets), OD-10 (theme).

## Done in Cycle 1 (thin vertical)

- Deterministic `validateProfile` + `selectModules` in `packages/core` (existing schemas/registries).
- Golden fixtures for representative modules (web-saas, payments, mobile, ai, desktop deferral, ecommerce ± payments) plus shuffle-invariance.
- Pure compiler emits README, PROJECT.md, AGENTS.md stub, ARCHITECTURE.md stub, `state/CURRENT_STATE.md`.
- `POST /os/api/compile` returns ZIP or JSON; `/os` UI compiles and downloads.
- **Not done (still M1/M4):** golden fixture per all 22 modules; `packages/schemas`; full template set; adapter files; deflate ZIP; G2/G4 evaluation.

## Recommended next build cycle

- **M1 remainder:** `packages/schemas` (move schema validation out of `tools/spec.test.mjs`); remaining module goldens; optional G2/G4 results for the engine.
- **Or M2:** tenancy, auth on dev transport, Postgres/Drizzle, audit events — the compile route is currently unauthenticated.
- **Not yet:** AI calls, research, full compiler templates (M4), premium journey (M7), deployment.

## Housekeeping

- Keep `FILE_INDEX.md` current (`npm run check` enforces it).
- Do not expand the 301-capability registry unless a later cycle explicitly needs it.
