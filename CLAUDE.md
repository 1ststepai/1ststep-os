# Claude Adapter — 1stStep OS

Before any implementation work:

1. Read `AGENTS.md`.
2. Read the core authority files listed there.
3. Read `state/CURRENT_STATE.md`.
4. Inspect the repository.
5. Do not assume prior chat context is authoritative unless captured in the repository.
6. Follow the evidence vocabulary and gates.
7. Update state and handoff files before ending a meaningful work cycle.

Claude-specific convenience must never override the canonical Project OS.


## Auto Model Router
Use skill .claude/skills/auto-model-router/SKILL.md before choosing model/effort for substantial work: suggest lightest tier, wait for confirm/override, then run.

