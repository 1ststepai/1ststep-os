import { SCHEMA_VERSION, type IntakeForm, type Profile } from './types.ts';

function fnv1aHex(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.codePointAt(i)!, 16777619);
  return (h >>> 0).toString(16).padStart(8, '0');
}

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function known<T>(value: T, evidence: Profile['mode']['evidence'], source: string, note?: string) {
  return { status: 'KNOWN' as const, value, evidence, source, ...(note ? { note } : {}) };
}

function unknown(note?: string) {
  return note ? { status: 'UNKNOWN' as const, note } : { status: 'UNKNOWN' as const };
}

function declined(note: string) {
  return { status: 'DECLINED' as const, note };
}

function na(note: string) {
  return { status: 'NOT_APPLICABLE' as const, note };
}

const DEFAULT_PRODUCT = 'WEB_SAAS';
const DEFAULT_PLATFORM = 'WEB';

export function deriveName(idea: string, explicit?: string): string {
  const fromForm = explicit?.trim();
  if (fromForm) return clip(fromForm, 80);
  const line = idea.trim().split(/\n/)[0] ?? '';
  const cut = clip(line, 60);
  return cut || 'Untitled project';
}

/**
 * Deterministic idea/form → ProjectProfile. Defaults are ASSUMED and listed.
 * No model is called. Unknown is never encoded as false: defaults are explicit.
 */
export function buildProfile(input: { idea: string; form?: IntakeForm; now: string }): Profile {
  const idea = (input.idea ?? '').trim();
  const form = input.form ?? {};
  const now = input.now;
  const name = deriveName(idea, form.name);
  const productTypes = form.productTypes?.length ? form.productTypes : [DEFAULT_PRODUCT];
  const platformTargets = form.platformTargets?.length ? form.platformTargets : [DEFAULT_PLATFORM];
  const paymentsNeeded = form.paymentsNeeded ?? false;
  const authNeeded = form.authNeeded ?? true;
  const usesAI = form.usesAI ?? false;
  const lifecycleStage = form.lifecycleStage ?? 'IDEA';
  const mode = form.mode ?? 'BUILD_PRODUCT';
  const defaultsUsed = {
    productTypes: !form.productTypes?.length,
    platformTargets: !form.platformTargets?.length,
    paymentsNeeded: form.paymentsNeeded === undefined,
    authNeeded: form.authNeeded === undefined,
    usesAI: form.usesAI === undefined,
    name: !form.name?.trim(),
  };

  const assumptions: Profile['assumptions'] = [];
  const addAssumption = (id: string, statement: string, impactIfWrong: string) => {
    assumptions.push({ id, statement, evidence: 'ASSUMED', impactIfWrong, confirmedByUser: false });
  };
  if (defaultsUsed.productTypes) {
    addAssumption('asm-product-type', `Product type defaulted to ${DEFAULT_PRODUCT}.`, 'Module selection (web vs other surfaces) may be wrong.');
  }
  if (defaultsUsed.platformTargets) {
    addAssumption('asm-platform', `Platform defaulted to ${DEFAULT_PLATFORM}.`, 'Mobile/desktop/extension modules will not be selected.');
  }
  if (defaultsUsed.paymentsNeeded) {
    addAssumption('asm-payments', 'Payments assumed not needed.', 'The payments module will be missing if the product actually charges.');
  }
  if (defaultsUsed.authNeeded) {
    addAssumption('asm-auth', 'Authentication assumed needed.', 'Operations/auth guidance may be unnecessary for a throwaway prototype.');
  }
  if (defaultsUsed.usesAI) {
    addAssumption('asm-ai', 'AI features assumed not in scope.', 'The AI module will be missing if the product uses models.');
  }
  if (defaultsUsed.name) {
    addAssumption('asm-name', `Project name derived from the idea text (${name}).`, 'Replace with the real name before sharing the bundle.');
  }
  addAssumption('asm-cycle1', 'Cycle 1 foundation demo: no research, stack recommendation, or interview was run.', 'Treat this bundle as a starting stub, not a complete Project OS.');

  const aiUses = usesAI === 'DECLINED'
    ? declined('User chose to decide later.')
    : known(Boolean(usesAI), defaultsUsed.usesAI ? 'ASSUMED' : 'CONFIRMED', defaultsUsed.usesAI ? 'DEFAULTED' : 'USER_STATED');

  const id = `prof_c1_${fnv1aHex(`${name}\n${idea}\n${productTypes.join(',')}\n${platformTargets.join(',')}`)}`;
  const src = (deflt: boolean) => (deflt ? 'DEFAULTED' : 'USER_STATED');
  const ev = (deflt: boolean) => (deflt ? 'ASSUMED' : 'CONFIRMED');

  return {
    kind: 'ProjectProfile',
    schemaVersion: SCHEMA_VERSION,
    id,
    profileVersion: 1,
    createdAt: now,
    updatedAt: now,
    mode: known(mode, 'ASSUMED', form.mode ? 'USER_STATED' : 'DEFAULTED', 'Cycle 1 intake is BUILD_PRODUCT unless the form says otherwise.'),
    identity: { name: known(name, defaultsUsed.name ? 'ASSUMED' : 'CONFIRMED', defaultsUsed.name ? 'INFERRED' : 'USER_STATED') },
    idea: {
      originalText: { text: idea.slice(0, 20000), trust: 'USER_INPUT' },
      summary: idea ? known(clip(idea, 280), 'ASSUMED', 'INFERRED', 'Truncated idea text; not an interviewed summary.') : unknown('No idea text.'),
      problem: unknown('Not collected in Cycle 1 intake.'),
    },
    targetUsers: unknown('Not collected in Cycle 1 intake.'),
    jobsToBeDone: unknown('Not collected in Cycle 1 intake.'),
    productTypes: known(productTypes, ev(defaultsUsed.productTypes), src(defaultsUsed.productTypes)),
    lifecycleStage: known(lifecycleStage, form.lifecycleStage ? 'CONFIRMED' : 'ASSUMED', form.lifecycleStage ? 'USER_STATED' : 'DEFAULTED'),
    featureScope: known([], 'ASSUMED', 'DEFAULTED', 'No interview; empty scope is an assumption, not "no features".'),
    nonGoals: unknown(),
    dataSensitivity: known(authNeeded ? ['PERSONAL'] : [], 'INFERRED', 'RULE_DERIVED', authNeeded ? 'Auth implies PERSONAL until classified otherwise.' : 'No auth: no known data classes.'),
    auth: {
      needed: known(authNeeded, ev(defaultsUsed.authNeeded), src(defaultsUsed.authNeeded)),
      methods: unknown(),
      multiTenant: unknown(),
    },
    payments: {
      needed: known(paymentsNeeded, ev(defaultsUsed.paymentsNeeded), src(defaultsUsed.paymentsNeeded)),
      handlesCardData: known(false, 'ASSUMED', 'DEFAULTED', 'Cycle 1 never assumes card data handling.'),
    },
    ai: {
      usesAI: aiUses,
      userDataSentToModels: unknown(),
      autonomousExternalActions: known(false, 'ASSUMED', 'DEFAULTED'),
    },
    integrations: known([], 'ASSUMED', 'DEFAULTED', 'Confirmed none for this demo intake (known empty, not unknown).'),
    platformTargets: known(platformTargets, ev(defaultsUsed.platformTargets), src(defaultsUsed.platformTargets)),
    geography: { markets: unknown() },
    businessModel: unknown(),
    distributionModel: unknown(),
    growthGoals: unknown(),
    capabilityRequests: known([], 'ASSUMED', 'DEFAULTED', 'No explicit capability requests.'),
    businessOperations: na('BUILD_PRODUCT intake; Business Owner Mode not used.'),
    budget: {
      toolsMonthlyUsd: unknown(),
      aiMonthlyUsd: unknown(),
      hourlyValueUsd: na('Not collected.'),
    },
    riskClassification: {
      level: unknown('Filled by classifyRisk.'),
      factors: [],
      rulesetVersion: '0.1.0',
    },
    stackRecommendation: unknown('No recommendation engine in Cycle 1.'),
    selectedModules: unknown('Filled by selectModules at compile time.'),
    assumptions,
    unresolvedDecisions: [],
  };
}
