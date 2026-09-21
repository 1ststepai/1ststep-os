// Shared types for the Cycle 1 domain engine. Loose enough to accept
// schema-valid ProjectProfile documents without generating TS from JSON Schema.

export const SCHEMA_VERSION = '0.1.0';
export const PLATFORM_PHASE = 'P0';
export const COMPILER_VERSION = '0.1.0';
export const RISK_RULESET_VERSION = '0.1.0';
export const PHASES = ['P0', 'P1', 'P2', 'LATER'] as const;
export type Phase = (typeof PHASES)[number];

export const EVIDENCE_STATES = ['CONFIRMED', 'OBSERVED', 'INFERRED', 'ASSUMED', 'UNVERIFIED', 'BLOCKED'] as const;
export type EvidenceState = (typeof EVIDENCE_STATES)[number];

export const ASSESSMENT_STATUSES = ['KNOWN', 'UNKNOWN', 'NOT_APPLICABLE', 'DECLINED'] as const;
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

export const VALUE_SOURCES = ['USER_STATED', 'USER_CONFIRMED', 'INFERRED', 'RESEARCHED', 'DEFAULTED', 'RULE_DERIVED'] as const;

export const PRODUCT_TYPES = [
  'WEB_SAAS', 'MARKETPLACE', 'INTERNAL_TOOL', 'ECOMMERCE', 'DEVELOPER_TOOL', 'API_SERVICE', 'SDK_LIBRARY',
  'BROWSER_EXTENSION', 'MOBILE_APP', 'DESKTOP_APP', 'CONTENT_SITE', 'REALTIME_APP', 'BOT', 'AI_AGENT',
  'DATA_PIPELINE', 'GAME_INTERACTIVE', 'IOT_COMPANION', 'FINANCIAL_TRADING', 'OTHER',
] as const;

export const PLATFORMS = ['WEB', 'IOS', 'ANDROID', 'MACOS', 'WINDOWS', 'LINUX', 'BROWSER_EXTENSION', 'CLI', 'API'] as const;
export const LIFECYCLE_STAGES = ['IDEA', 'VALIDATING', 'BUILDING', 'LAUNCHED', 'GROWING', 'EXISTING_RECOVERY'] as const;
export const DATA_CLASSES = [
  'PERSONAL', 'SENSITIVE_PERSONAL', 'LOCATION', 'HEALTH', 'FINANCIAL', 'PAYMENT_CARD', 'CHILDREN',
  'CREDENTIALS', 'USER_GENERATED_CONTENT', 'BIOMETRIC_VOICE_LIKENESS',
] as const;
export const MODES = ['BUILD_PRODUCT', 'AUTOMATE_BUSINESS', 'RECOVER_PROJECT'] as const;
export const RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type Assessment<T = Json> = {
  status: AssessmentStatus;
  value?: T;
  evidence?: EvidenceState;
  source?: string;
  confidence?: string;
  claimIds?: string[];
  note?: string;
};

export type UntrustedText = { text: string; trust: 'USER_INPUT' | 'UNTRUSTED_EXTERNAL' | 'AI_GENERATED' };

export type Profile = {
  kind: 'ProjectProfile';
  schemaVersion: string;
  id: string;
  profileVersion: number;
  createdAt: string;
  updatedAt: string;
  mode: Assessment<string>;
  identity: { name: Assessment<string> };
  idea: { originalText: UntrustedText; summary: Assessment<string>; problem: Assessment<string> };
  targetUsers: Assessment<string[]>;
  jobsToBeDone: Assessment<string[]>;
  productTypes: Assessment<string[]>;
  lifecycleStage: Assessment<string>;
  featureScope: Assessment<unknown[]>;
  nonGoals: Assessment<string[]>;
  dataSensitivity: Assessment<string[]>;
  auth: { needed: Assessment<boolean>; methods: Assessment<string[]>; multiTenant: Assessment<boolean> };
  payments: { needed: Assessment<boolean>; handlesCardData: Assessment<boolean> };
  ai: { usesAI: Assessment<boolean>; userDataSentToModels: Assessment<boolean>; autonomousExternalActions: Assessment<boolean> };
  integrations: Assessment<string[]>;
  platformTargets: Assessment<string[]>;
  geography: { markets: Assessment<string[]>; regulatedJurisdictions?: Assessment<string[]> };
  businessModel: Assessment<string[]>;
  distributionModel: Assessment<string[]>;
  growthGoals: Assessment<string[]>;
  capabilityRequests: Assessment<string[]>;
  businessOperations: Assessment<unknown[]>;
  budget: { toolsMonthlyUsd: Assessment<number>; aiMonthlyUsd: Assessment<number>; hourlyValueUsd: Assessment<number> };
  riskClassification: {
    level: Assessment<string>;
    factors: Array<{ code: string; rationale: string }>;
    rulesetVersion: string;
  };
  stackRecommendation: Assessment<string>;
  selectedModules: Assessment<unknown[]>;
  assumptions: Array<{ id: string; statement: string; evidence: string; impactIfWrong: string; confirmedByUser: boolean }>;
  unresolvedDecisions: Array<{
    id: string;
    question: string;
    whyItMatters: string;
    blocking: boolean;
    field?: string;
    options?: string[];
  }>;
  [key: string]: unknown;
};

export type Condition = {
  field: string;
  operator: 'INCLUDES_ANY' | 'EXCLUDES_ALL' | 'IN' | 'IS_TRUE' | 'IS_FALSE';
  values?: string[];
};

export type Applicability =
  | { mode: 'ALWAYS' }
  | { mode: 'RULES'; all?: Condition[]; any?: Condition[]; onUnknown: 'EXCLUDE' | 'INCLUDE' | 'RAISE_DECISION' };

export type ModuleDefinition = {
  id: string;
  version: string;
  title?: string;
  phase: Phase | string;
  applicability: Applicability;
  capabilities: string[];
  dependsOn: string[];
  conflictsWith: string[];
  riskFactors?: string[];
};

export type CapabilityDefinition = {
  id: string;
  generationPhase: Phase | string;
  consentRequired?: boolean;
};

export type ModuleRegistry = { modules: ModuleDefinition[]; registryVersion?: string };
export type CapabilityRegistry = { capabilities: CapabilityDefinition[]; registryVersion?: string };

export type SelectedModule = {
  moduleId: string;
  moduleVersion: string;
  reason: 'ALWAYS' | 'RULE_MATCH' | 'DEPENDENCY' | 'USER_ADDED';
  trace?: string[];
};

export type DeferredModule = {
  id: string;
  reason: 'PHASE_NOT_AVAILABLE' | 'BLOCKING_DECISION' | 'CONSENT_REQUIRED';
};

export type SelectionDecision = {
  field: string;
  blocking: boolean;
  code: 'UNKNOWN_FIELD' | 'DECLINED_FIELD' | 'DEPENDENCY_CONTRADICTS_PROFILE' | 'MODULE_CONFLICT';
  message: string;
  moduleIds: string[];
};

export type SelectionResult = {
  selected: SelectedModule[];
  deferred: DeferredModule[];
  decisions: SelectionDecision[];
  capabilities: Array<{ id: string; generationPhase: string }>;
  trace: string[];
  error?: 'MODULE_CONFLICT' | 'REGISTRY_INVALID' | 'DEPENDENCY_CONTRADICTS_PROFILE';
};

export type Artifact = { path: string; content: string };

export type CompileResult = {
  ok: true;
  profile: Profile;
  selection: SelectionResult;
  files: Artifact[];
  generatedAt: string;
} | {
  ok: false;
  code: string;
  issues: string[];
  selection?: SelectionResult;
};

export type IntakeForm = {
  name?: string;
  productTypes?: string[];
  platformTargets?: string[];
  paymentsNeeded?: boolean;
  authNeeded?: boolean;
  usesAI?: boolean | 'DECLINED';
  lifecycleStage?: string;
  mode?: string;
};

export type CompileRequest = {
  idea?: string;
  profile?: unknown;
  form?: IntakeForm;
  generatedAt?: string;
  userAddedModuleIds?: string[];
};
