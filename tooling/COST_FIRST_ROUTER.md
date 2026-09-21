# Cost-First Capability Router

Unified routing order for build-vs-buy decisions, tools and models (reconciles the earlier 6-step list here with `tooling/BUILD_VS_BUY.md` and the Cycle 0 instruction). The `ToolProvider.routingClass` value is the step number.

## Order of consideration

1. deterministic/local operation (code, rules, ffmpeg-class transforms, templates)
2. existing project asset/reuse (cached results, prior outputs, existing components, existing subscriptions)
3. open-source option (library or self-hosted; include maintenance and operational burden)
4. free/low-cost managed service
5. low-cost model (Tier B)
6. balanced model (Tier C)
7. premium model/tool (Tier D) only when value requires it

Never sacrifice required quality/security merely to minimize price.

## Hard filters (applied before ranking)

A candidate is eligible only if it passes all of these:

- **Quality floor:** eval pass rate for the task (models) or acceptance tests (tools).
- **Privacy class** compatible with the data (AI data policy OD-6; `privacyClass` of the task).
- **Licence** permits commercial use and output ownership where needed.
- **Consent** present for identity-bearing capabilities.
- **Authorization scopes** available and approved (`EXTERNAL_ACTIONS.md`).
- **Budget:** worst-case cost fits the reservation (ADR-012 §12).
- **Security review** passed for new dependencies with network or data access.

## Ranking

The lowest routing class that passes the filters wins. Ties break on expected cost, then lock-in, then latency.

## Dimensions recorded for every material routing / build-vs-buy decision

quality · cost (expected and worst-case; usage-based at 1k/10k/100k users when relevant) · privacy · licensing · latency · reliability · lock-in · migration/exit path · operational burden · security impact

Material decisions are recorded as ADRs or Recommendation records (category ARCHITECTURE).

## Learning loop

Track expected vs actual cost and quality (`ai_calls`, job and tool telemetry) so routing improves over time. Routing-table changes require eval evidence (COST_REVIEW gate).
