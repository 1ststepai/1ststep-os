# Known Issues

Canonical finding status lives in `audit/findings.json`. Operational notes:

- **Empty update archives.** `1stStep-OS-Everything-Layer-v0.1.0.zip` and `1stStep-OS-Universal-LLM-Addendum-v0.1.0.zip` are 22-byte empty archives. The update content was copied into the tree directly (F-0020, F-0024).
- **Server needs a web build first.** `npm start` serves the SPA from `apps/web/dist`, so run `npm run build` first. Without it, `/os/` returns 404 while the API still works.
- **Placeholder web tokens.** `apps/web/src/tokens.css` is a placeholder; canonical tokens and their generator arrive in M7 (ADR-013 §2).
- **No auth, tenancy, CSRF or security headers yet.** The scaffold exposes only `/os/api/healthz`. Do not deploy it; M2 adds these controls.
- **Local tooling quirk (environment, not project).** One `npm install -w` run through the lean-ctx shell hook reported success without installing packages; a direct re-run installed correctly. Verify installs with `npm ls` when output is compressed.
