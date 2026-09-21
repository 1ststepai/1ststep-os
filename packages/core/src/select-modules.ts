import { fieldAssessment } from './assessments.ts';
import { PHASES, type CapabilityRegistry, type Condition, type ModuleDefinition, type ModuleRegistry, type Profile, type SelectionDecision, type SelectionResult, type SelectedModule } from './types.ts';

function phaseIndex(phase: string): number {
  const i = PHASES.indexOf(phase as (typeof PHASES)[number]);
  return i === -1 ? PHASES.length : i;
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (value === undefined || value === null) return [];
  return [String(value)];
}

function asScalar(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(',');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

type CondResult = { pass: boolean; unknown: boolean; declined: boolean; note: string };

function evalCondition(profile: Profile, cond: Condition): CondResult {
  const assessment = fieldAssessment(profile, cond.field);
  const status = assessment?.status ?? 'UNKNOWN';
  if (status === 'NOT_APPLICABLE') {
    return { pass: false, unknown: false, declined: false, note: `${cond.field} NOT_APPLICABLE => false` };
  }
  if (status === 'UNKNOWN' || status === 'DECLINED') {
    return {
      pass: false,
      unknown: status === 'UNKNOWN',
      declined: status === 'DECLINED',
      note: `${cond.field} ${status} ${cond.operator}`,
    };
  }
  const value = assessment?.value;
  const values = cond.values ?? [];
  let pass = false;
  switch (cond.operator) {
    case 'INCLUDES_ANY':
      pass = asList(value).some((v) => values.includes(v));
      break;
    case 'EXCLUDES_ALL':
      pass = asList(value).every((v) => !values.includes(v));
      break;
    case 'IN':
      pass = values.includes(asScalar(value));
      break;
    case 'IS_TRUE':
      pass = value === true;
      break;
    case 'IS_FALSE':
      pass = value === false;
      break;
    default:
      pass = false;
  }
  return { pass, unknown: false, declined: false, note: `${cond.field} ${cond.operator} ${values.join('|') || ''} => ${pass} (KNOWN)` };
}

type Match = { matched: boolean; reason: SelectedModule['reason']; unknownFields: string[]; declinedFields: string[]; notes: string[] };

function matchModule(profile: Profile, mod: ModuleDefinition): Match {
  if (mod.applicability.mode === 'ALWAYS') {
    return { matched: true, reason: 'ALWAYS', unknownFields: [], declinedFields: [], notes: ['ALWAYS'] };
  }
  const onUnknown = mod.applicability.onUnknown;
  const unknownFields: string[] = [];
  const declinedFields: string[] = [];
  const notes: string[] = [];

  const apply = (cond: Condition): boolean => {
    const result = evalCondition(profile, cond);
    notes.push(result.note);
    if (result.unknown || result.declined) {
      if (result.declined) declinedFields.push(cond.field);
      else unknownFields.push(cond.field);
      if (onUnknown === 'INCLUDE') return true;
      // EXCLUDE and RAISE_DECISION both evaluate the condition as false.
      return false;
    }
    return result.pass;
  };

  const allConds = mod.applicability.all ?? [];
  const anyConds = mod.applicability.any ?? [];
  const allPass = allConds.length === 0 ? true : allConds.every(apply);
  const anyPass = anyConds.length === 0 ? true : anyConds.some(apply);
  return { matched: allPass && anyPass, reason: 'RULE_MATCH', unknownFields, declinedFields, notes };
}

function rulesFalseOnKnown(profile: Profile, mod: ModuleDefinition): boolean {
  if (mod.applicability.mode === 'ALWAYS') return false;
  const evalKnown = (cond: Condition): boolean | null => {
    const result = evalCondition(profile, cond);
    if (result.unknown || result.declined) return null;
    return result.pass;
  };
  const allConds = mod.applicability.all ?? [];
  const anyConds = mod.applicability.any ?? [];
  if (allConds.some((c) => evalKnown(c) === false)) return true;
  if (anyConds.length && anyConds.every((c) => evalKnown(c) === false)) return true;
  return false;
}

function sortById<T extends { id?: string; moduleId?: string }>(items: T[], key: 'id' | 'moduleId'): T[] {
  return [...items].sort((a, b) => String(a[key] ?? '').localeCompare(String(b[key] ?? '')));
}

export function selectModules(
  profile: Profile,
  moduleRegistry: ModuleRegistry,
  capabilityRegistry: CapabilityRegistry,
  platformPhase = 'P0',
  options: { userAddedModuleIds?: string[] } = {},
): SelectionResult {
  const modules = moduleRegistry?.modules;
  const capabilities = capabilityRegistry?.capabilities;
  if (!Array.isArray(modules) || !Array.isArray(capabilities)) {
    return { selected: [], deferred: [], decisions: [], capabilities: [], trace: ['REGISTRY_INVALID'], error: 'REGISTRY_INVALID' };
  }

  const byId = new Map<string, ModuleDefinition>();
  for (const mod of modules) {
    if (!mod?.id || byId.has(mod.id)) {
      return { selected: [], deferred: [], decisions: [], capabilities: [], trace: ['REGISTRY_INVALID'], error: 'REGISTRY_INVALID' };
    }
    byId.set(mod.id, mod);
  }
  for (const mod of modules) {
    for (const dep of mod.dependsOn ?? []) {
      if (!byId.has(dep)) {
        return { selected: [], deferred: [], decisions: [], capabilities: [], trace: [`missing dependency ${dep}`], error: 'REGISTRY_INVALID' };
      }
    }
  }

  const capById = new Map(capabilities.map((c) => [c.id, c]));
  const ordered = [...modules].sort((a, b) => a.id.localeCompare(b.id));
  const trace: string[] = [];
  const decisionMap = new Map<string, SelectionDecision>();
  const selectedMap = new Map<string, SelectedModule>();
  const deferred: SelectionResult['deferred'] = [];
  const userAdded = new Set(options.userAddedModuleIds ?? []);

  const raise = (field: string, moduleId: string, declined: boolean) => {
    const mod = byId.get(moduleId);
    const blocking = !declined && Boolean(mod?.riskFactors?.length || field === 'mode');
    const existing = decisionMap.get(field);
    if (existing) {
      if (!existing.moduleIds.includes(moduleId)) existing.moduleIds.push(moduleId);
      existing.blocking = existing.blocking || blocking;
      existing.moduleIds.sort();
      return;
    }
    decisionMap.set(field, {
      field,
      blocking,
      code: declined ? 'DECLINED_FIELD' : 'UNKNOWN_FIELD',
      message: declined
        ? `Field ${field} is DECLINED; module ${moduleId} did not match.`
        : `Field ${field} is UNKNOWN; module ${moduleId} cannot be decided.`,
      moduleIds: [moduleId],
    });
  };

  const consider = (mod: ModuleDefinition, forced?: SelectedModule['reason']): boolean => {
    if (selectedMap.has(mod.id) || deferred.some((d) => d.id === mod.id)) return selectedMap.has(mod.id);
    const match = forced ? { matched: true, reason: forced, unknownFields: [] as string[], declinedFields: [] as string[], notes: [forced] } : matchModule(profile, mod);
    for (const field of match.unknownFields) {
      if (mod.applicability.mode === 'RULES' && mod.applicability.onUnknown === 'RAISE_DECISION') raise(field, mod.id, false);
    }
    for (const field of match.declinedFields) {
      if (mod.applicability.mode === 'RULES' && mod.applicability.onUnknown === 'RAISE_DECISION') raise(field, mod.id, true);
    }
    trace.push(`${mod.id}: ${match.notes.join('; ')} => ${match.matched ? match.reason : 'no-match'}`);
    if (!match.matched && !forced) return false;
    if (phaseIndex(String(mod.phase)) > phaseIndex(platformPhase)) {
      deferred.push({ id: mod.id, reason: 'PHASE_NOT_AVAILABLE' });
      trace.push(`${mod.id}: PHASE_NOT_AVAILABLE (${mod.phase} > ${platformPhase})`);
      return false;
    }
    selectedMap.set(mod.id, { moduleId: mod.id, moduleVersion: mod.version, reason: match.reason, trace: match.notes });
    return true;
  };

  for (const mod of ordered) consider(mod);
  for (const id of [...userAdded].sort()) {
    const mod = byId.get(id);
    if (mod) consider(mod, 'USER_ADDED');
  }

  // Dependencies (stable id order, recompute until fixed point).
  let added = true;
  while (added) {
    added = false;
    for (const selected of [...selectedMap.values()].sort((a, b) => a.moduleId.localeCompare(b.moduleId))) {
      const mod = byId.get(selected.moduleId);
      if (!mod) continue;
      for (const depId of [...mod.dependsOn].sort()) {
        if (selectedMap.has(depId)) continue;
        const dep = byId.get(depId);
        if (!dep) continue;
        if (rulesFalseOnKnown(profile, dep)) {
          const existing = decisionMap.get(depId);
          const decision: SelectionDecision = existing ?? {
            field: depId,
            blocking: true,
            code: 'DEPENDENCY_CONTRADICTS_PROFILE',
            message: `Module ${selected.moduleId} depends on ${depId}, whose rules are false on KNOWN profile data.`,
            moduleIds: [selected.moduleId, depId],
          };
          if (existing && !existing.moduleIds.includes(selected.moduleId)) existing.moduleIds.push(selected.moduleId);
          decisionMap.set(depId, decision);
          selectedMap.delete(selected.moduleId);
          trace.push(`${selected.moduleId}: DEPENDENCY_CONTRADICTS_PROFILE (${depId})`);
          added = true;
          break;
        }
        if (deferred.some((d) => d.id === depId)) continue;
        const before = selectedMap.size;
        consider(dep, 'DEPENDENCY');
        if (selectedMap.size !== before) added = true;
      }
    }
  }

  const selectedIds = [...selectedMap.keys()].sort();
  for (let i = 0; i < selectedIds.length; i++) {
    for (let j = i + 1; j < selectedIds.length; j++) {
      const a = byId.get(selectedIds[i]);
      const b = byId.get(selectedIds[j]);
      if (a?.conflictsWith?.includes(selectedIds[j]) || b?.conflictsWith?.includes(selectedIds[i])) {
        return {
          selected: [],
          deferred: [],
          decisions: [{
            field: 'modules',
            blocking: true,
            code: 'MODULE_CONFLICT',
            message: `Selected modules ${selectedIds[i]} and ${selectedIds[j]} conflict.`,
            moduleIds: [selectedIds[i], selectedIds[j]],
          }],
          capabilities: [],
          trace,
          error: 'MODULE_CONFLICT',
        };
      }
    }
  }

  const selected = sortById([...selectedMap.values()], 'moduleId');
  const selectedCaps = new Map<string, { id: string; generationPhase: string }>();
  for (const item of selected) {
    const mod = byId.get(item.moduleId);
    for (const capId of mod?.capabilities ?? []) {
      const cap = capById.get(capId);
      if (!cap) continue;
      if (phaseIndex(String(cap.generationPhase)) > phaseIndex(platformPhase)) continue;
      selectedCaps.set(cap.id, { id: cap.id, generationPhase: String(cap.generationPhase) });
    }
  }

  const decisions = [...decisionMap.values()].sort((a, b) => a.field.localeCompare(b.field));
  const contradiction = decisions.find((d) => d.code === 'DEPENDENCY_CONTRADICTS_PROFILE');
  deferred.sort((a, b) => a.id.localeCompare(b.id));

  return {
    selected,
    deferred,
    decisions,
    capabilities: [...selectedCaps.values()].sort((a, b) => a.id.localeCompare(b.id)),
    trace,
    error: contradiction ? 'DEPENDENCY_CONTRADICTS_PROFILE' : undefined,
  };
}
