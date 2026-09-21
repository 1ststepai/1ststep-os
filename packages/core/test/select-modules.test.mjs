import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const fixtures = fileURLToPath(new URL('./fixtures/select', import.meta.url));
const core = await import('../src/index.ts');
const modules = JSON.parse(readFileSync(join(root, 'modules/registry.json'), 'utf8'));
const caps = JSON.parse(readFileSync(join(root, 'capabilities/registry.json'), 'utf8'));
const now = '2026-09-21T00:00:00Z';

function selectFromFixture(doc) {
  const built = core.buildProfile({ idea: doc.idea, form: doc.form, now });
  const validated = core.validateProfile(built);
  assert.equal(validated.ok, true, validated.ok ? '' : validated.issues.join('\n'));
  const profile = core.classifyRisk(validated.profile);
  return core.selectModules(profile, modules, caps, 'P0');
}

test('golden fixtures: module selection for representative profiles', () => {
  const files = readdirSync(fixtures).filter((f) => f.endsWith('.json')).sort();
  assert.ok(files.length >= 5, 'expected several golden fixtures');
  for (const file of files) {
    const doc = JSON.parse(readFileSync(join(fixtures, file), 'utf8'));
    const sel = selectFromFixture(doc);
    assert.deepEqual(
      sel.selected.map((m) => [m.moduleId, m.reason]),
      doc.expected.selected,
      file,
    );
    assert.deepEqual(
      sel.deferred.map((m) => [m.id, m.reason]),
      doc.expected.deferred,
      file,
    );
    assert.deepEqual(
      sel.decisions.map((d) => [d.field, d.code]),
      doc.expected.decisionCodes,
      file,
    );
    assert.equal(sel.error, doc.expected.error);
  }
});

test('schema example profile validates and selects marketplace modules', () => {
  const example = JSON.parse(readFileSync(join(root, 'schemas/0.1.0/examples/project-profile.json'), 'utf8'));
  const validated = core.validateProfile(example);
  assert.equal(validated.ok, true, validated.ok ? '' : validated.issues.join('\n'));
  const sel = core.selectModules(core.classifyRisk(validated.profile), modules, caps, 'P0');
  assert.ok(sel.selected.some((m) => m.moduleId === 'core' && m.reason === 'ALWAYS'));
  assert.ok(sel.selected.some((m) => m.moduleId === 'payments'));
  assert.ok(sel.selected.some((m) => m.moduleId === 'mobile'));
  assert.deepEqual(sel.decisions.map((d) => d.code), ['DECLINED_FIELD']);
  assert.equal(sel.decisions[0].blocking, false);
});

test('UNKNOWN payments.needed raises a blocking decision and excludes payments', () => {
  const built = core.buildProfile({
    idea: 'A billed SaaS.',
    form: { name: 'Billed', productTypes: ['WEB_SAAS'], platformTargets: ['WEB'], paymentsNeeded: false, authNeeded: true, usesAI: false },
    now,
  });
  built.payments.needed = { status: 'UNKNOWN' };
  const sel = core.selectModules(core.classifyRisk(built), modules, caps, 'P0');
  assert.equal(sel.selected.some((m) => m.moduleId === 'payments'), false);
  const decision = sel.decisions.find((d) => d.field === 'payments.needed');
  assert.ok(decision);
  assert.equal(decision.blocking, true);
  assert.equal(decision.code, 'UNKNOWN_FIELD');
});

test('synthetic conflict fails closed', () => {
  const profile = core.classifyRisk(core.buildProfile({ idea: 'x', form: { name: 'X' }, now }));
  const tiny = {
    modules: [
      {
        id: 'alpha', version: '0.1.0', phase: 'P0',
        applicability: { mode: 'ALWAYS' },
        capabilities: ['docs.readme'], dependsOn: [], conflictsWith: ['beta'],
      },
      {
        id: 'beta', version: '0.1.0', phase: 'P0',
        applicability: { mode: 'ALWAYS' },
        capabilities: ['docs.changelog'], dependsOn: [], conflictsWith: ['alpha'],
      },
    ],
  };
  const capsTiny = { capabilities: [{ id: 'docs.readme', generationPhase: 'P0' }, { id: 'docs.changelog', generationPhase: 'P0' }] };
  const sel = core.selectModules(profile, tiny, capsTiny, 'P0');
  assert.equal(sel.error, 'MODULE_CONFLICT');
  assert.deepEqual(sel.selected, []);
});

test('property: shuffled registry order is selection-invariant', () => {
  const doc = JSON.parse(readFileSync(join(fixtures, 'payments-marketplace.json'), 'utf8'));
  const baseline = selectFromFixture(doc);
  const snapshot = (sel) => JSON.stringify({
    selected: sel.selected,
    deferred: sel.deferred,
    decisions: sel.decisions,
    capabilities: sel.capabilities,
    error: sel.error,
  });
  const expected = snapshot(baseline);
  let seed = 20260921;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const shuffle = (list) => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  for (let n = 0; n < 12; n++) {
    const shuffled = { ...modules, modules: shuffle(modules.modules) };
    const built = core.buildProfile({ idea: doc.idea, form: doc.form, now });
    const sel = core.selectModules(core.classifyRisk(built), shuffled, caps, 'P0');
    assert.equal(snapshot(sel), expected, `shuffle ${n}`);
  }
});
