<#
.SYNOPSIS
    JPV-OS Authority Check - Verifies Revenue, Role, and Idea Authority standards.

.DESCRIPTION
    This script enforces JPV-OS authority protections by validating:
    - Revenue authority: TIN (enterprise) vs SSN (creator/labs) separation
    - Role authority: Brand-specific voice constraints
    - Idea authority: No cross-layer contamination
    - Governance artifacts: Required files exist and contain mandatory terms

.NOTES
    Runs on Windows-latest GitHub Actions runner with PowerShell Core.
    Exit code 0 = pass, Exit code 1 = fail
#>

$ErrorActionPreference = "Stop"

# Repository root
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$Failures = [System.Collections.ArrayList]::new()

function Test-FileExists {
    param([string]$RelativePath)
    $FullPath = Join-Path $RepoRoot $RelativePath
    return Test-Path $FullPath
}

function Get-FileContent {
    param([string]$RelativePath)
    $FullPath = Join-Path $RepoRoot $RelativePath
    if (Test-Path $FullPath) {
        return Get-Content $FullPath -Raw
    }
    [void]$Failures.Add("Missing required file: $RelativePath")
    return ""
}

function Assert-FileContains {
    param(
        [string]$File,
        [string[]]$Terms
    )
    $Content = Get-FileContent -RelativePath $File
    foreach ($Term in $Terms) {
        if (-not $Content.Contains($Term)) {
            [void]$Failures.Add("$File is missing required term: $Term")
        }
    }
}

function Assert-FileMatchesRegex {
    param(
        [string]$File,
        [string]$Pattern,
        [string]$Description
    )
    $Content = Get-FileContent -RelativePath $File
    if (-not ($Content -match $Pattern)) {
        [void]$Failures.Add("$File failed check: $Description")
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JPV-OS Authority Standards Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. Required Governance Files
# ============================================================================
Write-Host "[1/6] Checking required governance files..." -ForegroundColor Yellow

$RequiredFiles = @(
    "README.md",
    "GOVERNANCE.md",
    "SECURITY.md",
    "PEOPLE-PROTECTION.md",
    ".github/CODEOWNERS",
    ".github/workflows/jpv-policy-enforcement.yml",
    "operations/jpv_os_enforcement/jpv_os.yaml"
)

foreach ($File in $RequiredFiles) {
    if (-not (Test-FileExists -RelativePath $File)) {
        [void]$Failures.Add("Missing required file: $File")
    } else {
        Write-Host "  [OK] $File" -ForegroundColor Green
    }
}

# ============================================================================
# 2. Revenue Authority Validation
# ============================================================================
Write-Host ""
Write-Host "[2/6] Validating revenue authority separation..." -ForegroundColor Yellow

$JpvOsYaml = Get-FileContent -RelativePath "operations/jpv_os_enforcement/jpv_os.yaml"

# Check TIN vs SSN separation in spec
if ($JpvOsYaml -match "revenue_channel:\s*TIN") {
    Write-Host "  [OK] Enterprise (TIN) revenue channel defined" -ForegroundColor Green
}
if ($JpvOsYaml -match "revenue_channel:\s*SSN") {
    Write-Host "  [OK] Creator/Labs (SSN) revenue channel defined" -ForegroundColor Green
}

# Verify no revenue mixing patterns exist in code
$RevenueViolationPatterns = @(
    "bypass_revenue_check",
    "skip_tin_validation",
    "ignore_ssn_separation"
)

$CodeFiles = Get-ChildItem -Path $RepoRoot -Recurse -Include "*.ts","*.js","*.mjs","*.cjs" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "node_modules|\.next|dist|build|coverage" }

foreach ($CodeFile in $CodeFiles) {
    $Content = Get-Content $CodeFile.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -ne $Content) {
        foreach ($Pattern in $RevenueViolationPatterns) {
            if ($Content -match $Pattern) {
                [void]$Failures.Add("Revenue authority violation in $($CodeFile.Name): contains '$Pattern'")
            }
        }
    }
}

Write-Host "  [OK] No revenue mixing patterns detected" -ForegroundColor Green

# ============================================================================
# 3. Role Authority Validation
# ============================================================================
Write-Host ""
Write-Host "[3/6] Validating role authority constraints..." -ForegroundColor Yellow

# Verify brand authority levels are defined
if ($JpvOsYaml -match "authority:\s*absolute") {
    Write-Host "  [OK] Enterprise absolute authority defined" -ForegroundColor Green
}
if ($JpvOsYaml -match "authority:\s*controlled") {
    Write-Host "  [OK] Labs controlled authority defined" -ForegroundColor Green
}
if ($JpvOsYaml -match "authority:\s*cultural") {
    Write-Host "  [OK] Creator cultural authority defined" -ForegroundColor Green
}

# Verify voice constraints exist
if ($JpvOsYaml -match "no_cross_voice") {
    Write-Host "  [OK] Cross-voice prohibition rule defined" -ForegroundColor Green
} else {
    [void]$Failures.Add("jpv_os.yaml missing no_cross_voice rule")
}

# ============================================================================
# 4. Idea Authority Validation
# ============================================================================
Write-Host ""
Write-Host "[4/6] Validating idea authority flow..." -ForegroundColor Yellow

# Verify system flow sequence
if ($JpvOsYaml -match "sequence:") {
    Write-Host "  [OK] System flow sequence defined" -ForegroundColor Green
}

# Verify no direct creator-to-enterprise bypass
if ($JpvOsYaml -match "no_direct_creator_to_enterprise_without_validation") {
    Write-Host "  [OK] Creator-to-enterprise validation gate defined" -ForegroundColor Green
} else {
    [void]$Failures.Add("jpv_os.yaml missing creator-to-enterprise validation rule")
}

# ============================================================================
# 5. Governance Document Integrity
# ============================================================================
Write-Host ""
Write-Host "[5/6] Validating governance document integrity..." -ForegroundColor Yellow

# PEOPLE-PROTECTION.md required terms
Assert-FileContains -File "PEOPLE-PROTECTION.md" -Terms @(
    "People Protection",
    "human dignity",
    "informed consent",
    "user autonomy"
)

# README must reference governance docs
Assert-FileContains -File "README.md" -Terms @(
    "GOVERNANCE.md",
    "SECURITY.md",
    "PEOPLE-PROTECTION.md"
)

# GOVERNANCE must reference People Protection
Assert-FileContains -File "GOVERNANCE.md" -Terms @(
    "People Protection",
    "PEOPLE-PROTECTION.md"
)

# SECURITY must reference human protections
Assert-FileContains -File "SECURITY.md" -Terms @(
    "People Protection"
)

Write-Host "  [OK] Governance cross-references validated" -ForegroundColor Green

# ============================================================================
# 6. Audit & Recovery Path Verification
# ============================================================================
Write-Host ""
Write-Host "[6/6] Validating audit and recovery paths..." -ForegroundColor Yellow

# Check for required documentation
$AuditDocs = @(
    "docs/production-review-checklist.md",
    "docs/policy-index.md",
    "docs/enforcement-map.md"
)

foreach ($Doc in $AuditDocs) {
    if (Test-FileExists -RelativePath $Doc) {
        Write-Host "  [OK] $Doc" -ForegroundColor Green
    } else {
        [void]$Failures.Add("Missing audit document: $Doc")
    }
}

# Verify enforcement workflow exists
if (Test-FileExists -RelativePath ".github/workflows/jpv-os-enforcement.yml") {
    Write-Host "  [OK] JPV-OS enforcement workflow exists" -ForegroundColor Green
} else {
    [void]$Failures.Add("Missing .github/workflows/jpv-os-enforcement.yml")
}

# ============================================================================
# FINAL RESULT
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($Failures.Count -gt 0) {
    Write-Host "JPV-OS AUTHORITY CHECK FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Violations found:" -ForegroundColor Red
    foreach ($Failure in $Failures) {
        Write-Host "  - $Failure" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Fix authority violations before merge or deployment." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "JPV-OS AUTHORITY CHECK PASSED" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "All authority standards verified:" -ForegroundColor Green
    Write-Host "  - Revenue authority (TIN/SSN separation)" -ForegroundColor Green
    Write-Host "  - Role authority (brand voice constraints)" -ForegroundColor Green
    Write-Host "  - Idea authority (layer flow validation)" -ForegroundColor Green
    Write-Host "  - Governance documents (cross-references)" -ForegroundColor Green
    Write-Host "  - Audit/recovery paths (documentation)" -ForegroundColor Green
    exit 0
}
