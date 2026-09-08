[CmdletBinding()]
param(
    [Parameter()]
    [ValidatePattern('^[^/]+/[^/]+$')]
    [string]$Repository = 'JayPVentures-LLC/jayventures-labs'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-GitHubApiJson {
    param(
        [Parameter(Mandatory)]
        [ValidateSet('GET', 'PATCH', 'PUT')]
        [string]$Method,

        [Parameter(Mandatory)]
        [string]$Endpoint,

        [Parameter()]
        [hashtable]$Body
    )

    $arguments = @(
        'api',
        '--method', $Method,
        '-H', 'Accept: application/vnd.github+json',
        '-H', 'X-GitHub-Api-Version: 2026-03-10',
        $Endpoint
    )

    if ($PSBoundParameters.ContainsKey('Body')) {
        $payload = $Body | ConvertTo-Json -Compress -Depth 10
        $arguments += @('--input', '-')
        $raw = $payload | & gh @arguments
    }
    else {
        $raw = & gh @arguments
    }

    if ($LASTEXITCODE -ne 0) {
        throw "GitHub API request failed: $Method $Endpoint"
    }

    if ([string]::IsNullOrWhiteSpace(($raw -join "`n"))) {
        return $null
    }

    return (($raw -join "`n") | ConvertFrom-Json)
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI (gh) is required on the authorized execution host.'
}

& gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
    throw 'GitHub CLI is not authenticated on the authorized execution host.'
}

$repoRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($repoRoot)) {
    throw 'Run this command from the checked-out jayventures-labs repository.'
}

$workflowRoot = Join-Path $repoRoot '.github/workflows'
if (Test-Path $workflowRoot) {
    throw 'GITHUB_ACTIONS_WORKFLOW_SURFACE_PRESENT'
}

$codeqlEndpoint = "repos/$Repository/code-scanning/default-setup"
$actionsEndpoint = "repos/$Repository/actions/permissions"

# Retire CodeQL default setup first because GitHub default setup executes through GitHub Actions.
Invoke-GitHubApiJson -Method PATCH -Endpoint $codeqlEndpoint -Body @{
    "state" = "not-configured"
} | Out-Null

# Disable the repository Actions execution surface after default setup is retired.
Invoke-GitHubApiJson -Method PUT -Endpoint $actionsEndpoint -Body @{
    "enabled" = $false
} | Out-Null

$codeqlReadback = Invoke-GitHubApiJson -Method GET -Endpoint $codeqlEndpoint
$actionsReadback = Invoke-GitHubApiJson -Method GET -Endpoint $actionsEndpoint

if ($null -eq $codeqlReadback -or $codeqlReadback.state -ne 'not-configured') {
    throw 'CODEQL_DEFAULT_SETUP_NOT_RETIRED'
}

if ($null -eq $actionsReadback -or [bool]$actionsReadback.enabled) {
    throw 'GITHUB_ACTIONS_STILL_ENABLED'
}

$receipt = [ordered]@{
    repository = $Repository
    codeql_default_setup = $codeqlReadback.state
    github_actions_enabled = [bool]$actionsReadback.enabled
    workflows_present = [bool](Test-Path $workflowRoot)
    verified_at = [DateTimeOffset]::UtcNow.ToString('o')
}

$receipt | ConvertTo-Json -Depth 5
