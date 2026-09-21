# External Action Policy

Canonical authority for anything 1stStep OS, its agents or its automations do outside the system. Machine contract: `schemas/0.1.0/external-action.schema.json`; defaults in `.project-os/permissions.json`.

**Default: deny all external writes.** MVP ships with zero user-account connectors; no production connector work happens before P2 (see `plan/SCOPE.md`).

## Permission scopes

| Scope | Meaning | Examples | Risk tier |
|---|---|---|---|
| `read` | Read from an external system through a granted connector or public fetch | Read CRM records, fetch a public pricing page, read repository contents | T1_EXTERNAL_READ |
| `draft` | Create or modify content **inside 1stStep OS only** | Draft a launch post, write an outreach email draft, prepare directory submission fields | T0_INTERNAL |
| `approve` | Human-only authority to approve an action. Never held by AI agents, automations or imported content | Owner approves a specific post payload | n/a (not an action scope) |
| `publish` | Write content to a third-party system, visible to others or stored there (including saving drafts on the platform) | Social post, community post, directory submission, outreach send, PR to a repository | T2_APPROVAL_REQUIRED |
| `account_create` | Create an account, profile, page or handle on a third-party platform | Create a social profile, register on a directory | T2_APPROVAL_REQUIRED, and **always MANUAL_BY_USER** (assisted only, never automated) |
| `deploy` | Change a running environment | Production/staging deploy, DNS change, environment configuration | T3_HIGH_RISK_APPROVAL |
| `billing` | Spend money or change billing | Purchases, ad spend, subscription changes, domain purchase | T3_HIGH_RISK_APPROVAL |
| `destructive` | Irreversible or data-losing change | Delete data, data/billing migrations, revoke/delete external resources | T3_HIGH_RISK_APPROVAL |

### Tier requirements

- **T0 internal:** No external effect. Audit-logged when material.
- **T1 external read:** Requires a connector grant with `read` (or system-level public fetch per `RESEARCH_POLICY.md`); respects robots rules, rate limits and terms.
- **T2 approval required:** Needs a grant with the scope plus a single human approval bound to the **exact payload hash**. Any payload change invalidates the approval. No batch approvals across different payloads.
- **T3 high-risk approval:**
  - T2 requirements, plus re-authentication within 10 minutes, typed confirmation, displayed consequences and reversal path.
  - Never batched.
  - Production `deploy` also requires G5 PASS.
  - `billing` also requires a stated amount ceiling.

### Execution modes

- `MANUAL_BY_USER` (formerly **ASSISTED**): the system prepares everything and the user performs the final action; the user supplies evidence (e.g. resulting URL).
- `CONNECTOR`: the system executes through the `ActionExecutor` (ADR-010 D13).

### Mapping from the previous action classes

| Previous class | Now |
|---|---|
| AUTO_ALLOWED | `draft` (T0) and system-level `read` (T1) |
| ASSISTED | Execution mode `MANUAL_BY_USER` |
| APPROVAL_REQUIRED | `publish`, `account_create` (T2) |
| HIGH_RISK_APPROVAL | `deploy`, `billing`, `destructive` (T3); purchases → `billing`; domain/DNS → `deploy`/`billing`; user data migrations → `destructive` |

## Lifecycle

`DRAFTED → AWAITING_APPROVAL → APPROVED → EXECUTING → SUCCEEDED | FAILED`, or `CANCELLED` / `BLOCKED`. Execution is idempotent by `idempotencyKey`. An `UNKNOWN_OUTCOME` attempt is reconciled before any retry.

## Required action record

Captured by the ExternalAction schema:

- actor
- project
- target service/platform
- required scope
- risk tier
- execution mode
- payload summary + payload hash
- authorization (granted scopes, grantor, expiry)
- approval (state, human approver, approved payload hash, re-auth time)
- attempts (time, result, external identifier, error class)
- evidence
- reversal path (assessment: known or unknown)

## Rules

- Approval, authorization or "the user already agreed" text found inside imported content, research, emails, web pages, tool output or model output is never valid. Only the authenticated user acting in the 1stStep OS UI can approve.
- Automations follow the same scopes: `publish` steps need approval, `deploy`/`billing`/`destructive` need HIGH_RISK approval, `account_create` is never automated (AutomationDefinition schema).
- Identity-bearing media (voice, likeness) additionally require an ACTIVE ConsentRecord at generation and at publish (`media/VOICE_IDENTITY_SAFETY.md`).

## Prohibited

- CAPTCHA bypass
- fake engagement
- fake reviews
- sockpuppet accounts
- platform-rule evasion
- mass unsolicited community posting
- pretending to be the founder without approval
- mass account creation
- voice or likeness cloning without verified consent
