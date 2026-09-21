// Generates capabilities/registry.json from .project-os/capability-taxonomy.json + the explicit classification below.
// Every taxonomy entry must be classified exactly once; the script fails otherwise.
// Rerun after editing, then `npm run check`.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const taxonomy = JSON.parse(readFileSync(join(root, '.project-os/capability-taxonomy.json'), 'utf8'));
const list = (s) => s.trim().split(/\s+/);
const PHASES = ['P0', 'P1', 'P2', 'LATER'];

// When a generated Project OS may contain guidance for the capability. See plan/SCOPE.md for rationale.
const GENERATION = {
  P0: list(`
    product.idea_validation product.product_strategy product.prd_generator product.user_stories product.jtbd product.roadmap product.feature_prioritization
    design.design_system design.design_tokens design.responsive_design design.motion design.accessibility design.design_qa
    development.web_apps development.mobile_apps development.browser_extensions development.apis development.cli_tools development.internal_tools development.ecommerce development.marketplaces
    ai.model_routing ai.agents ai.evals ai.guardrails ai.context_engineering ai.token_harness ai.structured_output ai.human_approval ai.claude_code ai.codex ai.cursor_adapter
    backend.database backend.auth backend.authorization backend.multitenancy backend.storage backend.webhooks backend.email backend.rate_limiting backend.background_jobs backend.migrations
    infra.ci_cd infra.environments infra.deployment infra.observability infra.logging infra.backups infra.secrets
    quality.unit_testing quality.integration_testing quality.e2e_testing quality.security_testing quality.accessibility_testing quality.release_gates quality.rollback
    security.threat_model security.owasp security.prompt_injection security.tenant_isolation security.dependency_security security.secret_scanning security.data_classification security.retention security.deletion security.audit_log
    automation.workflow_automation automation.integration_discovery automation.approval_workflows automation.rpa_boundaries
    brand.naming brand.domain_strategy brand.brand_guidelines brand.color_typography brand.messaging brand.taglines brand.positioning
    marketing.market_research marketing.competitors marketing.icp marketing.personas marketing.pricing marketing.monetization marketing.seo marketing.content marketing.socials marketing.community marketing.directories marketing.product_launch
    business.business_model business.cost_model business.terms_privacy_readiness
    analytics.event_taxonomy analytics.product_analytics analytics.web_analytics analytics.funnel
    docs.readme docs.architecture_docs docs.runbooks docs.changelog
    team.task_planning team.handoffs team.code_review`),
  P1: list(`
    product.requirements_traceability product.feedback_synthesis
    design.wireframes design.prototyping design.microinteractions design.iconography design.illustration design.data_visualization design.ux_research design.usability_testing
    development.desktop_apps development.sdk_libraries development.realtime_apps development.pwa
    ai.tool_use ai.rag ai.embeddings ai.vector_search ai.prompt_registry ai.caching ai.fallbacks
    backend.queues backend.cron backend.notifications backend.search backend.cache
    infra.dns_domains infra.cdn infra.tracing infra.metrics infra.alerting infra.disaster_recovery infra.feature_flags infra.cost_monitoring
    quality.visual_regression quality.cross_browser quality.device_testing
    security.incident_response security.vulnerability_management
    automation.triggers automation.scheduled_jobs automation.webhook_automation automation.email_automation automation.crm_automation automation.lead_routing automation.reporting_automation automation.data_sync automation.document_automation
    brand.logo brand.press_kit brand.social_kit brand.app_store_assets brand.screenshots brand.mockups brand.pitch_deck
    image.og_images image.diagrams
    marketing.email_marketing marketing.newsletter marketing.pr marketing.partnerships marketing.affiliates marketing.referrals marketing.utm_attribution
    sales.lead_qualification sales.crm sales.pipeline sales.outreach sales.sales_emails sales.demo sales.proposals sales.quotes
    customer.onboarding customer.activation customer.support customer.knowledge_base customer.feature_requests
    analytics.cohorts analytics.retention analytics.attribution analytics.dashboards analytics.experiments analytics.ab_tests analytics.cro analytics.unit_economics
    business.financial_model business.cac_ltv business.break_even business.budgeting business.forecasting business.vendor_selection business.ip_trademark_checklist
    international.i18n international.locale_formatting
    docs.api_docs docs.release_notes docs.user_guides docs.internal_knowledge
    team.sprints team.contractor_briefs team.raci team.meeting_summaries
    recovery.repo_discovery recovery.stack_detection recovery.dependency_inventory recovery.architecture_inference recovery.tech_debt recovery.migration_plan recovery.os_recovery`),
  P2: list(`
    development.offline_first ai.mcp_connectors quality.load_testing
    image.text_to_image image.image_editing image.background_removal image.upscale image.product_mockups image.ad_creative image.thumbnails image.social_graphics image.infographics
    video.video_strategy video.scripting video.storyboard video.demo_video video.tutorial_video video.short_form video.captions video.subtitles
    audio.voiceover audio.text_to_speech audio.speech_to_text audio.transcription audio.podcast
    marketing.influencers marketing.paid_ads marketing.retargeting
    sales.lead_research sales.followups sales.sales_enablement sales.win_loss
    customer.chatbot customer.ticketing customer.nps_csat customer.reviews customer.testimonials customer.case_studies customer.churn customer.winback
    business.procurement business.tax_accounting_handoff business.insurance_risk_checklist
    international.localization international.translation international.rtl international.multilingual_seo
    docs.tutorials docs.training team.hiring_plan team.job_descriptions team.interview_kits
    recovery.legacy_user_continuity recovery.billing_migration recovery.data_migration
    intelligence.competitor_watch intelligence.pricing_watch intelligence.seo_watch intelligence.channel_discovery intelligence.reputation_watch intelligence.dependency_watch intelligence.cost_drift intelligence.os_drift intelligence.release_watch`),
  LATER: list(`
    video.text_to_video video.image_to_video video.video_editing video.broll video.clipping video.reframing video.transitions video.color_audio_finish video.lipsync video.avatars video.dubbing video.ad_video
    audio.voice_cloning audio.voice_consent audio.audio_editing audio.noise_removal audio.music audio.sound_effects audio.audio_localization
    spatial.image_to_3d spatial.text_to_3d spatial.product_3d spatial.ar_assets spatial.model_optimization
    international.dubbing_localization`),
};

// When 1stStep OS itself performs the capability (beyond writing guidance). Unlisted = LATER.
const EXECUTION = {
  P0: list(`product.idea_validation product.jtbd product.prd_generator product.feature_prioritization marketing.market_research marketing.competitors
    marketing.pricing marketing.icp business.business_model automation.integration_discovery ai.claude_code ai.codex ai.cursor_adapter
    docs.readme docs.architecture_docs team.handoffs`),
  P1: list(`recovery.repo_discovery recovery.stack_detection recovery.dependency_inventory recovery.architecture_inference recovery.tech_debt
    recovery.os_recovery marketing.directories marketing.socials brand.social_kit brand.naming`),
  P2: list(`intelligence.competitor_watch intelligence.pricing_watch intelligence.seo_watch intelligence.channel_discovery intelligence.reputation_watch
    intelligence.dependency_watch intelligence.cost_drift intelligence.os_drift intelligence.release_watch marketing.seo image.og_images brand.screenshots brand.mockups`),
};

const DEPENDS = {
  'audio.voice_cloning': ['audio.voice_consent'],
  'video.avatars': ['audio.voice_consent'],
  'video.lipsync': ['audio.voice_consent'],
  'video.dubbing': ['audio.voice_consent', 'audio.speech_to_text'],
  'international.dubbing_localization': ['video.dubbing', 'international.translation'],
  'audio.audio_localization': ['international.translation'],
  'backend.authorization': ['backend.auth'],
  'backend.multitenancy': ['backend.authorization'],
  'security.tenant_isolation': ['backend.multitenancy'],
  'analytics.ab_tests': ['analytics.experiments'],
  'analytics.cohorts': ['analytics.event_taxonomy'],
  'analytics.funnel': ['analytics.event_taxonomy'],
  'marketing.utm_attribution': ['analytics.web_analytics'],
  'marketing.retargeting': ['analytics.web_analytics'],
  'video.captions': ['audio.transcription'],
  'video.subtitles': ['audio.transcription'],
  'international.rtl': ['international.i18n'],
  'international.localization': ['international.i18n'],
  'international.multilingual_seo': ['marketing.seo', 'international.localization'],
  'automation.approval_workflows': ['ai.human_approval'],
};

const SCOPES = {
  'marketing.socials': ['draft', 'publish', 'account_create'],
  'marketing.directories': ['draft', 'publish', 'account_create'],
  'marketing.product_launch': ['draft', 'publish'],
  'marketing.pr': ['draft', 'publish'],
  'marketing.email_marketing': ['draft', 'publish'],
  'marketing.newsletter': ['draft', 'publish'],
  'marketing.community': ['draft', 'publish'],
  'marketing.influencers': ['draft', 'publish'],
  'marketing.paid_ads': ['draft', 'publish', 'billing'],
  'marketing.retargeting': ['publish', 'billing'],
  'marketing.affiliates': ['draft', 'publish', 'billing'],
  'sales.outreach': ['draft', 'publish'],
  'sales.sales_emails': ['draft', 'publish'],
  'sales.followups': ['draft', 'publish'],
  'sales.crm': ['read', 'draft'],
  'customer.reviews': ['draft', 'publish'],
  'customer.winback': ['draft', 'publish'],
  'customer.chatbot': ['publish'],
  'infra.deployment': ['deploy'],
  'infra.ci_cd': ['deploy'],
  'infra.dns_domains': ['deploy', 'billing', 'destructive'],
  'quality.rollback': ['deploy'],
  'recovery.repo_discovery': ['read'],
  'recovery.data_migration': ['destructive'],
  'recovery.billing_migration': ['billing', 'destructive'],
  'business.procurement': ['billing'],
  'automation.email_automation': ['read', 'draft', 'publish'],
  'automation.crm_automation': ['read', 'draft', 'publish'],
  'automation.data_sync': ['read', 'publish', 'destructive'],
  'automation.document_automation': ['read', 'draft'],
  'automation.reporting_automation': ['read', 'draft'],
  'automation.lead_routing': ['read', 'publish'],
  'intelligence.competitor_watch': ['read'],
  'intelligence.pricing_watch': ['read'],
  'intelligence.seo_watch': ['read'],
  'intelligence.reputation_watch': ['read'],
};

const CONSENT = new Set(list(`audio.voice_cloning video.avatars video.lipsync video.dubbing international.dubbing_localization
  audio.audio_localization customer.testimonials customer.case_studies`));
const GENERATIVE_ONLY = new Set(list(`image.text_to_image video.text_to_video video.image_to_video audio.voice_cloning spatial.text_to_3d
  spatial.image_to_3d audio.music video.avatars video.lipsync`));
const HIGH_COST = new Set(list(`video.text_to_video video.image_to_video video.avatars video.lipsync video.dubbing spatial.text_to_3d
  spatial.image_to_3d audio.voice_cloning marketing.paid_ads international.dubbing_localization`));
const VARIABLE_COST_DOMAINS = new Set(['image', 'video', 'audio', 'spatial', 'intelligence']);
const VARIABLE_COST = new Set(list(`marketing.market_research marketing.competitors marketing.pricing marketing.seo ai.model_routing ai.rag recovery.architecture_inference`));

const OWNER = {
  product: 'orchestrator', design: 'engineering', development: 'engineering', ai: 'engineering', backend: 'engineering',
  infra: 'engineering', quality: 'engineering', security: 'engineering', automation: 'operations', brand: 'business-intelligence',
  image: 'growth', video: 'growth', audio: 'growth', spatial: 'growth', marketing: 'growth', sales: 'growth', customer: 'operations',
  analytics: 'growth', business: 'business-intelligence', international: 'engineering', docs: 'engineering', team: 'orchestrator',
  recovery: 'engineering', intelligence: 'business-intelligence',
};
const BI_MARKETING = new Set(list('marketing.market_research marketing.competitors marketing.icp marketing.personas marketing.pricing marketing.monetization'));
const FILE_OVERRIDES = { 'ai.agents': 'AI_AGENTS.md' };
const TITLE_OVERRIDES = { 'analytics.retention': 'User Retention', 'security.retention': 'Data Retention', 'ai.agents': 'AI Agents' };

function phaseOf(table, id, fallback) {
  const hits = Object.entries(table).filter(([, ids]) => ids.includes(id)).map(([p]) => p);
  if (hits.length > 1) throw new Error(`${id} classified in ${hits.join(', ')}`);
  if (hits.length === 0 && !fallback) throw new Error(`${id} has no generation phase`);
  return hits[0] ?? fallback;
}

const capabilities = [];
for (const [domain, names] of Object.entries(taxonomy.domains)) {
  for (const name of names) {
    const id = `${domain}.${name.toLowerCase()}`;
    const doc = `capabilities/${domain}/${FILE_OVERRIDES[id] ?? `${name}.md`}`;
    if (!existsSync(join(root, doc))) throw new Error(`missing doc ${doc}`);
    const title = TITLE_OVERRIDES[id] ?? readFileSync(join(root, doc), 'utf8').split('\n')[0].replace(/^#\s*/, '').trim();
    const scopes = SCOPES[id] ?? [];
    const consent = CONSENT.has(id);
    let level = 'AUTOMATED';
    if (scopes.includes('account_create')) level = 'ASSISTED';
    else if (consent || scopes.some((s) => ['publish', 'deploy', 'billing', 'destructive'].includes(s))) level = 'AUTOMATED_WITH_APPROVAL';
    const generationPhase = phaseOf(GENERATION, id);
    const executionPhase = phaseOf(EXECUTION, id, 'LATER');
    if (PHASES.indexOf(executionPhase) < PHASES.indexOf(generationPhase)) throw new Error(`${id}: executes before guidance exists`);
    capabilities.push({
      kind: 'CapabilityDefinition',
      schemaVersion: '0.1.0',
      id,
      domain,
      title,
      doc,
      ownerDomain: BI_MARKETING.has(id) ? 'business-intelligence' : OWNER[domain],
      generationPhase,
      executionPhase,
      maxAutomationLevel: level,
      dependsOn: DEPENDS[id] ?? [],
      conflictsWith: [],
      externalActionScopes: scopes,
      consentRequired: consent,
      deterministicFirst: !GENERATIVE_ONLY.has(id),
      costProfile: HIGH_COST.has(id) ? 'HIGH' : VARIABLE_COST_DOMAINS.has(domain) || VARIABLE_COST.has(id) ? 'VARIABLE' : 'LOW',
      status: 'STUB',
    });
  }
}

const known = new Set(capabilities.map((c) => c.id));
for (const table of [GENERATION, EXECUTION]) {
  for (const id of Object.values(table).flat()) if (!known.has(id)) throw new Error(`classification references unknown capability ${id}`);
}
for (const id of [...Object.keys(DEPENDS), ...Object.keys(SCOPES), ...CONSENT, ...GENERATIVE_ONLY, ...HIGH_COST]) {
  if (!known.has(id)) throw new Error(`override references unknown capability ${id}`);
}

capabilities.sort((a, b) => a.id.localeCompare(b.id));
const registry = { kind: 'CapabilityRegistry', schemaVersion: '0.1.0', registryVersion: '0.1.0', generatedBy: 'tools/build-capability-registry.mjs', capabilities };
writeFileSync(join(root, 'capabilities/registry.json'), JSON.stringify(registry, null, 2) + '\n');
const count = (key) => Object.fromEntries(PHASES.map((p) => [p, capabilities.filter((c) => c[key] === p).length]));
console.log(`wrote ${capabilities.length} capabilities`, { generation: count('generationPhase'), execution: count('executionPhase') });
