[CmdletBinding()]
param([string]$RepositoryRoot)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
    $RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
}

$path = Join-Path $RepositoryRoot 'JPV-INSTITUTIONAL-INHERITANCE.json'
if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw 'JPV_COMPLETION_BOUNDED_INHERITANCE_FAILURE: inheritance artifact missing' }
$cfg = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json

$requiredTrue = @(
    'completion_bounded_work_sessions_required',
    'settled_corrections_inherit_as_operating_state',
    'status_only_completion_forbidden',
    'duplicate_founder_escalation_forbidden',
    'protected_off_time_requires_explicit_work_admission',
    'recurring_settled_failure_routes_to_regression_remediation',
    'completion_bounded_execution_drift_blocks_launch'
)
foreach ($name in $requiredTrue) {
    if ($cfg.$name -ne $true) { throw "JPV_COMPLETION_BOUNDED_INHERITANCE_FAILURE: $name must be true" }
}
if ($cfg.local_overrides_may_weaken_baseline -ne $false) { throw 'JPV_COMPLETION_BOUNDED_INHERITANCE_FAILURE: local overrides may not weaken baseline' }
if ($cfg.canonical_governance_source -ne 'JayPVentures-LLC/jpv-governance@35d5d82271012071a69b2e8886d5988562ca071e') { throw 'JPV_COMPLETION_BOUNDED_INHERITANCE_FAILURE: canonical source drift' }

$requiredStates = @('COMPLETED_RESULT','VERIFIED_BLOCKER','SINGLE_NECESSARY_FOUNDER_DECISION','HARD_TOOL_OR_AUTHORITY_BOUNDARY','EXPLICIT_FOUNDER_PAUSE')
foreach ($state in $requiredStates) {
    if ($state -notin $cfg.required_terminal_states) { throw "JPV_COMPLETION_BOUNDED_INHERITANCE_FAILURE: missing terminal state $state" }
}

[ordered]@{ status='PASS'; control_id='JPV-COMPLETION-BOUNDED-INHERITANCE-001'; validated_at_utc=[DateTime]::UtcNow.ToString('o') } | ConvertTo-Json
