param(
  [string]$BaseUrl = $(if ($env:JVP_BASE_URL) { $env:JVP_BASE_URL } else { "http://127.0.0.1:8787" }),
  [string]$AdminToken = $env:ADMIN_UPLOAD_TOKEN,
  [string]$MemberstackApiKey = $env:MEMBERSTACK_API_KEY,
  [string]$MemberstackApiUrl = $env:MEMBERSTACK_API_URL,
  [string]$ExportCsv = "memberstack-members.csv",
  [string]$ExportJson = "",
  [string]$InputJson = "",
  [int]$PageSize = 100,
  [int]$MaxPages = 20,
  [switch]$SkipExport,
  [switch]$ExportJsonOnly
)

Set-StrictMode -Version Latest

function Write-Usage {
  Write-Host "Usage: .\\scripts\\memberstack-backfill.ps1 -AdminToken <token> -MemberstackApiKey <key> -MemberstackApiUrl <url>"
  Write-Host "       .\\scripts\\memberstack-backfill.ps1 -AdminToken <token> -SkipExport -ExportCsv .\\members.csv"
  Write-Host "       .\\scripts\\memberstack-backfill.ps1 -AdminToken <token> -InputJson .\\members.json"
  Write-Host "       .\\scripts\\memberstack-backfill.ps1 -AdminToken <token> -MemberstackApiKey <key> -MemberstackApiUrl <url> -ExportJson .\\members.json"
  Write-Host "       .\\scripts\\memberstack-backfill.ps1 -AdminToken <token> -MemberstackApiKey <key> -MemberstackApiUrl <url> -ExportJson .\\members.json -ExportJsonOnly"
  Write-Host "Env vars: JVP_BASE_URL, ADMIN_UPLOAD_TOKEN, MEMBERSTACK_API_KEY, MEMBERSTACK_API_URL"
}

function Get-String([object]$value) {
  if ($null -eq $value) { return "" }
  return [string]$value
}

function Resolve-ApiUrl([string]$base, [int]$page, [int]$pageSize) {
  if ([string]::IsNullOrWhiteSpace($base)) { return "" }
  if ($base -match "\{page\}" -or $base -match "\{pageSize\}") {
    return $base.Replace("{page}", $page).Replace("{pageSize}", $pageSize)
  }
  $separator = $(if ($base.Contains("?")) { "&" } else { "?" })
  return "$base${separator}page=$page&pageSize=$pageSize"
}

function Convert-MemberRow([object]$member) {
  $memberId = Get-String $member.id
  $email = Get-String $member.email
  $name = Get-String $member.name
  $tier = ""

  if ($member.plan -and $member.plan.name) {
    $tier = Get-String $member.plan.name
  } elseif ($member.tier) {
    $tier = Get-String $member.tier
  } elseif ($member.membership) {
    $tier = Get-String $member.membership
  }

  return [pscustomobject]@{
    memberId = $memberId
    memberKey = $memberId
    email = $email
    name = $name
    tier = $tier
  }
}

if (-not $AdminToken) {
  Write-Usage
  throw "ADMIN_UPLOAD_TOKEN is required."
}

if ($InputJson) {
  if (-not (Test-Path $InputJson)) {
    throw "JSON file not found: $InputJson"
  }

  $rawJson = Get-Content -Path $InputJson -Raw
  $parsed = $null

  try {
    $parsed = $rawJson | ConvertFrom-Json -ErrorAction Stop
  } catch {
    throw "Invalid JSON file: $InputJson"
  }

  if ($parsed -isnot [System.Collections.IEnumerable]) {
    throw "JSON file must contain an array."
  }

  $payload = $parsed | ConvertTo-Json -Depth 6
  $response = Invoke-RestMethod -Method Post -Uri "$BaseUrl/inner-circle/backfill" -Headers @{ Authorization = "Bearer $AdminToken"; "Content-Type" = "application/json" } -Body $payload
  $response | ConvertTo-Json -Depth 6
  exit 0
}

$members = @()

if (-not $SkipExport) {
  if (-not $MemberstackApiKey -or -not $MemberstackApiUrl) {
    Write-Usage
    throw "MEMBERSTACK_API_KEY and MEMBERSTACK_API_URL are required unless -SkipExport is used."
  }

  for ($page = 1; $page -le $MaxPages; $page++) {
    $url = Resolve-ApiUrl $MemberstackApiUrl $page $PageSize
    if (-not $url) { break }

    $response = Invoke-RestMethod -Method Get -Uri $url -Headers @{ Authorization = "Bearer $MemberstackApiKey" }

    $pageItems = @()
    if ($response -is [System.Collections.IEnumerable]) {
      $pageItems = @($response)
    } elseif ($response.data) {
      $pageItems = @($response.data)
    } elseif ($response.members) {
      $pageItems = @($response.members)
    }

    if (-not $pageItems -or $pageItems.Count -eq 0) { break }

    $members += $pageItems
  }

  $rowsFromApi = $members | ForEach-Object { Convert-MemberRow $_ }

  if ($ExportJson) {
    $rowsFromApi | ConvertTo-Json -Depth 6 | Set-Content -Path $ExportJson
    if ($ExportJsonOnly) {
      Write-Host "Exported JSON to $ExportJson"
      exit 0
    }
  } else {
    $rowsFromApi | Export-Csv -Path $ExportCsv -NoTypeInformation
  }
}

if ($ExportJson -and (Test-Path $ExportJson)) {
  $rows = Get-Content -Path $ExportJson -Raw | ConvertFrom-Json
} else {
  if (-not (Test-Path $ExportCsv)) {
    throw "CSV file not found: $ExportCsv"
  }

  $rows = Import-Csv -Path $ExportCsv | ForEach-Object {
    [pscustomobject]@{
      memberId = $_.memberId
      memberKey = $(if ($_.memberKey) { $_.memberKey } else { $_.memberId })
      email = $_.email
      name = $(if ($_.name) { $_.name } else { $_.fullName })
      tier = $_.tier
    }
  }
}

$payload = $rows | ConvertTo-Json -Depth 4

$response = Invoke-RestMethod -Method Post -Uri "$BaseUrl/inner-circle/backfill" -Headers @{ Authorization = "Bearer $AdminToken"; "Content-Type" = "application/json" } -Body $payload

$response | ConvertTo-Json -Depth 6
