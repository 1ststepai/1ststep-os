# Integrate Universal LLM Architecture

Read all files in this addendum plus canonical 1stStep OS authority.

## Objective

Make model/provider neutrality a first-class architecture requirement across:
- 1stStep OS
- 1stStep OS Audit
- continuation/resume
- model routing
- provider failover
- BYO LLM
- local/self-hosted models
- site messaging

## Required changes

1. Add provider/model capability registry schemas.
2. Add organization/user provider policy.
3. Add BYO LLM connection model.
4. Add OpenAI-compatible/custom endpoint abstraction where feasible.
5. Add local/self-hosted model support boundaries.
6. Make Audit orchestrator provider-neutral.
7. Make checkpoints portable across providers.
8. Add failover compatibility rules.
9. Add model eval registry.
10. Add provider-independent task envelopes.
11. Update `/os` product positioning to show model portability.
12. Preserve Claude Code and Codex as first-class adapters, not privileged canonical engines.

## Rule

No canonical workflow may require one named provider unless the user explicitly chooses it.
