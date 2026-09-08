# Azure Deployment Lane

## Purpose

Azure is the managed core runtime for JayPVentures LLC services that require enterprise monitoring, managed identity, and operational visibility.

Cloudflare remains the edge boundary. Azure does not replace Cloudflare Workers.

## Deployment Authority

Deployment is orchestrated through the JPV execution plane. GitHub is the source/review surface, not the deployment runtime.

Required gate:
- JPV-OS enforcement must pass before Azure deployment.
- Deployment commands execute through the approved JPV-native runner or operator path.
- Provider readback must verify the resulting Azure deployment before it is called operational.
- No `.github/workflows` or GitHub Actions dependency is permitted.

## Required Azure Credentials

Credentials must be held in Azure/JPV-approved secret infrastructure and injected only into the execution environment that needs them:
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_ACR_NAME`
- `AZURE_CONTAINER_APP_NAME`
- `AZURE_HEALTHCHECK_URL`

Do not treat GitHub workflow secrets or GitHub environments as production secret infrastructure.

## Runtime Standard

Azure Container Apps is the preferred first production target for services assigned to this lane.

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
- `decision_reason` for consequential actions
- `appeal_path` for user-impacting denials
- `rollback_supported` for reversible enforcement
- no silent bypass flags
- no disabled enforcement in production
