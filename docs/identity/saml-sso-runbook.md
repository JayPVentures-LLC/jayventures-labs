# JPV-OS SAML SSO Runbook

## Purpose

Automate SAML SSO onboarding for enterprise/institutional SaaS under `jaypventuresllc` using Microsoft Entra ID and PowerShell + Microsoft Graph.

## Workflow

1. Prepare a manifest (see `config/entra/saml-apps.example.json`).
2. Run `scripts/entra/saml-app-provision.ps1 -ManifestPath <manifest.json>` to provision or update the SAML app.
3. Run `scripts/entra/saml-app-verify.ps1 -DisplayName <displayName>` to verify the deployment.
4. Confirm a readback report is generated in `docs/identity/generated/`.
5. Only document SAML onboarding after readback passes.

## Required Fields

- displayName
- identifierUris
- replyUrls
- logoutUrl
- assignmentRequired
- groupObjectIds

## Operational Standard

- No portal-only configuration
- No undocumented identity changes
- All changes must be manifest-driven and readback-verified
