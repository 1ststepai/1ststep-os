# Business Owner Mode

A non-developer should be able to ask:
"Automate my business."

The interview discovers:
- leads
- sales
- quoting
- scheduling
- email
- documents
- invoicing
- payments
- customer support
- reporting
- inventory/fulfillment
- recurring admin
- approvals
- data entry
- compliance handoffs

Then produces an automation map ranked by time saved, implementation effort, risk, and ROI.

Architecture: ADR-014 §5. Phase: **P0** for the interview and ranked map (deterministic scoring); automation execution LATER. Profile fields: `mode = AUTOMATE_BUSINESS`, `businessOperations`, `budget`.

## Interview

1. **Mode detection.** The model proposes `AUTOMATE_BUSINESS` from the user's words; the user confirms. An unknown mode is a blocking decision.
2. **Area sweep.** A fast yes/no over the 17 `businessArea` values (leads, sales, CRM, quoting, scheduling, email, documents, invoicing, payments, customer support, reporting, inventory, fulfillment, recurring admin, approvals, data entry, compliance handoffs). Areas not used are skipped.
3. **Per area in use:** current tools, monthly volume, minutes per occurrence, how much could be automated (plain-language bands mapped to a fraction), data sensitivity, what hurts most.
4. **Economics:** hourly value of the owner's/staff time and monthly tool budget. These are optional; unknown values stay UNKNOWN.
5. **Constraints:** approvals the owner insists on; systems that must not be written to.

Question selection is deterministic: ask only what changes ranking or safety. The model phrases questions and extracts answers; the user confirms inferred numbers.

## Scoring (deterministic, Tier A)

```text
hoursSavedPerMonth = volumePerMonth × minutesPerOccurrence × automatableFraction / 60
valuePerMonth      = hoursSavedPerMonth × hourlyValueUsd
runningCostMonth   = recommended tool cost + estimated AI cost
implementationCost = implementationHours(effort 1–5 band) × hourlyValueUsd
risk (1–5)         = f(data sensitivity, external-action scopes, reversibility, consent needs)
roi12m             = (valuePerMonth − runningCostMonth) × 12 / implementationCost
priority           = normalize(roi12m) × (1 − 0.15 × (risk − 1)); ties → lower effort
```

Unknown inputs are never treated as zero. Such opportunities are listed as `NEEDS_DATA` together with the single question that would unlock ranking.

## Output

- `operations/BUSINESS_PROFILE.md`: operations inventory with evidence labels.
- `operations/AUTOMATION_OPPORTUNITY_MAP.md`: ranked table (time saved, cost, effort, risk, ROI, build-vs-buy recommendation per `tooling/COST_FIRST_ROUTER.md`, approvals required), plus quick wins and the NEEDS_DATA list.
- Draft AutomationDefinitions for the top opportunities (status DRAFT; no execution).
