# Universal Agent Audit

1stStep OS Audit must not depend on Claude or Codex.

## Audit execution roles

### Audit Orchestrator
Provider-neutral workflow/state machine.

### Audit Worker
Any compatible model/agent selected by the router.

### Verification Worker
May be the same or a different provider/model depending on risk and independence requirements.

## Audit state

Persist outside provider conversation state:
- run ID
- baseline
- completed controls
- evidence
- findings
- scores
- next action
- checkpoints
- pause reason
- budget usage

## Benefits

- resume after provider limits
- move from one provider to another
- use cheaper model for low-risk controls
- use premium model for difficult analysis
- use local model for sensitive repositories
