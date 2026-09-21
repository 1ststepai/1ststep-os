# ADR-010 — MVP Application Architecture

- **Status:** ACCEPTED (agent-evaluated in Cycle 0 under the autonomous Cycle 0 mandate; product-owner ratification PENDING, see `gates/results/G1-2026-09-13-cycle0.json`)
- **Date:** 2026-09-13
- **Supersedes:** `DECISIONS.md` ADR-010 "Implementation stack — OPEN"
- **Companion ADRs:** ADR-012 AI runtime & cost harness · ADR-013 Premium experience · ADR-014 Capability registry, Media Factory, Automation Engine, Business Owner Mode

## Evidence note

No web research was performed in Cycle 0. Statements about third-party technology come from model knowledge and are **INFERRED**. Anything version-, price-, limit- or terms-specific is **UNVERIFIED**. Every milestone that adopts a dependency or vendor has to verify those facts as an entry criterion and record them (ToolProvider/ModelProvider registry entry, or an ADR amendment). Local facts are **OBSERVED**: Node.js v24.14.1, npm 11.12.1, git 2.53 installed; the repository is not a git repository.

## Context and drivers

From `PRODUCT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `AI_RUNTIME_OS.md`, `PREMIUM_EXPERIENCE_OS.md` and `EVERYTHING_OS.md`:

1. Deterministic, reproducible Project OS generation from versioned schemas and registries.
2. Vendor-neutral canonical core; provider-specific code only in adapters.
3. Long-running research and AI synthesis work (minutes, not request-sized).
4. Tenant isolation and a strict external-action authorization model from day one.
5. AI cost control designed in (budgets, routing, telemetry), not bolted on.
6. A premium, fast, accessible UI. Not a generic dashboard.
7. A small team: low operational burden, few moving parts, fast tests.
8. A capability universe of 301 capabilities and 22 modules that must be **selectable**, not implemented, in MVP.

## Decision summary

| # | Area | Decision |
|---|---|---|
| D1 | Runtime / web framework | TypeScript on Node.js LTS; Hono HTTP server; React + Vite SPA served under `/os`; domain logic in framework-free packages |
| D2 | Database | PostgreSQL (managed), Drizzle ORM + committed SQL migrations; canonical documents as schema-validated JSONB; append-only versions |
| D3 | Authentication | Self-hosted auth library (Better Auth) with sessions in our Postgres; magic link + Google OAuth in MVP |
| D4 | Authorization / multitenancy | Organization-as-tenant from day one; one server-side `authorize()`; tenant-scoped repositories; Postgres RLS as defence in depth |
| D5 | Storage | No object storage in MVP (exports regenerate deterministically); S3-compatible `BlobStore` introduced with P1 recovery / P2 media |
| D6 | Background jobs | Postgres-backed queue (pg-boss) + worker process from the same codebase |
| D7 | Deployment | One OCI image, `server` + `worker` processes, container PaaS + managed Postgres; staging only until G5 + owner approval |
| D8 | Observability | Structured JSON logs with correlation IDs and redaction; `audit_events`, `ai_calls`, `job_runs` tables; OTel context; error tracker before G5 |
| D9 | Testing | `node:test` for pure packages, Playwright for E2E/visual/a11y, golden-file compiler tests, PGlite DB tests, schema mutation tests, AI evals |
| D10 | AI provider abstraction | Provider-neutral `ModelClient` port with Anthropic and OpenAI adapters, router, budgets and telemetry (ADR-012) |
| D11 | Research / search abstraction | `SearchProvider` + in-house SSRF-safe `PageFetcher`; quote-anchored claim extraction; provider OPEN (OD-2) |
| D12 | Media / model provider abstraction | Capability-typed ports resolved through ModelProvider/ToolProvider registries; execution LATER (ADR-014) |
| D13 | Connector architecture | Connector = ToolProvider + encrypted grant + scope map; every external call goes through one `ActionExecutor`; zero connectors in MVP |
| D14 | Capability registry | Versioned JSON registries in the repo, validated in CI, loaded read-only |
| D15 | Module-selection engine | Pure deterministic function in `packages/core`; no AI |
| D16 | Project OS compiler | Pure function per `GENERATION_CONTRACT.md`; logic-less templates; AI text generated before compile and stored |
| D17 | Export / download | Deterministic streamed ZIP, auth-checked, not persisted; manifest + ZIP hash shown in preview |
| D18 | Future GitHub recovery (P1) | Read-only GitHub App, ephemeral sandbox, no code execution, secret redaction before model context |
| D19 | Future continuous intelligence (P2) | Budgeted scheduled watches → snapshots → diffs → Findings; never auto-mutate accepted decisions |

## Repository layout (target)

```text
apps/server         Hono API; serves the built SPA at /os; auth; ActionExecutor
apps/web            React + Vite SPA (premium UX per ADR-013)
apps/worker         job worker (added in M3/M5)
packages/core       pure domain: profile rules, risk ruleset, selection, compiler, adapters (no I/O, no model SDKs)
packages/schemas    validators generated from /schemas (added in M1)
packages/ai-runtime ModelClient port, adapters, router, budgets, telemetry (added in M3)
packages/research   search/fetch ports, SSRF-safe fetcher, claim verification (added in M5)
packages/db         Drizzle schema, migrations, tenant-scoped repositories (added in M2)
```

Packages are created by the milestone that first needs them. The Cycle 0 scaffold only creates the workspace, `apps/server`, `apps/web`, `packages/core` and the boundary check.

**Dependency rule (enforced by test):** `packages/core` must not import model SDKs, `ai-runtime`, `db`, network or filesystem modules. Everything deterministic stays testable without I/O.

---

## D1 — Runtime and web framework

- **Recommended:** TypeScript on Node.js LTS. HTTP with Hono on its Node adapter. UI as a React + Vite single-page app built to static assets and served by the same Node process under base path `/os`.
- **Alternatives:** Next.js App Router; SvelteKit; Python (FastAPI) API + React.
- **Tradeoffs:** The product surface is an authenticated, wizard-like workspace, so SSR buys little. Public SEO pages belong on `1ststep.ai`, and a prerendered static landing page can be added if `/os` needs one. Next.js adds server/client boundary complexity and faster framework churn, and it is optimized for a serverless hosting shape that conflicts with minutes-long jobs (D6/D7). Python would split the schema-driven compiler and UI across two languages; TypeScript lets the same compiler code run on server and, if needed, in preview.
- **Cost:** No licence cost; small dependency surface.
- **Lock-in:** Low. Hono is built on Web-standard Request/Response (INFERRED) and portable across runtimes; React components are framework-agnostic.
- **Security:** Cookie sessions with `SameSite=Lax` plus an Origin check on every mutating route (CSRF); strict CSP with no inline scripts; no HTML from untrusted content is rendered without sanitization (ADR-013).
- **Future scaling:** Stateless server processes scale horizontally; CPU-heavy compile and research run in the worker.
- **Migration path:** If SSR becomes necessary, UI routes can move to a React SSR framework. `packages/core` is unaffected.

## D2 — Database

- **Recommended:** Managed PostgreSQL (≥ 16) using only standard Postgres features in core code. Drizzle ORM with committed, reviewed SQL migrations. Canonical documents (profile versions, claims, recommendations, manifests, gate results) stored as JSONB and validated against `schemas/` on write, with relational columns for tenancy, IDs, status and indexes. Profile and decision history is append-only.
- **Alternatives:** SQLite/libSQL; MongoDB; a BaaS platform (Postgres plus its proprietary auth/storage/RLS helpers).
- **Tradeoffs:** Postgres supports relational integrity, JSONB documents, full-text search (research text), RLS, a job queue (D6) and pgvector (P1 retrieval) in one system. SQLite is cheaper and simpler but weaker for multi-process workers and RLS. A BaaS speeds early auth/storage but couples core code to vendor features.
- **Cost:** One small managed instance for staging/MVP; exact pricing UNVERIFIED (OD-1).
- **Lock-in:** Low while core code avoids provider-specific extensions.
- **Security:** Separate DB roles for migrations and app; the app role has no DDL; RLS policies as defence in depth (D4); encrypted connections; point-in-time recovery required before G5.
- **Future scaling:** Vertical scaling first; monthly partitioning for `ai_calls`, `audit_events`, `job_runs`; read replicas for analytics.
- **Migration path:** Standard `pg_dump`/logical replication to any Postgres host.

## D3 — Authentication

- **Recommended:** A self-hosted TypeScript auth library (Better Auth, INFERRED maturity; verify at M2) storing users/sessions in our Postgres. MVP methods: email magic link and Google OAuth. GitHub OAuth arrives with P1 recovery; passkeys P1; enterprise SSO later.
- **Alternatives:** Hosted identity (e.g. Clerk, WorkOS); Auth.js; BaaS auth.
- **Tradeoffs:** Hosted identity ships fastest but puts identity data at a vendor, has per-MAU pricing (UNVERIFIED) and makes sharing identity with other 1stStep.ai products a vendor question. Self-hosting means we own rate limits, email deliverability and patching. Mitigation: auth is confined to `apps/server/auth` behind a `Session` type, which bounds the swap cost.
- **Cost:** Library free; transactional email provider needed (OD-4).
- **Lock-in:** Low; standard OAuth/OIDC.
- **Security:** httpOnly/Secure/SameSite cookies; session rotation on privilege change; single-use magic links with short TTL; OAuth state + PKCE; login rate limiting; `reauthenticatedAt` recorded for T3 actions.
- **Future scaling:** Session table indexed; OIDC federation with 1stStep.ai identity if OD-3 decides so.
- **Migration path:** Users table is ours; an external IdP can be introduced via OIDC with account linking.

## D4 — Authorization and multitenancy

- **Recommended:** Organization is the tenant from day one. Every user gets a personal organization at signup. Every tenant-owned table has a non-null `organization_id`. Project roles: `OWNER`, `EDITOR`, `VIEWER`; the human-only `approve` scope requires `OWNER` (or an explicit approver grant). All checks go through one server-side `authorize(actor, action, resource)`. Repositories require a `TenantContext`, so unscoped queries do not type-check. Postgres RLS (`SET LOCAL app.org_id` per transaction) backs this up.
- **Alternatives:** User-owned records only (painful migration to teams); RLS-only authorization (logic hidden in SQL, harder to test); database per tenant (operationally heavy).
- **Tradeoffs:** Slightly more schema up front. It avoids the most expensive later migration (P2 team Project OS).
- **Cost:** Negligible.
- **Lock-in:** None.
- **Security:** Composite lookups `(organization_id, id)` prevent IDOR. A cross-tenant negative test is required for every repository (G3). AI agents never hold `approve`.
- **Future scaling:** Large tenants can be moved to dedicated databases by `organization_id`.
- **Migration path:** Team/organization features (P2) add memberships without re-keying data.

## D5 — Storage

- **Recommended:** No object storage in MVP. A generated OS is a deterministic function of stored inputs (GENERATION_CONTRACT.md), so ZIPs are streamed on request and not retained. When P1 repository snapshots or P2 media assets need blobs, introduce a `BlobStore` port with an S3-compatible adapter (provider chosen then).
- **Alternatives:** Store every export ZIP now; store in Postgres large objects.
- **Tradeoffs:** Regeneration costs a little CPU but avoids a second copy of user data, retention policy work and signed-URL handling.
- **Cost:** Zero in MVP.
- **Lock-in:** S3 API is a de-facto standard (INFERRED).
- **Security:** Fewer data copies. When introduced: private buckets, per-tenant key prefixes, short-lived signed URLs, malware/type checks on uploads.
- **Future scaling / migration:** Add the adapter without changing callers.

## D6 — Background jobs

- **Recommended:** Postgres-backed queue (pg-boss, INFERRED) consumed by `apps/worker`. Job types: research, AI synthesis, large compiles, scheduled freshness checks. Each job has a singleton/idempotency key `(organizationId, projectId, type, inputsHash)`, bounded retries classified per `ai-runtime/RETRY_FALLBACK.md`, a dead-letter table and persisted step state for resumable multi-step workflows. Progress goes to the UI over Server-Sent Events fed by `LISTEN/NOTIFY`.
- **Alternatives:** Hosted durable-workflow services; Redis + BullMQ; serverless queues; Temporal.
- **Tradeoffs:** One less infrastructure component, and jobs share transactions with domain writes. The throughput ceiling is far above MVP needs (INFERRED). Durable workflows are hand-rolled through step state; this is acceptable while workflows are short DAGs.
- **Cost:** Uses existing Postgres.
- **Lock-in:** Low; handlers take plain JSON payloads.
- **Security:** Jobs carry IDs, not secrets; worker re-authorizes tenant context from the DB on each run.
- **Future scaling:** Separate worker pools per queue; move automation execution (LATER) to a durable workflow engine if needed.
- **Migration path:** The handler interface is queue-agnostic.

## D7 — Deployment

- **Recommended:** One OCI container image with two process types (`server`, `worker`) on a container PaaS, plus managed Postgres in the same region. Environments: local → staging → production, each with separate databases and secrets. Production deploy is a T3 high-risk action that requires G5 PASS and explicit owner approval. **No deployment happens in Cycle 0.** The host is OPEN (OD-1); candidates must support an always-on worker, private networking to Postgres, rollbacks and log drains. Routing for `1ststep.ai/os` is OPEN (OD-5).
- **Alternatives:** Serverless platform + hosted queue/workflow; Kubernetes.
- **Tradeoffs:** Containers fit long jobs and keep hosts swappable. Serverless lowers idle cost but splits the system across vendors and time limits. Kubernetes is operational overkill for MVP.
- **Cost:** Small always-on instances; UNVERIFIED until OD-1.
- **Lock-in:** Low (plain container + Postgres).
- **Security:** Host secret store; no production data in staging; image scanning in CI; least-privilege deploy tokens.
- **Future scaling / migration:** Horizontal server scaling; any container host.

## D8 — Observability

- **Recommended:** Structured JSON logs (pino, INFERRED) with request/job/organization/project correlation IDs and a redaction list (tokens, cookies, emails, idea text at info level). W3C trace-context propagation, with export enabled once a backend is chosen. Product tables: append-only `audit_events` for every privileged action and external side effect; `ai_calls` for all dimensions in `ai-runtime/AI_OBSERVABILITY.md`; `job_runs`. Health endpoints `/os/api/healthz` and `/os/api/readyz`. An error-tracking vendor is required before G5 (OD-7).
- **Alternatives:** Full OpenTelemetry collector + APM vendor from day one.
- **Tradeoffs:** Tables + logs cover MVP questions (cost, failures, audit) without a vendor; APM added when traffic justifies it.
- **Cost:** Log volume; sampled debug logs.
- **Lock-in:** Low (OTel-compatible context).
- **Security:** Prompts/responses stored only in `ai_calls` with tenant scoping and a retention limit (OD-6); never in general logs.
- **Future scaling / migration:** Export to any OTel backend.

## D9 — Testing

- **Recommended:**
  - `node:test` for pure packages (zero dependencies; Node type stripping for erasable TS syntax, INFERRED) plus `tsc --noEmit`.
  - Schema fixtures and negative mutation tests (`tools/spec.test.mjs`, running now).
  - Golden-file compiler tests: compile twice, compare byte-identical ZIPs.
  - PGlite (in-process Postgres, INFERRED) for repository and tenant-isolation tests; containerized Postgres in CI as fallback.
  - Playwright for the critical-path E2E (idea → download), visual regression and axe accessibility checks (ADR-013).
  - Security suites: SSRF fetcher, archive paths, untrusted-text fencing, authorization negatives, webhook signatures.
  - AI evals per task, run on routing changes and at COST_REVIEW (ADR-012).
- **Alternatives:** Vitest/Jest everywhere; Cypress.
- **Tradeoffs:** `node:test` avoids a test framework for pure logic; Vitest may be added only for DOM component tests if Playwright component coverage is insufficient.
- **Cost:** CI minutes; visual baselines rendered in a pinned Linux container.
- **Lock-in:** None.
- **Security:** Tests use synthetic fixtures only; no real research or user data.
- **Migration path:** N/A.

## D10 — AI provider abstraction

See ADR-012. Summary: `ModelClient` port (`generate`, `stream`, `countTokens`) with an Anthropic adapter first and an OpenAI adapter in the same milestone; every call goes through the router, budget reservation, validation and telemetry. Deterministic (Tier A) work cannot import the model client.

## D11 — Research / search abstraction

- **Recommended:** Two ports. `SearchProvider.search(query)` returns results with URL, title, snippet and retrieval time. `PageFetcher.fetch(url)` returns final URL, status, content type, normalized text, content hash and retrieval time. The fetcher is built in-house with SSRF protections: https only; resolve DNS and reject private, loopback, link-local and metadata ranges; re-validate on every redirect (max 5); 10 s timeout; 2 MB cap; content-type allowlist; honour robots rules; identifying user agent. Claim extraction (Tier B) is **quote-anchored**: an OBSERVED claim's excerpt must be a substring of the stored normalized text, checked deterministically. Public-page fetch results may be cached across tenants keyed by URL + content hash (public web content only). If no search provider is configured, research questions become BLOCKED claims; nothing is fabricated.
- **Alternatives:** Model-provider server-side web search tools (convenient citations, but tie research to one model vendor); scraping APIs.
- **Tradeoffs:** A separate search API keeps research vendor-neutral and auditable; the in-house fetcher is security-critical code that needs a test suite.
- **Cost:** Per-query search pricing UNVERIFIED (OD-2).
- **Lock-in:** Low behind the port.
- **Security:** SSRF, content-type confusion and prompt injection. Fetched text is untrusted data, fenced in prompts and never executed as instructions.
- **Future scaling / migration:** Multiple providers with fallback; continuous intelligence reuses the same ports (D19).

## D12 — Media / model provider abstraction

See ADR-014. Summary: capability-typed ports (`ImageGeneration`, `SpeechSynthesis`, `Transcription`, `VideoGeneration`, `VoiceClone`, …) resolved by the cost-first router against ModelProvider/ToolProvider registries. Deterministic media operations (ffmpeg-class transforms, template rendering) come before generative calls. Execution is LATER; P0 only generates guidance.

## D13 — Connector / integration architecture

- **Recommended:**
  - A Connector is a ToolProvider entry plus a per-organization grant. OAuth tokens are envelope-encrypted: a per-org data key wrapped by a master key from the host secret store or KMS.
  - Provider scopes map to Project OS action scopes.
  - Every external read or write goes through a single `ActionExecutor`, which enforces the ExternalAction lifecycle: record → risk tier → authorization → approval bound to payload hash → idempotent execution → evidence → audit event.
  - MCP servers may be used as connector transports in P2 under the same executor. Their tool descriptions and outputs are untrusted input.
  - **MVP has zero user-account connectors.** The only outbound calls are model APIs, the search API and the fetcher, all system-level reads.
- **Alternatives:** Embedding an iPaaS; per-feature ad-hoc API clients.
- **Tradeoffs:** A single executor is slightly slower to build, but it makes approvals, idempotency and audit uniform.
- **Cost:** None in MVP.
- **Lock-in:** Low; iPaaS platforms may become ToolProviders routed by COST_FIRST_ROUTER.
- **Security:** No tokens in logs, prompts or generated bundles; minimum scopes; grant expiry; revocation on disconnect; webhook signature + replay-window verification.
- **Future scaling / migration:** Connector catalog grows by registry entries, not architecture changes.

## D14 — Capability registry

- **Recommended:** `capabilities/registry.json` (generated by `tools/build-capability-registry.mjs` from `.project-os/capability-taxonomy.json` + explicit phase classification) and `modules/registry.json`, both versioned with the code, schema-validated and referentially checked in CI, loaded read-only at startup. ToolProvider/ModelProvider registries follow the same pattern from M3.
- **Alternatives:** DB-managed registry with admin UI.
- **Tradeoffs:** Registry changes ship as code review + tests, which is appropriate while the registry defines generated authority. A DB registry becomes useful for P2 organization-custom modules.
- **Cost / lock-in:** None.
- **Security:** Registry is trusted code; user-supplied capability requests are validated against it.
- **Migration path:** Seed DB tables from the JSON when custom modules arrive.

## D15 — Module-selection engine

- **Recommended:** `selectModules(profile, moduleRegistry, capabilityRegistry, platformPhase)` in `packages/core`, a pure function returning `{ selected, deferred, decisions, trace }`. Semantics (unknown handling, dependencies, conflicts, phase/consent deferral, decision de-duplication, ordering) are specified in `tooling/CAPABILITY_REGISTRY.md`. No AI. The interview model may *suggest* capability requests; they only take effect once the user confirms them.
- **Alternatives:** LLM-chosen modules; weighted scoring.
- **Tradeoffs:** Rules need curation, but they are explainable, testable and reproducible (`ai-runtime/MODEL_ROUTING.md` Tier A).
- **Security:** Selection cannot be influenced by injected text because inputs are schema-typed enums.
- **Future scaling / migration:** Rule language versioned with the registry schema.

## D16 — Project OS compiler

Pure, deterministic function per `GENERATION_CONTRACT.md`. Logic-less templates (a Mustache-compatible subset with no code execution; library or small renderer chosen at M4). AI-authored prose is generated beforehand as stored, versioned `GeneratedText` records and only inserted into declared slots.

## D17 — Export / download

- **Recommended:** An authenticated endpoint streams a ZIP built deterministically (sorted entries, fixed timestamps and permissions, UTF-8/LF, no symlinks), with `manifest.json` listing every file hash. The ZIP sha256 is shown in preview and returned in a response header. The ZIP is not stored server-side. Export is refused if validation fails or blocking decisions are unresolved. Rate limited; size capped.
- **Alternatives:** Store ZIPs in object storage and email links; client-side ZIP generation.
- **Tradeoffs:** Server-side generation keeps preview/export byte-identical and keeps templates private.
- **Security:** Path safety (schema `relativePath`), secret scan, untrusted-content fencing, `Content-Disposition: attachment`, `X-Content-Type-Options: nosniff`.
- **Migration path:** "Push to GitHub" (P1/P2) reuses the same artifact set as a T2 publish action.

## D18 — Future GitHub / repository recovery (P1)

A GitHub App requesting read-only contents and metadata permissions (INFERRED names; verify at the P1 milestone). Short-lived installation tokens. The repository archive is downloaded into an ephemeral, size-capped sandbox. **No code execution, installs or builds.** File-type and size allowlists. Secret scanning with redaction before anything enters model context. Tree + file-purpose + symbol index (tree-sitter class parser), incremental by content hash. Output is ObservedImplementation plus Findings with evidence labels; inferred architecture stays INFERRED until the user confirms. Pull requests back to the repo are T2 publish actions (P2).

## D19 — Future continuous intelligence (P2)

Scheduled jobs (D6) per watch with per-project monthly budgets (ADR-012). Each run: fetch → snapshot (content hash) → deterministic diff → ChangeEvent. A model is used only to summarize a real diff. Changes create Findings or mark dependent Recommendations `NEEDS_EVIDENCE`; they never change accepted decisions automatically. Users get digests; there are no real-time alerts by default.

---

## Open decisions (non-blocking for G1 and scaffold)

| ID | Decision | Owner | Blocks | Default assumption until decided |
|---|---|---|---|---|
| OD-1 | Container host + managed Postgres provider | Product owner | M8 staging | Portable container + standard Postgres |
| OD-2 | Research/search provider | Product owner | M5 live research | Fixture-backed research; claims BLOCKED without provider |
| OD-3 | Share identity with other 1stStep.ai products? | Product owner | M2 auth finalization | Separate accounts; OIDC-federatable later |
| OD-4 | Transactional email provider | Product owner | M2 magic link | Dev console transport |
| OD-5 | How `1ststep.ai/os` is routed (parent site hosting UNVERIFIED) | Product owner | M8 | Reverse-proxy/rewrite to container host |
| OD-6 | AI data policy: may idea/profile text go to third-party model providers; retention; zero-retention requirement; prompt log retention | Product owner (+ legal) | M3 with real users | Synthetic data only; prompts retained ≤ 30 days once enabled |
| OD-7 | Error tracking / telemetry vendor | Product owner | G5 | Logs + tables only |
| OD-8 | Git hosting and CI provider (repo is not yet a git repository) | Product owner | CI for M1+ | Local `npm run check` |
| OD-9 | 1stStep OS pricing, plans and AI budgets per plan | Product owner | Public launch; COST_REVIEW targets | Internal budgets only |
| OD-10 | Theme scope for MVP (light only vs light + dark) | Product owner | M7 visual finalization | Tokens support both; ship light |

## Consequences

- Scaffolding may start after G1 PASS, limited to the layout above.
- Every future dependency or vendor adoption records verified facts and follows `tooling/COST_FIRST_ROUTER.md`.
- `packages/core` purity is a hard architectural constraint checked by tests.
