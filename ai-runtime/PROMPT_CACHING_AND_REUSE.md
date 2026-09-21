# Prompt Caching & Reuse

## Goal

Reduce repeated processing of stable context.

Potentially cache/reuse:
- stable system instructions
- canonical OS authority
- schema definitions
- stable project profile sections
- provider adapter instructions
- repeated evaluation rubrics
- unchanged large reference material

## Rules

- Provider-specific caching must be behind an abstraction.
- Never assume every provider implements caching the same way.
- Track cache eligibility, version, TTL/freshness, privacy scope, hit/miss, and estimated savings.
- Invalidate when authoritative files or schema versions change.
- Do not cache secrets.
- Do not let stale cached business/research information override freshness policy.
