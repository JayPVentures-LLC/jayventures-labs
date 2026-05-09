# scripts/entra/saml-app-verify.ps1

param(
  [Parameter(Mandatory = $true)]
  [string]$DisplayName,

  [Parameter(Mandatory = $false)]
  [string]$ManifestPath
)

$ErrorActionPreference = "Stop"

Import-Module Microsoft.Graph.Applications -ErrorAction Stop
Import-Module Microsoft.Graph.Groups -ErrorAction Stop

if (-not (Get-MgContext)) {
  Connect-MgGraph -Scopes @(
    "Application.Read.All",
    "Directory.Read.All",
    "Group.Read.All"
  )
}

# Find application by display name
$escapedDisplayName = $DisplayName -replace "'", "''"
$app = Get-MgApplication -Filter "displayName eq '$escapedDisplayName'" -ConsistencyLevel eventual | Select-Object -First 1
if (-not $app) {
  throw "Application not found: $DisplayName"
}

# Find service principal by appId
$sp = Get-MgServicePrincipal -Filter "appId eq '$($app.AppId)'" -ConsistencyLevel eventual | Select-Object -First 1
if (-not $sp) {
  throw "Service principal not found for: $DisplayName"
}

if (-not $sp.AppRoleAssignmentRequired) {
  throw "Assignment required is not enabled."
}

if (-not $app.IdentifierUris -or $app.IdentifierUris.Count -eq 0) {
  throw "Missing identifier URI."
}

if (-not $app.Web.RedirectUris -or $app.Web.RedirectUris.Count -eq 0) {
  throw "Missing reply URL / ACS URL."
}

if ($ManifestPath) {
  if (!(Test-Path $ManifestPath)) {
    throw "Manifest not found: $ManifestPath"
  }

  $manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
  if (-not $manifest.groupObjectIds -or $manifest.groupObjectIds.Count -eq 0) {
    throw "Manifest must include at least one approved groupObjectIds entry."
  }

  foreach ($groupId in $manifest.groupObjectIds) {
    $group = Get-MgGroup -GroupId $groupId -ErrorAction Stop
    $assignment = Get-MgGroupAppRoleAssignment `
      -GroupId $groupId `
      -Filter "resourceId eq $($sp.Id)" `
      -ErrorAction SilentlyContinue |
      Select-Object -First 1

    if (-not $assignment) {
      throw "Missing SAML group assignment for $($group.DisplayName) ($groupId)."
    }
  }
}

Write-Host "SAML application verification passed." -ForegroundColor Green
Write-Host "Application: $($app.DisplayName)"
Write-Host "AppId: $($app.AppId)"
Write-Host "ServicePrincipalId: $($sp.Id)"
