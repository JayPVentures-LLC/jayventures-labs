[CmdletBinding()]
param([string]$RepositoryRoot)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) { $RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path }

$path = Join-Path $RepositoryRoot 'JPV-INSTITUTIONAL-INHERITANCE.json'
if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw 'JPV_COMPLETION_BOUNDED_INHERITANCE_FAILURE: inheritance artifact missing' }
$cfg = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
foreach ($name in @('canonical_authority_hierarchy_required','desired_state_must_be_preserved','observed_state_must_remain_separate','authority_hierarchy_drift_blocks_launch','completion_bounded_work_sessions_required','settled_corrections_inherit_as_operating_state','status_only_completion_forbidden','duplicate_founder_escalation_forbidden','protected_off_time_requires_explicit_work_admission','recurring_settled_failure_routes_to_regression_remediation','completion_bounded_execution_drift_blocks_launch')) { if ($cfg.$name -ne $true) { throw "JPV_COMPLETION_BOUNDED_INHERITANCE_FAILURE: $name must be true" } }
if ($cfg.local_overrides_may_weaken_baseline -ne $false) { throw 'JPV_COMPLETION_BOUNDED_INHERITANCE_FAILURE: local overrides may not weaken baseline' }
if ($cfg.subordinate_surfaces_may_supersede_canonical_state -ne $false) { throw 'JPV_AUTHORITY_HIERARCHY_VIOLATION: subordinate surfaces may not supersede canonical state' }
if ($cfg.execution_failure_may_rewrite_desired_state -ne $false) { throw 'JPV_AUTHORITY_HIERARCHY_VIOLATION: execution failure may not rewrite desired state' }
if ($cfg.canonical_governance_source -ne 'JayPVentures-LLC/jpv-governance@7c3389b2469a4d39a07d880595dc4affc934af39') { throw 'JPV_AUTHORITY_HIERARCHY_VIOLATION: canonical governance source drift' }
if ($cfg.canonical_authority_runtime_source -ne 'jaypVLabs/JPV-OS@852f129c8bb24d8071c988b67bb10f4cc6272afd') { throw 'JPV_AUTHORITY_HIERARCHY_VIOLATION: canonical runtime source drift' }
foreach ($state in @('COMPLETED_RESULT','VERIFIED_BLOCKER','SINGLE_NECESSARY_FOUNDER_DECISION','HARD_TOOL_OR_AUTHORITY_BOUNDARY','EXPLICIT_FOUNDER_PAUSE')) { if ($state -notin $cfg.required_terminal_states) { throw "JPV_COMPLETION_BOUNDED_INHERITANCE_FAILURE: missing terminal state $state" } }

foreach ($relative in @('JPV-CLAIM-TRUTH-CONSUMER-INHERITANCE.json','operations/governance/claim-truth-consumer.mjs','tests/claim-truth-consumer.test.mjs','tests/disclosure-authorization-consumer.test.ts')) { if (-not (Test-Path -LiteralPath (Join-Path $RepositoryRoot $relative) -PathType Leaf)) { throw "JPV_CLAIM_TRUTH_INHERITANCE_FAILURE: missing $relative" } }
$truth = Get-Content -LiteralPath (Join-Path $RepositoryRoot 'JPV-CLAIM-TRUTH-CONSUMER-INHERITANCE.json') -Raw | ConvertFrom-Json
if ($truth.contract_id -ne 'JPV-CLAIM-TRUTH-PROVENANCE-GATE-V1' -or $truth.contract_version -ne '1.2.0' -or $truth.fail_mode -ne 'CLOSED') { throw 'JPV_CLAIM_TRUTH_INHERITANCE_FAILURE: truth contract drift' }
if ($truth.may_promote_status -ne $false -or $truth.may_expand_authorization_scope -ne $false) { throw 'JPV_CLAIM_TRUTH_INHERITANCE_FAILURE: downstream weakening detected' }

$mergePath = Join-Path $RepositoryRoot 'JPV-GITHUB-MERGE-AUTHORITY-INHERITANCE.json'
if (-not (Test-Path -LiteralPath $mergePath -PathType Leaf)) { throw 'JPV_GITHUB_MERGE_AUTHORITY_INHERITANCE_FAILURE: manifest missing' }
$merge = Get-Content -LiteralPath $mergePath -Raw | ConvertFrom-Json
if ($merge.contract_id -ne 'JPV-GITHUB-MERGE-AUTHORITY-V1' -or $merge.fail_mode -ne 'CLOSED') { throw 'JPV_GITHUB_MERGE_AUTHORITY_INHERITANCE_FAILURE: contract drift' }
if ($merge.same_person_role_multiplicity_counts_as_independence -ne $false) { throw 'JPV_GITHUB_MERGE_AUTHORITY_INHERITANCE_FAILURE: same-person multiplicity cannot satisfy independence' }
if ($merge.machine_authorization_requires_exact_sha -ne $true) { throw 'JPV_GITHUB_MERGE_AUTHORITY_INHERITANCE_FAILURE: exact SHA binding required' }
foreach ($class in @('BRANCH_RULESET','SECURITY_TRUST_ROOT','FINANCIAL_AUTHORITY','LEGAL_COMMITMENT','HUMAN_RIGHTS_OR_PRIVACY','IRREVERSIBLE_RECORD_DELETION','VERIFICATION_WEAKENING','EMERGENCY_BYPASS')) { if ($class -notin $merge.human_required_classes) { throw "JPV_GITHUB_MERGE_AUTHORITY_INHERITANCE_FAILURE: missing high-risk class $class" } }

[ordered]@{status='PASS';control_id='JPV-AUTHORITY-INHERITANCE-001';claim_truth_consumer='BOUND';disclosure_authorization_lifecycle='BOUND';github_merge_authority='BOUND';ruleset_activation_verified=$merge.ruleset_activation_verified;validated_at_utc=[DateTime]::UtcNow.ToString('o')} | ConvertTo-Json