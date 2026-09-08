# Azure Deployment Secret Template

Azure deployment credentials belong in Azure or JPV-approved secret infrastructure. They must not be stored as GitHub workflow secrets.

| Secret Name | Description |
| --- | --- |
| `AZURE_CLIENT_ID` | Azure workload or service principal client ID |
| `AZURE_CLIENT_SECRET` | Client secret only where managed identity or federated identity cannot be used |
| `AZURE_TENANT_ID` | Azure tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `AZURE_CONTAINERAPPS_ENV` | Azure Container Apps environment name |
| `AZURE_RESOURCE_GROUP` | Azure resource group name |
| `AZURE_REGION` | Azure region |
| `APPINSIGHTS_CONNECTION_STRING` | Application Insights connection string |
| `APPINSIGHTS_ALERT_EMAIL` | Email destination for critical alerts, where configured |

## Setup Standard

1. Prefer managed identity or workload identity over long-lived client secrets.
2. Where a service principal is required, scope it to the minimum Azure resources and permissions needed.
3. Store secrets in Azure Key Vault or the approved JPV secret layer.
4. Inject values only into the JPV-native execution environment that performs the deployment.
5. After deployment, obtain provider readback from Azure and record the resulting resource state before calling the deployment operational.

Example service-principal creation when a service principal is actually required:

```sh
az ad sp create-for-rbac \
  --name "jpv-os-deployer" \
  --role contributor \
  --scopes /subscriptions/<sub-id>/resourceGroups/<rg-name>
```

The resulting credentials must be moved immediately into the approved secret store and must never be committed to the repository.
