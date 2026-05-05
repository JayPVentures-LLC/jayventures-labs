# Azure Deployment Lane

## Purpose

Azure is the controlled core runtime for JayPVentures LLC services that require enterprise monitoring, managed identity, and operational visibility.

Cloudflare remains the edge boundary. Azure does not replace Cloudflare Workers.

## Deployment Control

GitHub Actions is the deployment control plane.

Required gate:

- JPV-OS enforcement must pass before Azure deployment.
- Deployment runs through `deploy-azure-container-app.yml`.
- Production deployment requires GitHub environment controls.

## Required GitHub Secrets

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_ACR_NAME`
- `AZURE_CONTAINER_APP_NAME`
- `AZURE_HEALTHCHECK_URL`

## Runtime Standard

Azure Container Apps is the preferred first production target.

Do not move edge webhook verification away from Cloudflare unless the system design explicitly changes.

## Monitoring

Application Insights should be attached to the Azure runtime.

Minimum alert set:

- HTTP 5xx spike
- Availability failure
- Container restart loop
- Queue processing failure
- Authentication or entitlement error spike

## JPV-OS Requirements

Every deployable service must preserve:

- decision_reason for consequential actions
- appeal_path for user-impacting denials
- rollback_supported for reversible enforcement
- no silent bypass flags
- no disabled enforcement in production
