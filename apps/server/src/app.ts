import { Hono } from 'hono';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipCompile } from '@1ststep-os/core';

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));
const moduleRegistry = JSON.parse(readFileSync(join(repoRoot, 'modules/registry.json'), 'utf8'));
const capabilityRegistry = JSON.parse(readFileSync(join(repoRoot, 'capabilities/registry.json'), 'utf8'));

function slug(name: string): string {
  const s = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return s || 'project';
}

function projectName(profile: { identity?: { name?: { status?: string; value?: unknown } } }): string {
  const name = profile.identity?.name;
  if (name?.status === 'KNOWN' && typeof name.value === 'string' && name.value.trim()) return name.value;
  return 'project';
}

// API routes live under /os/api (ADR-010 D1). Auth, authorize(), CSRF and tenancy arrive in M2.
export const api = new Hono().basePath('/os/api');

api.get('/healthz', (c) => c.json({ status: 'ok' }));

api.post('/compile', async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'PROFILE_INVALID', issues: ['JSON body required'] }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return c.json({ error: 'PROFILE_INVALID', issues: ['JSON object required'] }, 400);
  }

  const generatedAt = typeof body.generatedAt === 'string' && body.generatedAt ? body.generatedAt : new Date().toISOString();
  const result = zipCompile({
    idea: typeof body.idea === 'string' ? body.idea : undefined,
    profile: body.profile,
    form: body.form && typeof body.form === 'object' && !Array.isArray(body.form) ? body.form : undefined,
    generatedAt,
  }, { moduleRegistry, capabilityRegistry, now: generatedAt });

  if (!result.ok) {
    const status = result.code === 'MODULE_CONFLICT' || result.code === 'REGISTRY_INVALID' ? 409 : 400;
    return c.json({ error: result.code, issues: result.issues, decisions: result.selection?.decisions ?? [] }, status);
  }

  const format = body.format === 'json' || c.req.query('format') === 'json' ? 'json' : 'zip';
  if (format === 'json') {
    return c.json({
      demo: true,
      notice: 'Cycle 1 foundation demo. Deterministic compile; no model call; not a complete Project OS.',
      generatedAt: result.generatedAt,
      profileId: result.profile.id,
      modules: result.selection.selected,
      deferred: result.selection.deferred,
      decisions: result.selection.decisions,
      files: result.files.map((f) => ({ path: f.path, bytes: new TextEncoder().encode(f.content).length, content: f.content })),
    });
  }

  if (!result.zip) return c.json({ error: 'OUTPUT_SCHEMA_INVALID', issues: ['ZIP missing'] }, 500);
  const filename = `${slug(projectName(result.profile))}-project-os.zip`;
  return c.body(result.zip, 200, {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'X-Content-Type-Options': 'nosniff',
  });
});
