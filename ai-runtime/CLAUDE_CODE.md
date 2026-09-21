# Claude Code Adapter & Harness

## Role

Claude Code is a supported coding-agent environment for building and maintaining 1stStep OS and for generated Project OS exports.

## Canonical relationship

`AGENTS.md` and the Project OS remain authoritative.

`CLAUDE.md` is an adapter, not a competing source of truth.

## Claude Code usage discipline

- start from repository authority/state, not chat memory
- use scoped tasks
- read targeted files before broad scans
- avoid repeatedly re-ingesting unchanged documentation
- write durable decisions/state back to repository
- finish meaningful cycles with verification + handoff
- use subagents/parallel work only when responsibilities and output contracts are clear
- avoid duplicate agents solving the same problem
- do not use expensive reasoning for deterministic work
- do not rerun full audits when a targeted verification is sufficient
- preserve exact command/test evidence

## Generated projects

When 1stStep OS generates a project for Claude Code, include:
- `AGENTS.md`
- `CLAUDE.md`
- scoped bootstrap prompt
- current-state file
- architecture/security/testing contracts
- only applicable modules
- explicit next action

This keeps the initial Claude context small and useful.
