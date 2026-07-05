#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = {
  manifest: path.resolve(root, 'REPOSITORY_MANIFEST.json'),
  deploymentRegistry: path.resolve(root, 'deployment-registry.json'),
  routingMap: path.resolve(root, 'repo-routing-map.md'),
  repoStatus: path.resolve(root, 'REPO_STATUS.md'),
  intentContract: path.resolve(root, 'governance/jpv-os/intent-normalization-contract.json'),
  executiveStateModel: path.resolve(root, 'governance/jpv-os/executive-state-model.json'),
  publicReadinessGate: path.resolve(root, 'governance/jpv-os/public-readiness-gate.json'),
  directiveII: path.resolve(root, 'governance/jpv-os/constitutional-directive-ii-human-capability-infrastructure.json'),
  missionAlignmentPolicy: path.resolve(root, 'governance/jpv-os/mission-alignment-policy.json'),
  executiveOperatingModel: path.resolve(root, 'governance/jpv-os/executive-operating-model.json'),
  permanentExecutiveBacklog: path.resolve(root, 'governance/jpv-os/permanent-executive-systems-backlog.json'),
  freedomIndexHriMeasurement: path.resolve(root, 'governance/jpv-os/freedom-index-hri-measurement.json'),
  frictionToImprovementPolicy: path.resolve(root, 'governance/jpv-os/friction-to-improvement-policy.json'),
  constitutionalReleaseGatePolicy: path.resolve(root, 'governance/jpv-os/constitutional-release-gate-policy.json')
};

const requiredSystemLayerFiles = [
  'governance/jpv-os/runtime-registry.json',
  'governance/jpv-os/decision-and-friction-policy.json',
  'governance/jpv-os/operator-safety-policy.json',
  'governance/jpv-os/lifecycle-archive-policy.json',
  'governance/jpv-os/relationship-map-contract.json',
  'governance/jpv-os/offer-engine-contract.json',
  'governance/jpv-os/completion-gates.json',
  'governance/jpv-os/founder-operator-mode.json',
  'governance/jpv-os/project-aurora-directive.json',
  'governance/jpv-os/constitutional-directive-ii-human-capability-infrastructure.json',
  'governance/jpv-os/mission-alignment-policy.json',
  'governance/jpv-os/executive-operating-model.json',
  'governance/jpv-os/permanent-executive-systems-backlog.json',
  'governance/jpv-os/freedom-index-hri-measurement.json',
  'governance/jpv-os/friction-to-improvement-policy.json',
  'governance/jpv-os/constitutional-release-gate-policy.json'
].map((rel) => path.resolve(root, rel));

const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing required file: ${label} (${path.relative(root, filePath)})`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`Invalid JSON in ${label}: ${message}`);
    return null;
  }
}

function requireFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing required file: ${label} (${path.relative(root, filePath)})`);
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateRepositoryManifest(manifest) {
  if (!manifest) return;

  const repository = manifest.repository ?? {};
  const executionBoundary = manifest.executionBoundary ?? {};

  if (manifest.schemaVersion !== '1.0.0') fail('REPOSITORY_MANIFEST.json schemaVersion must be 1.0.0');
  if (!isNonEmptyString(repository.purpose)) fail('REPOSITORY_MANIFEST.json repository.purpose is required');
  if (!isNonEmptyString(repository.owner)) fail('REPOSITORY_MANIFEST.json repository.owner is required');
  if (!['production', 'non-production'].includes(repository.productionStatus)) {
    fail('REPOSITORY_MANIFEST.json repository.productionStatus must be production or non-production');
  }
  if (!Array.isArray(repository.runtime) || repository.runtime.length === 0) {
    fail('REPOSITORY_MANIFEST.json repository.runtime must be a non-empty array');
  }
  if (!Array.isArray(repository.lane) || repository.lane.length === 0) {
    fail('REPOSITORY_MANIFEST.json repository.lane must be a non-empty array');
  }

  if (executionBoundary.nexusProductionSourceOfTruth !== 'jaypVLabs/JPV-OS') {
    fail('REPOSITORY_MANIFEST.json executionBoundary.nexusProductionSourceOfTruth must be jaypVLabs/JPV-OS');
  }

  if (executionBoundary.nexusProductionRoutingAllowed !== false) {
    fail('REPOSITORY_MANIFEST.json executionBoundary.nexusProductionRoutingAllowed must be false');
  }

  if (manifest.constitutionalDirective?.project !== 'AURORA') {
    fail('REPOSITORY_MANIFEST.json constitutionalDirective.project must be AURORA');
  }

  if (manifest.optimizationTarget !== 'life') {
    fail('REPOSITORY_MANIFEST.json optimizationTarget must be life');
  }

  const layers = manifest.systemLayers ?? {};
  const expectedLayers = [
    'trust',
    'entitlement',
    'revenueCommand',
    'publicReadinessGate',
    'operatorSafety',
    'lifecycleArchive',
    'relationshipMap',
    'offerEngine',
    'learningLoop',
    'proofOfWorkDashboard'
  ];

  for (const layer of expectedLayers) {
    if (!['active', 'planned'].includes(layers[layer])) {
      fail(`REPOSITORY_MANIFEST.json systemLayers.${layer} must be active or planned`);
    }
  }
}

function validateDeploymentRegistry(registry) {
  if (!registry) return;

  if (registry.schemaVersion !== '1.0.0') fail('deployment-registry.json schemaVersion must be 1.0.0');
  if (!isNonEmptyString(registry.generatedAtUtc)) fail('deployment-registry.json generatedAtUtc is required');
  if (!Array.isArray(registry.repositories) || registry.repositories.length === 0) {
    fail('deployment-registry.json repositories must be a non-empty array');
  }
  if (!Array.isArray(registry.deployments) || registry.deployments.length === 0) {
    fail('deployment-registry.json deployments must be a non-empty array');
    return;
  }

  const requiredDeploymentFields = [
    'id',
    'service',
    'deploymentSource',
    'deploymentTarget',
    'environment',
    'productionUrl',
    'workflow',
    'branch',
    'lastDeployment',
    'lastFailure',
    'rollbackTarget',
    'lane',
    'workflowOwner'
  ];

  for (const deployment of registry.deployments) {
    for (const field of requiredDeploymentFields) {
      if (!isNonEmptyString(deployment[field])) {
        fail(`deployment-registry.json deployment ${deployment.id ?? '<unknown>'} missing required field: ${field}`);
      }
    }

    if (typeof deployment.productionUrl === 'string' && !deployment.productionUrl.startsWith('https://')) {
      fail(`deployment-registry.json deployment ${deployment.id ?? '<unknown>'} productionUrl must use https://`);
    }
  }

  const nexus = registry.deployments.find((item) => item.id === 'nexus-production-reference');
  if (!nexus) {
    fail('deployment-registry.json must include deployment id nexus-production-reference');
  } else {
    if (nexus.deploymentSource !== 'jaypVLabs/JPV-OS') {
      fail('deployment-registry.json nexus-production-reference deploymentSource must be jaypVLabs/JPV-OS');
    }
    if (nexus.readOnlyReference !== true) {
      fail('deployment-registry.json nexus-production-reference readOnlyReference must be true');
    }
  }
}

function validateIntentContract(intentContract) {
  if (!intentContract) return;

  if (intentContract.manualRoutingAllowed !== false) {
    fail('intent-normalization-contract.json manualRoutingAllowed must be false');
  }

  const commands = new Set((intentContract.commands ?? []).map((item) => item.command));
  const requiredCommands = [
    'Deploy Nexus',
    'Fix it',
    'Do it',
    'Next',
    'Check it',
    'Release',
    'Approve',
    'Merge',
    'Validate',
    'Rollback',
    'Summarize',
    'show money blockers',
    'protect revenue',
    'publish offer',
    'check checkout',
    'show unpaid opportunities',
    'get it done',
    "what's next",
    'check blockers',
    'review money',
    'route work',
    'shut up'
  ];

  for (const command of requiredCommands) {
    if (!commands.has(command)) {
      fail(`intent-normalization-contract.json missing required command: ${command}`);
    }
  }
}

function validateExecutiveStateModel(stateModel) {
  if (!stateModel) return;

  const requiredViews = ['live', 'broken', 'blocked', 'waiting', 'money', 'next'];
  const viewKeys = new Set((stateModel.views ?? []).map((view) => view.key));
  for (const key of requiredViews) {
    if (!viewKeys.has(key)) {
      fail(`executive-state-model.json missing required view: ${key}`);
    }
  }

  const metrics = new Set(stateModel.proofOfWorkDashboard?.metrics ?? []);
  const requiredMetrics = ['systemsBuilt', 'peopleHelped', 'risksReduced', 'revenueProtected', 'workAutomated', 'blockersRemoved'];
  for (const metric of requiredMetrics) {
    if (!metrics.has(metric)) {
      fail(`executive-state-model.json proofOfWorkDashboard missing metric: ${metric}`);
    }
  }
}

function validatePublicReadiness(publicReadinessGate) {
  if (!publicReadinessGate) return;

  const checks = new Set(publicReadinessGate.checks ?? []);
  const requiredChecks = ['brandAlignment', 'legalBasics', 'routeHealth', 'checkout', 'contactPath', 'mobileView', 'rollback'];
  for (const check of requiredChecks) {
    if (!checks.has(check)) {
      fail(`public-readiness-gate.json missing required check: ${check}`);
    }
  }

  if (publicReadinessGate.requiredForPublicRelease !== true) {
    fail('public-readiness-gate.json requiredForPublicRelease must be true');
  }
}

function validateFounderOperatorMode() {
  const modePath = path.resolve(root, 'governance/jpv-os/founder-operator-mode.json');
  const mode = readJson(modePath, 'governance/jpv-os/founder-operator-mode.json');
  if (!mode) return;

  if (mode.jayMode?.enabled !== true) {
    fail('founder-operator-mode.json jayMode.enabled must be true');
  }

  if (mode.jayMode?.advisorLoopDefault !== false) {
    fail('founder-operator-mode.json jayMode.advisorLoopDefault must be false');
  }

  if (mode.natureMobileMode?.enabled !== true) {
    fail('founder-operator-mode.json natureMobileMode.enabled must be true');
  }

  if (mode.moneyProtectionMode?.enabled !== true) {
    fail('founder-operator-mode.json moneyProtectionMode.enabled must be true');
  }

  if (mode.oneTapApprovalQueue?.enabled !== true) {
    fail('founder-operator-mode.json oneTapApprovalQueue.enabled must be true');
  }
}

function validateAuroraDirective() {
  const auroraPath = path.resolve(root, 'governance/jpv-os/project-aurora-directive.json');
  const aurora = readJson(auroraPath, 'governance/jpv-os/project-aurora-directive.json');
  if (!aurora) return;

  if (aurora.directive?.project !== 'AURORA') {
    fail('project-aurora-directive.json directive.project must be AURORA');
  }

  if (aurora.directive?.priority !== 'highest') {
    fail('project-aurora-directive.json directive.priority must be highest');
  }

  if (!Array.isArray(aurora.executiveModules) || aurora.executiveModules.length < 20) {
    fail('project-aurora-directive.json executiveModules must include the full executive module set');
  }

  if (aurora.engineeringRule?.rejectIfNoImprovement !== true) {
    fail('project-aurora-directive.json engineeringRule.rejectIfNoImprovement must be true');
  }

  const linked = new Set(aurora.linkedConstitutionalArtifacts ?? []);
  const requiredLinked = [
    'governance/jpv-os/constitutional-directive-ii-human-capability-infrastructure.json',
    'governance/jpv-os/mission-alignment-policy.json',
    'governance/jpv-os/executive-operating-model.json',
    'governance/jpv-os/permanent-executive-systems-backlog.json',
    'governance/jpv-os/freedom-index-hri-measurement.json',
    'governance/jpv-os/friction-to-improvement-policy.json',
    'governance/jpv-os/constitutional-release-gate-policy.json'
  ];
  for (const artifact of requiredLinked) {
    if (!linked.has(artifact)) {
      fail(`project-aurora-directive.json missing linked constitutional artifact: ${artifact}`);
    }
  }
}

function validateDirectiveII(directiveII) {
  if (!directiveII) return;

  if (directiveII.directive?.id !== 'constitutional-directive-ii') {
    fail('constitutional-directive-ii-human-capability-infrastructure.json directive.id must be constitutional-directive-ii');
  }

  if (directiveII.equationEnforcement?.rejectIfChainBroken !== true) {
    fail('constitutional-directive-ii-human-capability-infrastructure.json equationEnforcement.rejectIfChainBroken must be true');
  }

  const precedence = directiveII.policyPrecedence?.order ?? [];
  if (precedence[0] !== 'PEOPLE-PROTECTION.md') {
    fail('constitutional-directive-ii-human-capability-infrastructure.json policyPrecedence.order must begin with PEOPLE-PROTECTION.md');
  }
}

function validateMissionAlignmentPolicy(missionAlignmentPolicy) {
  if (!missionAlignmentPolicy) return;

  if (missionAlignmentPolicy.policy?.failClosed !== true) {
    fail('mission-alignment-policy.json policy.failClosed must be true');
  }

  const progression = missionAlignmentPolicy.humanCapabilityAcceptanceCriteria?.requiredProgression ?? [];
  if (!Array.isArray(progression) || progression.length !== 7) {
    fail('mission-alignment-policy.json humanCapabilityAcceptanceCriteria.requiredProgression must include 7 required steps');
  }

  if (missionAlignmentPolicy.requiredGovernanceMetadata?.lifeCapital?.requiredAtLeastOne !== true) {
    fail('mission-alignment-policy.json requiredGovernanceMetadata.lifeCapital.requiredAtLeastOne must be true');
  }

  if (missionAlignmentPolicy.requiredGovernanceMetadata?.humanInfrastructurePillars?.requiredAtLeastOne !== true) {
    fail('mission-alignment-policy.json requiredGovernanceMetadata.humanInfrastructurePillars.requiredAtLeastOne must be true');
  }
}

function validateExecutiveOperatingModel(executiveOperatingModel) {
  if (!executiveOperatingModel) return;

  const classes = new Set((executiveOperatingModel.decisionClasses ?? []).map((item) => item.class));
  const requiredClasses = ['ignore', 'archive', 'automate', 'delegate', 'research', 'escalate', 'approve', 'execute'];
  for (const decisionClass of requiredClasses) {
    if (!classes.has(decisionClass)) {
      fail(`executive-operating-model.json missing decision class: ${decisionClass}`);
    }
  }

  const rejectDesignsThatIncrease = new Set(executiveOperatingModel.quietInfrastructureConstraints?.rejectDesignsThatIncrease ?? []);
  if (!rejectDesignsThatIncrease.has('bureaucracy')) {
    fail('executive-operating-model.json quietInfrastructureConstraints.rejectDesignsThatIncrease must include bureaucracy');
  }
}

function validatePermanentExecutiveBacklog(permanentExecutiveBacklog) {
  if (!permanentExecutiveBacklog) return;

  const systems = new Set((permanentExecutiveBacklog.systems ?? []).map((item) => item.name));
  const requiredSystems = [
    'founder-dashboard',
    'curiosity-engine',
    'opportunity-radar',
    'relationship-intelligence',
    'personal-cfo',
    'health-intelligence',
    'thinking-capture',
    'emotional-friction-engine',
    'anti-burnout-intelligence',
    'wisdom-engine',
    'serendipity-engine',
    'environment-intelligence',
    'reputation-guardian',
    'personal-knowledge-graph',
    'mission-alignment-engine',
    'recovery-intelligence',
    'joy-optimizer'
  ];
  for (const system of requiredSystems) {
    if (!systems.has(system)) {
      fail(`permanent-executive-systems-backlog.json missing system: ${system}`);
    }
  }
}

function validateFreedomIndexHriMeasurement(freedomIndexHriMeasurement) {
  if (!freedomIndexHriMeasurement) return;

  if (freedomIndexHriMeasurement.measurement?.primaryKpi !== 'freedom-index') {
    fail('freedom-index-hri-measurement.json measurement.primaryKpi must be freedom-index');
  }

  if (freedomIndexHriMeasurement.measurement?.ultimateKpi !== 'human-return-on-infrastructure') {
    fail('freedom-index-hri-measurement.json measurement.ultimateKpi must be human-return-on-infrastructure');
  }

  if (freedomIndexHriMeasurement.initiativeMeasurementRequirement?.required !== true) {
    fail('freedom-index-hri-measurement.json initiativeMeasurementRequirement.required must be true');
  }
}

function validateFrictionToImprovementPolicy(frictionToImprovementPolicy) {
  if (!frictionToImprovementPolicy) return;

  if (frictionToImprovementPolicy.automation?.onThresholdAction !== 'create-governed-improvement-task') {
    fail('friction-to-improvement-policy.json automation.onThresholdAction must be create-governed-improvement-task');
  }

  if (frictionToImprovementPolicy.reviewCheckpoints?.blockPhaseAdvanceIfRecurringBurdenUnaddressed !== true) {
    fail('friction-to-improvement-policy.json reviewCheckpoints.blockPhaseAdvanceIfRecurringBurdenUnaddressed must be true');
  }
}

function validateConstitutionalReleaseGatePolicy(constitutionalReleaseGatePolicy) {
  if (!constitutionalReleaseGatePolicy) return;

  if (constitutionalReleaseGatePolicy.policy?.failClosed !== true) {
    fail('constitutional-release-gate-policy.json policy.failClosed must be true');
  }

  const rejectionCriteria = new Set(constitutionalReleaseGatePolicy.explicitRejectionCriteria ?? []);
  const requiredRejections = [
    'increases-cognitive-load-without-offset',
    'adds-bureaucracy-without-life-capital-gain',
    'adds-unnecessary-decisions',
    'requires-repetitive-manual-work'
  ];
  for (const rejection of requiredRejections) {
    if (!rejectionCriteria.has(rejection)) {
      fail(`constitutional-release-gate-policy.json missing rejection criterion: ${rejection}`);
    }
  }

  if (constitutionalReleaseGatePolicy.routingBoundaryEnforcement?.nexusProductionSourceOfTruth !== 'jaypVLabs/JPV-OS') {
    fail('constitutional-release-gate-policy.json routingBoundaryEnforcement.nexusProductionSourceOfTruth must be jaypVLabs/JPV-OS');
  }
}

const manifest = readJson(files.manifest, 'REPOSITORY_MANIFEST.json');
const deploymentRegistry = readJson(files.deploymentRegistry, 'deployment-registry.json');
const intentContract = readJson(files.intentContract, 'governance/jpv-os/intent-normalization-contract.json');
const executiveStateModel = readJson(files.executiveStateModel, 'governance/jpv-os/executive-state-model.json');
const publicReadinessGate = readJson(files.publicReadinessGate, 'governance/jpv-os/public-readiness-gate.json');
const directiveII = readJson(files.directiveII, 'governance/jpv-os/constitutional-directive-ii-human-capability-infrastructure.json');
const missionAlignmentPolicy = readJson(files.missionAlignmentPolicy, 'governance/jpv-os/mission-alignment-policy.json');
const executiveOperatingModel = readJson(files.executiveOperatingModel, 'governance/jpv-os/executive-operating-model.json');
const permanentExecutiveBacklog = readJson(files.permanentExecutiveBacklog, 'governance/jpv-os/permanent-executive-systems-backlog.json');
const freedomIndexHriMeasurement = readJson(files.freedomIndexHriMeasurement, 'governance/jpv-os/freedom-index-hri-measurement.json');
const frictionToImprovementPolicy = readJson(files.frictionToImprovementPolicy, 'governance/jpv-os/friction-to-improvement-policy.json');
const constitutionalReleaseGatePolicy = readJson(files.constitutionalReleaseGatePolicy, 'governance/jpv-os/constitutional-release-gate-policy.json');

requireFile(files.routingMap, 'repo-routing-map.md');
requireFile(files.repoStatus, 'REPO_STATUS.md');
for (const layerFile of requiredSystemLayerFiles) {
  requireFile(layerFile, path.relative(root, layerFile));
}

validateRepositoryManifest(manifest);
validateDeploymentRegistry(deploymentRegistry);
validateIntentContract(intentContract);
validateExecutiveStateModel(executiveStateModel);
validatePublicReadiness(publicReadinessGate);
validateFounderOperatorMode();
validateAuroraDirective();
validateDirectiveII(directiveII);
validateMissionAlignmentPolicy(missionAlignmentPolicy);
validateExecutiveOperatingModel(executiveOperatingModel);
validatePermanentExecutiveBacklog(permanentExecutiveBacklog);
validateFreedomIndexHriMeasurement(freedomIndexHriMeasurement);
validateFrictionToImprovementPolicy(frictionToImprovementPolicy);
validateConstitutionalReleaseGatePolicy(constitutionalReleaseGatePolicy);

if (failures.length > 0) {
  console.error('Governance metadata validation failed:');
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('Governance metadata validation passed.');
