# Product Requirements — 1stStep OS

Phase classification for every capability area (P0/P1/P2/LATER, generation vs execution): `plan/SCOPE.md`. Milestones: `plan/MVP_MILESTONES.md`.

## Approved product direction; delivery phase not yet assigned (ADR-021)

- The **standard free Audit result** (including preliminary Genome, evidence, priorities, OS/agent recommendations and report) must require **zero incremental metered AI/API usage cost to 1stStep.ai** (ADR-022). No model or usage-priced provider is a dependency, even when promotional credits are available. Ask a few material questions where repository evidence cannot answer them; do not simulate semantic understanding. Label nuanced judgment NOT ASSESSED or leave it to separately authorized paid work. Observe and bound infrastructure cost separately; zero metered usage is not zero compute.
- Existing builders will eventually start with “Connect your project. We'll audit it for free.” Connection requires explicit read-only scope, pinned source identity and baseline, applicable controls derived from a confirmed Project Profile/Genome, and an evidence-backed assessment. A public URL alone permits only a bounded public first look, not a full audit or repo access.
- Present what is strong, weak, risky and unknown, then the most important actionable priorities and a justified Project OS configuration. Only recommend capabilities and specialist agents when evidence and project needs warrant them. Audit value must not depend on conversion or payment.
- Preserve the new-builder idea/business-goal path as a separate interpretation and adaptive-question flow. Both paths converge on one Project Genome/Profile → Project OS → engineering-team contract. The Genome definition and mapping to the existing profile remain open (F-0025).
- Paid spin-up and optional specialists are target commercial stages, **not** approved prices, payment flows, entitlements or live services. Scoring is secondary and may be published only when applicable evidence and coverage justify the claim. Phase assignments and G1/G2 implementation gates remain unchanged pending contract reconciliation.

## P0 — MVP

### Idea intake
- Accept a plain-English idea **or a business goal** (Business Owner Mode).
- Support users who do not know technical terminology.
- Preserve original intent (stored verbatim as untrusted user input).

### Business Owner Mode (added Cycle 0 — ratify)
- Discover business operations (leads, CRM, quoting, scheduling, email, documents, invoicing, payments, support, reporting, inventory, fulfillment, recurring admin, approvals, data entry, compliance handoffs).
- Produce a deterministic ranked automation opportunity map by time saved, cost, effort, risk and ROI; unknown inputs are flagged `NEEDS_DATA`, never treated as zero.
- No automation execution in MVP.

### Premium experience and AI cost control (added Cycle 0 — canonical per `prompts/CLAUDE_CYCLE0_ADDENDUM.md`)
- 1stStep OS meets `PREMIUM_EXPERIENCE_OS.md`, `FRONTEND_QUALITY.md`, `MOTION_AND_ANIMATION.md` and passes `DESIGN_REVIEW_GATE.md` for user-facing milestones.
- AI usage meets `AI_RUNTIME_OS.md` and passes `COST_REVIEW_GATE.md`, with per-request/workflow/user/project budgets and hard limits.

### Data rights and AI disclosure (added Cycle 0 — ratify; F-0010)
- Users can delete a project and export their own project data.
- Users are told before intake which data is sent to third-party AI and search providers (policy per OD-6).

### Adaptive interview
Ask only questions that materially affect:
- product type
- target users
- monetization
- data sensitivity
- authentication
- AI requirements
- integrations
- mobile/web/extension needs
- geographic/legal considerations
- launch goals
- growth goals

The system should recommend defaults instead of forcing beginners to make technical decisions they cannot evaluate.

### Project Profile
Generate a structured canonical profile containing:
- project summary
- problem
- target user
- jobs to be done
- project type
- lifecycle stage
- feature scope
- non-goals
- data classification
- auth needs
- payment needs
- AI needs
- integration needs
- distribution model
- risk profile
- proposed stack
- selected OS modules

### Business intelligence
Research:
- market context
- competitors
- substitutes
- competitor pricing
- positioning
- user pain signals
- category language
- potential business models
- pricing options
- likely channels
- risks/opportunities

All research must include source, date, freshness, confidence, and fact-vs-estimate status.

### Stack recommendation
Recommend architecture based on requirements, not fashion.

Output:
- recommended stack
- alternatives considered
- tradeoffs
- cost/scaling assumptions
- reason for recommendation
- confidence
- unresolved decisions

### Capability & module engine
Select only applicable modules (bundles of capabilities) deterministically from the profile. Generate the smallest applicable OS; never dump every capability into a project (`EVERYTHING_OS.md`). Matched modules of later phases are shown as deferred.

Examples:
- SaaS
- mobile
- extension
- AI
- payments
- ecommerce
- trading/finance
- developer tools
- local marketplace
- internal tool

### Project OS compiler
Generate:
- canonical root Markdown
- structured `.project-os` files
- agents
- workflows
- gates
- checklists
- state
- prompts
- applicable domain modules
- provider adapters

### Provider adapters
At minimum:
- generic `AGENTS.md`
- Claude (`CLAUDE.md` / bootstrap prompt)
- Codex-compatible project instructions
- Cursor-compatible output strategy
- provider-neutral export

Do not let provider-specific conventions become the canonical source of truth.

### Preview
Users must be able to inspect:
- project summary
- recommendations
- research/evidence
- selected modules
- files to be generated
- assumptions
- unresolved decisions

before downloading.

### Export
- Complete ZIP
- Stable filenames
- Manifest
- OS version
- Generation timestamp
- Schema version
- Module list

### OS versioning
Each generated OS has:
- OS version
- schema version
- project version
- changelog
- migration/update path

## P1

- GitHub repository import
- stack detection
- architecture inference
- existing project recovery
- implementation inventory
- gap analysis
- Project OS generation around an existing codebase
- health/compliance score
- remediation prompts
- social profile/asset kit
- live channel registry
- detailed automation specs (email, CRM, documents, reporting, data sync)
- sales/CRM and customer-success modules
- desktop, PWA, SDK, realtime modules
- tool/model provider registries surfaced to users

## P2

- repository sync
- continuous OS drift detection
- competitor changes
- pricing changes
- launch eligibility changes
- directory discovery
- content/growth suggestions
- team Project OS
- organization standards
- approved connector actions
- Media Factory guidance (image, video strategy/scripts, TTS/STT, podcast) and deterministic asset rendering
- localization

## LATER

- automation execution engine
- generative video/editing, voice cloning, dubbing, avatars/lipsync, music, 3D/AR execution
- specialised modules for bots, AI agents, data pipelines, games, IoT companions

## Explicit MVP non-goals

- Autonomous production deployment
- Mass account creation
- Unrestricted social posting
- Community spam
- Automated legal filings
- Automated purchases
- Automatic billing changes
- Fully autonomous company operation
- Treating AI-generated estimates as verified facts
- Running business automations or connector write actions
- Media generation, voice cloning or avatar generation
- Hundreds of provider integrations
