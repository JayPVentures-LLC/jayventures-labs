# Repository Ownership Map

## Active retained repositories

| Repository | Status | Role |
|---|---|---|
| jayventures-labs | Active | Labs, orchestration, governance research, integration staging, documentation archive |
| automation-core | Active | Production automation/runtime lane for webhooks, Discord entitlement sync, Cloudflare Worker runtime, and Zero Trust automation |
| jpv-os-access-gateway | Active | JPV-OS access gateway for role-based entry, entitlement routing, and protected application access |
| jpv-public-records | Active / Private | Evidence-governance repository for public-records research, documentation, and audit materials |
| jpv-discussions | Active / Public | Public discussion, feedback, and community conversation surface |

## Archived retained repositories

| Repository | Status | Retention reason |
|---|---|---|
| SOS | Archived | Legacy application/workspace; docs migrated; retained for source/history |
| jaypventures-landing | Archived | Legacy landing source and brand/deployment history; docs migrated |
| jaypventuresllc.com | Archived | Legacy Wix/Cloudflare/access-management operational reference; hygiene cleanup completed |
| website-design | Archived | Legacy operational architecture, runbooks, and Zero Trust references; docs migrated |
| WebsiteDesign--PythonInsider | Archived | Legacy Python/Flask and integration prototype history; hygiene cleanup completed |
| jaypventuresllc | Archived | Legacy governance/design/Wix package; retained for historical reference |

## Deleted repositories

| Repository | Final action | Reason |
|---|---|---|
| demo-repository | Deleted | No operational, governance, or historical value after inspection |

## Canonical ownership rules

- `automation-core` owns production automation runtime patterns.
- `jayventures-labs` owns labs, research, orchestration, integration staging, and canonical migrated documentation.
- `jpv-os-access-gateway` owns protected entry, entitlement routing, and access gateway logic.
- Archived repositories are historical references and should not receive new product work.
- New work must start in the correct active repository unless a new repository has a documented role and governance approval.
