# AI Cost Budgets

## Required budget levels

- request
- workflow
- user/day
- user/month
- project/day
- project/month
- organization/month
- provider/model

## Controls

### Soft threshold
Warn, downgrade where safe, batch work, or ask for confirmation for unusually expensive optional work.

### Hard threshold
Stop optional model usage and return a clear budget state rather than silently exceeding the configured limit.

## Track

- input tokens
- output tokens
- cached/reused tokens when available
- model/provider
- latency
- retries
- tool calls
- estimated/requested cost
- workflow result
- quality/eval outcome

## Product economics

Every paid tier must be modeled against expected:
- model cost
- search/research cost
- storage
- database
- background jobs
- observability
- external APIs
- payment processing
- support load

Pricing must not be finalized without AI cost scenarios.
