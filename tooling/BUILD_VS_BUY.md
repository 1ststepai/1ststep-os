# Build vs Buy Engine

Before adding a dependency/service:
- can deterministic code solve it?
- is there a mature open-source option?
- is managed service cheaper after maintenance?
- what is lock-in?
- privacy/security impact?
- usage-based cost at 1k/10k/100k users?
- exit/migration path?
- operational burden?
- API reliability?

Record material decisions as ADRs.

Apply these questions in the routing order and hard filters defined in `tooling/COST_FIRST_ROUTER.md` (the single routing authority).
