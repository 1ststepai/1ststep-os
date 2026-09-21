# AI Cost Review Gate

## Permanent `FREE-AUDIT-ZERO-METERED-COST` release gate (ADR-022)

**Status: NOT_EVALUATED.** For any release that can generate the standard free OS Audit, PASS requires a complete, instrumented run through baseline-derived Genome, detectors/rules, findings, prioritization, OS and specialist recommendations, and report with **no metered AI/API call or required paid inference dependency**, including retry/fallback/error paths. A mocked zero bill, trial credit, cached paid output, or caller-supplied paid key is not proof. An automated dependency/call-boundary test must fail if a future change introduces a metered provider into this path. Verify usage-priced external API cost is `$0.00` per free run and collect separate bounded CPU/time, memory, repository bytes/files, network, storage and cache metrics where available; unknown telemetry is BLOCKED, not PASS. Document abuse limits and per-baseline permission-safe cache keys. If the standard free result requires paid inference, **release is BLOCKED** unless Evan explicitly reverses the product invariant. This gate is a specification, not an implemented test or a passed release check.

Before an AI-heavy feature is considered release-ready:

- workflow has a defined model-routing policy
- deterministic steps do not call models
- input/output token budgets are explicit
- large context is retrieved/scoped rather than dumped
- retry behavior is bounded
- fallback behavior is defined
- cost telemetry exists
- privacy-safe caching/reuse has been considered
- quality eval supports chosen model tier
- per-user/project budget behavior is defined
- worst-case and expected unit cost are estimated

## Result and evidence

`PASS | FAIL | BLOCKED | NOT_APPLICABLE`, recorded as `gates/results/COST_REVIEW-<milestone>.json` (GateResult schema). Each criterion cites its implementation per the mapping table in `architecture/decisions/ADR-012-ai-runtime-and-cost-harness.md`. Unit-cost figures cite model prices with `lastVerified` dates; unverified prices make the criterion BLOCKED.
