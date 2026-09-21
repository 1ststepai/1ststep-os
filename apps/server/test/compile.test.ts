import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/app.ts';

test('POST /os/api/compile returns a ZIP from an idea', async () => {
  const res = await api.request('/os/api/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea: 'A neighbourhood tool library with accounts.', generatedAt: '2026-09-21T00:00:00Z' }),
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/zip');
  assert.match(res.headers.get('content-disposition') ?? '', /attachment; filename=".*-project-os\.zip"/);
  const bytes = new Uint8Array(await res.arrayBuffer());
  assert.ok(bytes.length > 100);
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
});

test('POST /os/api/compile?format=json lists files and modules', async () => {
  const res = await api.request('/os/api/compile?format=json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idea: 'A neighbourhood tool library.',
      form: { name: 'Tool Library', paymentsNeeded: false, usesAI: false },
      generatedAt: '2026-09-21T00:00:00Z',
    }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.demo, true);
  assert.ok(body.modules.some((m) => m.moduleId === 'core'));
  assert.deepEqual(body.files.map((f) => f.path).sort(), [
    'AGENTS.md', 'ARCHITECTURE.md', 'PROJECT.md', 'README.md', 'state/CURRENT_STATE.md',
  ]);
  assert.match(body.files.find((f) => f.path === 'README.md').content, /foundation demo/i);
});

test('POST /os/api/compile rejects invalid JSON profile', async () => {
  const res = await api.request('/os/api/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile: { kind: 'Nope' } }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'PROFILE_INVALID');
  assert.ok(Array.isArray(body.issues) && body.issues.length > 0);
});

test('POST /os/api/compile rejects an empty body idea', async () => {
  const res = await api.request('/os/api/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea: '   ' }),
  });
  assert.equal(res.status, 400);
});
