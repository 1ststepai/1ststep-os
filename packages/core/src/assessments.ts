import type { Assessment, AssessmentStatus, Profile } from './types.ts';

export const CONDITION_FIELDS = [
  'mode', 'productTypes', 'platformTargets', 'lifecycleStage', 'dataSensitivity', 'businessModel',
  'distributionModel', 'integrations', 'capabilityRequests', 'auth.needed', 'payments.needed',
  'ai.usesAI', 'riskClassification.level',
] as const;

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isAssessment(value: unknown): value is Assessment {
  if (!isObject(value) || typeof value.status !== 'string') return false;
  return (['KNOWN', 'UNKNOWN', 'NOT_APPLICABLE', 'DECLINED'] as AssessmentStatus[]).includes(value.status as AssessmentStatus);
}

export function fieldAssessment(profile: Profile, field: string): Assessment | undefined {
  switch (field) {
    case 'mode': return profile.mode;
    case 'productTypes': return profile.productTypes;
    case 'platformTargets': return profile.platformTargets;
    case 'lifecycleStage': return profile.lifecycleStage;
    case 'dataSensitivity': return profile.dataSensitivity;
    case 'businessModel': return profile.businessModel;
    case 'distributionModel': return profile.distributionModel;
    case 'integrations': return profile.integrations;
    case 'capabilityRequests': return profile.capabilityRequests;
    case 'auth.needed': return profile.auth?.needed;
    case 'payments.needed': return profile.payments?.needed;
    case 'ai.usesAI': return profile.ai?.usesAI;
    case 'riskClassification.level': return profile.riskClassification?.level;
    default: return undefined;
  }
}

export function known<T>(assessment: Assessment<T> | undefined, fallback: T): T {
  if (assessment?.status === 'KNOWN') return assessment.value as T;
  return fallback;
}

export function displayAssessment(assessment: Assessment | undefined): string {
  if (!assessment) return 'missing';
  if (assessment.status !== 'KNOWN') return assessment.status;
  const value = assessment.value;
  if (Array.isArray(value)) return value.length ? value.join(', ') : '(none)';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (value === undefined) return 'KNOWN (empty)';
  return String(value);
}
