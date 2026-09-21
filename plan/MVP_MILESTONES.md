# MVP Milestones

Each milestone is independently verifiable and ends with gate results in `gates/results/`, updated state and a handoff. No milestone includes production deployment. Production launch needs a separate owner-approved release cycle (G5 → T3 approval → G6).

---

## M0 — Canonical contracts and spec checks (Cycle 0)

- **Objective:** Reconciled Project OS authority, accepted architecture, versioned schemas, registries and runnable spec checks.
- **Inputs:** Repository authority files.
- **Outputs:** ADR-010, ADR-012..014, `GENERATION_CONTRACT.md`, `schemas/0.1.0/*`, `capabilities/registry.json`, `modules/registry.json`, `tools/spec.test.mjs`, audit findings, G1 result, scaffold.
- **Dependencies:** None.
- **Acceptance criteria:** `npm run check` passes; G1 GateResult validates with PASS; findings recorded with immutable IDs.
- **Tests:** Schema compile, fixtures, negative mutations, registry referential integrity, machine/Markdown agreement, FILE_INDEX, secret scan.
- **Cost considerations:** No AI or runtime cost.
- **Security considerations:** Unified action scopes; untrusted-content rendering rule; no secrets.
- **Gates:** G0 (spec intake), G1.

## M1 — Core domain engine

- **Objective:** Deterministic profile handling, risk ruleset and module/capability selection in `packages/core`.
- **Inputs:** Schemas 0.1.0, registries, selection spec in `tooling/CAPABILITY_REGISTRY.md`.
- **Outputs:** `packages/schemas` (validators), `validateProfile`, `classifyRisk` (ruleset 0.1.0), `selectModules`, decision emission, profile version append.
- **Dependencies:** M0; OD-8 (git + CI) strongly recommended.
- **Acceptance criteria:**
  - Golden selection fixtures for every one of the 22 modules (match, unknown → decision, NOT_APPLICABLE, DECLINED, dependency add, dependency contradiction, conflict error, phase deferral, consent deferral).
  - Identical output across repeated runs.
  - Core has no I/O or model imports.
- **Tests:** `node:test` unit + golden; boundary test; property test (shuffled registry order → same output).
- **Cost considerations:** None (Tier A).
- **Security considerations:** Inputs are schema-typed enums; injected free text cannot affect selection.
- **Gates:** G2, G4.

## M2 — Platform skeleton: tenancy, auth, data, audit

- **Objective:** Server + web shell at `/os` with Postgres, migrations, organization tenancy, dev auth, audit events, rate limiting.
- **Inputs:** ADR-010 D1–D4, D8.
- **Outputs:** `packages/db` (Drizzle schema: users, organizations, memberships, projects, profile_versions, audit_events, job_runs), tenant-scoped repositories with RLS, auth (magic link via dev transport + Google OAuth), `authorize()`, CSRF/origin checks, health endpoints, structured logging.
- **Dependencies:** M0 (can run in parallel with M1). OD-3/OD-4 needed to finish production auth, not to pass M2 on dev transport.
- **Acceptance criteria:**
  - A cross-tenant negative test for every repository passes.
  - Unauthenticated access is denied for every non-public route.
  - Audit event is written for each privileged action.
  - Migrations are reversible or have a forward-fix plan.
- **Tests:** PGlite repository tests; authz matrix tests; session/CSRF tests; login rate-limit test.
- **Cost considerations:** Local only; no hosting.
- **Security considerations:** Secrets via env only; cookie flags; IDOR prevention; least-privilege DB roles.
- **Gates:** G2, G3, G4.

## M3 — AI runtime and adaptive interview (build + business goal)

- **Objective:** ModelClient port with Anthropic and OpenAI adapters, router, budgets, telemetry, evals, and the adaptive interview for both modes.
- **Inputs:** ADR-012; M1 selection (to decide which fields matter); M2 persistence.
- **Outputs:**
  - `packages/ai-runtime` (TaskSpec registry, ContextAssembler, router, reservation budgets, retry/repair, `ai_calls`)
  - ModelProvider registry entries with verified pricing/features
  - `apps/worker`
  - Interview engine: deterministic next-field selection + AI phrasing/extraction, with user confirmation of INFERRED values
  - Business Owner Mode question plan
  - `tools/unit-cost`
- **Dependencies:** M1, M2. OD-6 before any real user data (synthetic fixtures until then).
- **Acceptance criteria:**
  - Every model call references a TaskSpec.
  - Hard budget stops the workflow with `BUDGET_EXCEEDED`.
  - Invalid structured output triggers exactly one repair and then a typed failure.
  - Eval pass rates recorded for chosen routes.
  - Worst-case and expected unit cost report produced.
  - Prompt-injection fixtures in idea text cannot change selection or rules.
- **Tests:** Replay-adapter unit tests; budget reservation concurrency test; eval runs; injection fixtures; adapter contract tests (recorded, no live keys in CI).
- **Cost considerations:** Live eval runs are budget-capped and logged; replay by default.
- **Security considerations:** API keys only in env/secret store; prompts stored tenant-scoped with retention; untrusted-text fencing.
- **Gates:** G2, G3, G4, COST_REVIEW.

## M4 — Project OS compiler, templates, adapters, deterministic export

- **Objective:** Pure compiler producing P0 module bundles with adapters and byte-identical ZIPs.
- **Inputs:** `GENERATION_CONTRACT.md`; M1 selection output; fixture profiles.
- **Outputs:** `templates/` for all P0 modules, compiler S1–S9, validators, ZIP writer, CHANGELOG diff, adapter files (Claude, Codex, Cursor, generic).
- **Dependencies:** M1 (not M3; uses fixture GeneratedText).
- **Acceptance criteria:**
  - Golden ZIP hashes stable across two runs and two machines/OSes.
  - All S7 validations enforced with a negative test each.
  - No nested `AGENTS.md`.
  - Adapters add no rules (diff test against canonical).
  - Cursor/Codex conventions verified and recorded.
- **Tests:** Golden files; path traversal; secret injection; unfenced untrusted text; placeholder; size limits; adapter authority header.
- **Cost considerations:** CPU only.
- **Security considerations:** Archive safety; second-order prompt injection; no secrets in bundles.
- **Gates:** G2, G3, G4.

## M5 — Research engine

- **Objective:** Evidence-bound research producing ResearchClaims with provenance, freshness and confidence.
- **Inputs:** `RESEARCH_POLICY.md` research contract; ADR-010 D11; M3 runtime.
- **Outputs:** `packages/research` (SearchProvider adapter, SSRF-safe PageFetcher, excerpt verification, confidence scoring, freshness jobs), research question generation from modules' `researchTopics`, claims storage.
- **Dependencies:** M2, M3; OD-2 for live research (fixture provider before that).
- **Acceptance criteria:**
  - A fabricated excerpt is rejected.
  - With no provider configured, questions resolve to BLOCKED claims.
  - Stale claims mark dependent recommendations NEEDS_EVIDENCE.
  - The SSRF suite passes.
  - Snippet-only claims can't exceed LOW confidence.
- **Tests:** SSRF (private IPs, DNS rebinding, redirects, IPv6, metadata endpoints); robots; size/timeouts; excerpt verification; freshness transitions.
- **Cost considerations:** Per-project research budget; public fetch cache.
- **Security considerations:** SSRF, content-type confusion, prompt injection from pages, copyright-limited excerpts (≤ 500 chars).
- **Gates:** G2, G3, G4, COST_REVIEW.

## M6 — Recommendations and Business Owner Mode ranking

- **Objective:** Stack, pricing, positioning and channel recommendations linked to claims; deterministic automation opportunity ranking.
- **Inputs:** M1 profile/selection; M5 claims; ADR-014 §5 scoring.
- **Outputs:** Deterministic option generation + AI rationale; Recommendation lifecycle (PROPOSED → ACCEPTED only via user approval or versioned rule); opportunity scoring in core; NEEDS_DATA handling.
- **Dependencies:** M1, M3, M5.
- **Acceptance criteria:**
  - No recommendation reaches ACCEPTED automatically when it depends on claims below OBSERVED.
  - Every material recommendation lists claim/assumption ids.
  - Unknown ROI inputs never rank as zero.
- **Tests:** Acceptance-rule tests; scoring golden fixtures; eval set for rationale grounding.
- **Cost considerations:** Tier C tasks budgeted; rationale cached per inputs.
- **Security considerations:** Model output cannot set decision fields (schema + code guard).
- **Gates:** G2, G4, COST_REVIEW.

## M7 — Premium end-to-end journey

- **Objective:** Start → Understand → Evidence → Decide → Your OS (preview) → Download → Start Building, plus the business-goal variant.
- **Inputs:** ADR-013; M3, M4, M6.
- **Outputs:** Design tokens, primitives, domain components, all ResourceState renderers, SSE progress, approval dialog patterns, export flow, project deletion/export of own data.
- **Dependencies:** M3, M4, M6; OD-10 for theme finalization.
- **Acceptance criteria:**
  - Critical path E2E passes on 360/768/1440.
  - Performance budgets met.
  - axe finds no serious/critical issues.
  - Visual baselines approved.
  - Preview bytes == downloaded bytes (hash).
- **Tests:** Playwright E2E with replay model + fixture research; visual regression; a11y; performance; keyboard-only.
- **Cost considerations:** E2E uses replay; zero live model spend in CI.
- **Security considerations:** Sanitized Markdown rendering; CSP; export auth; rate limits.
- **Gates:** G2, G4, DESIGN_REVIEW.

## M8 — Staging release readiness (no production)

- **Objective:** Deployable, observable staging environment and release evidence.
- **Inputs:** ADR-010 D7/D8; M7.
- **Outputs:** Container image, staging environment, migrations run, backups and restore test, error tracking, dashboards (SQL views), runbooks, security review, unit-cost report, known issues.
- **Dependencies:** M7; OD-1, OD-5, OD-7; owner approval for staging resources (billing scope).
- **Acceptance criteria:**
  - G5 PASS evidence: rollback rehearsed, restore tested, alerts firing in test, budgets configured, no open HIGH/CRITICAL findings.
  - Production deploy remains a separate T3-approved action.
- **Tests:** Smoke tests against staging; restore drill; load sanity for job queue.
- **Cost considerations:** Staging resources sized minimum; spend tracked.
- **Security considerations:** Separate secrets/DBs; dependency and image scanning; security gate.
- **Gates:** G3, G5, COST_REVIEW.
