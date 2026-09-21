# ADR-014 — Capability Registry, Media Factory, Automation Engine and Business Owner Mode

- **Status:** ACCEPTED (Cycle 0; product-owner ratification PENDING)
- **Date:** 2026-09-13
- **Implements:** `EVERYTHING_OS.md`, `prompts/CLAUDE_EVERYTHING_LAYER.md`, `tooling/*`, `media/*`, `automation/AUTOMATION_ENGINE.md`, `operations/BUSINESS_OWNER_MODE.md`, `governance/HUMAN_CONTROL.md`, `app-dev/PLATFORM_MATRIX.md`, `growth/FULL_FUNNEL.md`

## Decision

1stStep OS is a **capability registry + selective generator**. The capability universe is fully *described* (301 capabilities, 22 modules), but only a small, explicitly classified subset is *generated* in P0, and far fewer are *executed* by 1stStep OS itself.

## 1. Capability model

| Concept | Definition | Source of truth |
|---|---|---|
| Capability | Granular unit (e.g. `audio.voice_cloning`) with generation phase, execution phase, max automation level, dependencies, action scopes, consent flag, deterministic-first flag, cost profile | `capabilities/registry.json` (generated from `.project-os/capability-taxonomy.json` by `tools/build-capability-registry.mjs`) |
| Module | Bundle of capabilities + files + agents + gates, selected by deterministic rules over the profile | `modules/registry.json` |
| ToolProvider / ModelProvider | Concrete way to fulfil a capability, with quality, cost, privacy, licence, lock-in and last-verified evidence | registries introduced at M3 (schemas exist now) |
| Adapter | Provider-specific rendering of canonical output (Claude, Codex, Cursor, generic) | `GENERATION_CONTRACT.md` |

**Two phases per capability:**

- `generationPhase`: when a generated Project OS may include guidance for it. Counts: 103 P0 / 110 P1 / 64 P2 / 25 LATER.
- `executionPhase`: when 1stStep OS itself performs it. Counts: 16 P0 / 10 P1 / 13 P2 / 262 LATER.

Execution can never come before guidance (checked).

**Bloat control:**

- A generated OS contains only selected modules, and only the capabilities within them whose `generationPhase` ≤ platform phase.
- Matched modules of later phases are listed as *deferred* in preview and manifest, not generated.
- Templates are per module, not per capability. A capability contributes a section, never a file of its own, unless its module declares one.

## 2. Build-vs-buy and provider routing

The unified order, dimensions and hard filters are in `tooling/COST_FIRST_ROUTER.md`:

1. deterministic/local
2. existing project asset/reuse
3. open-source
4. low-cost managed service
5. low-cost model
6. balanced model
7. premium only when justified

**Hard filters first:** quality floor from evals, privacy class, licence/commercial use, consent, authorization scopes, budget. Then pick the lowest routing class that passes, tie-breaking on expected cost and then lock-in. Every routing decision records the dimensions: quality, cost, privacy, licensing, latency, reliability, lock-in and migration path.

## 3. Media Factory (P2 guidance, execution LATER)

- **Pipeline:** `BRAND_SOURCE` asset (tokens, voice, logo, messaging) → typed MediaJobs forming a DAG (image, screenshot, mockup, social creative, thumbnail, script, storyboard, video, B-roll, edit, clip/reframe, captions, voiceover, authorized voice clone, dubbing, avatar/lipsync, podcast, music/SFX, 3D/AR, platform variants).
- **Operation classes:** `DETERMINISTIC` covers ffmpeg-class trim/merge/transcode/reframe-by-crop, caption formatting from transcripts, resize/convert, HTML-template rendering to image for social/OG/thumbnails, and screen capture. `GENERATIVE` covers text-to-image/video, TTS, voice clone, lipsync and 3D. The router must try the deterministic path first when `deterministicFirst` is true.
- **Provenance:** every output is a MediaAsset (schema) with content hash, parents, tool/model ids, prompt/parameter hashes, cost, content-credentials flag and AI-disclosure flag. Versions are immutable; edits create a new version.
- **Rights:** licence and commercial use must be KNOWN before APPROVED/PUBLISHED (schema-enforced).
- **Consent:** assets of identity-bearing types require ConsentRecord links (schema-enforced). Jobs check for an ACTIVE consent covering identity type, use, project, channel and language at job start **and** again at publish. Revocation blocks generation immediately and schedules deletion of derived voice models; published assets are queued for review.
- **Brand consistency:** automated brand check (tokens, logo usage, contrast, copy rules) → `brandCheck` PASS required for approval.
- **Cost routing:** per-job budget reservation (ADR-012 §12); HIGH cost-profile capabilities require explicit user confirmation per batch.
- **Publishing** is an ExternalAction (T2), never part of the media pipeline.

## 4. Automation Engine (P0 guidance/specs; execution LATER)

- **Definition:** AutomationDefinition schema. Trigger (schedule/webhook/event/condition/manual) → conditions → steps with scope + approval + idempotency key + timeout → bounded retry → failure queue → owner → pause/kill switch → dry run → audit trail → ROI.
- **Governance:** `governance/HUMAN_CONTROL.md`, with visible status, pause/stop, approvals, permissions, audit, recovery, rollback, budget ceiling, notifications and a named owner.
- **Safety rules (schema-enforced):**
  - `publish` steps require approval.
  - `deploy`, `billing` and `destructive` steps require HIGH_RISK approval.
  - `account_create` is never automated.
  - Retries are bounded at 10.
  - Kill switch and failure queue are mandatory.
- **Execution options when promoted (decided later with evidence):** (a) our worker + persisted step state (ADR-010 D6); (b) a durable workflow engine; (c) routing to an existing iPaaS as a ToolProvider when build-vs-buy favours it. Webhook ingress needs signature verification and a replay window.
- **ROI measurement:** baseline minutes per run × runs per month × hourly value, minus running cost, versus implementation hours. Measured minutes saved come from run logs. All inputs are assessments, so unknown values stay unknown.

## 5. Business Owner Mode (P0: interview + ranked map; execution LATER)

- **Entry:** intake detects `mode = AUTOMATE_BUSINESS` (Tier B classification, confirmed by the user). An unknown mode raises a blocking decision.
- **Interview:** deterministic question plan over the 17 `businessArea` values. For each area in use it captures current tools, monthly volume, minutes per occurrence, automatable fraction, data sensitivity and pain note. Questions are skipped when an area is declared not in use.
- **Scoring (deterministic, Tier A, in `packages/core` at M6):**
  - `hoursSavedPerMonth = volume × minutes × automatableFraction / 60`
  - `valuePerMonth = hoursSavedPerMonth × hourlyValueUsd`
  - `runningCostPerMonth` = recommended tool cost + estimated AI cost (ADR-012 §14)
  - `implementationCost = implementationHours × hourlyValueUsd` (effort rubric 1–5 maps to an hours band)
  - `risk` 1–5 from data sensitivity, external-action scopes, reversibility and consent needs
  - `roi12m = (valuePerMonth − runningCostPerMonth) × 12 / implementationCost`
  - `priority = roi12m_normalized × (1 − 0.15 × (risk − 1))`; ties → lower effort
  - **Unknown inputs are never defaulted to zero.** The opportunity is marked `NEEDS_DATA` and listed separately with the question that would unlock it. Explicit user-provided defaults are labelled ASSUMED.
- **Output:** `operations/BUSINESS_PROFILE.md`, `operations/AUTOMATION_OPPORTUNITY_MAP.md` (ranked table with time saved, cost, effort, risk, ROI, build-vs-buy recommendation, approvals needed), draft AutomationDefinitions for the top opportunities, and a quick-wins list.

## 6. Platform matrix and full funnel

- `app-dev/PLATFORM_MATRIX.md` platforms map to profile `platformTargets`/`productTypes` and to modules (web-saas, mobile, desktop, browser-extension, developer-tool).
- Bots, AI agents, data pipelines, games and IoT companions exist as product types. Their dedicated modules are LATER; until then they receive core + applicable engineering modules and an explicit "no specialised module yet" note in preview.
- `growth/FULL_FUNNEL.md` stages are covered by the growth, sales-crm and customer-success modules.

## 7. Scope classification

See `plan/SCOPE.md` for P0/P1/P2/LATER per area with rationale.

## Alternatives considered

- **Implement integrations per capability in MVP.** Rejected: unshippable; violates `prompts/CLAUDE_EVERYTHING_LAYER.md`.
- **LLM-selected capabilities.** Rejected: non-deterministic and injection-prone; AI may only suggest capability requests, which the user confirms.
- **One file per capability in generated OS.** Rejected: bloat and large coding-agent context; module-level templates instead.
