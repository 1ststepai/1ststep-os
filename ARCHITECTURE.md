# Architecture Contract

Accepted architecture: `architecture/decisions/ADR-010` (application), `ADR-012` (AI runtime & cost), `ADR-013` (premium experience), `ADR-014` (capabilities, media, automation, Business Owner Mode). Compiler contract: `GENERATION_CONTRACT.md`.

## Target acquisition and assessment contract (ADR-021)

**Binding free-tier constraint (ADR-022):** The standard free-result dependency graph is entirely deterministic and has no mandatory metered AI/API edge. Repository/HTML/configuration/Git facts plus minimal user-confirmed answers feed baseline, profile/Genome signals, applicable static checks, approved rule/PatternDefinition evaluation, evidence, findings, priority and OS/agent recommendation mappings, and a templated report. A detector records its rule/version, scope, input hash and evidence references; a missing source remains UNKNOWN/NOT ASSESSED. Neither the free Genome nor the report renderer nor recommendation selector may call a model. Sophisticated UX, market, business or architecture judgment beyond reliable static checks is NOT ASSESSED or reserved for the separately authorized paid phase. This binding path narrows the provider-neutral worker architecture in `1stStep OS Audit/ARCHITECTURE.md` for free executions; it does not prohibit paid or internal model-assisted research and reviewed pattern authoring.

Maintain a separate free-audit cost ledger: metered AI/API usage **$0**, infrastructure runtime/CPU/memory, repository bytes/files, bandwidth/storage and cache hit/miss recorded where available. Limit size/count, execution time, concurrency, repeated audits and retention. Reuse only safe, permission-aware results for the same pinned baseline/manifest plus engine/control/approved-pattern versions and evidence freshness; never share raw private evidence across tenants merely because commits match. `FREE-AUDIT-ZERO-METERED-COST` blocks a release when a standard free path calls or requires a usage-priced provider. See `COST_REVIEW_GATE.md`; no gate has passed and no free engine is live.

The primary **future** path for an existing builder is: free audit request → permissioned read-only project connection → pinned identity/baseline → evidence-aware Project Genome → applicable-domain audit → verified strengths, weaknesses, risks and unknowns → top priorities → justified Project OS configuration → optional paid spin-up → core engineering team → only needed specialist agents → remediation, independent verification, re-audit and release. The free report must remain useful without a purchase. A request or URL is not a connection, a preliminary review is not a completed audit, and a scaffold or fixture is not a customer outcome.

The new-builder path remains idea/business goal → plain-language interpretation → adaptive questions → preliminary Genome/Profile → evidence-labeled recommendations → proposed Project OS; it needs no fictional repository baseline. Both paths converge on one versioned Genome/Profile, Project OS and engineering-team authority contract, not one generic questionnaire. Root `AGENTS.md` currently leaves “Project Genome” undefined (F-0025); this diagram is a product requirement, **not** permission to persist a new Genome schema before reconciliation.

The separate `1stStep OS Audit` foundation owns audit-specific controls, evidence strength, immutable baselines, scoring, finding history and verification. The OS owns the project/profile, capability and generated OS contracts. Exchange versioned records through `1stStep OS Audit/INTEGRATION_CONTRACT.md`; a lossy base Finding export must not become the audit ledger. Applicability follows verified project type and the approved Genome fields; uncertain applicability stays unresolved. Show findings and evidence coverage before any readiness number, and suppress a customer-facing aggregate when coverage or source identity cannot support it. Never turn unknown into a defect, a good audit into a sales objection, or an unnecessary agent into a recommendation. Exact coverage and score-publishing gates remain an Audit-engine design decision.

`1ststep.ai/os` and `/os/start/` are public concept/preview surfaces owned by the website. The root React shell and separate backend direction still have an unresolved route, ownership and release contract; neither is integrated or live because this decision was recorded. `app.1ststep.ai` remains the Job Agent orchestrator's domain. Price, payment, entitlement, connection consent, retention, provider permissions and the P0/P1 audit sequencing require their existing owner gates. The current foundation pipeline below remains the implemented-scope plan until those decisions change explicitly.

## Canonical pipeline (MVP)

```text
Plain-English Idea  ─or─  Business Goal
        ↓
Adaptive Interview (deterministic question selection, AI phrasing/extraction, user confirmation)
        ↓
Canonical Project Profile (versioned, schema-validated)
        ↓
┌─────────────────────────────────────────┐
│ Risk Engine (deterministic)             │
│ Module & Capability Selection (determ.) │
│ Research Engine (evidence-bound)        │
│ Recommendation Engines: stack, pricing, │
│   positioning, channels, automation ROI │
└─────────────────────────────────────────┘
        ↓
User reviews assumptions / decisions / approvals
        ↓
Project OS Compiler (pure, deterministic)
        ↓
┌────────────┬────────────┬──────────────┐
│ Markdown   │ Structured │ Provider     │
│ OS         │ State      │ Adapters     │
└────────────┴────────────┴──────────────┘
        ↓
Preview → Download ZIP → Start Building
(Git connection / push: P1–P2)
```

Module selection consumes profile facts only, never the stack recommendation, so the pipeline has no cycle. Stack recommendation consumes the selected modules.

## Runtime layers

```text
apps/web (premium SPA) ──▶ apps/server (Hono: auth, authorize(), API, ActionExecutor, export)
                                 │
                 ┌───────────────┼──────────────────┐
           packages/core    packages/db        apps/worker (pg-boss)
           (pure domain)    (Postgres, RLS)          │
                                              packages/ai-runtime ── model adapters
                                              packages/research ──── search / SSRF-safe fetch
```

## Later architecture

```text
Git Repository (read-only GitHub App, sandbox, no code execution)
      ↓
Repository Scanner + Index
      ↓
Observed Implementation
      ↕
Canonical Project OS
      ↓
Drift / Compliance Engine  +  Continuous Intelligence watches (budgeted)
      ↓
Findings + Health + Remediation
```

## Required architectural properties

- Vendor-neutral canonical core
- Versioned schemas
- Deterministic module and capability selection
- No model calls inside deterministic work or the compiler
- Idempotent generation jobs
- Reproducible exports
- Tenant isolation
- Explicit connector scopes
- Research provenance and freshness
- Cost observability and enforced budgets for AI/research workloads
- Prompt-injection defense, including second-order injection into generated files
- External-action authorization model
- Consent and provenance for identity-bearing media
- Extensible module and capability registries
- Provider adapter registry
- Premium, accessible, performance-budgeted UI

## Phase 0 architecture decision

Completed in Cycle 0; see the ADRs above. Each decision records recommended option, alternatives, tradeoffs, cost, lock-in, security, future scaling and migration path.
