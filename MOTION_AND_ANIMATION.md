# Motion & Animation Contract

## Purpose

Use motion to improve comprehension, continuity, feedback, and perceived quality.

## Principles

- Motion must explain change, not decorate every surface.
- Prefer short, interruptible transitions.
- Avoid blocking interactions.
- Preserve 60fps-class responsiveness on supported hardware where practical.
- Respect `prefers-reduced-motion`.
- Do not animate large layout properties when transform/opacity can accomplish the effect.
- Avoid excessive blur, parallax, particle systems, and continuous background animation unless product value clearly justifies the cost.

## Recommended motion uses

- route/page continuity
- wizard progression
- module-generation progress
- expandable evidence panels
- success confirmation
- generation status
- list insertion/removal
- command palette
- drawers/modals
- skeleton-to-content transition
- project health/status changes

## Required testing

- reduced motion
- keyboard focus continuity
- mobile performance
- CPU/GPU impact
- no animation-induced layout shift
- no animation that obscures important errors or approvals
