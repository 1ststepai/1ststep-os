# ADR-013 — Premium Experience Architecture

- **Status:** ACCEPTED (Cycle 0; product-owner ratification PENDING)
- **Date:** 2026-09-13
- **Implements:** `PREMIUM_EXPERIENCE_OS.md`, `FRONTEND_QUALITY.md`, `MOTION_AND_ANIMATION.md`, `UX.md`, `DESIGN_REVIEW_GATE.md`
- **Evidence note:** Library characteristics and Web Vitals "good" thresholds are INFERRED from model knowledge; verify library versions and a11y coverage at M7 entry.

## 1. Information architecture: a guided project workspace, not a dashboard

The product is a narrative that turns uncertainty into decisions. Primary structure:

```text
Start ─▶ Understand ─▶ Evidence ─▶ Decide ─▶ Your OS ─▶ Build
 idea /    "Here is      research,     assumptions,   preview files,   download,
 business  what we       claims,       decisions,     modules,         bootstrap prompt,
 goal      understand"   confidence    approvals      manifest         next actions
```

- One project at a time is the default. A project switcher exists, but no "home dashboard of widgets".
- Each stage shows the **recommendation → reason → confidence → decision needed** pattern (UX.md) and hides depth behind expandable evidence.
- Business Owner Mode swaps "Your OS" for "Your automation map" with the same evidence and decision grammar.
- Signature moments get deliberate design and motion budget: the "Here is what we understand" reveal, module-by-module compile progress, and the side-by-side file tree + rendered document preview.

## 2. Design system and tokens

- **Source of truth:** `apps/web/design/tokens.json`, a W3C design-tokens-style structure with primitive → semantic → component layers. A ~50-line build script (no dependency) emits CSS custom properties; TypeScript types are derived for token names.
- **Token groups:** color (semantic roles incl. the 6 evidence states, never color-only), typography scale (fluid `clamp()` steps), spacing (4-px base), radius, elevation, borders, motion (durations/easings), z-index, breakpoints, focus ring.
- **Themes:** tokens are structured for light and dark. MVP ships light only unless OD-10 decides otherwise (`FRONTEND_QUALITY.md`: dark mode only if intentionally supported).
- **Versioning:** tokens are semver-versioned; a visual regression run is required on token changes.

## 3. Component strategy

- **Accessible primitives:** React Aria Components (INFERRED: broad ARIA pattern coverage, keyboard, focus and internationalization). Alternative: Radix Primitives. Chosen for a11y depth in complex widgets (combobox, dialogs, date/number fields, drag and drop).
- **Styling:** CSS Modules + token custom properties. Zero runtime, no utility-class aesthetic by default. Alternative: Tailwind v4 with tokens as theme; not chosen, to keep tokens canonical and markup semantic.
- **Layers:** `primitives/` (thin styled wrappers) → `patterns/` (forms, drawers, command palette, approval dialog, evidence panel) → `features/` (stage screens). No component abstraction until a second use exists (`FRONTEND_QUALITY.md`).
- **Domain components (required):** `EvidenceBadge` (6 states, icon + label), `ConfidenceMeter`, `SourceCitation`, `FreshnessChip`, `AssumptionList`, `DecisionCard`, `ApprovalDialog` (T2 vs T3: T3 needs re-auth + typed confirmation + consequence and reversal text), `ModuleMap`, `FileTreePreview`, `GenerationProgress`, `BudgetState`, `OpportunityRankTable`.

## 4. Loading / empty / error / success architecture

- **Single resource-state model:**

  ```ts
  type ResourceState<T> =
    | { kind: 'idle' } | { kind: 'loading'; startedAt: number }
    | { kind: 'partial'; data: Partial<T>; progress?: Progress } | { kind: 'success'; data: T }
    | { kind: 'empty'; reason: EmptyReason } | { kind: 'error'; error: TypedError; retry?: () => void }
    | { kind: 'degraded'; data?: T; reason: 'offline' | 'budget_exceeded' | 'provider_unavailable' };
  ```

  `<ResourceView>` requires a renderer for every kind (exhaustiveness checked by TypeScript), so no screen can ship without designed states.
- **Boundaries:** route-level error boundary and suspense boundary per stage. Skeletons appear only after 300 ms; below that, no flash.
- **Long jobs:** research and compile stream step progress over SSE into `partial` states with per-step names. Users can leave and return; progress is persisted server-side.
- **Typed errors map to copy + action:** `BUDGET_EXCEEDED`, `BLOCKING_DECISION_UNRESOLVED`, `PROVIDER_UNAVAILABLE`, `VALIDATION_FAILED`, `RATE_LIMITED`, `OFFLINE`.
- **Optimistic UI** only for reversible, local edits (e.g. editing an assumption). Never for approvals or exports.

## 5. Motion

- **Default mechanism:** CSS transitions/animations on `transform`/`opacity` only; View Transitions API as progressive enhancement for stage-to-stage continuity. A motion library is loaded lazily, and only if a layout animation cannot be done with CSS.
- **Motion tokens:** `instant 0ms`, `quick 120ms`, `standard 200ms`, `emphasized 320ms`, plus 2 easing curves. No continuous background animation, parallax, particles or large blurs (`MOTION_AND_ANIMATION.md`).
- **Reduced motion:** `prefers-reduced-motion: reduce` switches to opacity-only or instant, preserves focus continuity, and never hides errors or approvals behind animation.
- **Budget:** animations must not cause layout shift and must stay interruptible. The DESIGN_REVIEW gate requires a CPU-throttled performance trace for the compile-progress and reveal moments.

## 6. Accessibility

- Target WCAG 2.2 AA.
- Semantic HTML first; one `h1` per stage; landmarks.
- Visible focus ring token; logical focus order; focus management on route change and dialog open/close.
- Touch targets ≥ 44×44 px.
- Evidence and status are never conveyed by color alone.
- Live regions for job progress, throttled.
- **Automated:** axe checks in Playwright on every critical screen and state (G4).
- **Manual:** keyboard-only and screen-reader passes recorded as DESIGN_REVIEW evidence.

## 7. Responsive behavior

- Mobile-first CSS. Breakpoint tokens: 360 / 768 / 1024 / 1440. Container queries for components (evidence panel, file preview) so they adapt to their slot, not just the viewport.
- Preview on mobile uses a stacked file list → document view with preserved scroll position. On desktop it is a split pane.
- Critical path must be completable on a 360 px viewport on a throttled connection.

## 8. Assets, images, fonts

- **Brand mark:** use the official 1stStep.ai logo exactly as locked by `DECISIONS.md` ADR-011 (source artwork and proportions preserved; no redraw or generated logo). A Signal Path motif may appear only in secondary visuals and motion. The Media Factory must never generate a replacement mark for 1stStep.ai itself.

- Self-hosted variable font(s), max 2 families, subset, `woff2`, `font-display: swap`, with metric-override fallback faces to avoid layout shift.
- Icons as an inline SVG sprite; no icon font.
- Raster images AVIF/WebP with explicit dimensions; illustrations as SVG.
- No third-party runtime scripts on app routes except the chosen error tracker (OD-7).

## 9. Frontend performance budgets (enforced in CI)

| Metric | Budget | How enforced |
|---|---|---|
| LCP (p75, mid-tier mobile, 4G throttling) | ≤ 2.5 s | Playwright + web-vitals on throttled profile for Start, Evidence, Your OS |
| INP | ≤ 200 ms | Scripted interactions on the same screens |
| CLS | ≤ 0.1 | Same run; plus zero layout shift during animations |
| Initial JS (entry route, gzip) | ≤ 150 KB | Build-size check script fails CI |
| Per-route lazy chunk (gzip) | ≤ 100 KB | Build-size check |
| CSS total (gzip) | ≤ 40 KB | Build-size check |
| Fonts total | ≤ 120 KB | Build-size check |

- Route-level code splitting; heavy views (Markdown renderer, file tree, charts) lazy-loaded.
- No request waterfalls: each route fetches in parallel through one loader.
- No polling where SSE is available (`FRONTEND_QUALITY.md`).
- Adding a large dependency requires a size and benefit note in the PR (BUILD_VS_BUY).

## 10. Rendering untrusted content

Research excerpts, imported docs and generated Markdown are rendered through a sanitizing Markdown pipeline with raw HTML disabled and an allowlist of elements and attributes. Links get `rel="noopener noreferrer nofollow"`, and external links show a domain. This works together with the CSP from ADR-010 D1 against stored XSS (`SECURITY.md`).

## 11. Visual regression

- Playwright screenshot assertions rendered in a pinned Linux container image, so fonts and anti-aliasing are stable.
- **Matrix:** critical screens × all resource states × {360, 768, 1440} × {default, reduced-motion}.
- Animations disabled at capture; deterministic fixture data and a fixed clock.
- Baselines change only in reviewed commits, and the DESIGN_REVIEW result references the run.

## 12. Premium UI review process

1. Stage design brief: user goal, primary decision, states, motion moments, content.
2. Build behind a feature flag with all `ResourceState` renderers.
3. Automated evidence: axe, visual regression, performance budgets, keyboard E2E.
4. Manual evidence: keyboard-only pass, screen-reader pass (one desktop + one mobile reader), reduced-motion pass, slow-network pass, beginner clarity check (a 5-second test: can a non-technical reviewer name the decision being asked?).
5. A `gates/results/DESIGN_REVIEW-<milestone>.json` GateResult with criteria from `DESIGN_REVIEW_GATE.md`, ratified by a human reviewer.

## G1 coverage statement

This ADR gives a credible, testable plan for premium production UI/UX: tokens, components, state architecture, motion, accessibility, responsive behavior, assets, budgets, visual regression and a review gate. Implementation evidence arrives at M7 through the DESIGN_REVIEW gate.
