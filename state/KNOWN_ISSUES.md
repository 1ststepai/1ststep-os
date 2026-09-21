# Known Issues

Canonical finding status lives in `audit/findings.json`. Operational notes:

- **Server needs a web build first.** `npm start` serves the SPA from `apps/web/dist`, so run `npm run build` first. Without it, `/os/` returns 404 while the API still works.
- **Placeholder web tokens.** `apps/web/src/tokens.css` is a placeholder; canonical tokens and their generator arrive in M7 (ADR-013 §2).
- **No auth, tenancy, CSRF or security headers yet.** Cycle 1 exposes `/os/api/healthz` and unauthenticated `POST /os/api/compile`. Do not deploy it; M2 adds these controls.
- **Cycle 1 compiler is a stub bundle.** Five markdown files, STORE ZIP, no adapter files, no full module templates (M4). Export does not yet enforce every S7 rule in `GENERATION_CONTRACT.md`.
- **Node 22 type stripping.** Workspace test/start scripts pass `--experimental-strip-types` so `.ts` sources load on Node 22; Node 24+ may enable stripping by default.
- **Local tooling quirk (environment, not project).** One `npm install -w` run through the lean-ctx shell hook reported success without installing packages; a direct re-run installed correctly. Verify installs with `npm ls` when output is compressed.
