import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const core = await import('../src/index.ts');
const example = JSON.parse(readFileSync(fileURLToPath(new URL('../../../schemas/0.1.0/examples/project-profile.json', import.meta.url)), 'utf8'));

test('example profile validates', () => {
  const result = core.validateProfile(example);
  assert.equal(result.ok, true, result.ok ? '' : result.issues.join('\n'));
  assert.equal(result.profile.kind, 'ProjectProfile');
});

test('rejects KNOWN without value and UNKNOWN with value', () => {
  const missing = structuredClone(example);
  missing.payments.needed = { status: 'KNOWN', evidence: 'CONFIRMED', source: 'USER_STATED' };
  const a = core.validateProfile(missing);
  assert.equal(a.ok, false);
  assert.equal(a.code, 'PROFILE_INVALID');

  const extra = structuredClone(example);
  extra.ai.usesAI = { status: 'UNKNOWN', value: false };
  const b = core.validateProfile(extra);
  assert.equal(b.ok, false);
});

test('rejects a bare boolean in place of an assessment', () => {
  const doc = structuredClone(example);
  doc.ai.usesAI = false;
  const result = core.validateProfile(doc);
  assert.equal(result.ok, false);
});

test('rejects non-objects', () => {
  assert.equal(core.validateProfile(null).ok, false);
  assert.equal(core.validateProfile('nope').ok, false);
});

test('buildProfile from idea is valid and records ASSUMED defaults', () => {
  const profile = core.buildProfile({
    idea: 'An app where neighbours share lawn mowers.',
    now: '2026-09-21T00:00:00Z',
  });
  const result = core.validateProfile(profile);
  assert.equal(result.ok, true, result.ok ? '' : result.issues.join('\n'));
  assert.ok(profile.assumptions.some((a) => a.id === 'asm-cycle1'));
  assert.equal(profile.productTypes.value[0], 'WEB_SAAS');
  assert.equal(profile.idea.originalText.trust, 'USER_INPUT');
});
