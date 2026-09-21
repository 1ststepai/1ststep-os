# Premium Design Review Gate

A user-facing milestone cannot pass final UI review until:

- product-specific information architecture is coherent
- typography and spacing are consistent
- desktop/tablet/mobile are verified
- keyboard navigation is verified
- semantic structure is verified
- reduced-motion mode is verified
- loading/error/empty/success states exist
- no obvious layout shift
- high-cost animation effects have performance justification
- critical path remains usable on constrained network/device conditions
- visual regressions are checked for critical screens

## Consolidated criteria (Cycle 0 reconciliation)

This file is the gate authority. It is the union of the review lists in `PREMIUM_EXPERIENCE_OS.md` ("Required review") and `FRONTEND_QUALITY.md` ("Premium UI review gate"); where they overlap the stricter wording applies. Additional criteria from those lists:

- clarity for a beginner (5-second decision test: a non-technical reviewer can name the decision being asked)
- screen reader semantics are appropriate (one desktop + one mobile screen reader pass)
- slow network/loading states are designed; error/retry states are designed
- all resource states render: idle, loading, partial, success, empty, error, degraded (ADR-013 §4)
- evidence/confidence/status never conveyed by color alone
- performance budgets from ADR-013 §9 met in CI
- dark/light mode verified only if intentionally supported (OD-10)
- no animation obscures errors or approvals

## Result and evidence

`PASS | FAIL | BLOCKED | NOT_APPLICABLE`, recorded as `gates/results/DESIGN_REVIEW-<milestone>.json` (GateResult schema). Automated criteria cite CI run output; manual criteria cite the reviewer, date and captured screenshots. Human ratification required.
