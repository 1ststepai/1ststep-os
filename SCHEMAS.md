# Canonical Schemas

Machine-readable contracts live in `schemas/<schemaVersion>/` as JSON Schema draft 2020-12 (ADR-016). Current version: **0.1.0**.

| Schema | File | Purpose |
|---|---|---|
| common definitions | `common.schema.json` | ids, versions, hashes, paths, evidence states, scopes, phases, actors, `assessment` pattern |
| ProjectProfile | `project-profile.schema.json` | Identity, idea, mode (build / business / recovery), users, JTBD, product types, lifecycle, scope, non-goals, data sensitivity, auth, payments, AI, integrations, platforms, geography, business & distribution model, growth goals, capability requests, business operations, budget, risk, stack recommendation ref, selected modules, assumptions, unresolved decisions |
| ProjectOSManifest | `project-os-manifest.schema.json` | Versions, generator, source profile hash, inputsHash, platform phase, modules, deferred modules, capabilities, agents, adapters, authority order, evidence vocabulary, file hashes, compatibility |
| CapabilityDefinition / CapabilityRegistry | `capability-definition.schema.json`, `capability-registry.schema.json` | Capability phases, automation ceiling, dependencies, scopes, consent, deterministic-first, cost profile |
| ModuleDefinition / ModuleRegistry | `module-definition.schema.json`, `module-registry.schema.json` | Applicability rules, capabilities, dependencies, conflicts, required files/agents/gates, adapter contributions |
| ProviderPolicy | `provider-policy.schema.json` | Organization/project/user AI provider policy applied before routing (ADR-012 Amendment A) |
| LLMConnection | `llm-connection.schema.json` | Bring-your-own LLM connection with secret reference and SSRF boundary |
| ToolProvider | `tool-provider.schema.json` | Tool/service/connector registry entry with routing class, licensing, privacy, pricing, lock-in, last verified |
| ModelProvider | `model-provider.schema.json` | Model registry entry with tier, features, limits, pricing, data policy, evals |
| ResearchClaim | `research-claim.schema.json` | Claim, type, evidence, confidence, sources with excerpt + hash, freshness, review, recommendation links |
| Recommendation | `recommendation.schema.json` | Options, evidence links, status, decision basis |
| ExternalAction | `external-action.schema.json` | Scope, risk tier, execution mode, payload hash, authorization, approval, attempts, evidence, reversal |
| MediaAsset | `media-asset.schema.json` | Versioned asset with production method, provenance, rights, identity subjects → consent |
| ConsentRecord | `consent-record.schema.json` | Identity consent: uses, scope, evidence, verification, revocation |
| AutomationDefinition | `automation-definition.schema.json` | Trigger, steps with scopes/approvals/idempotency, retry, failure queue, controls, ROI |
| Finding | `finding.schema.json` | Immutable ID, severity, domain, evidence, impact, remediation, status, verification |
| GateResult | `gate-result.schema.json` | Gate, subject, result, criteria with evidence, blockers, ratification |
| Handoff | `handoff.schema.json` | Files changed, checks, gates, blockers, open decisions, next cycle |

## Conventions

- **Unknown is never false or empty.** Uncertain fields use the `assessment` pattern:
  - `status: KNOWN` requires `value`, `evidence` and `source`.
  - `UNKNOWN`, `NOT_APPLICABLE` and `DECLINED` forbid `value`.
  - `KNOWN` with `[]` means "confirmed none". `KNOWN` with evidence `ASSUMED`/`UNVERIFIED` means "have a value but it's not verified".
- Humans only: approvers, consent recorders/verifiers, claim reviewers (CONFIRMED), risk acceptors, gate ratifiers (`userActor`).
- Paths are portable relative POSIX paths (`relativePath`).
- Every document carries `kind` and `schemaVersion`.

## Versioning

- Additive optional fields → patch/minor within the same major line.
- Removing or renaming fields, or tightening constraints → new version directory plus a pure migration function with fixtures (`GENERATION_CONTRACT.md`).

## Verification

`npm run check` compiles every schema, validates every fixture in `schemas/0.1.0/examples/`, and asserts that 48 negative mutations are rejected. The mutations cover unknown-vs-false, approval bypasses, consent gaps, path traversal, gate PASS without evidence, and more.
