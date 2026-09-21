// packages/core must stay pure (ADR-010 dependency rule, ADR-012 §1): only relative imports.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('../src', import.meta.url));
const files = (dir) => readdirSync(dir).flatMap((e) => (statSync(join(dir, e)).isDirectory() ? files(join(dir, e)) : [join(dir, e)]));

test('core imports only relative modules', () => {
  const offenders = [];
  for (const file of files(src)) {
    const text = readFileSync(file, 'utf8');
    for (const [, spec] of text.matchAll(/(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      if (spec && !spec.startsWith('./') && !spec.startsWith('../')) offenders.push(`${file}: ${spec}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test('core exposes canonical evidence states', async () => {
  const core = await import('../src/index.ts');
  const common = JSON.parse(readFileSync(fileURLToPath(new URL('../../../schemas/0.1.0/common.schema.json', import.meta.url)), 'utf8'));
  assert.deepEqual([...core.EVIDENCE_STATES], common.$defs.evidenceState.enum);
});
