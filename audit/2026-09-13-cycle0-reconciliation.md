# Cycle 0 Reconciliation Audit — 2026-09-13

- **Scope:** entire repository after the Everything Layer update
- **Findings log (canonical, immutable IDs):** `audit/findings.json`
- **Nature of this report:** a dated snapshot. `audit/findings.json` holds the current status of each finding.

## Method

- Read every authority file in the mandated order, then every file in the tree: 301 capability stubs, 25 agents, 8 numbered gates, 2 review gates, and all domain, runtime, media, automation, tooling, governance, prompts and state files.
- Hashed capability stub bodies to detect template duplication.
- Checked case-insensitive filename collisions.
- Inspected the update zip.

Evidence is OBSERVED unless marked otherwise.

## 1. Duplicate files

| Observation | Resolution |
|---|---|
| 301 `capabilities/**` stubs share one boilerplate body (only titles differ) | Kept as stubs; metadata moved to generated `capabilities/registry.json` (F-0013) |
| `capabilities/analytics/RETENTION.md` and `capabilities/security/RETENTION.md` byte-identical, different meanings | Retitled User/Data Retention (F-0015) |
| Three premium UI review checklists | Union in `DESIGN_REVIEW_GATE.md` (F-0017) |
| `.project-os/state.json` duplicates `state/CURRENT_STATE.md`; `capability-taxonomy.json` vs capability files | Declared machine mirrors; equality checked by `npm run check` (F-0010, F-0013) |

## 2. Conflicting rules

| Conflict | Strongest rule preserved |
|---|---|
| External-action classes vs permissions vs security list; default `approval_required` vs `deny_external_write` | `deny_external_write`; unified scopes including `account_create`, which is manual-only (F-0001, ADR-015) |
| MVP pipeline includes Git / health vs PRD P1 | PRD P1 (F-0005) |
| Routing orders (6-step router vs build-vs-buy vs instruction) | Unified 7-step order with hard filters (F-0018) |
| Module selection input `stack` vs stack recommendation needing modules | Selection uses profile facts only (F-0011) |
| ADR-011 number collision: the owner added "Locked parent-brand logo" as ADR-011 during this cycle while Cycle 0 drafted ADRs used 011–018 | Owner's ADR-011 kept verbatim; Cycle 0 ADRs renumbered 012–019 before closing |

## 3. Superseded instructions

- `APPLY_THIS_UPDATE.md` is applied; annotated as superseded (F-0020).
- The empty 22-byte `1stStep-OS-Everything-Layer-v0.1.0.zip` is left for owner removal (F-0020).
- `prompts/CLAUDE_BOOTSTRAP.md` Cycle 0 scope is extended by `prompts/CLAUDE_CYCLE0_ADDENDUM.md`, `prompts/CLAUDE_EVERYTHING_LAYER.md` and the owner's Cycle 0 reconciliation instruction. All three are incorporated; the bootstrap prompt is kept for reference.
- `DECISIONS.md` ADR-010 "Implementation stack — OPEN" is superseded by the ACCEPTED ADR-010.

## 4. Incomplete authority chains

- `AGENTS.md` hierarchy omitted research, external-action, schema, UX and data-model files and all Everything-layer files; `manifest.json` ranked first with no rules (F-0002).
- `governance/HUMAN_CONTROL.md`, `app-dev/PLATFORM_MATRIX.md` and `growth/FULL_FUNNEL.md` were unreferenced (F-0022).
- The canonical requirements in the Cycle 0 addendum were not reflected in the PRD (F-0008).

## 5. Merge vs keep separate

| Decision | Files |
|---|---|
| **Merged (criteria consolidated)** | Review lists → `DESIGN_REVIEW_GATE.md`; routing guidance → `tooling/COST_FIRST_ROUTER.md`; provider-registry and module selection → `tooling/CAPABILITY_REGISTRY.md` |
| **Kept separate (different subjects)** | `ai-runtime/*` (how 1stStep OS runs AI) vs `capabilities/ai/*` (guidance for generated projects); `growth/*` and `business/*` contracts vs `capabilities/marketing/*` stubs; `state/TECH_DEBT.md` vs `capabilities/recovery/TECH_DEBT.md`; `MOTION_AND_ANIMATION.md` vs `capabilities/design/MOTION.md` (F-0014) |
| **Kept separate (stable references)** | Root `DESIGN_REVIEW_GATE.md` and `COST_REVIEW_GATE.md` registered as gate ids instead of moved (F-0019) |

No material requirement was deleted.

## 6. Missing index / reference links

- `FILE_INDEX.md` was unchecked (F-0021). It is now regenerated and verified by the check suite.
- Cross-references added: `AI_RUNTIME_OS.md` → ADR-012; `PREMIUM_EXPERIENCE_OS.md` / `FRONTEND_QUALITY.md` → `DESIGN_REVIEW_GATE.md` + ADR-013; `EVERYTHING_OS.md` → registries, ADR-014, `plan/SCOPE.md`; `README.md` start-here list updated.

## 7. Naming inconsistencies

- Nested `capabilities/ai/AGENTS.md` could be loaded as agent instructions. Renamed to `AI_AGENTS.md`; nested `AGENTS.md` is now forbidden and checked (F-0016, HIGH).
- Name collisions between root/runtime files and capability stubs (F-0014).
- Evidence and status vocabularies were undefined or inconsistent (F-0003, F-0004, F-0010).

## 8. Missing security boundaries and schema requirements

- Second-order prompt injection via generated OS files; approval spoofing (F-0007, HIGH).
- Schema coverage raised from 5 prose descriptions to 15 machine-readable schemas (F-0006).
- Repository has no version control (F-0023, owner decision OD-8).

## Summary

| Metric | Value |
|---|---|
| Findings | 23 (3 HIGH, 11 MEDIUM, 9 LOW) |
| Resolved in cycle | 20 |
| Left open for owner or cleanup | F-0019, F-0020, F-0023 |
