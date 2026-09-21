# 1stStep OS — Everything Layer

## North Star
1stStep OS should save a builder from repeatedly researching, selecting, configuring, prompting, and coordinating the tools required to turn an idea into a functioning product/business.

It is not one giant autonomous agent. It is a capability router and Project OS generator that activates only relevant modules.

## Capability domains
1. Ideation & validation
2. Product strategy
3. UX/UI/design
4. Web development
5. Mobile/desktop/extension development
6. AI/agents/RAG/evals
7. Data/backend/infrastructure
8. Security/privacy/compliance/accessibility
9. QA/testing/release
10. DevOps/SRE/observability
11. Automation/integrations/workflows
12. Business/finance/pricing/legal-readiness
13. Brand/creative/marketing assets
14. Image generation/editing
15. Video production/editing
16. Audio/voice/podcast/music
17. 3D/AR/spatial assets
18. SEO/content/social/community
19. Launch/directories/PR/outreach
20. Sales/CRM/lead generation
21. Customer success/support/feedback
22. Analytics/CRO/experimentation
23. Growth/partnerships/affiliates/referrals
24. Localization/internationalization
25. Documentation/training/knowledge base
26. Hiring/team/project management
27. Cost/token/model/provider optimization
28. Existing-project recovery/migration
29. Business continuity/backups/incidents
30. Continuous intelligence and drift monitoring

## Design rule
Generate the smallest applicable OS. Never dump every module into every user's project.

## Where this is implemented
- Capability registry (301, with generation and execution phases): `capabilities/registry.json`
- Modules (22) and deterministic selection: `modules/registry.json`, `tooling/CAPABILITY_REGISTRY.md`
- Architecture: `architecture/decisions/ADR-014-capabilities-media-automation-business-owner.md`
- Phase classification P0/P1/P2/LATER: `plan/SCOPE.md`
