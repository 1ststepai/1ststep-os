# Technical Debt

| Item | Why it exists | Pay down when |
|---|---|---|
| 301 capability docs are STUB boilerplate | Registry metadata was the Cycle 0 priority | Each capability's generation phase is reached (templates in M4+) |
| `tools/spec.test.mjs` is a single growing check file | Cycle 0 had no packages | M1 creates `packages/schemas`; move schema validation there |
| Review gates live at the repository root (`DESIGN_REVIEW_GATE.md`, `COST_REVIEW_GATE.md`) | Prompts reference those paths (F-0019) | Optional cleanup once prompts are updated |
| Placeholder `tokens.css` and scaffold page | Scaffold only | M7 |
| Server static-serving path assumes the monorepo layout | Scaffold simplicity | M8 container build defines final asset path |
