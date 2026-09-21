# MVP Scope Classification

**P0 proves one loop:**

`Idea / Business Goal → Adaptive Interview → Project Profile → Research → Capability Selection → Recommendations → Generated Project OS → Preview → Download → Start Building`

- **Generation** = the generated Project OS contains guidance for the area.
- **Execution** = 1stStep OS itself performs work in that area.
- Per-capability detail lives in `capabilities/registry.json`. Module phases live in `modules/registry.json`.
- Status: proposed in Cycle 0; product-owner ratification pending.

| Area | Generation | Execution by 1stStep OS | Why |
|---|---|---|---|
| Idea intake + adaptive interview (build mode) | P0 | P0 | The core loop |
| Business goal intake + Business Owner Mode interview & ranked automation map | P0 | P0 (deterministic scoring only) | The prompt requires "Idea / Business Goal"; scoring is Tier A and cheap |
| Project Profile, risk classification, capability/module selection | P0 | P0 | Deterministic core |
| Market / competitor / pricing / ICP research | P0 | P0 | PRD P0 business intelligence; evidence-bound |
| Recommendations (stack, pricing, positioning, channels) | P0 | P0 | PRD P0 |
| Project OS compiler, preview, ZIP export | P0 | P0 | PRD P0 |
| Provider adapters (Claude Code, Codex, Cursor, generic) | P0 | P0 | PRD P0; Claude Code first-class |
| Premium UX for 1stStep OS itself | n/a | P0 | Canonical requirement (ADR-013) |
| AI runtime / token harness / budgets for 1stStep OS itself | n/a | P0 | Canonical requirement (ADR-012) |
| Product strategy, PRD, JTBD, roadmap | P0 | P0 (partial) | Needed for a buildable OS |
| Design system / accessibility / motion guidance | P0 | LATER | Guidance cheap; no design generation |
| Web, mobile, extension, API/CLI, ecommerce, marketplace, internal tool engineering guidance | P0 | LATER | Module applicability already required by PRD |
| Desktop, PWA, SDK, realtime | P1 | LATER | Less common first projects |
| AI feature guidance (routing, evals, guardrails, token harness) | P0 | LATER | Many user projects use AI |
| RAG / embeddings / tool use / MCP guidance | P1 / P2 | LATER | Advanced |
| Backend, infra, security, quality baselines | P0 (core) / P1 (advanced) | LATER | Safety baseline for every build |
| Automation guidance (workflow, integration discovery, approvals, RPA boundaries) | P0 | LATER | Needed by Business Owner Mode map |
| Specific automations (email, CRM, docs, reporting, data sync, webhooks) | P1 | LATER | Detailed specs after map proves value |
| Brand foundations (naming, positioning, messaging, domain strategy) | P0 | P1 (naming only) | BI P0 |
| Brand assets (logo, press kit, social kit, screenshots, mockups, deck) | P1 | P1–P2 (assisted) | Needs Media Factory maturity |
| SEO / content / socials / community / directories / launch planning | P0 | P1–P2 (drafts, assisted only) | ADR-008 distribution from day one; publishing approval-gated |
| Email marketing, PR, partnerships, referrals, affiliates | P1 | LATER | After launch plan |
| Paid ads, retargeting, influencers | P2 | LATER | Spend risk (billing scope) |
| Sales / CRM | P1 | LATER | Secondary for beginner builders |
| Customer success / support | P1 (core) / P2 | LATER | Post-launch |
| Analytics basics (event taxonomy, funnel, product/web analytics) | P0 | LATER | Measure from day one |
| CRO, experiments, cohorts, unit economics | P1 | LATER | Needs traffic |
| Finance / pricing / business model / cost model | P0 (model, cost, terms readiness) / P1 | P0 (business model rec) | Pricing evidence is P0 |
| Tax, insurance, procurement handoffs | P2 | LATER | Handoff checklists only |
| Image generation/editing | P2 (OG/diagrams P1) | LATER (OG render P2) | Media Factory later; deterministic templates first |
| Video generation/editing, B-roll, clipping, reframing | P2 strategy/scripts; LATER generative/editing | LATER | Cost, consent, provenance maturity |
| Voice cloning, TTS/STT, dubbing | P2 TTS/STT/transcription; LATER cloning/dubbing | LATER | Identity consent; **no real voice cloning** |
| Podcast / audio / music / SFX | P2 podcast; LATER audio editing/music | LATER | Non-core |
| Avatars / lipsync | LATER | LATER | Identity risk, high cost |
| 3D / AR | LATER | LATER | Niche |
| Localization / i18n | P1 i18n / P2 localization | LATER | After core market |
| Documentation / training | P0 README, architecture, runbooks, changelog / P1–P2 | P0 (README/architecture docs in bundle) | Part of generated OS |
| Team / hiring / project management | P0 handoffs, task planning, code review / P1–P2 | P0 (handoffs) | Handoffs are core Project OS memory |
| Existing project recovery / migrations | P1 | P1 | PRD P1 |
| Continuous intelligence (competitor/pricing/SEO/OS drift) | P2 | P2 | PRD P2 |
| Connectors / assisted external actions | P2 | P2 (approval-gated) | PRD P2 "approved connector actions"; MVP has zero connectors |
| Team / org Project OS standards | P2 | P2 | PRD P2 |

## What moved relative to earlier documents and why

- **Business goal intake moved into P0.** It was implied only by `operations/BUSINESS_OWNER_MODE.md`; the current Cycle 0 instruction puts "Idea / Business Goal" in the P0 loop. It is limited to the interview, deterministic ranking and generated guidance. No automation runs.
- **Premium UX and AI cost harness are P0 architecture requirements** for 1stStep OS itself (`prompts/CLAUDE_CYCLE0_ADDENDUM.md`), not user-project features.
- **The Media Factory, voice/video/avatars, 3D and automation execution stay P2/LATER** (`prompts/CLAUDE_EVERYTHING_LAYER.md` "do not expand MVP"). Schemas for MediaAsset, ConsentRecord and AutomationDefinition exist now so later phases don't redesign data.
- **"Capability selection" replaces "module selection" in the P0 loop wording.** Modules remain the selection unit; capabilities are the granular content inside them.

## Universal LLM addendum (incorporated 2026-09-13)

| Area | Phase | Why |
|---|---|---|
| Provider-neutral canonical layer, policy before routing, portable checkpoints, failover rules | P0 (architecture now, M3 implementation) | Canonical requirement; cheap to build in, expensive to retrofit |
| Native Anthropic and OpenAI adapters | P0 (M3) | Two independent providers prove neutrality |
| ProviderPolicy UI (organization/project) | P1 | MVP uses platform defaults; schema exists |
| BYO LLM (OpenAI-/Anthropic-compatible endpoints, enterprise gateways) | P1 | Needs connection test, secret store and egress guard |
| Cloud model platform and custom adapters | P2 | Demand-driven |
| Local/self-hosted model execution (self-hosted 1stStep OS or local agent runner) | P2 | Needs a self-hosted runtime mode |
| Additional coding-agent adapters (Gemini, Copilot, Windsurf, local agents) | P1 generation | Templates only; conventions verified before claiming support |
| /os site provider-neutral messaging and animation | Website work, not this repository | Must not imply implemented compatibility |
