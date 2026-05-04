# PowerShell script to prompt for and set all required Azure deployment GitHub secrets at the org level
param(
    [string]$Org = "JayPVentures-LLC"
)

$secrets = @(
    @{ Name = "AZURE_CLIENT_ID"; Desc = "Azure Service Principal Client ID" },
    @{ Name = "AZURE_CLIENT_SECRET"; Desc = "Azure Service Principal Client Secret" },
    @{ Name = "AZURE_TENANT_ID"; Desc = "Azure Tenant ID" },
    @{ Name = "AZURE_SUBSCRIPTION_ID"; Desc = "Azure Subscription ID" },
    @{ Name = "AZURE_CONTAINERAPPS_ENV"; Desc = "Azure Container Apps Environment Name" },
    @{ Name = "AZURE_RESOURCE_GROUP"; Desc = "Azure Resource Group Name" },
    @{ Name = "AZURE_REGION"; Desc = "Azure Region (e.g., eastus)" },
    @{ Name = "APPINSIGHTS_CONNECTION_STRING"; Desc = "Application Insights Connection String" },
    @{ Name = "APPINSIGHTS_ALERT_EMAIL"; Desc = "Email for critical alert notifications" }
)

foreach ($secret in $secrets) {
    $value = Read-Host "Enter value for $($secret.Name) [$($secret.Desc)]"
    if ($value -ne "") {
        Write-Host "Setting $($secret.Name) at org $Org..."
        gh secret set $($secret.Name) --org $Org --body "$value"
    } else {
        Write-Host "Skipped $($secret.Name)"
    }
}

Write-Host "All provided secrets set for org $Org."