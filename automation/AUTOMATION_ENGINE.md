# Automation Engine

Automation types:
- scheduled
- event/webhook driven
- conditional monitoring
- pipeline/workflow
- human approval
- batch
- data synchronization
- reporting
- lifecycle messaging

Every automation needs:
trigger → conditions → action → idempotency → retries → failure queue → observability → owner → pause/kill switch → audit trail.

High-impact external actions remain approval/authorization governed.

Architecture: ADR-014 §4. Machine contract: `schemas/0.1.0/automation-definition.schema.json`. Governance: `governance/HUMAN_CONTROL.md`. Phase: guidance and specs P0/P1; **execution LATER**.

## Coverage

| Area | How it is expressed |
|---|---|
| Scheduled | `trigger.type = SCHEDULE` (cron + timezone) |
| Event / webhook | `EVENT` / `WEBHOOK` with signature verification + replay window |
| Conditional monitoring | `CONDITION` with poll interval ≥ 5 min |
| Approval workflows | Steps with `approval: REQUIRED / HIGH_RISK`; approvals bound to payload hash (`EXTERNAL_ACTIONS.md`) |
| Email / CRM / document / reporting automation | Steps with `read` / `draft` / `publish` scopes against ToolProviders |
| Data sync | `DATA_SYNC` type; destructive writes need HIGH_RISK approval |
| Business process automation | Business Owner Mode opportunities → draft AutomationDefinitions |
| Failure queues | Mandatory `failureQueue.enabled = true`, retention, owner notification |
| Retries | Bounded (`maxAttempts` ≤ 10), only on TIMEOUT / RATE_LIMIT / TRANSIENT |
| Idempotency | `idempotencyKeyTemplate` per step; `UNKNOWN_OUTCOME` reconciled before retry |
| Pause / kill switch | Mandatory; per-automation and global |
| Audit trail | Mandatory; every run and step result |
| Owner | Named human owner required |
| ROI / time saved | `roi` assessments; measured minutes saved from run logs vs baseline |

## Safety rules (schema-enforced)

- `publish` steps require approval.
- `deploy`, `billing` and `destructive` steps require HIGH_RISK approval.
- `account_create` is never automated.
- Budget ceiling and max runs per day are required.
- Dry run should be available before activation.

## Execution (when promoted)

Options are evaluated by `tooling/COST_FIRST_ROUTER.md`:

1. Our worker with persisted step state (ADR-010 D6)
2. A durable workflow engine
3. An existing iPaaS as a ToolProvider

Whichever is chosen, all external writes go through the ActionExecutor.
