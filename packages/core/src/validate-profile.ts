import { ASSESSMENT_STATUSES, EVIDENCE_STATES, SCHEMA_VERSION, VALUE_SOURCES, type Profile } from './types.ts';
import { isAssessment, isObject } from './assessments.ts';

const ID = /^[A-Za-z][A-Za-z0-9._:-]{2,127}$/;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

const REQUIRED = [
  'kind', 'schemaVersion', 'id', 'profileVersion', 'createdAt', 'updatedAt', 'mode',
  'identity', 'idea', 'targetUsers', 'jobsToBeDone', 'productTypes', 'lifecycleStage',
  'featureScope', 'nonGoals', 'dataSensitivity', 'auth', 'payments', 'ai', 'integrations',
  'platformTargets', 'geography', 'businessModel', 'distributionModel', 'growthGoals',
  'capabilityRequests', 'businessOperations', 'budget',
  'riskClassification', 'stackRecommendation', 'selectedModules', 'assumptions', 'unresolvedDecisions',
] as const;

export type ValidateOk = { ok: true; profile: Profile };
export type ValidateFail = { ok: false; code: 'PROFILE_INVALID'; issues: string[] };

function checkAssessment(path: string, value: unknown, issues: string[]): void {
  if (!isAssessment(value)) {
    issues.push(`${path}: expected an assessment object with status`);
    return;
  }
  if (!ASSESSMENT_STATUSES.includes(value.status)) {
    issues.push(`${path}: invalid status ${String(value.status)}`);
    return;
  }
  if (value.status === 'KNOWN') {
    if (!('value' in value)) issues.push(`${path}: KNOWN requires value`);
    if (!value.evidence || !(EVIDENCE_STATES as readonly string[]).includes(value.evidence)) {
      issues.push(`${path}: KNOWN requires evidence`);
    }
    if (!value.source || !(VALUE_SOURCES as readonly string[]).includes(value.source)) {
      issues.push(`${path}: KNOWN requires source`);
    }
  } else if ('value' in value && value.value !== undefined) {
    issues.push(`${path}: ${value.status} must not carry a value`);
  }
}

function checkUntrusted(path: string, value: unknown, issues: string[]): void {
  if (!isObject(value) || typeof value.text !== 'string' || typeof value.trust !== 'string') {
    issues.push(`${path}: expected untrustedText { text, trust }`);
    return;
  }
  if (!['USER_INPUT', 'UNTRUSTED_EXTERNAL', 'AI_GENERATED'].includes(value.trust)) {
    issues.push(`${path}: invalid trust ${value.trust}`);
  }
}

export function validateProfile(input: unknown): ValidateOk | ValidateFail {
  const issues: string[] = [];
  if (!isObject(input)) return { ok: false, code: 'PROFILE_INVALID', issues: ['profile must be an object'] };

  if (input.kind !== 'ProjectProfile') issues.push('kind must be ProjectProfile');
  if (input.schemaVersion !== SCHEMA_VERSION) issues.push(`schemaVersion must be ${SCHEMA_VERSION}`);
  if (typeof input.id !== 'string' || !ID.test(input.id)) issues.push('id is missing or invalid');
  if (typeof input.profileVersion !== 'number' || !Number.isInteger(input.profileVersion) || input.profileVersion < 1) {
    issues.push('profileVersion must be an integer >= 1');
  }
  if (typeof input.createdAt !== 'string' || !TIMESTAMP.test(input.createdAt)) issues.push('createdAt must be an ISO timestamp');
  if (typeof input.updatedAt !== 'string' || !TIMESTAMP.test(input.updatedAt)) issues.push('updatedAt must be an ISO timestamp');

  for (const key of REQUIRED) {
    if (!(key in input)) issues.push(`missing required field ${key}`);
  }

  checkAssessment('mode', input.mode, issues);
  if (!isObject(input.identity)) issues.push('identity must be an object');
  else checkAssessment('identity.name', input.identity.name, issues);

  if (!isObject(input.idea)) issues.push('idea must be an object');
  else {
    checkUntrusted('idea.originalText', input.idea.originalText, issues);
    checkAssessment('idea.summary', input.idea.summary, issues);
    checkAssessment('idea.problem', input.idea.problem, issues);
  }

  for (const key of [
    'targetUsers', 'jobsToBeDone', 'productTypes', 'lifecycleStage', 'featureScope', 'nonGoals',
    'dataSensitivity', 'integrations', 'platformTargets', 'businessModel', 'distributionModel',
    'growthGoals', 'capabilityRequests', 'businessOperations', 'stackRecommendation', 'selectedModules',
  ] as const) {
    checkAssessment(key, input[key], issues);
  }

  if (!isObject(input.auth)) issues.push('auth must be an object');
  else {
    checkAssessment('auth.needed', input.auth.needed, issues);
    checkAssessment('auth.methods', input.auth.methods, issues);
    checkAssessment('auth.multiTenant', input.auth.multiTenant, issues);
  }

  if (!isObject(input.payments)) issues.push('payments must be an object');
  else {
    checkAssessment('payments.needed', input.payments.needed, issues);
    checkAssessment('payments.handlesCardData', input.payments.handlesCardData, issues);
  }

  if (!isObject(input.ai)) issues.push('ai must be an object');
  else {
    checkAssessment('ai.usesAI', input.ai.usesAI, issues);
    checkAssessment('ai.userDataSentToModels', input.ai.userDataSentToModels, issues);
    checkAssessment('ai.autonomousExternalActions', input.ai.autonomousExternalActions, issues);
  }

  if (!isObject(input.geography)) issues.push('geography must be an object');
  else checkAssessment('geography.markets', input.geography.markets, issues);

  if (!isObject(input.budget)) issues.push('budget must be an object');
  else {
    checkAssessment('budget.toolsMonthlyUsd', input.budget.toolsMonthlyUsd, issues);
    checkAssessment('budget.aiMonthlyUsd', input.budget.aiMonthlyUsd, issues);
    checkAssessment('budget.hourlyValueUsd', input.budget.hourlyValueUsd, issues);
  }

  if (!isObject(input.riskClassification)) issues.push('riskClassification must be an object');
  else {
    checkAssessment('riskClassification.level', input.riskClassification.level, issues);
    if (!Array.isArray(input.riskClassification.factors)) issues.push('riskClassification.factors must be an array');
    if (typeof input.riskClassification.rulesetVersion !== 'string') issues.push('riskClassification.rulesetVersion is required');
  }

  if (!Array.isArray(input.assumptions)) issues.push('assumptions must be an array');
  if (!Array.isArray(input.unresolvedDecisions)) issues.push('unresolvedDecisions must be an array');

  if (issues.length) return { ok: false, code: 'PROFILE_INVALID', issues };
  return { ok: true, profile: input as Profile };
}
