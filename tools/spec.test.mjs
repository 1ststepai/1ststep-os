// Cycle 0 spec checks: schemas compile, fixtures and negative mutations, registry integrity,
// machine-state/Markdown agreement, FILE_INDEX completeness, secret scan. Run: npm run check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = fileURLToPath(new URL('..', import.meta.url));
const V = '0.1.0';
const schemaDir = join(root, 'schemas', V);
const read = (p) => readFileSync(join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const PHASES = ['P0', 'P1', 'P2', 'LATER'];

const ajv = new Ajv2020({ allErrors: true, strictTypes: false, strictTuples: false });
addFormats(ajv);
const schemaFiles = readdirSync(schemaDir).filter((f) => f.endsWith('.schema.json'));
for (const f of schemaFiles) ajv.addSchema(JSON.parse(readFileSync(join(schemaDir, f), 'utf8')));
const schemaJson = (name) => JSON.parse(readFileSync(join(schemaDir, `${name}.schema.json`), 'utf8'));
const validator = (name) => ajv.getSchema(`https://1ststep.ai/os/schemas/${V}/${name}.schema.json`);
const errors = (v) => ajv.errorsText(v.errors, { separator: '\n' });
const expectValid = (name, doc, label = name) => {
  const v = validator(name);
  assert.ok(v(doc), `${label} should be valid:\n${errors(v)}`);
};

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(relative(root, full).split(sep).join('/'));
  }
  return out;
}

test('all schemas compile', () => {
  for (const f of schemaFiles) assert.ok(validator(f.replace('.schema.json', '')), `compile ${f}`);
});

const REQUIRED = [
  'project-profile', 'project-os-manifest', 'capability-definition', 'module-definition', 'tool-provider', 'model-provider',
  'research-claim', 'recommendation', 'external-action', 'media-asset', 'consent-record', 'automation-definition', 'finding', 'gate-result', 'handoff',
  'provider-policy', 'llm-connection',
];

test('every required schema exists and has a valid fixture', () => {
  for (const name of REQUIRED) {
    assert.ok(existsSync(join(schemaDir, `${name}.schema.json`)), `missing schema ${name}`);
    if (name === 'capability-definition' || name === 'module-definition') continue; // covered by registries
    expectValid(name, json(`schemas/${V}/examples/${name}.json`), `example ${name}`);
  }
});

const example = (name) => json(`schemas/${V}/examples/${name}.json`);
const MUTATIONS = [
  ['project-profile', 'UNKNOWN carrying a value', (p) => { p.ai.usesAI = { status: 'UNKNOWN', value: false }; }],
  ['project-profile', 'KNOWN without value', (p) => { p.payments.needed = { status: 'KNOWN', evidence: 'CONFIRMED', source: 'USER_STATED' }; }],
  ['project-profile', 'null instead of assessment', (p) => { p.payments.needed = null; }],
  ['project-profile', 'bare false instead of assessment', (p) => { p.ai.usesAI = false; }],
  ['project-profile', 'bare empty list instead of assessment', (p) => { p.integrations = []; }],
  ['research-claim', 'OBSERVED without sources', (c) => { c.sources = []; }],
  ['research-claim', 'CONFIRMED without human review', (c) => { c.evidence = 'CONFIRMED'; }],
  ['research-claim', 'ESTIMATE without method', (c) => { c.claimType = 'ESTIMATE'; }],
  ['recommendation', 'ACCEPTED without decision', (r) => { delete r.decision; }],
  ['recommendation', 'user-approval decided by an agent', (r) => { r.decision.decidedBy = { actorType: 'AGENT', actorId: 'pricing-agent' }; }],
  ['external-action', 'executed publish without approval', (a) => { a.status = 'SUCCEEDED'; a.approval = { state: 'PENDING' }; }],
  ['external-action', 'agent approver', (a) => { a.approval.approver = { actorType: 'AGENT', actorId: 'social-agent' }; }],
  ['external-action', 'approve used as action scope', (a) => { a.requiredScope = 'approve'; }],
  ['external-action', 'risk tier mismatch', (a) => { a.riskTier = 'T0_INTERNAL'; }],
  ['external-action', 'account creation via connector', (a) => { a.requiredScope = 'account_create'; a.executionMode = 'CONNECTOR'; }],
  ['external-action', 'high-risk approved without re-auth', (a) => { a.requiredScope = 'deploy'; a.riskTier = 'T3_HIGH_RISK_APPROVAL'; }],
  ['gate-result', 'PASS with FAIL criterion', (g) => { g.criteria[0].result = 'FAIL'; }],
  ['gate-result', 'PASS criterion without evidence', (g) => { g.criteria[0].evidence = []; }],
  ['gate-result', 'BLOCKED without blockers', (g) => { g.result = 'BLOCKED'; }],
  ['project-os-manifest', 'path traversal', (m) => { m.files[0].path = '../outside.md'; }],
  ['project-os-manifest', 'absolute path', (m) => { m.files[0].path = '/etc/passwd'; }],
  ['project-os-manifest', 'backslash path', (m) => { m.files[0].path = 'a\\b.md'; }],
  ['finding', 'VERIFIED without verification', (f) => { delete f.verification; }],
  ['finding', 'short mutable id', (f) => { f.id = 'F-1'; }],
  ['media-asset', 'identity asset without consent link', (a) => { a.identitySubjects = []; }],
  ['media-asset', 'approved with unknown rights', (a) => { a.rights.license = { status: 'UNKNOWN' }; }],
  ['media-asset', 'AI asset without prompt provenance', (a) => { delete a.production.promptHash; }],
  ['consent-record', 'ACTIVE without verification', (c) => { delete c.verification; }],
  ['consent-record', 'recorded by an agent', (c) => { c.recordedBy = { actorType: 'AGENT', actorId: 'content-agent' }; }],
  ['consent-record', 'REVOKED without revocation', (c) => { c.status = 'REVOKED'; }],
  ['automation-definition', 'publish step without approval', (a) => { a.steps[2].approval = 'NONE'; }],
  ['automation-definition', 'automated account creation', (a) => { a.steps[2].requiredScope = 'account_create'; }],
  ['automation-definition', 'no kill switch', (a) => { a.controls.killSwitch = false; }],
  ['automation-definition', 'unbounded retries', (a) => { a.retry.maxAttempts = 50; }],
  ['model-provider', 'ACTIVE with unknown price', (m) => { m.status = 'ACTIVE'; }],
  ['tool-provider', 'routing class out of range', (t) => { t.routingClass = 9; }],
  ['handoff', 'rename without source path', (h) => { delete h.filesChanged[0].from; }],
  ['model-provider', 'self-hosted model without connection', (m) => { m.hosting = 'SELF_HOSTED'; }],
  ['provider-policy', 'local-only policy allowing hosted APIs', (p) => { p.localOnly = true; }],
  ['provider-policy', 'independent provider without independent model', (p) => { p.verification = { independentModelRequired: false, independentProviderRequired: true }; }],
  ['provider-policy', 'allowlist mode with no providers', (p) => { p.providers.mode = 'ALLOWLIST'; }],
  ['provider-policy', 'policy set by an agent', (p) => { p.updatedBy = { actorType: 'AGENT', actorId: 'ai-agent' }; }],
  ['llm-connection', 'cloud runtime calling localhost', (c) => { c.endpoint = { baseUrl: 'http://localhost:11434/v1', networkZone: 'LOCALHOST' }; }],
  ['llm-connection', 'cloud runtime over plain http', (c) => { c.endpoint.baseUrl = 'http://llm-gateway.example.com/v1'; }],
  ['llm-connection', 'raw key instead of secret reference', (c) => { c.auth.secretRef = 'sk-short-inline-key'; }],
  ['llm-connection', 'active without passing test', (c) => { c.connectionTest.result = 'FAIL'; }],
  ['llm-connection', 'active with empty allowlist', (c) => { c.modelAllowlist = []; }],
  ['llm-connection', 'revoked without timestamp', (c) => { c.status = 'REVOKED'; }],
];

test('negative mutations are rejected', () => {
  for (const [name, label, mutate] of MUTATIONS) {
    const doc = structuredClone(example(name));
    mutate(doc);
    assert.equal(validator(name)(doc), false, `${name}: "${label}" must be rejected`);
  }
});

const profileDefs = schemaJson('project-profile').$defs;
const capReg = json('capabilities/registry.json');
const modReg = json('modules/registry.json');
const capIds = new Set(capReg.capabilities.map((c) => c.id));
const capById = new Map(capReg.capabilities.map((c) => [c.id, c]));

function assertAcyclic(nodes, edges, label) {
  const state = new Map();
  const visit = (n, path) => {
    if (state.get(n) === 'done') return;
    assert.notEqual(state.get(n), 'active', `${label} dependency cycle: ${[...path, n].join(' -> ')}`);
    state.set(n, 'active');
    for (const d of edges(n)) visit(d, [...path, n]);
    state.set(n, 'done');
  };
  for (const n of nodes) visit(n, []);
}

test('capability registry matches taxonomy and is consistent', () => {
  expectValid('capability-registry', capReg);
  const taxonomy = json('.project-os/capability-taxonomy.json');
  const fromTaxonomy = Object.entries(taxonomy.domains).flatMap(([d, names]) => names.map((n) => `${d}.${n.toLowerCase()}`)).sort();
  assert.deepEqual([...capIds].sort(), fromTaxonomy, 'registry ids must equal taxonomy');
  assert.equal(capIds.size, capReg.capabilities.length, 'duplicate capability ids');
  const docs = new Set(walk(join(root, 'capabilities')).filter((p) => p.endsWith('.md')));
  for (const c of capReg.capabilities) {
    assert.ok(docs.delete(c.doc), `${c.id}: doc ${c.doc} missing or shared`);
    for (const d of [...c.dependsOn, ...c.conflictsWith]) assert.ok(capIds.has(d), `${c.id} references unknown ${d}`);
    for (const d of c.dependsOn) {
      assert.ok(PHASES.indexOf(capById.get(d).generationPhase) <= PHASES.indexOf(c.generationPhase), `${c.id} depends on later-phase ${d}`);
    }
    assert.ok(PHASES.indexOf(c.executionPhase) >= PHASES.indexOf(c.generationPhase), `${c.id} executes before guidance exists`);
  }
  assert.deepEqual([...docs], [], 'capability docs without registry entries');
  assertAcyclic([...capIds], (id) => capById.get(id).dependsOn, 'capability');
});

test('module registry is valid and referentially consistent', () => {
  expectValid('module-registry', modReg);
  const ids = new Set();
  const agents = new Set(readdirSync(join(root, 'agents')).map((f) => f.replace(/\.md$/, '')));
  const gateFile = (g) => (g === 'DESIGN_REVIEW' ? 'DESIGN_REVIEW_GATE.md' : g === 'COST_REVIEW' ? 'COST_REVIEW_GATE.md' : readdirSync(join(root, 'gates')).find((f) => f.startsWith(`${g}-`)));
  const enumFor = {
    mode: schemaJson('project-profile').properties.mode.properties.value.enum,
    productTypes: profileDefs.productType.enum, platformTargets: profileDefs.platform.enum, lifecycleStage: profileDefs.lifecycleStage.enum,
    dataSensitivity: profileDefs.dataClass.enum, businessModel: profileDefs.businessModel.enum, distributionModel: profileDefs.distribution.enum,
    capabilityRequests: [...capIds], 'riskClassification.level': ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
  };
  const files = new Set();
  for (const m of modReg.modules) {
    assert.ok(!ids.has(m.id), `duplicate module ${m.id}`);
    ids.add(m.id);
  }
  const byId = new Map(modReg.modules.map((m) => [m.id, m]));
  for (const m of modReg.modules) {
    for (const d of m.dependsOn) {
      assert.ok(ids.has(d), `${m.id} depends on unknown ${d}`);
      assert.ok(PHASES.indexOf(byId.get(d).phase) <= PHASES.indexOf(m.phase), `${m.id} depends on later-phase module ${d}`);
    }
    for (const c of m.conflictsWith) {
      assert.ok(ids.has(c) && c !== m.id, `${m.id} bad conflict ${c}`);
      assert.ok(byId.get(c).conflictsWith.includes(m.id), `conflict ${m.id}/${c} must be declared on both sides`);
      assert.ok(!m.dependsOn.includes(c), `${m.id} both depends on and conflicts with ${c}`);
    }
    for (const c of m.capabilities) assert.ok(capIds.has(c), `${m.id} lists unknown capability ${c}`);
    for (const a of m.requiredAgents) assert.ok(agents.has(a), `${m.id} requires missing agent ${a}`);
    for (const g of m.requiredGates) assert.ok(gateFile(g) && existsSync(join(root, g.startsWith('G') && !g.includes('_') ? 'gates' : '', gateFile(g))), `${m.id} requires missing gate ${g}`);
    for (const f of m.requiredFiles) {
      assert.ok(!files.has(f.path), `${f.path} owned by two modules`);
      files.add(f.path);
    }
    const conditions = [...(m.applicability.all ?? []), ...(m.applicability.any ?? [])];
    for (const cond of conditions) {
      if (!cond.values || !enumFor[cond.field]) continue;
      for (const v of cond.values) assert.ok(enumFor[cond.field].includes(v), `${m.id}: ${cond.field} value ${v} not in profile schema`);
    }
  }
  assertAcyclic([...ids], (id) => byId.get(id).dependsOn, 'module');
  const covered = new Set(modReg.modules.flatMap((m) => m.capabilities));
  const orphans = [...capIds].filter((c) => !covered.has(c));
  assert.deepEqual(orphans, [], 'every capability must be reachable through at least one module');
});

test('machine state agrees with Markdown authorities', () => {
  const common = schemaJson('common');
  const manifest = json('.project-os/manifest.json');
  const perms = json('.project-os/permissions.json');
  const state = json('.project-os/state.json');
  assert.deepEqual(manifest.evidenceStates, common.$defs.evidenceState.enum);
  assert.equal(manifest.schemaVersion, V);
  assert.deepEqual(perms.scopes, common.$defs.scope.enum);
  assert.equal(perms.default, 'deny_external_write');
  assert.equal(manifest.externalActionDefault, perms.default);
  const agentsMd = read('AGENTS.md');
  for (const s of common.$defs.evidenceState.enum) assert.ok(agentsMd.includes(`\`${s}\``), `AGENTS.md missing evidence state ${s}`);
  const ext = read('EXTERNAL_ACTIONS.md');
  for (const s of common.$defs.scope.enum) assert.ok(ext.includes(`\`${s}\``), `EXTERNAL_ACTIONS.md missing scope ${s}`);
  assert.ok(read('state/CURRENT_STATE.md').includes(state.status), 'state.json status must appear in CURRENT_STATE.md');
  for (const p of manifest.authorityOrder) assert.ok(existsSync(join(root, p)), `authority file missing: ${p}`);
});

test('gate results, findings and handoffs validate', () => {
  for (const f of walk(join(root, 'gates')).filter((p) => p.endsWith('.json'))) expectValid('gate-result', json(f), f);
  if (existsSync(join(root, 'handoffs'))) {
    for (const f of walk(join(root, 'handoffs')).filter((p) => p.endsWith('.json'))) expectValid('handoff', json(f), f);
  }
  const log = json('audit/findings.json');
  const seen = new Set();
  for (const finding of log.findings) {
    expectValid('finding', finding, finding.id);
    assert.ok(!seen.has(finding.id), `duplicate finding ${finding.id}`);
    seen.add(finding.id);
  }
});

test('FILE_INDEX lists every file', () => {
  const indexed = new Set([...read('FILE_INDEX.md').matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]));
  const actual = walk(root).filter((p) => p !== 'package-lock.json');
  assert.deepEqual(actual.filter((p) => !indexed.has(p)), [], 'files missing from FILE_INDEX.md');
  assert.deepEqual([...indexed].filter((p) => !actual.includes(p)), [], 'FILE_INDEX.md lists missing files');
});

test('only the root AGENTS.md exists (no nested agent authority)', () => {
  const nested = walk(root).filter((p) => /(^|\/)agents\.md$/i.test(p) && p !== 'AGENTS.md');
  assert.deepEqual(nested, []);
});

test('no secrets committed', () => {
  const patterns = [
    ['sk-' + 'ant-', /sk-ant-[A-Za-z0-9_-]{20,}/],
    ['openai key', /\bsk-(proj-)?[A-Za-z0-9]{32,}/],
    ['aws key', /\bAKIA[0-9A-Z]{16}\b/],
    ['private key', new RegExp('-----BEGIN (RSA |EC |OPENSSH )?' + 'PRIVATE KEY-----')],
    ['github token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
    ['slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ];
  for (const f of walk(root).filter((p) => !p.endsWith('.zip'))) {
    const text = read(f);
    for (const [label, re] of patterns) assert.ok(!re.test(text), `${label} pattern found in ${f}`);
  }
});
