# G6-production-verification

## Purpose
Deployment exists and production behavior is directly verified.

## Result
`PASS | FAIL | BLOCKED | NOT_APPLICABLE`

`FAIL` = evaluated and not met. `BLOCKED` = cannot be evaluated yet. `NOT_APPLICABLE` requires a reason.

## Evidence
Record concrete evidence; a narrative assertion alone is insufficient.

Machine-readable results live in `gates/results/*.json` and must validate against `schemas/0.1.0/gate-result.schema.json`. PASS requires every criterion to PASS or be NOT_APPLICABLE with a reason.
