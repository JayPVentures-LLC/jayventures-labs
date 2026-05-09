# scripts/entra/saml-app-provision.ps1
# JPV-OS Enterprise SAML SSO Provisioning
# Authority: jaypventuresllc
# Scope: enterprise / institutional / business SaaS identity onboarding

param(
  [Parameter(Mandatory = $true)]
  [string]$ManifestPath
)

$ErrorActionPreference = "Stop"

Write-Host "JPV-OS SAML SSO Provisioning" -ForegroundColor Cyan
Write-Host "Authority: jaypventuresllc" -ForegroundColor Cyan

if (!(Test-Path $ManifestPath)) {
  throw "Manifest not found: $ManifestPath"
}

$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json

$required = @(
  "displayName",
  "identifierUris",
  "replyUrls",
  "logoutUrl",
  "assignmentRequired",
  "groupObjectIds"
)

foreach ($field in $required) {
  if (-not $manifest.$field) {
    throw "Missing required manifest field: $field"
  }
}

Import-Module Microsoft.Graph.Applications -ErrorAction Stop
Import-Module Microsoft.Graph.Groups -ErrorAction Stop

Connect-MgGraph -Scopes `
  "Application.ReadWrite.All",
"AppRoleAssignment.ReadWrite.All",
"Directory.Read.All",
"Group.Read.All"

Write-Host "Connected to Microsoft Graph." -ForegroundColor Green

$existingApp = Get-MgApplication -Filter "displayName eq '$($manifest.displayName)'" -ConsistencyLevel eventual

if ($existingApp) {
  Write-Host "Application exists: $($manifest.displayName)" -ForegroundColor Yellow
  $app = $existingApp[0]
}
else {
  Write-Host "Creating application: $($manifest.displayName)" -ForegroundColor Green

  $app = New-MgApplication `
    -DisplayName $manifest.displayName `
    -IdentifierUris $manifest.identifierUris `
    -Web @{
    RedirectUris = $manifest.replyUrls
    LogoutUrl    = $manifest.logoutUrl
  }
}

$sp = Get-MgServicePrincipal -Filter "appId eq '$($app.AppId)'" -ConsistencyLevel eventual

if (-not $sp) {
  Write-Host "Creating service principal." -ForegroundColor Green
  $sp = New-MgServicePrincipal -AppId $app.AppId
}

Update-MgServicePrincipal `
  -ServicePrincipalId $sp.Id `
  -AppRoleAssignmentRequired:$manifest.assignmentRequired

Write-Host "Assignment requirement configured." -ForegroundColor Green

foreach ($groupId in $manifest.groupObjectIds) {
  $group = Get-MgGroup -GroupId $groupId -ErrorAction Stop

  Write-Host "Verified group: $($group.DisplayName)" -ForegroundColor Green

  $existingAssignment = Get-MgGroupAppRoleAssignment `
    -GroupId $groupId `
    -Filter "resourceId eq $($sp.Id)" `
    -ErrorAction SilentlyContinue

  if ($existingAssignment) {
    Write-Host "Group already assigned: $($group.DisplayName)" -ForegroundColor Yellow
    continue
  }

  New-MgGroupAppRoleAssignment `
    -GroupId $groupId `
    -PrincipalId $groupId `
    -ResourceId $sp.Id `
    -AppRoleId "00000000-0000-0000-0000-000000000000"

  Write-Host "Assigned group: $($group.DisplayName)" -ForegroundColor Green
}

$report = [ordered]@{
  displayName        = $manifest.displayName
  applicationId      = $app.Id
  appId              = $app.AppId
  servicePrincipalId = $sp.Id
  assignmentRequired = $manifest.assignmentRequired
  identifierUris     = $manifest.identifierUris
  replyUrls          = $manifest.replyUrls
  logoutUrl          = $manifest.logoutUrl
  assignedGroups     = $manifest.groupObjectIds
  authority          = "jaypventuresllc"
  generatedAtUtc     = (Get-Date).ToUniversalTime().ToString("o")
}

$reportPath = "docs/identity/generated/$($manifest.displayName -replace '[^a-zA-Z0-9\-]', '-').saml-readback.json"

New-Item -ItemType Directory -Force -Path (Split-Path $reportPath) | Out-Null
$report | ConvertTo-Json -Depth 10 | Set-Content $reportPath -Encoding UTF8

Write-Host "Readback report written: $reportPath" -ForegroundColor Green
