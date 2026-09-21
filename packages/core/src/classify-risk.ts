import { RISK_RULESET_VERSION, type Profile } from './types.ts';

type Factor = { code: string; rationale: string };

function knownBool(assessment: Profile['payments']['needed']): boolean | undefined {
  if (assessment?.status !== 'KNOWN') return undefined;
  return Boolean(assessment.value);
}

function knownList(assessment: Profile['dataSensitivity']): string[] | undefined {
  if (assessment?.status !== 'KNOWN') return undefined;
  return Array.isArray(assessment.value) ? assessment.value.map(String) : [];
}

/**
 * Risk ruleset 0.1.0. Unknown is never treated as false: only KNOWN facts raise factors.
 * Level is the highest triggered band; no known factors → LOW.
 */
export function classifyRisk(profile: Profile): Profile {
  const factors: Factor[] = [];
  const data = knownList(profile.dataSensitivity) ?? [];
  const paymentsNeeded = knownBool(profile.payments?.needed);
  const cardData = knownBool(profile.payments?.handlesCardData);
  const usesAI = knownBool(profile.ai?.usesAI);
  const autonomous = knownBool(profile.ai?.autonomousExternalActions);

  const has = (code: string) => data.includes(code);

  if (has('CHILDREN')) factors.push({ code: 'CHILDREN_DATA', rationale: 'dataSensitivity includes CHILDREN.' });
  if (has('HEALTH')) factors.push({ code: 'HEALTH_DATA', rationale: 'dataSensitivity includes HEALTH.' });
  if (has('BIOMETRIC_VOICE_LIKENESS')) factors.push({ code: 'BIOMETRIC_DATA', rationale: 'dataSensitivity includes BIOMETRIC_VOICE_LIKENESS.' });
  if (has('PAYMENT_CARD') || cardData === true) {
    factors.push({ code: 'CARD_DATA', rationale: 'Payment card data is in scope or handlesCardData is true.' });
  }
  if (has('FINANCIAL')) factors.push({ code: 'FINANCIAL_DATA', rationale: 'dataSensitivity includes FINANCIAL.' });
  if (paymentsNeeded === true) factors.push({ code: 'PAYMENT_PROCESSING', rationale: 'payments.needed is KNOWN true.' });
  if (has('LOCATION')) factors.push({ code: 'LOCATION_DATA', rationale: 'dataSensitivity includes LOCATION.' });
  if (has('PERSONAL') || has('SENSITIVE_PERSONAL') || has('CREDENTIALS')) {
    factors.push({ code: 'PERSONAL_DATA', rationale: 'Personal or credential data classes are listed.' });
  }
  if (usesAI === true) factors.push({ code: 'AI_FEATURES', rationale: 'ai.usesAI is KNOWN true.' });
  if (autonomous === true) factors.push({ code: 'AUTONOMOUS_ACTIONS', rationale: 'ai.autonomousExternalActions is KNOWN true.' });

  let level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  const codes = new Set(factors.map((f) => f.code));
  if (codes.has('CHILDREN_DATA') || codes.has('HEALTH_DATA')) level = 'CRITICAL';
  else if (codes.has('CARD_DATA') || codes.has('FINANCIAL_DATA') || codes.has('BIOMETRIC_DATA') || codes.has('AUTONOMOUS_ACTIONS')) level = 'HIGH';
  else if (codes.has('PAYMENT_PROCESSING') || codes.has('LOCATION_DATA') || codes.has('PERSONAL_DATA') || codes.has('AI_FEATURES')) level = 'MODERATE';

  if (factors.length === 0) {
    factors.push({
      code: 'NO_KNOWN_HIGH_RISK_FACTORS',
      rationale: 'No KNOWN high-risk facts. UNKNOWN fields were not treated as false or as present.',
    });
  }

  return {
    ...profile,
    riskClassification: {
      level: { status: 'KNOWN', value: level, evidence: 'INFERRED', source: 'RULE_DERIVED' },
      factors,
      rulesetVersion: RISK_RULESET_VERSION,
    },
  };
}
