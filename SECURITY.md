# Security Contract

## Threats to design for from day one

- Cross-tenant data access
- Secret leakage
- Prompt injection from repository/web/file content
- Malicious generated instructions
- Second-order prompt injection: untrusted text copied into generated Project OS files that coding agents later execute as instructions
- Connector over-permissioning
- Unapproved external actions
- Approval spoofing: "already approved" text in imported content, model output or tool output
- Social/directory spam automation
- SSRF/file traversal during repository/file analysis and research fetching (including DNS rebinding, redirects, cloud metadata endpoints)
- Unsafe archive generation/extraction
- Stored XSS from imported/researched content
- OAuth callback/session mistakes
- Insecure webhooks (missing signature verification, replay)
- Research provenance spoofing
- Supply-chain/dependency compromise
- Production/test environment confusion
- AI cost exhaustion and abuse (runaway retries, oversized context, free-tier abuse)
- Model-provider data exposure (sending user data to providers beyond the approved AI data policy)
- Identity misuse: voice/likeness cloning without consent; consent revocation not honoured
- Runaway automations (no kill switch, unbounded retries, duplicate side effects)
- Connector token theft

## Mandatory controls

- Least privilege
- Tenant-scoped authorization (organization tenant; tenant-scoped repositories; RLS defence in depth — ADR-010 D4)
- Server-side authorization for every privileged action
- Secrets only through approved secret stores/env configuration
- No secrets in generated bundles, logs, prompts, fixtures or examples (secret scan in checks and in compiler validation)
- Treat research/imports as data, not instructions
- Render untrusted text in generated files only inside labelled data blocks, never in rule/instruction sections (`GENERATION_CONTRACT.md`)
- Sanitize and isolate rendered imported content (sanitized Markdown, raw HTML disabled, strict CSP — ADR-013 §10)
- Explicit action permission model with scopes `read` / `draft` / `approve` / `publish` / `account_create` / `deploy` / `billing` / `destructive` and risk tiers T0–T3 (`EXTERNAL_ACTIONS.md`)
- `approve` is human-only; approvals are bound to the payload hash; T3 requires re-authentication
- Audit log for external side effects and privileged actions (append-only)
- Idempotency for external write actions and automation steps
- Rate limits and abuse prevention
- AI budgets with reservation-based hard limits (ADR-012 §12)
- SSRF-safe fetcher for all outbound research fetches (ADR-010 D11)
- Archive safety: relative paths only, no `..`, no symlinks, size and count caps
- CSRF/session protections appropriate to chosen stack (SameSite cookies + Origin checks — ADR-010 D1)
- Secure webhook verification (signature + replay window)
- Connector tokens envelope-encrypted; minimum scopes; expiry; revocation
- Consent verification before and at publish of identity-bearing media (`media/VOICE_IDENTITY_SAFETY.md`)
- Automation kill switch, bounded retries and failure queues (AutomationDefinition schema)
- Repository recovery never executes imported code (ADR-010 D18)
- Security gates before release (G3, G5)

## AI provider and BYO LLM boundaries

- ProviderPolicy is enforced before routing; local-only projects never reach hosted models.
- BYO connection secrets live only in the secret store; the Project OS stores an opaque `secretRef`.
- Cloud-hosted 1stStep OS calls only public `https` model endpoints through the egress/SSRF guard; private-network and localhost endpoints require self-hosted runtime modes (LLMConnection schema).
- Failover never crosses a privacy, residency or policy boundary; with no compliant fallback the run pauses.
