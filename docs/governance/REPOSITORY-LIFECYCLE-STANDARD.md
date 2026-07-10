# Repository Lifecycle Standard

## Purpose

This standard defines how JPV-OS repositories are created, retained, archived, or deleted.

## Creation requirements

A new repository must have:

- documented repository role
- named governance owner
- security baseline
- branch protection plan
- CI/check requirements
- `.gitignore` baseline
- secret-handling standard
- README and SECURITY documentation
- clear reason it should not live inside an existing repository

## Active repository requirements

Active repositories must maintain:

- clean protected default branch
- protected main branch where available
- changes via pull requests
- signed commits where required
- CodeQL or equivalent security scanning where applicable
- dependency update process
- documented runtime or documentation ownership
- no tracked secrets
- no tracked local runtime artifacts

## Archive requirements

A repository may be archived only after:

- export verification
- branch cleanup
- open PR review
- documentation migration where needed
- tracked secret/runtime artifact review
- default branch verification
- final status documented in the repository ownership map

## Deletion requirements

A repository may be deleted only when:

- it has no canonical system value
- it has no evidence, governance, brand, or operational history requiring retention
- export verification is complete
- no active integrations depend on it
- deletion decision is documented

## Prohibited patterns

Repositories must not be used for:

- dumping generated build artifacts
- storing `.env` files
- storing live credentials
- storing personal device identifiers
- storing IMEIs or phone numbers
- duplicating active runtime ownership without documentation
- unmanaged Copilot branch sprawl
- abandoned deployment experiments without archival review

## Legacy repository rule

Archived repositories are retained as historical references only. New production work must move to the appropriate active repository.

