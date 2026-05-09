# JPV-OS SAML SSO Policy

## Brand Authority

- All enterprise/institutional/business SAML onboarding is owned by `jaypventuresllc`.
- `jaypventures` is reserved for creator-facing identity only.

## Requirements

- SAML onboarding must be automated (script-first, manifest-driven).
- All assignments and configuration must be validated by readback.
- No SAML onboarding is considered complete until a readback report exists and passes verification.
- Do not expose certificates, secrets, tenant IDs, or private SAML metadata in public documentation.

## Deployment Rule

Do not publish SAML setup instructions as final unless the readback verification report exists and confirms:

- application exists
- service principal exists
- assignmentRequired is true
- identifier URI exists
- reply URL exists
- approved group assignments exist
