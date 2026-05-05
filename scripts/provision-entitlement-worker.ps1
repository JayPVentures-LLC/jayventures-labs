# Provision Cloudflare resources and secrets for jpv-entitlement-worker
# Usage: pwsh -ExecutionPolicy Bypass -File scripts/provision-entitlement-worker.ps1
#
# Prerequisites:
#   - Wrangler CLI authenticated: npx wrangler login
#   - GitHub CLI (gh) authenticated for org secrets (optional)
#
# What this script does:
#   1. Creates the METRICS_KV namespace (if not already created)
#   2. Prompts for and sets all required Worker secrets
#   3. Runs a deploy dry-run to validate the build
#
# After running this script, update wrangler.toml with the METRICS_KV namespace ID
# printed in step 1, then run: npx wrangler deploy --config operations/entitlement-system/wrangler.toml

param(
    [string]$WorkerName = "jpv-entitlement-worker"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== JPV Entitlement Worker Provisioning ==="
Write-Host "Worker: $WorkerName"
Write-Host ""

# ── Step 1: Create METRICS_KV namespace ──────────────────────────────────────
Write-Host "[1/3] Creating METRICS_KV KV namespace..."
Write-Host "      Run this command and copy the returned namespace ID into wrangler.toml:"
Write-Host ""
Write-Host "        npx wrangler kv namespace create METRICS_KV"
Write-Host ""
$namespaceId = Read-Host "      Paste the namespace ID here (or press Enter to skip)"
if ($namespaceId -ne "") {
    Write-Host "      Namespace ID recorded: $namespaceId"
    Write-Host "      Update operations/entitlement-system/wrangler.toml:"
    Write-Host "        [[kv_namespaces]]"
    Write-Host "        binding = ""METRICS_KV"""
    Write-Host "        id = ""$namespaceId"""
}
Write-Host ""

# ── Step 2: Set Worker secrets ────────────────────────────────────────────────
Write-Host "[2/3] Setting Worker secrets for $WorkerName..."
Write-Host "      Each secret will be prompted individually."
Write-Host ""

$secrets = @(
    @{ Name = "DISCORD_GUILD_ID";           Desc = "Discord Guild ID (single-guild reflection target)" },
    @{ Name = "DISCORD_ROLE_COMMUNITY_ID";  Desc = "Discord Role ID for member/community tier" },
    @{ Name = "DISCORD_ROLE_VIP_ID";        Desc = "Discord Role ID for premium/VIP tier" },
    @{ Name = "DISCORD_CLIENT_ID";          Desc = "Discord OAuth Application Client ID" },
    @{ Name = "DISCORD_CLIENT_SECRET";      Desc = "Discord OAuth Application Client Secret" },
    @{ Name = "DISCORD_BOT_TOKEN";          Desc = "Discord Bot Token (for role management API)" },
    @{ Name = "DISCORD_OAUTH_REDIRECT_URI"; Desc = "OAuth callback URL (e.g. https://your-worker.workers.dev/oauth/discord/callback)" },
    @{ Name = "PUBLIC_BASE_URL";            Desc = "Worker public base URL (e.g. https://your-worker.workers.dev)" },
    @{ Name = "OAUTH_STATE_SECRET";         Desc = "HMAC secret for OAuth state validation (generate: openssl rand -hex 32)" },
    @{ Name = "ACTIVATION_TOKEN_SECRET";    Desc = "HMAC secret for activation token signing (generate: openssl rand -hex 32)" }
)

$skipped = @()
foreach ($secret in $secrets) {
    $value = Read-Host "  $($secret.Name) [$($secret.Desc)]"
    if ($value -ne "") {
        Write-Host "  Setting $($secret.Name)..."
        Write-Output $value | npx wrangler secret put $secret.Name --name $WorkerName
    } else {
        $skipped += $secret.Name
        Write-Host "  Skipped $($secret.Name)"
    }
}

if ($skipped.Count -gt 0) {
    Write-Host ""
    Write-Host "  Skipped secrets (set these before deploying):"
    foreach ($s in $skipped) {
        Write-Host "    npx wrangler secret put $s --name $WorkerName"
    }
}
Write-Host ""

# ── Step 3: Validate build ────────────────────────────────────────────────────
Write-Host "[3/3] Running deploy dry-run to validate bundle..."
$tmpBuildDir = Join-Path ([System.IO.Path]::GetTempPath()) "entitlement-build"
npx wrangler deploy --dry-run --outdir $tmpBuildDir --config operations/entitlement-system/wrangler.toml
Write-Host ""
Write-Host "=== Provisioning complete ==="
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Ensure wrangler.toml METRICS_KV id is updated with the namespace ID from step 1"
Write-Host "  2. Run: npx wrangler deploy --config operations/entitlement-system/wrangler.toml"
Write-Host "  3. Register /webhook/stripe in Stripe dashboard"
Write-Host "  4. Register /oauth/discord/callback in Discord OAuth app redirect URIs"
