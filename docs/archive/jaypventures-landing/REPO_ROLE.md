# REPO_ROLE — jaypventures-landing

## Classification

| Attribute         | Value                                     |
|-------------------|-------------------------------------------|
| **Role**          | Production                                |
| **Owner**         | JayPVentures LLC                          |
| **Purpose**       | Public-facing marketing and landing site  |
| **Framework**     | Next.js 14 (static export)                |
| **Deployment**    | Cloudflare Pages                          |
| **DNS authority** | Cloudflare DNS                            |
| **Domain**        | jaypventures.com                          |

## Production Branch

`main` is the sole authoritative production branch.  
Every push to `main` triggers an automatic Cloudflare Pages deployment.

## Branch Policy

| Branch pattern            | Purpose                          | Lifetime      |
|---------------------------|----------------------------------|---------------|
| `main`                    | Production source of truth       | Permanent     |
| `dev`                     | Pre-production integration       | Optional      |
| `feature/<description>`   | Feature development              | Short-lived   |
| `fix/<description>`       | Bug fixes                        | Short-lived   |
| `copilot/*`               | AI-assisted / tool execution     | Ephemeral     |

Rules:
- Copilot and tool branches must be merged and deleted within the same task scope.
- No `backup/*`, `temp/*`, or named-person branches as long-lived branches.
- `main` must be protected: require PR review, passing CI, no force-push.

## Hosting

| Component         | Provider          | Notes                                 |
|-------------------|-------------------|---------------------------------------|
| Build & deploy    | Cloudflare Pages  | Auto-deploy on push to `main`         |
| DNS               | Cloudflare DNS    | Authoritative nameservers             |
| CDN & edge cache  | Cloudflare        | Global edge network                   |
| SSL/TLS           | Cloudflare        | Managed certificates                  |

## Build

```bash
npm install
npm run build   # outputs to ./out (static export)
npm run lint    # ESLint check
```

Output directory: `out/`  
Cloudflare config: `wrangler.toml`

## Environment Variables

Managed in **Cloudflare Pages → Settings → Environment variables**.  
Template: `.env.example` (committed; no secrets).  
Local overrides: `.env.local` (gitignored; never committed).

## JayPV-OS SOP Reference

This repo follows the [JayPV-OS Git Repository Consolidation SOP].  
Last reviewed: 2026-04-21
