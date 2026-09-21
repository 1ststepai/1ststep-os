# Retry & Fallback Policy

## Avoid blind retries

Retry only when failure classification supports it.

Classify:
- timeout
- rate limit
- transient provider fault
- malformed structured output
- safety refusal
- insufficient context
- tool failure
- deterministic validation failure

## Strategy

- exponential/backoff behavior where appropriate
- bounded attempts
- cheaper retry when quality permits
- alternate provider/model when appropriate
- schema repair before full regeneration
- partial resume rather than full workflow restart
- idempotency for tool/external actions

Track the cost of retries separately.
