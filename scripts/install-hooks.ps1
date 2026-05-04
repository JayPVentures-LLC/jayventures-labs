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
