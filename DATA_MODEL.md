# Data Model — Conceptual

Core entities:

- User
- Organization
- Project
- ProjectMembership
- ProjectProfile
- ProjectOSVersion
- ModuleDefinition
- SelectedModule
- AgentDefinition
- GenerationJob
- GeneratedArtifact
- ResearchSource
- ResearchClaim
- Recommendation
- Decision
- Finding
- GateResult
- Handoff
- Connector
- ExternalAction
- GrowthChannel
- ChannelSubmission
- Competitor
- CompetitorSnapshot
- PricingSnapshot
- Experiment
- Metric
- AuditEvent
- CapabilityDefinition (registry, read-only)
- ToolProvider / ModelProvider (registry)
- GeneratedText (stored AI prose used by the compiler)
- ResearchQuestion
- AICall (usage/cost telemetry) and BudgetLedger (reservations)
- JobRun
- MediaAsset
- ConsentRecord
- AutomationDefinition and AutomationRun
- BusinessOperation (Business Owner Mode inventory, inside ProjectProfile)

Every tenant-owned entity carries `organization_id` (ADR-010 D4). Canonical document shapes are defined in `schemas/0.1.0/`. Physical tables are designed in M2 onward.
