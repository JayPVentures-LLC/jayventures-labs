# Azure Deployment GitHub Secrets Template

Set these secrets at the repository or organization level for Azure Container Apps deployment and monitoring:

| Secret Name                  | Description                                      |
|-----------------------------|--------------------------------------------------|
| AZURE_CLIENT_ID             | Azure Service Principal Client ID                 |
| AZURE_CLIENT_SECRET         | Azure Service Principal Client Secret             |
| AZURE_TENANT_ID             | Azure Tenant ID                                  |
| AZURE_SUBSCRIPTION_ID       | Azure Subscription ID                            |
| AZURE_CONTAINERAPPS_ENV     | Azure Container Apps Environment Name             |
| AZURE_RESOURCE_GROUP        | Azure Resource Group Name                        |
| AZURE_REGION                | Azure Region (e.g., eastus)                      |
| APPINSIGHTS_CONNECTION_STRING | Application Insights Connection String           |
| APPINSIGHTS_ALERT_EMAIL     | Email for critical alert notifications           |

## Setup Instructions

1. Create a Service Principal with Contributor role on the resource group:
   ```sh
   az ad sp create-for-rbac --name "jpv-os-deployer" --role contributor --scopes /subscriptions/<sub-id>/resourceGroups/<rg-name>
   ```
2. Copy the output values to the corresponding GitHub secrets above.
3. Set Application Insights connection string and alert email as needed.
4. Use the following command to set each secret (replace <SECRET_NAME> and <VALUE>):
   ```sh
   gh secret set <SECRET_NAME> --body "<VALUE>"
   ```

---

> **Note:** For org-wide secrets, use `gh secret set <SECRET_NAME> --org <ORG_NAME>`
> For more details, see: https://docs.github.com/en/actions/security-guides/encrypted-secrets
