# Claude — Integrate the 1stStep OS Everything Layer

Read `EVERYTHING_OS.md`, every file in this addendum, and the existing canonical 1stStep OS authority.

## Objective
Integrate this capability universe into the architecture WITHOUT turning every generated project into a giant template dump.

## Required work
1. Add a versioned Capability Registry schema.
2. Add Tool/Provider/Model registry schemas.
3. Extend ProjectProfile so the interview can select these capabilities.
4. Define capability dependencies/conflicts.
5. Define cost/privacy/quality/authorization routing.
6. Add Media Factory architecture covering image, video, voice, audio, captions, avatars/lipsync, music and 3D.
7. Add voice-identity consent/provenance controls.
8. Add Automation Engine architecture.
9. Add Business Owner Mode.
10. Add full app-platform matrix.
11. Add build-vs-buy and cost-first routing.
12. Add full-funnel growth/sales/customer-success modules.
13. Add localization/documentation/team/recovery/continuous-intelligence modules.
14. Ensure Claude Code remains first-class while canonical Project OS stays vendor-neutral.
15. Update gates, schemas, roadmap, state and implementation milestones.

## Critical architecture rule
This is a **capability registry + selective generator**, not a mandate to implement hundreds of integrations in MVP.

MVP must prove:
idea/interview → profile → capability/module selection → recommendations → generated OS.

Provider integrations and media execution are adapter layers that can be added incrementally.

## Do not
- hard-code one media/model vendor
- auto-enable every capability
- create unbounded autonomous posting
- clone voices without authorization controls
- turn deterministic media operations into expensive AI calls
- let provider-specific instructions outrank Project OS
- expand MVP until it becomes unshippable

At completion, report what moved into P0/P1/P2/later and why.
