# Frontend Quality Contract

## Quality bar

The product must meet a premium production bar for:
- responsive layout
- accessibility
- semantic HTML
- perceived performance
- interaction latency
- typography
- hierarchy
- component consistency
- forms
- validation
- empty/loading/error states
- cross-browser behavior
- visual regressions

## Required engineering practices

- reusable primitives without premature component abstraction
- server/client boundaries chosen intentionally
- avoid unnecessary hydration
- lazy-load expensive visual modules
- route-level code splitting
- optimized images/assets
- avoid large dependency additions without benefit/cost review
- stable keys and predictable state
- no hidden network waterfalls
- no unnecessary polling
- explicit loading/error boundaries
- measurable performance budgets

## Premium UI review gate

Before a major UI feature is complete, verify:
1. clarity for a beginner
2. responsive layout
3. accessibility
4. visual consistency
5. motion quality
6. performance
7. failure-state UX
8. dark/light mode only if intentionally supported

Gate authority (consolidated criteria and evidence rules): `DESIGN_REVIEW_GATE.md`. Performance budgets: ADR-013 §9.
