# Decisions — 1stStep OS

Short records live here. Long ADRs live in `architecture/decisions/` and are indexed below. ADR numbers are immutable once assigned.

## ADR-001 — Product name
**Status:** ACCEPTED  
**Decision:** The customer-facing product is **1stStep OS**.

## ADR-002 — Parent brand
**Status:** ACCEPTED  
**Decision:** 1stStep OS is part of **1stStep.ai**.

## ADR-003 — Product URL
**Status:** ACCEPTED  
**Decision:** Public product entry point is **`1ststep.ai/os`**. A new domain is not required.

## ADR-004 — Core specification name
**Status:** ACCEPTED  
**Decision:** The underlying portable specification is called the **Project OS**.

## ADR-005 — Persistent memory model
**Status:** ACCEPTED  
**Decision:** Project OS files are durable project memory. AI conversations are execution sessions, not authoritative storage.

## ADR-006 — Markdown + structured state
**Status:** ACCEPTED  
**Decision:** Markdown serves humans and LLMs; `.project-os/*.json` (or equivalent structured schemas) powers deterministic application behavior.

## ADR-007 — Vendor neutrality
**Status:** ACCEPTED  
**Decision:** The canonical Project OS is provider-neutral. Claude/Codex/Cursor/etc. are adapters.

## ADR-008 — Growth timing
**Status:** ACCEPTED  
**Decision:** Distribution/growth begins during project formation, not after the build finishes.

## ADR-009 — External side effects
**Status:** ACCEPTED  
**Decision:** Research and drafting may be automatic. Publishing, posting, account creation, submission, deployment, billing, and destructive actions require explicit capability/authorization and applicable approval gates.

## ADR-010 — MVP application architecture
**Status:** ACCEPTED (2026-09-13, Cycle 0; product-owner ratification pending). Previously OPEN ("Implementation stack").  
**Decision:** `architecture/decisions/ADR-010-mvp-application-architecture.md`. TypeScript/Node, Hono + React/Vite SPA at `/os`, PostgreSQL + Drizzle, self-hosted auth, organization tenancy with RLS defence in depth, pg-boss worker, container deployment (host open), deterministic streamed export. Open decisions OD-1..OD-10 do not block scaffolding.

## ADR-011 — Locked parent-brand logo
**Status:** ACCEPTED  
**Decision:** Keep the official 1stStep.ai logo used by the current live `1ststep.ai` site as the canonical mark across 1stStep OS, Audit, Job Agent, and related marketing assets. Preserve the real source artwork and its proportions; do not redesign, reinterpret, replace, redraw, or generate a new logo. A Signal Path motif may support secondary visuals and motion but cannot replace or alter the logo. The website repository documents the verified asset and placement rules in `main-website/docs/BRAND_LOGO_USAGE.md`. This brand decision does not choose the open G1 implementation architecture.

## ADR-012 — AI runtime, token harness and cost control
**Status:** ACCEPTED (2026-09-13; ratification pending)  
**Decision:** `architecture/decisions/ADR-012-ai-runtime-and-cost-harness.md`. Provider-neutral ModelClient (Anthropic + OpenAI adapters), TaskSpec registry, eval-gated static routing, scoped context assembly, reservation-based budgets, bounded retry/repair, full cost telemetry.

## ADR-013 — Premium experience architecture
**Status:** ACCEPTED (2026-09-13; ratification pending)  
**Decision:** `architecture/decisions/ADR-013-premium-experience-architecture.md`. Guided workspace IA (not a dashboard), canonical tokens, accessible primitives + CSS Modules, exhaustive resource-state rendering, CSS-first motion, WCAG 2.2 AA, CI-enforced performance budgets and visual regression, DESIGN_REVIEW gate. 1stStep OS uses the locked parent-brand logo (ADR-011).

## ADR-014 — Capability registry, Media Factory, Automation Engine, Business Owner Mode
**Status:** ACCEPTED (2026-09-13; ratification pending)  
**Decision:** `architecture/decisions/ADR-014-capabilities-media-automation-business-owner.md`. Registry + selective generator with separate generation and execution phases; Media Factory and automation execution deferred; Business Owner Mode ranking in P0.

## ADR-015 — Unified external-action scopes
**Status:** ACCEPTED (2026-09-13; resolves F-0001)  
**Decision:** One vocabulary: scopes `read, draft, approve, publish, account_create, deploy, billing, destructive` mapped to risk tiers T0–T3. `approve` is human-only; `account_create` is always manual. The previous classes AUTO_ALLOWED/ASSISTED/APPROVAL_REQUIRED/HIGH_RISK_APPROVAL map as documented in `EXTERNAL_ACTIONS.md`. Default: deny external writes.

## ADR-016 — Canonical schema format
**Status:** ACCEPTED (2026-09-13)  
**Decision:** JSON Schema draft 2020-12 under `schemas/<version>/` is the language-neutral canonical contract. Uncertain values use the `assessment` pattern so unknown is never encoded as false or empty. TypeScript types are derived, never the source.

## ADR-017 — No AI inside the compiler
**Status:** ACCEPTED (2026-09-13)  
**Decision:** Compilation is a pure deterministic function. AI prose is generated beforehand and stored as versioned GeneratedText inserted into declared slots (`GENERATION_CONTRACT.md`).

## ADR-018 — Separate generation phase and execution phase per capability
**Status:** ACCEPTED (2026-09-13)  
**Decision:** Each capability records when generated projects receive guidance and, separately, when 1stStep OS itself performs it. This keeps the capability universe describable without expanding MVP implementation (`plan/SCOPE.md`).

## ADR-020 — Universal LLM: provider-neutral execution
**Status:** ACCEPTED (2026-09-13; ratification pending)  
**Decision:** `architecture/decisions/ADR-012-ai-runtime-and-cost-harness.md` Amendment A. Policy before routing (ProviderPolicy), capability-based routing across endpoint types, BYO LLM connections with secret references and an SSRF boundary (P1), local/self-hosted runtime (P2), provider-independent checkpoints and failover that preserves run identity, eval registry. No canonical workflow requires a named provider.

## ADR-019 — Business goal intake is P0 (guidance + deterministic ranking only)
**Status:** ACCEPTED (2026-09-13; ratification pending)  
**Decision:** Business Owner Mode interview and ranked automation opportunity map are P0; automation execution is LATER.

## ADR-021 — Evidence-first free Audit as the existing-builder acquisition path
**Status:** Product direction APPROVED by Evan (2026-09-13); implementation scope, commercial terms, Audit engine contract, and release gates remain OPEN.  
**Decision:** The target model is free OS Audit → evidence-backed strengths/weaknesses/risks → personalized Project OS recommendation → paid OS spin-up → optional, justified specialist agents. Existing builders should eventually connect a project with read-only permission, pin its baseline, build an evidence-aware Project Genome, receive an applicable-domain audit and top priorities, then decide whether to spin up an OS. New builders retain the separate idea → interpretation → questions → Genome → proposed OS path. Both converge on Genome → Project OS → engineering team. A useful, truthful audit stands independently of purchase; healthy findings stay healthy, insufficient evidence stays UNKNOWN/UNVERIFIED, and specialist agents are never recommended solely to sell them. A generic 0–100 score is not the central product; quantitative readiness needs applicable controls and sufficient evidence. See `ARCHITECTURE.md` and the first-party methodology review in the public-site architecture docs. This decision does not itself approve connectors, pricing, payments, a sales funnel redesign, or a change to `plan/SCOPE.md` P0/P1 execution assignments. Root OS and the separate Audit engine must reconcile the G1.5 contracts before G2 persistence.

## ADR-022 — Zero metered AI/API cost for the standard free Audit
**Status:** Binding product invariant APPROVED by Evan (2026-09-13); implementation and release verification NOT STARTED.  
**Decision:** The standard customer-facing free OS Audit, including baseline-derived Genome, applicable checks, structured report, priority ranking, OS configuration and optional agent recommendations, must complete with **$0 incremental metered AI/API usage charged to 1stStep.ai**. No LLM, paid embeddings/reranking/search/enrichment, paid repository analysis or usage-priced coding agent is required anywhere on that path; a temporary free vendor credit is not a dependency. Deterministic local/open-source analysis, bounded user questions and approved versioned rules are the default. Paid activation can authorize metered reasoning separately. Infrastructure CPU, bandwidth, storage, queues and database use are real costs, measured and controlled separately; do not advertise an audit as literally costless. A future user-supplied AI credential is optional and outside the standard free result. `FREE-AUDIT-ZERO-METERED-COST` is a permanent release gate: a mandatory metered dependency blocks release unless Evan explicitly changes this invariant. No engine, connector or production behavior is implemented by this decision.
