# ADR-012 — AI Runtime, Token Harness and Cost Control

- **Status:** ACCEPTED (Cycle 0; product-owner ratification PENDING)
- **Date:** 2026-09-13
- **Implements:** `AI_RUNTIME_OS.md`, everything under `ai-runtime/`, `COST_REVIEW_GATE.md`, `prompts/CLAUDE_CYCLE0_ADDENDUM.md`
- **Evidence note:** Provider features (prompt caching mechanics, structured-output modes, token counting endpoints) are INFERRED from model knowledge. Prices, limits and model availability are UNVERIFIED and are recorded in the ModelProvider registry with `lastVerified` before any model becomes ACTIVE.

## Principle

`required quality + minimum sufficient context + lowest sustainable cost`. Deterministic work never calls a model. Cheaper routes are adopted only with eval evidence.

## 1. Deterministic vs AI work

| Tier A — deterministic (no model, enforced) | Model-assisted |
|---|---|
| schema validation; risk classification; module & capability selection; which interview field to ask next; compile; manifest; hashing; ZIP; ROI/opportunity scoring; freshness state; confidence scoring; citation formatting; diffing; policy checks; cost estimation | phrasing questions; extracting answers into assessments; summaries/JTBD synthesis; research query planning; claim extraction; competitor/pricing/positioning synthesis; stack rationale prose; OS narrative sections; automation opportunity notes |

**Enforcement:** `packages/core` cannot import `packages/ai-runtime` (boundary test). A model call must reference a registered `TaskSpec`; there is no ad-hoc `generate()` entry point.

## 2. Task classification (TaskSpec registry)

Every AI task is declared in code:

```ts
type TaskSpec = {
  id: string; version: string;
  tier: 'B_LOW_COST' | 'C_BALANCED' | 'D_PREMIUM';
  inputSchema: JsonSchemaRef; outputSchema: JsonSchemaRef;
  maxInputTokens: number; maxOutputTokens: number; timeoutMs: number;
  retry: RetryPolicy; fallbackChain: string[];        // ModelProvider ids
  privacyClass: 'PUBLIC_WEB' | 'PROJECT_PRIVATE' | 'SENSITIVE';
  cacheable: 'NONE' | 'PROJECT' | 'PUBLIC_SHARED';
  evalSetId: string; optional: boolean;             // optional work stops first at soft budget
};
```

Initial MVP task table. Token ceilings are **design budgets** to be tuned from telemetry, not measurements.

| Task | Tier | Max in / out tokens | Retries | Cache | Notes |
|---|---|---|---|---|---|
| `intake.classify` (mode, product types) | B | 4k / 0.5k | 1 repair | PROJECT | Output is candidate assessments with `source: INFERRED`; user confirms |
| `interview.phrase_question` | B | 3k / 0.3k | 1 | PROJECT | Field chosen deterministically |
| `interview.extract_answer` | B | 4k / 1k | 1 repair | NONE | Writes assessments only through schema validation |
| `profile.synthesize` (summary, problem, JTBD) | C | 12k / 2k | 1 repair | PROJECT | |
| `research.plan_queries` | B | 4k / 1k | 1 | PROJECT | |
| `research.extract_claims` (per page) | B | 8k / 1.5k | 1 repair | PUBLIC_SHARED | Excerpts verified by substring check |
| `bi.competitor_synthesis` | C | 24k / 3k | 1 repair | PROJECT | Cites claim ids only |
| `bi.pricing_recommendation` | C | 16k / 3k | 1 repair | PROJECT | |
| `stack.rationale` | C | 16k / 3k | 1 repair | PROJECT | Options produced by deterministic rules |
| `bom.opportunity_notes` | C | 8k / 2k | 1 | PROJECT | Scores are Tier A |
| `os.narrative_section` | C | 12k / 3k | 1 repair | PROJECT | Stored as GeneratedText before compile |
| `architecture.deep_review` (user-requested) | D | 40k / 6k | 0 | PROJECT | `optional: true`; needs explicit user confirmation and soft-budget headroom |

## 3. Provider-neutral interface

```ts
interface ModelClient {
  generate(req: ModelRequest): Promise<ModelResult>;
  stream(req: ModelRequest): AsyncIterable<ModelChunk>;
  countTokens(req: ModelRequest): Promise<number | null>;   // null → heuristic
}
type ModelRequest = {
  modelProviderId: string; system: ContextBlock[]; messages: Message[];
  tools?: ToolDef[]; outputSchema?: JsonSchema; maxOutputTokens: number;
  cacheBreakpoints?: number[]; metadata: CallMetadata;          // task, org, project, user, workflow run
};
type ModelResult = {
  output: unknown; text?: string; finishReason: string;
  usage: { inputTokens: number; outputTokens: number; cacheReadTokens?: number; cacheWriteTokens?: number };
  providerRequestId?: string; latencyMs: number;
};
```

- **Anthropic / Claude adapter (M3):** Messages API; prompt caching mapped from `cacheBreakpoints` to cache-control markers; structured output via tool/JSON-schema mode where available (INFERRED).
- **OpenAI adapter (M3):** Responses-style API; provider-side automatic prefix caching reported through usage fields; JSON-schema structured output where available (INFERRED).
- **Replay adapter:** deterministic recorded fixtures for tests and evals.
- There is no feature-parity promise. The router only considers models whose registry `features` satisfy the TaskSpec.

## 4. Model routing

- A versioned static routing table maps each `taskId` to an ordered list of candidate ModelProvider ids per tier. No online bandits in MVP.
- A candidate is **eligible** only if: status ACTIVE (which needs a KNOWN price) ∧ its latest eval for the task passed ∧ its data policy satisfies the task `privacyClass` and OD-6 ∧ its features and limits satisfy the TaskSpec.
- Router output (per `ai-runtime/MODEL_ROUTING.md`): provider, model, input/output ceilings, timeout, retry policy, fallback chain, validation method.
- A routing change requires an eval run recorded as evidence (COST_REVIEW gate).
- Initial candidates: Anthropic `claude-haiku-4-5` (Tier B), `claude-sonnet-5` (Tier C), `claude-opus-5` (Tier D); OpenAI candidates per tier are chosen at M3 from a verified model list. All start as `CANDIDATE`.

## 5. Context assembly and targeted retrieval

`ContextAssembler.build(task, refs) → ContextPacket` with blocks ordered for cache stability:

1. Versioned system policy for the task (stable prefix)
2. Relevant schema excerpts (stable per schema version)
3. Canonical profile slice: only the fields the TaskSpec declares
4. Task-specific evidence: claim ids + excerpts, never whole pages
5. The user turn / variable input (last)

Rules from `ai-runtime/CONTEXT_MANAGEMENT.md` and `TOKEN_HARNESS.md`:

- **Structured retrieval first.** Fetch by profile path, claim id, module id or recommendation id. Postgres full-text search over stored research text is used only when an id lookup can't answer.
- **No vector DB in MVP.** pgvector embeddings arrive with P1 repository recovery.
- **Untrusted text is fenced.** Research, imports and user free text go inside labelled data blocks that the system prompt declares non-instructional.
- **Token estimation before the call.** Use the provider count endpoint when available, otherwise `ceil(chars / 3.5) × 1.15`. If the estimate exceeds the ceiling, drop optional blocks, then compact, then reject with `CONTEXT_BUDGET_EXCEEDED`. A request is never truncated silently.

## 6. Repository indexing (P1, for recovery and coding-agent packets)

Tree → file-purpose index → symbol index (tree-sitter class parser) → dependency neighbourhood, all keyed by content hash and updated incrementally. Context packets for code tasks use changed files plus their neighbourhood. Derived indexes never outrank canonical files.

## 7. Compaction

- **Interview sessions:** after each turn, durable facts are written to profile assessments (canonical state). The model then sees only the last N turns plus a Tier-B running summary, which points back to profile fields and does not restate them.
- **Long workflows:** each step persists outputs; resumption loads step outputs, not transcripts.

## 8. Caching and reuse (three layers)

1. **Deterministic memoization** by `inputsHash` (selection, compile, scoring).
2. **AI result cache** keyed by `(taskId, taskVersion, modelProviderId, promptTemplateVersion, canonicalInputHash)` and scoped by `cacheable`. `PROJECT` entries never cross tenants. `PUBLIC_SHARED` is only for public-web inputs (e.g. claim extraction from a public URL + content hash). Invalidated when schemas, authority files or templates change version. Research-derived cache entries respect freshness windows.
3. **Provider prompt caching** via adapter `cacheBreakpoints` on the stable prefix blocks (§5).

Hit/miss, eligibility, TTL and estimated savings are logged in `ai_calls`. Secrets are never cached.

## 9. Retry and fallback

| Failure class | Action |
|---|---|
| TIMEOUT / RATE_LIMIT / TRANSIENT | Exponential backoff with jitter, ≤ 2 retries, then fallback chain if eligible |
| MALFORMED_OUTPUT (schema invalid) | One **repair** call (Tier B): send validation errors + the invalid output, not the full context; then fail |
| SAFETY_REFUSAL | No retry; surface to user with guidance |
| INSUFFICIENT_CONTEXT | No blind retry; expand retrieval once or ask the user |
| TOOL_FAILURE | Retry the tool per its idempotency rules, not the model |
| DETERMINISTIC_VALIDATION_FAILURE | Fail; never retry the model to "fix" a rule |

- Fallback to another provider only if it is eligible for the task's privacy class.
- Workflows resume from the last persisted step.
- Retry and repair cost is tagged separately (`attemptKind`).

## 10. Structured-output validation

Every model output is validated with Ajv against the TaskSpec output schema, even when the provider claims native structured output. Assessments produced by models get `source: INFERRED`, and material ones require user confirmation. Model output can never set `evidence: CONFIRMED`, set a Recommendation to ACCEPTED, or approve anything.

## 11. Eval-driven routing

- Eval sets live at `evals/<taskId>/` with synthetic cases (JSONL) and a versioned rubric.
- Graders: deterministic checks first (schema, required fields, citation ids exist, excerpt verification, no invented numbers). An LLM judge (Tier C, pinned) is used only for qualitative rubric items.
- A route becomes eligible when its pass rate ≥ the task threshold (set per task at M3).
- Evals run on routing change, prompt template change, model version change and at COST_REVIEW.

## 12. Budgets and enforcement

- **Budget scopes:** request (TaskSpec ceilings) → workflow run → user/day → user/month → project/day → project/month → organization/month → global/day kill switch.
- **Reservation model:** before a call, reserve worst-case cost `(maxInputTokens × inputPrice + maxOutputTokens × outputPrice)` against every enclosing scope; commit actual usage afterwards and release the difference. Models whose price is not KNOWN cannot be ACTIVE (schema-enforced), so reservations always have a price.
- **Soft threshold:** warn; skip `optional` tasks; down-route only to eval-eligible cheaper models; ask the user before expensive optional work.
- **Hard threshold:** stop model usage for that scope and return a typed `BUDGET_EXCEEDED` state that the UI renders as a designed state (ADR-013). Deterministic features keep working.
- **Initial values:** set at M3 as `expected cost × 3` per workflow from measured replay runs, with owner ratification (OD-9). No dollar figures are asserted in Cycle 0.

## 13. Cost telemetry

`ai_calls` row per attempt with every dimension in `ai-runtime/AI_OBSERVABILITY.md`: org, project, user, workflow run, task, tier, provider, model, input/output/cache tokens, estimated cost, latency, cache hit, attempt kind, fallback used, validation outcome, eval score reference and error class.

MVP dashboards are SQL views plus an internal admin page covering cost by feature, model, tier, workflow, retry waste and cache savings.

## 14. Worst-case and expected unit cost modelling

`tools/unit-cost` (M3) computes, from the TaskSpec table and the ModelProvider registry:

- **Worst case per workflow:** `Σ_tasks (maxIn × pIn + maxOut × pOut) × (1 + maxRetries + repair)` + research search/fetch cost × max queries.
- **Expected:** p50/p90 from replay and eval runs, later from production telemetry.
- **Per plan:** expected OS generations per user/month × workflow cost + regeneration rate.

COST_REVIEW requires both numbers with price `lastVerified` dates. Pricing (OD-9) must not be finalized without them (`ai-runtime/COST_BUDGETS.md`).

## 15. Coding-agent adapters and harness

- **Canonical source:** generated `AGENTS.md` and the Project OS. Adapters only point to or excerpt canonical files and never add rules.
- **Claude Code adapter (first-class):** generated `CLAUDE.md` is a thin pointer. `prompts/CLAUDE_BOOTSTRAP.md` holds the scoped task envelope from `ai-runtime/CODING_AGENT_HARNESS.md` (objective, scope, allowed files, authority refs, non-goals, acceptance criteria, tests, context budget, model tier, escalation). The initial read set is small: `AGENTS.md`, `state/CURRENT_STATE.md`, `state/NEXT_ACTIONS.md`, applicable module docs only (`ai-runtime/CLAUDE_CODE.md`).
- **Codex adapter:** relies on `AGENTS.md` (INFERRED convention) plus `prompts/CODEX_BOOTSTRAP.md` with the same envelope. Nested `AGENTS.md` files are forbidden in generated bundles except the root (lesson from F-0016).
- **Cursor adapter:** a project rule file pointing at `AGENTS.md` (path convention INFERRED; verified at M4).
- **Generic adapter:** `prompts/GENERIC_BOOTSTRAP.md`.
- **Internal use:** agents building 1stStep OS itself follow the same harness; `CLAUDE.md` in this repository stays an adapter.

## COST_REVIEW gate mapping

| COST_REVIEW_GATE.md item | Satisfied by |
|---|---|
| routing policy | §4 routing table + TaskSpec |
| deterministic steps don't call models | §1 boundary test |
| explicit token budgets | §2 TaskSpec ceilings, §5 estimation |
| scoped context | §5 ContextAssembler |
| bounded retries | §9 |
| fallback defined | §4, §9 |
| cost telemetry | §13 |
| privacy-safe caching | §8 |
| eval supports tier | §11 |
| per-user/project budgets | §12 |
| worst-case + expected unit cost | §14 |

---

## Amendment A — Universal LLM architecture (2026-09-13)

**Implements:** `os/ai/*`, `.project-os/universal-llm-policy.json`, `audit/PROVIDER_POLICY.md`, `audit/PROVIDER_FAILOVER.md`, `audit/UNIVERSAL_AGENT_AUDIT.md`, `prompts/CLAUDE_INTEGRATE_UNIVERSAL_LLM.md`. This addendum arrived during Cycle 0 and is incorporated before G1.

**Rule:** no canonical workflow may require one named provider unless the user explicitly chooses it. Claude Code and Codex remain first-class *adapters*, not privileged canonical engines. The section 4 "initial candidates" are candidates only; nothing in the canonical layer depends on them.

### A1. Provider classes and endpoint adapters

**Supported classes:** hosted commercial APIs, coding agents, chat assistants, enterprise gateways, cloud model platforms, local/self-hosted, open-weight, custom endpoints, and future providers.

`ModelClient` adapters are grouped by **endpoint type**, not brand:

| Endpoint type | Adapter | Phase |
|---|---|---|
| `NATIVE_PROVIDER_API` | Anthropic, OpenAI | P0 (M3) |
| `OPENAI_COMPATIBLE` | Generic OpenAI-compatible adapter. Covers many gateways and local inference servers (INFERRED); per-endpoint capability discovery is mandatory | P1 |
| `ANTHROPIC_COMPATIBLE` | Generic Anthropic-compatible adapter | P1 |
| `CLOUD_PLATFORM_API` | Cloud model platform adapters, added per demand | P2 |
| `CUSTOM_ADAPTER` | Plugin interface implementing `ModelClient` | P2 |

The router operates on `ModelProvider` capabilities (schema extended per `os/ai/PROVIDER_CAPABILITY_CONTRACT.md`): hosting, endpoint type, auth method, context/output limits, structured output, tools, streaming, embeddings, multimodal, code execution, caching, batch, rate limits, latency profile, price basis, retention, residency, fine-tuning, health, last verified, fallbacks.

### A2. Policy before routing

`ProviderPolicy` (schema) at organization, project or user level. The most restrictive applicable policy wins. The routing pipeline is:

1. Policy filter: allowed/prohibited providers, allowed tiers and hosting, local-only, residency, retention/zero-retention, training use, budgets.
2. TaskSpec capability filter.
3. Eval eligibility.
4. Cost/latency ranking (section 4).

Only humans edit policy.

### A3. Bring your own LLM (P1)

`LLMConnection` (schema) records connection type, endpoint, runtime mode, `secretRef` (opaque reference; the secret lives in the secret store, never in the Project OS, logs or bundles), connection test, discovered models, model allowlist, privacy classification, cost and rate-limit metadata, audit, disable and revoke.

- **Connection test and capability discovery** run before a connection can become ACTIVE. Discovered capabilities are UNVERIFIED until an eval run.
- **SSRF boundary (security-critical):** cloud-hosted 1stStep OS may only call `https` endpoints in `PUBLIC_INTERNET`, through the same egress guard as the research fetcher (ADR-010 D11). `PRIVATE_NETWORK` and `LOCALHOST` endpoints are allowed only when 1stStep OS is self-hosted or a local agent runner executes the task (schema-enforced).
- Every call through a BYO connection is logged in `ai_calls` with `connectionId`. Budgets still apply using the connection cost metadata; if cost is UNKNOWN, the user must acknowledge before non-optional tasks run on it.

### A4. Local and self-hosted models (P2 runtime; schema now)

- Tracked fields: endpoint, model identity/version, hardware/runtime constraints, context size, throughput and latency, estimated cost (`ESTIMATED_INFRASTRUCTURE_COST`), privacy boundary, tool/structured-output compatibility, health, fallback.
- No workflow assumes cloud connectivity: deterministic Tier A work runs fully offline, and AI tasks degrade to `degraded: provider_unavailable` (ADR-013 section 4) rather than failing silently.
- Local-only projects (`localOnly: true`) never fall back to hosted models.

### A5. Provider-independent task envelopes and portable checkpoints

- Every AI workflow step persists a **provider-independent envelope and checkpoint** in the database: `{runId, stepId, taskId, taskVersion, canonicalInputRefs, inputHash, outputRef, status, attempts, budgetUsage, pauseReason, nextAction}`.
- Provider conversation state (thread ids, cached prefixes) is an optimization only and is never required to resume.
- Coding-agent bootstrap prompts use the same envelope (`ai-runtime/CODING_AGENT_HARNESS.md`), so work can move between Claude Code, Codex, Cursor and future adapters (`os/ai/AI_PORTABILITY.md`).

### A6. Failover (applies to all agentic runs, including audit runs)

On a trigger (usage exhausted, rate limited, outage, context limit, model unavailable, budget exceeded, policy disallows):

1. Checkpoint the current atomic unit.
2. Persist provider-independent state.
3. Classify the pause reason.
4. Evaluate compatible fallbacks.
5. Resume with a fallback only if policy allows cross-provider failover and the fallback is eligible for the task (capabilities + eval + privacy); otherwise stay PAUSED.
6. Preserve run identity, finding ids and baseline.
7. Never re-run completed steps (idempotency keys).

Failover may change the worker, never the canonical run identity (`audit/PROVIDER_FAILOVER.md`). When policy requires independent verification, the verification worker must use a different model or provider (`verification` in ProviderPolicy).

### A7. Model eval registry

`ModelProvider.evalResults` records score, pass, structured-output validity, error rate, tool reliability, p50 latency, cost per task and human-review score per task and eval-set version (`os/ai/MODEL_EVAL_REGISTRY.md`). Routing is based on observed task performance, not provider reputation. Cheaper or local models are admitted per task when evals pass.

### A8. Scope and open items

- **Audit orchestrator neutrality:** `audit/UNIVERSAL_AGENT_AUDIT.md` describes 1stStep OS Audit. In this repository it governs OS compliance audits (P1) and any agentic run. Integration with the separate 1stStep OS Audit product is outside the Cycle 0 scope of this repository (OD-11).
- **Site messaging** (`site/*`, `prompts/CODEX_UPDATE_OS_SITE_PROVIDER_NEUTRAL.md`) belongs to the website work. Per its own instruction, it must present portability as architecture direction until adapters are actually implemented.
- **"Project Genome"** (`os/ai/AI_PORTABILITY.md`) is not defined anywhere in the repository and is treated as an open terminology question (F-0025), not a new canonical artifact.
