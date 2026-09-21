# Audit Provider Failover

## Trigger examples

- usage exhausted
- rate limited
- provider outage
- context limitation
- model unavailable
- cost budget exceeded
- privacy policy disallows provider

## Behavior

1. checkpoint current atomic unit
2. persist provider-independent state
3. classify pause reason
4. evaluate compatible fallback providers/models
5. if policy permits, resume with fallback
6. otherwise remain paused
7. preserve finding IDs and baseline
8. never duplicate completed controls

## Rule

Failover may change the worker, but never the canonical audit run identity.
