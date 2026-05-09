# scripts/entra/saml-app-verify.ps1

param(
  [Parameter(Mandatory = $true)]
  [string]$DisplayName
)

$ErrorActionPreference = "Stop"

Import-Module Microsoft.Graph.Applications -ErrorAction Stop
Import-Module Microsoft.Graph.Groups -ErrorAction Stop



Connect-MgGraph -Scopes @(
  "Application.Read.All",
  "Directory.Read.All",
  "Group.Read.All"
)

# Find application by display name
$app = Get-MgApplication -All | Where-Object { $_.DisplayName -eq $DisplayName }
if (-not $app) {
  throw "Application not found: $DisplayName"
}

# Find service principal by appId
$sp = Get-MgServicePrincipal -All | Where-Object { $_.AppId -eq $app.AppId }
if (-not $sp) {
  throw "Service principal not found for: $DisplayName"
}

if (-not $sp.AppRoleAssignmentRequired) {
  throw "Assignment required is not enabled."
}

if (-not $app[0].IdentifierUris -or $app[0].IdentifierUris.Count -eq 0) {
  throw "Missing identifier URI."
}

if (-not $app[0].Web.RedirectUris -or $app[0].Web.RedirectUris.Count -eq 0) {
  throw "Missing reply URL / ACS URL."
}

Write-Host "SAML application verification passed." -ForegroundColor Green
Write-Host "Application: $($app[0].DisplayName)"
Write-Host "AppId: $($app[0].AppId)"
Write-Host "ServicePrincipalId: $($sp.Id)"
