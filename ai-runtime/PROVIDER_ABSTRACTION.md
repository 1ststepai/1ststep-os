# AI Provider Abstraction

## Objective

1stStep OS must not be architecturally dependent on one AI vendor.

Canonical application code should use provider-neutral capabilities for:
- text/reasoning
- structured output
- tool use
- embeddings/retrieval when applicable
- caching metadata
- token/cost telemetry
- context limits
- retry/fallback behavior

Provider-specific optimizations belong in adapters.

## Initial adapters to plan for

- Anthropic / Claude
- OpenAI
- future providers without schema redesign

Do not promise feature parity across providers.
