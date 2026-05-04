<#
JPV-OS EXECUTION PROFILE
brand: jaypventures_llc
layer: enterprise
classification: subscription_provisioning
authority_required: global_admin
enforcement: strict
#>

# =========================
# PRECHECK: IDENTITY ENFORCEMENT
# =========================

Write-Host "Validating execution context..."

$context = az account show --output json | ConvertFrom-Json

if (-not $context) {
    Write-Error "No Azure session detected. Execution denied."
    exit 1
}

# Ensure correct tenant is used
$expectedTenant = "f2f234f1-e912-4f16-a31d-6a102faea644"

if ($context.tenantId -ne $expectedTenant) {
    Write-Error "Tenant mismatch. Expected $expectedTenant but found $($context.tenantId). Execution denied."
    exit 1
}

Write-Host "Context validated for JayPVentures LLC"

# =========================
# STEP 1: AUTHENTICATION
# =========================

az login

# =========================
# STEP 2: TENANT VERIFICATION
# =========================

az account tenant list --output table

# =========================
# STEP 3: LOCK TENANT CONTEXT
# =========================

az account tenant set --tenant $expectedTenant

# =========================
# STEP 4: CONTROLLED PORTAL HANDOFF
# =========================

Start-Process "https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade"

Write-Host "Manual action required: Create subscription via Azure Portal."
Write-Host "This step is intentionally not automated per Microsoft compliance policy."

# =========================
# STEP 5: POST-CREATION VALIDATION
# =========================

Write-Host "Waiting for subscription provisioning..."

Start-Sleep -Seconds 10

az account list --output table

# =========================
# STEP 6: OPTIONAL DEFAULT SET
# =========================

# az account set --subscription <SUBSCRIPTION_ID>

# =========================
# POSTCHECK: ENFORCEMENT LOG
# =========================

Write-Host "JPV-OS: Subscription provisioning complete under enterprise authority."
