# Implementation Inventory

Status vocabulary: `AGENTS.md`. Updated 2026-09-21 (Cycle 1 thin vertical).

| Area | Status | Evidence / next milestone |
|---|---|---|
| Product definition | SPECIFIED | PROJECT.md, PRODUCT_REQUIREMENTS.md, plan/SCOPE.md |
| Project OS authority | SPECIFIED | AGENTS.md hierarchy; reconciliation audit |
| Product requirements | SPECIFIED (additions pending ratification) | PRODUCT_REQUIREMENTS.md |
| Architecture decision | SPECIFIED (ACCEPTED, G1 PASS) | ADR-010, ADR-012..014 |
| Canonical schemas | SPECIFIED + TESTED | schemas/0.1.0 (20 files, 15 fixtures, 48 negative mutations) |
| Capability registry | SPECIFIED + TESTED | capabilities/registry.json (301) |
| Module registry | SPECIFIED + TESTED | modules/registry.json (22) |
| Module selection engine | IMPLEMENTED + TESTED | `packages/core` `selectModules`; representative goldens + shuffle property. Full 22-module golden set still M1 remainder. |
| Risk engine | IMPLEMENTED + TESTED | ruleset 0.1.0 in `classifyRisk` |
| Profile validation / idea intake | IMPLEMENTED + TESTED | `validateProfile`, `buildProfile` (deterministic defaults) |
| Compiler / templates / adapters | IMPLEMENTED (thin) | Cycle 1 emits 5 markdown files, no LLM, no adapter set. Full templates → M4 |
| Export (deterministic ZIP) | IMPLEMENTED (STORE) | `buildZip` STORE method; deflate + full S7 → M4 |
| AI runtime / token harness / budgets | SPECIFIED | ADR-012 → M3 |
| Universal LLM (policy, BYO, failover) | SPECIFIED | ADR-012 Amendment A; ProviderPolicy/LLMConnection schemas → M3 / P1 / P2 |
| Research engine | SPECIFIED | RESEARCH_POLICY.md research contract → M5 |
| Business intelligence / recommendations | SPECIFIED | → M6 |
| Business Owner Mode | SPECIFIED | ADR-014 §5 → M3 interview, M6 ranking |
| Growth registry | SPECIFIED (module level) | growth module → generation in M4 |
| External actions | SPECIFIED | EXTERNAL_ACTIONS.md, ExternalAction schema; no connectors |
| UI (premium experience) | SCAFFOLDED + Cycle 1 demo | `/os` idea/profile → ZIP; ADR-013 → M7 |
| API server | IN_PROGRESS | healthz + compile; auth/tenancy → M2 |
| Core package | IMPLEMENTED | pure domain engine + compiler |
| Authentication / authorization / tenancy | SPECIFIED | ADR-010 D3–D4 → M2 |
| Database | SPECIFIED | ADR-010 D2 → M2 |
| Background jobs / worker | SPECIFIED | ADR-010 D6 → M3 |
| Observability | SPECIFIED | ADR-010 D8, ADR-012 §13 → M2/M3/M8 |
| Deployment | NOT_STARTED (host OPEN) | ADR-010 D7 → M8 staging only |
| Media Factory | FUTURE (P2 guidance, LATER execution) | media/*, MediaAsset & ConsentRecord schemas |
| Automation Engine execution | FUTURE (LATER) | AutomationDefinition schema |
| Existing-repo recovery | FUTURE (P1) | ADR-010 D18 |
| Continuous intelligence | FUTURE (P2) | ADR-010 D19 |
