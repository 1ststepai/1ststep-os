# Claude Cycle 0 Addendum — Premium UX + AI Cost Harness

Read and incorporate these files before completing Cycle 0:

- `PREMIUM_EXPERIENCE_OS.md`
- `MOTION_AND_ANIMATION.md`
- `FRONTEND_QUALITY.md`
- `AI_RUNTIME_OS.md`
- `DESIGN_REVIEW_GATE.md`
- `COST_REVIEW_GATE.md`
- everything under `ai-runtime/`

These are canonical architectural requirements.

## Additional Cycle 0 requirements

### Premium frontend architecture
The architecture ADR must address:
- design system strategy
- component strategy
- animation/motion strategy
- accessibility
- responsive behavior
- performance budgets
- visual regression approach
- asset/image/font strategy
- loading/error/empty state architecture

Do not produce a generic dashboard by default.

### AI runtime/cost architecture
The architecture ADR must address:
- provider-neutral model interface
- Anthropic/Claude support
- OpenAI support
- Claude Code adapter/harness
- task classification
- model routing
- token budget enforcement
- context assembly/retrieval
- context compaction
- provider-specific prompt caching/reuse when available
- deterministic vs model-driven work
- bounded retries/fallbacks
- structured output validation
- eval-driven quality routing
- per-request/workflow/user/project cost telemetry
- budget enforcement
- worst-case unit cost modeling

### Cost principle
Do not optimize simply for the cheapest model. Optimize for:
`required quality + minimum sufficient context + lowest sustainable cost`.

### Claude Code principle
Claude Code must be a first-class supported coding environment, but canonical Project OS files remain vendor-neutral.

### Gate additions
Before G1 Architecture can PASS, demonstrate that the proposed architecture has a credible plan for both:
1. premium production UI/UX
2. AI token/cost control

Do not scaffold until these requirements are incorporated into the architecture decision.
