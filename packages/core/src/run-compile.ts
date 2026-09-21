import { classifyRisk } from './classify-risk.ts';
import { compileProjectOs } from './compile.ts';
import { buildProfile } from './profile-from-idea.ts';
import { selectModules } from './select-modules.ts';
import { validateProfile } from './validate-profile.ts';
import { buildZip } from './zip.ts';
import type { CapabilityRegistry, CompileRequest, CompileResult, ModuleRegistry } from './types.ts';

export type CompileDeps = {
  moduleRegistry: ModuleRegistry;
  capabilityRegistry: CapabilityRegistry;
  now?: string;
  platformPhase?: string;
};

export function runCompile(request: CompileRequest, deps: CompileDeps): CompileResult {
  const generatedAt = request.generatedAt ?? deps.now;
  if (!generatedAt) {
    return { ok: false, code: 'PROFILE_INVALID', issues: ['generatedAt is required (compiler is clock-free)'] };
  }

  let profileInput: unknown = request.profile;
  if (!profileInput) {
    const idea = (request.idea ?? '').trim();
    if (!idea && !request.form?.name) {
      return { ok: false, code: 'PROFILE_INVALID', issues: ['Provide idea text or a profile JSON document.'] };
    }
    profileInput = buildProfile({ idea: idea || request.form?.name || 'Untitled project', form: request.form, now: generatedAt });
  }

  const validated = validateProfile(profileInput);
  if (!validated.ok) return validated;

  const profile = classifyRisk(validated.profile);
  const selection = selectModules(
    profile,
    deps.moduleRegistry,
    deps.capabilityRegistry,
    deps.platformPhase ?? 'P0',
    { userAddedModuleIds: request.userAddedModuleIds },
  );

  if (selection.error === 'REGISTRY_INVALID' || selection.error === 'MODULE_CONFLICT') {
    return { ok: false, code: selection.error, issues: [selection.decisions[0]?.message ?? selection.error], selection };
  }

  const files = compileProjectOs({ profile, selection, generatedAt });
  return { ok: true, profile, selection, files, generatedAt };
}

export function zipCompile(request: CompileRequest, deps: CompileDeps): CompileResult & { zip?: Uint8Array } {
  const result = runCompile(request, deps);
  if (!result.ok) return result;
  return { ...result, zip: buildZip(result.files) };
}
