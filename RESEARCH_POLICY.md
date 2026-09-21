# Research & Evidence Policy

## Every external research item must capture

- source URL/provider
- source title
- retrieved date/time
- publication/update date when available
- claim supported
- direct fact vs inference vs estimate
- confidence
- freshness window
- project relevance

Machine contract: `schemas/0.1.0/research-claim.schema.json`.

## Status vocabulary

`CONFIRMED | OBSERVED | INFERRED | ASSUMED | UNVERIFIED | BLOCKED` (definitions in `AGENTS.md`)

## Rules

- Do not fabricate market size, pricing, traffic, user counts, conversion rates, or competitor features.
- Do not present search snippets as stronger evidence than source pages.
- Prefer primary sources for pricing/product capabilities.
- Community/review sources are useful for sentiment and pain signals, not unquestioned facts.
- Material recommendations should explain what evidence they depend on.
- Time-sensitive business intelligence must have a freshness date.
- Never allow unsupported claims to become canonical decisions automatically.

---

## Research contract

### Three independent axes

| Axis | Values | Question it answers |
|---|---|---|
| `claimType` | FACT, ESTIMATE, INFERENCE, SENTIMENT | What kind of statement is it? |
| `evidence` | CONFIRMED, OBSERVED, INFERRED, ASSUMED, UNVERIFIED, BLOCKED | How was it established? |
| `confidence` | HIGH, MEDIUM, LOW, NONE | How much should a decision rely on it? |

- An ESTIMATE must state its method.
- Automated research can at most reach **OBSERVED**. **CONFIRMED** requires a recorded human review against a primary source.

### 1. Requested

- Research questions (`{id, topic, question, requiredFor, freshnessWindowDays, priority}`) are generated **deterministically** from the profile and selected modules' `researchTopics`.
- Users may add questions.
- The model may *propose* extra questions (Tier B). They run only if accepted by the user or by a versioned rule, and they stay within the project research budget (ADR-012).

### 2. Sourced

- Only through the `SearchProvider` and the SSRF-safe `PageFetcher` (ADR-010 D11), or user-provided documents (`USER_PROVIDED`, treated as untrusted).
- Every FACT claim cites ≥ 1 fetched source with an excerpt (≤ 500 characters) that must be a substring of the stored normalized page text (deterministic check). A claim failing the check is discarded, not downgraded silently.
- A snippet-only source (`SEARCH_SNIPPET`) caps a claim at evidence UNVERIFIED and confidence LOW.
- Model knowledge without a source can only be recorded as ASSUMED or UNVERIFIED, marked "model knowledge", and never as FACT with OBSERVED evidence.
- With no provider configured, or blocked by robots/terms/paywall, the question produces a `BLOCKED` claim with `blockedReason`. Paywalls, logins, robots rules and anti-bot measures are never bypassed.

### 3. Stored

- ResearchClaim records plus a source record with content hash and retrieval metadata.
- Full page text is kept only as long as needed for excerpt verification and re-extraction (retention set at M5). Afterwards only hash + excerpt remain.
- Public-web fetch results may be cached across tenants (URL + content hash). Claims and project linkage are tenant-private.

### 4. Freshness-checked

Default windows:

| Topic | Window (days) |
|---|---|
| PRICING | 30 |
| COMPETITOR | 60 |
| CHANNEL | 90 |
| CUSTOMER / sentiment | 90 |
| REGULATORY | 180 |
| TECHNICAL | 180 |
| POSITIONING / BRAND | 180 |
| MARKET / SUBSTITUTE | 365 |

- `expiresAt = retrievedAt + window`. A scheduled job marks claims past `expiresAt` as stale in the UI.
- Recommendations depending on stale claims move to `NEEDS_EVIDENCE` on their next evaluation.
- Stale claims are never deleted, and an old pricing snapshot is never shown as current (`business/COMPETITOR_INTELLIGENCE.md`).

### 5. Confidence-scored (deterministic function; models cannot raise it)

- **HIGH:** FACT, PRIMARY source, fresh, excerpt verified, and either CONFIRMED or corroborated by a second independent source.
- **MEDIUM:** FACT from a PRIMARY or reputable SECONDARY source, fresh, excerpt verified; or ESTIMATE with stated method and ≥ 2 independent inputs.
- **LOW:** single COMMUNITY source, SEARCH_SNIPPET, INFERENCE, SENTIMENT, or stale.
- **NONE:** ASSUMED, UNVERIFIED without source, or BLOCKED.

### 6. Cited

- Generated Markdown renders citations from ResearchClaim records, e.g. `[C-12]` → URL, title, retrieved date, evidence, confidence, freshness.
- Excerpts are rendered as untrusted fenced content (`GENERATION_CONTRACT.md`).
- AI prose may reference claim ids only. Unknown ids fail validation.

### 7. Connected to recommendations

- `Recommendation.supportingClaimIds` and `assumptionIds` are required for material recommendations.
- **Canonicalization rule:** a Recommendation becomes `ACCEPTED` only through
  (a) explicit user approval in the UI (`decision.basis = USER_APPROVAL`, human actor), or
  (b) a versioned deterministic rule (`DETERMINISTIC_RULE`, `ruleId` + `ruleVersion`) that does not depend on any claim below OBSERVED.
- Recommendations supported only by ASSUMED/UNVERIFIED/INFERRED evidence stay `PROPOSED` and are shown with their evidence state.
- Profile fields set from research carry `source: RESEARCHED` and `claimIds`.
