# Media Factory

One source-of-truth product/brand brief should drive:
logo → screenshots → social graphics → thumbnails → demo scripts → video → voiceover → captions → ads → launch assets → localized variants.

The Media Factory must preserve brand consistency, provenance, rights/consent metadata, aspect-ratio variants, versioning, and source assets.

Architecture: ADR-014 §3. Phase: guidance P2; execution LATER (`plan/SCOPE.md`). Schemas: `media-asset`, `consent-record`, `tool-provider`, `model-provider`.

## Pipeline (provider-neutral)

```text
Brand source of truth (BRAND_SOURCE asset: tokens, voice, logo, messaging, do/don't rules)
 → images → screenshots → mockups → social creatives → thumbnails
 → scripts → storyboard → video → B-roll → editing → clipping / reframing → captions
 → voiceover → authorized voice cloning → dubbing → avatars / lipsync
 → podcast / audio → music / SFX → 3D / AR assets
 → platform variants (aspect ratio, duration, locale)
 → QA (brand check, rights, consent, accessibility captions) → human approval → export or publish (ExternalAction)
```

## Rules

- **Deterministic before generative.** When a capability is `deterministicFirst`, the router tries local/deterministic operations first: trim, merge, transcode, crop-reframe, caption formatting from transcripts, template rendering to image, screen capture.
- **Provider-neutral ports.** Capability-typed ports (`ImageGeneration`, `ImageEdit`, `SpeechSynthesis`, `Transcription`, `VideoGeneration`, `VoiceClone`, `Lipsync`, `Model3D`) are resolved through the provider registries and `tooling/COST_FIRST_ROUTER.md`. No hard-coded vendor.
- **Provenance.** Every output is a versioned MediaAsset with content hash, parents, tool/model ids, prompt/parameter hashes, cost, content-credentials flag and AI-disclosure flag. Edits create new versions; versions are immutable.
- **Licensing.** Licence and commercial use must be KNOWN before APPROVED or PUBLISHED.
- **Consent.** Identity-bearing assets (voice, likeness) must link ACTIVE ConsentRecords, checked at job start and again at publish (`media/VOICE_IDENTITY_SAFETY.md`).
- **Brand consistency.** An automated brand check (tokens, logo usage, contrast, copy rules) must PASS before approval.
- **Cost routing.** Per-job budget reservation; HIGH cost-profile capabilities require explicit user confirmation per batch.
- **Publishing** is never part of the pipeline. It is an ExternalAction with `publish` scope and T2 approval.
