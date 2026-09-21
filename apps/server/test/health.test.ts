import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/app.ts';

test('health endpoint responds under /os/api', async () => {
  const res = await api.request('/os/api/healthz');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('unknown API routes are 404', async () => {
  const res = await api.request('/os/api/does-not-exist');
  assert.equal(res.status, 404);
});
