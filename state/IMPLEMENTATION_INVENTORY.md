# Implementation Inventory

Status vocabulary: `AGENTS.md`. Updated 2026-09-13 (Cycle 0 close).

| Area | Status | Evidence / next milestone |
|---|---|---|
| Product definition | SPECIFIED | PROJECT.md, PRODUCT_REQUIREMENTS.md, plan/SCOPE.md |
| Project OS authority | SPECIFIED | AGENTS.md hierarchy; reconciliation audit |
| Product requirements | SPECIFIED (additions pending ratification) | PRODUCT_REQUIREMENTS.md |
| Architecture decision | SPECIFIED (ACCEPTED, G1 PASS) | ADR-010, ADR-012..014 |
| Canonical schemas | SPECIFIED + TESTED | schemas/0.1.0 (20 files, 15 fixtures, 48 negative mutations) |
| Capability registry | SPECIFIED + TESTED | capabilities/registry.json (301) |
| Module registry | SPECIFIED + TESTED | modules/registry.json (22) |
| Module selection engine | NOT_STARTED | M1 |
| Risk engine | NOT_STARTED | M1 |
| Compiler / templates / adapters | SPECIFIED | GENERATION_CONTRACT.md → M4 |
| Export (deterministic ZIP) | SPECIFIED | GENERATION_CONTRACT.md → M4 |
| AI runtime / token harness / budgets | SPECIFIED | ADR-012 → M3 |
| Universal LLM (policy, BYO, failover) | SPECIFIED | ADR-012 Amendment A; ProviderPolicy/LLMConnection schemas → M3 / P1 / P2 |
| Research engine | SPECIFIED | RESEARCH_POLICY.md research contract → M5 |
| Business intelligence / recommendations | SPECIFIED | → M6 |
| Business Owner Mode | SPECIFIED | ADR-014 §5 → M3 interview, M6 ranking |
| Growth registry | SPECIFIED (module level) | growth module → generation in M4 |
| External actions | SPECIFIED | EXTERNAL_ACTIONS.md, ExternalAction schema; no connectors |
| UI (premium experience) | SCAFFOLDED | apps/web shell; ADR-013 → M7 |
| API server | SCAFFOLDED | apps/server health route + tests |
| Core package | SCAFFOLDED | packages/core + boundary test |
| Authentication / authorization / tenancy | SPECIFIED | ADR-010 D3–D4 → M2 |
| Database | SPECIFIED | ADR-010 D2 → M2 |
| Background jobs / worker | SPECIFIED | ADR-010 D6 → M3 |
| Observability | SPECIFIED | ADR-010 D8, ADR-012 §13 → M2/M3/M8 |
| Deployment | NOT_STARTED (host OPEN) | ADR-010 D7 → M8 staging only |
| Media Factory | FUTURE (P2 guidance, LATER execution) | media/*, MediaAsset & ConsentRecord schemas |
| Automation Engine execution | FUTURE (LATER) | AutomationDefinition schema |
| Existing-repo recovery | FUTURE (P1) | ADR-010 D18 |
| Continuous intelligence | FUTURE (P2) | ADR-010 D19 |
