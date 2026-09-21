# Voice Identity & Consent

Voice cloning requires documented authorization from the voice owner or another lawful basis appropriate to the workflow.

Store:
- consent/authorization status
- source asset provenance
- permitted use
- project/brand scope
- revocation/deletion state

Never design the product around impersonating an unconsenting real person. Synthetic voices should be clearly managed as identity-sensitive assets.

Machine contract: `schemas/0.1.0/consent-record.schema.json` (also covers likeness, name and testimonials). Phase: LATER. **No real voice cloning in MVP.**

## Controls

- Consent is **recorded and verified by humans only** (schema: `userActor`). AI agents cannot create, verify or infer consent.
- `ACTIVE` requires evidence (signed document, recorded verbal statement, or verified in-app attestation, stored as a hash), a verifier and a `validFrom` date.
- Consent is scoped to identity types, permitted uses, project ids, channels, territories and languages. Anything outside that scope is denied.
- Checks run at **job start** and again **at publish**. Expired or revoked consent blocks both.
- **Revocation:** generation is blocked immediately (`generationBlocked: true`); derived voice models are deleted and recorded (`derivedModelsDeleted`); published assets are queued for review (`publishedAssetsReviewed`).
- Third-party voices (`THIRD_PARTY_PERSON`) require the subject's own evidence, not an attestation by the account holder.
- Synthetic voice outputs carry an AI-disclosure flag in provenance.
