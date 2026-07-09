# Validates required People Protection governance artifacts.
# Used locally and in CI.

$ErrorActionPreference = "Stop"

$RequiredFiles = @(
  "governance/people-protection/ENFORCEMENT-MATRIX.md",
  "governance/people-protection/CONSTITUTIONAL-PRINCIPLES.md",
  "governance/people-protection/OPERATIONAL-POLICY.md",
  "governance/partners/PARTNER-PROTECTION-STANDARD.md",
  "governance/public-trust/PUBLIC-TRUST-PAGE.md",
  "governance/launch/PEOPLE-PROTECTION-LAUNCH-CHECKLIST.md"
)

$RequiredTerms = @(
  "Human dignity",
  "Anti-discrimination",
  "Anti-exploitation",
  "18+",
  "Child/student",
  "Interoperability",
  "Human review",
  "appeal",
  "Anti-capture",
  "Vendor-boundary",
  "rollback",
  "audit"
)

$Failures = New-Object System.Collections.Generic.List[string]

foreach ($File in $RequiredFiles) {
  if (!(Test-Path $File)) {
    $Failures.Add("Missing required file: $File")
    continue
  }

  $Content = Get-Content $File -Raw

  if ([string]::IsNullOrWhiteSpace($Content)) {
    $Failures.Add("File is empty: $File")
  }
}

$Combined = ""
foreach ($File in $RequiredFiles) {
  if (Test-Path $File) {
    $Combined += "`n" + (Get-Content $File -Raw)
  }
}

foreach ($Term in $RequiredTerms) {
  if ($Combined -notmatch [regex]::Escape($Term)) {
    $Failures.Add("Missing required governance term or concept: $Term")
  }
}

if ($Failures.Count -gt 0) {
  Write-Host "People Protection validation failed:" -ForegroundColor Red
  foreach ($Failure in $Failures) {
    Write-Host "- $Failure" -ForegroundColor Red
  }
  exit 1
}

Write-Host "People Protection validation passed." -ForegroundColor Green
exit 0
