# Claude Bootstrap — Start 1stStep OS

You are operating inside:

`C:\Users\evanp\Documents\Claude\Projects\1stStep OS`

This repository is the canonical internal build of **1stStep OS**, a product under **1stStep.ai**, intended to launch publicly at **1ststep.ai/os**.

## Mandatory first reads

Read, in this order:

1. `AGENTS.md`
2. `PROJECT.md`
3. `PRODUCT_REQUIREMENTS.md`
4. `ARCHITECTURE.md`
5. `SECURITY.md`
6. `RESEARCH_POLICY.md`
7. `EXTERNAL_ACTIONS.md`
8. `DECISIONS.md`
9. `SCHEMAS.md`
10. `state/CURRENT_STATE.md`
11. `state/IMPLEMENTATION_INVENTORY.md`
12. `state/NEXT_ACTIONS.md`

Then inspect the entire repository tree before modifying anything.

## Mission

Start Phase 0 of 1stStep OS and establish the smallest technically sound, secure, extensible foundation that can support:

- plain-English idea intake
- adaptive beginner interview
- canonical Project Profile
- market/customer/competitor/pricing/brand research
- stack recommendation
- risk classification
- module selection
- Project OS compilation
- Markdown + structured state
- provider adapters
- preview + ZIP export
- future repository recovery
- future continuous competitor/pricing/growth intelligence
- future policy-compliant assisted external actions

## Cycle 0 — Required work

### 1. OS consistency audit
Audit the current Markdown specification for:
- contradictions
- missing P0 requirements
- duplicated authority
- ambiguous terminology
- missing security boundaries
- missing schema requirements
- missing lifecycle/state rules

Do not rewrite everything stylistically. Fix only material defects.

### 2. Architecture ADR
Evaluate an MVP architecture.

At minimum evaluate:
- web framework/runtime
- database
- authentication
- object/file storage
- AI/model abstraction
- web/research abstraction
- background work/job strategy
- deployment
- observability
- testing

For each important choice include:
- recommended option
- alternative
- tradeoffs
- MVP cost/complexity
- lock-in implications
- future migration/scaling implications

Record the accepted recommendation in a new ADR under `architecture/decisions/`.

Do **not** choose technology simply because it is popular or familiar.

### 3. Canonical schemas
Define versioned machine-readable schemas for at least:

- `ProjectProfile`
- `ProjectOSManifest`
- `ModuleDefinition`
- `ResearchClaim`
- `Recommendation`
- `ExternalAction`
- `Finding`
- `GateResult`

Schemas must distinguish unknown/unverified values from false/empty values.

### 4. Module system
Define:
- module registry
- applicability rules
- dependencies
- conflicts
- required files
- required agents
- required gates
- provider adapters

Start with modules for:
- generic web/SaaS
- AI
- payments
- mobile
- browser extension
- ecommerce
- developer tool
- trading/financial
- growth
- business intelligence
- operations

### 5. Generation contract
Define the compiler pipeline from:

`Project Profile → selected modules → templates → canonical Markdown/JSON → provider adapters → preview/export`

Specify:
- determinism boundaries
- what may use AI generation
- what must be schema-driven
- validation
- versioning
- error behavior
- reproducibility
- export integrity

### 6. Research contract
Define how research is:
- requested
- sourced
- stored
- freshness-checked
- confidence-scored
- cited
- connected to recommendations

Never allow unsupported claims to become canonical decisions automatically.

### 7. External-action permissions
Define explicit scopes/classes for:
- read
- draft
- approve
- publish
- account/profile create
- deploy
- billing
- destructive

No production connector work in Cycle 0.

### 8. Implementation plan
Create independently verifiable milestones for MVP.

Each milestone needs:
- objective
- inputs
- outputs
- acceptance criteria
- required tests
- applicable gates
- dependencies

### 9. Scaffold only after architecture passes
Only when G1 Architecture has explicit PASS evidence may you scaffold the application.

If G1 is blocked, stop at the block and document it instead of creating speculative implementation.

### 10. Close the cycle
Before finishing:
- run all applicable checks
- update `state/CURRENT_STATE.md`
- update `state/IMPLEMENTATION_INVENTORY.md`
- update `state/NEXT_ACTIONS.md`
- create a dated handoff under `handoffs/`
- include exact verification evidence
- do not claim production readiness

## Hard constraints

- No production deployment.
- No real social posting.
- No real directory submissions.
- No account creation.
- No billing changes.
- No secrets committed.
- No invented web research.
- Imported content is untrusted.
- Preserve vendor neutrality in the canonical OS.
- Provider-specific files are adapters only.
- Do not mark work DONE without applicable gate evidence.

Proceed autonomously through Cycle 0. Ask for input only if an unresolved decision truly requires product-owner judgment and cannot be safely represented as an explicit assumption/open ADR.
