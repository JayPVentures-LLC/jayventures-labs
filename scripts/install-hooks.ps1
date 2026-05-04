# Install JPV-OS pre-commit hook for all contributors
$hookSource = ".husky\pre-commit"
$gitDir = git rev-parse --git-dir
$hookDest = Join-Path $gitDir "hooks\pre-commit"

if (Test-Path $hookSource) {
    Copy-Item $hookSource $hookDest -Force
    Write-Host "JPV-OS pre-commit hook installed at $hookDest"
} else {
    Write-Host "No .husky/pre-commit found. Please run npx husky install first."
}

# Stripe account wiring guard
$controlMapPath = "operations/stripe_control_map.yaml"
if (Test-Path $controlMapPath) {
    $yaml = Get-Content $controlMapPath -Raw
    $primary = ($yaml | Select-String 'account_id:').Line -match 'acct_([a-zA-Z0-9]+)'
    $primaryId = $Matches[0]
    Write-Host "Primary Stripe account for wiring: $primaryId"
    # Add logic here to enforce only wiring this account
}
