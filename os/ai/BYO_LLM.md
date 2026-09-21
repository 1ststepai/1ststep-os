# Bring Your Own LLM

## Goal

Allow a user/business to connect the AI infrastructure they already use.

Potential connection patterns:
- API key to supported provider
- enterprise gateway
- OpenAI-compatible endpoint
- Anthropic-compatible endpoint
- cloud model gateway
- local model server
- self-hosted inference endpoint
- custom adapter

## Required controls

- connection test
- capability discovery
- privacy classification
- cost metadata
- rate-limit metadata
- model allowlist
- project/organization scope
- secret storage outside Project OS
- audit logging
- disable/revoke
