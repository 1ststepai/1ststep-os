# Premium Experience OS

## Objective

1stStep OS must feel like a premium, modern product rather than a generated admin template.

The UI should be:
- visually coherent
- responsive
- fast
- accessible
- deliberate in motion
- clear for beginners
- information-dense only where useful
- calm under complex workflows
- polished in loading, empty, error, success, and transition states

## Required design systems

- design tokens
- typography scale
- spacing scale
- radius/elevation rules
- component states
- responsive breakpoints
- iconography rules
- data visualization rules
- form patterns
- navigation patterns
- modal/drawer patterns
- command/search patterns
- onboarding patterns
- approval/action confirmation patterns
- evidence/confidence/status visualization

## Premium interaction quality

Every meaningful user action should have a designed state:
- idle
- hover
- focus
- active
- loading
- partial progress
- success
- warning
- error
- disabled
- retry
- empty
- offline/degraded when applicable

## No-template rule

Do not ship a generic SaaS dashboard aesthetic without deliberate product-specific information architecture and visual hierarchy.

## Required review

A feature is not visually complete until:
- desktop works
- tablet works
- mobile works
- keyboard works
- screen reader semantics are appropriate
- reduced-motion behavior works
- slow network/loading states are designed
- error/retry states are designed
- no layout shift or obvious visual breakage remains

Gate authority for these criteria (consolidated with `FRONTEND_QUALITY.md`): `DESIGN_REVIEW_GATE.md`. Architecture: `architecture/decisions/ADR-013-premium-experience-architecture.md`.
