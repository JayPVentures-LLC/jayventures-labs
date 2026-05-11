// JPV-OS Production Parameters
// Replace placeholder values with your real Azure resource IDs / image refs before deploying.

using './main.bicep'

param location = 'eastus'
param env = 'prod'

// Container image pushed by CI to your ACR:
// Format: <acr-name>.azurecr.io/jpv-api-gateway:<git-sha>
param gatewayImage = 'REPLACE_WITH_ACR_LOGIN_SERVER/jpv-api-gateway:latest'
