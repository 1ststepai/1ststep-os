# AI Runtime & Cost OS

## Mission

Make AI usage efficient, observable, vendor-neutral, and economically sustainable.

AI cost optimization must be designed into the architecture rather than added after launch.

## Core rules

- **Standard free OS Audit exception:** no model router or other usage-priced AI/API provider participates in its mandatory path, even as a cheap fallback. Its required result runs deterministically at $0 incremental metered AI/API usage to 1stStep.ai; paid activation has separate authorization and budget policy (ADR-022). Track infrastructure resources independently.
- Use the least expensive model that reliably meets the task's quality requirement.
- Expensive models are not default models.
- Do not send entire repositories or entire Project OS bundles when a scoped context packet is sufficient.
- Reuse deterministic computation instead of re-asking a model.
- Cache reusable results where policy/provider semantics allow.
- Avoid duplicate generation.
- Track cost and token usage per user, project, workflow, provider, model, and feature.
- Establish hard/soft budget limits.
- Evaluate model quality before routing down to a cheaper model or up to a more expensive one.
- Preserve privacy boundaries when caching or logging.

## Runtime layers

1. Task classifier
2. Context assembler
3. Token budgeter
4. Model router
5. Prompt/template registry
6. Cache/reuse layer
7. Tool execution layer
8. Retry/fallback controller
9. Output validator
10. Cost/latency telemetry
11. Evaluation layer
12. Budget enforcement

Architecture decision implementing these layers: `architecture/decisions/ADR-012-ai-runtime-and-cost-harness.md`. Release gate: `COST_REVIEW_GATE.md`.
