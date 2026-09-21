# Coding Agent Harness

## Objective

All coding agents should operate through a bounded cycle:

`Load Authority → Inspect → Plan → Execute → Verify → Persist State → Handoff`

## Required task envelope

- objective
- scope
- allowed files
- authoritative references
- non-goals
- acceptance criteria
- tests
- token/context budget
- model tier recommendation
- escalation conditions

## Anti-waste rules

- no repeated repository-wide scans without reason
- no repeated dependency installation attempts
- no full test suite when a targeted test is sufficient during iteration; full applicable suite at gates
- no duplicate code generation when an existing component can be safely reused
- no verbose planning artifacts that are not durable/useful
- no agents created merely to create more agents
