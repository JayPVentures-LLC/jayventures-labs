# Cloudflare Worker Deployment Guide - JAYPVENTURES LLC

## Overview

This Worker serves content from two R2 buckets across two domains:
- **assets.jaypventuresllc.com** — Public assets (images, CSS, JS)
- **vault.jaypventuresllc.com** — Private vault content (JWT-authenticated, tier-based access)

---

## Prerequisites

- Cloudflare account with Workers and R2 enabled
- Domain registered with Cloudflare (jaypventuresllc.com)
- Wrangler CLI installed: `npm install -g @cloudflare/wrangler`
- Node.js 18+

---

## Step 1: Create R2 Buckets

1. **Log in** to Cloudflare Dashboard
2. Go to **R2 Storage** → **Buckets**
3. Create two buckets:
   - `jvp-public-assets`
   - `jvp-all-access-vault`
4. **Do NOT make them public** (Private is default; it's perfect)

---

## Step 2: Configure Cloudflare Workers Bindings

### Method A: Via Cloudflare Dashboard (Easiest)

1. Go to **Workers & Pages**
2. Create/select `jvp-worker`
3. Go to **Settings** → **Variables & Bindings**
4. Click **Add** under **R2 Bucket Bindings**
   - **Variable name**: `PUBLIC_BUCKET`
   - **R2 bucket**: `jvp-public-assets`
   - Click **Save**
5. Add another binding:
   - **Variable name**: `VAULT_BUCKET`
   - **R2 bucket**: `jvp-all-access-vault`
   - Click **Save**

### Method B: Via wrangler.toml (Already Configured)

The `wrangler.toml` file includes the bindings. Just deploy:

```bash
wrangler deploy --env production
```

---

## Step 3: Set the JWT Public Key Secret

The Worker needs Memberstack's JWT public key to verify tokens.

### Via Wrangler CLI

```bash
wrangler secret put MEMBERSTACK_JWT_PUBLIC_KEY --env production
# Paste your Memberstack RS256 public key (PEM format)
# Example:
# -----BEGIN PUBLIC KEY-----
# MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
# -----END PUBLIC KEY-----
```

### Via Cloudflare Dashboard

1. Go to Worker → **Settings** → **Variables & Bindings**
2. Under **Secrets**, click **Add Secret**
3. **Variable name**: `MEMBERSTACK_JWT_PUBLIC_KEY`
4. **Value**: Paste your Memberstack public key (PEM format)
5. Click **Save**

---

## Step 4: Configure Routes in Cloudflare DNS

1. Go to **DNS** → **Records** → **CNAME**
2. Add two records:

   **Record 1:**
   - **Name**: `assets`
   - **Target**: `jvp-worker.<account-id>.workers.dev`
   - **Proxy status**: Proxied
   - Click **Save**

   **Record 2:**
   - **Name**: `vault`
   - **Target**: `jvp-worker.<account-id>.workers.dev`
   - **Proxy status**: Proxied
   - Click **Save**

3. Alternatively, use **Route Configuration** in Workers:
   - Go to Worker → **Triggers** → **Routes**
   - Add route: `assets.jaypventuresllc.com/*` → `jvp-worker`
   - Add route: `vault.jaypventuresllc.com/*` → `jvp-worker`

---

## Step 5: Deploy the Worker

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to production
wrangler deploy --env production

# OR deploy with a custom name
wrangler deploy --name jvp-worker --env production
```

Expected output:
```
✅ Deployed to https://jvp-worker.<account-id>.workers.dev
```

---

## Step 6: Upload Files to R2

### Upload to jvp-public-assets

```bash
# Via Cloudflare Dashboard: R2 → jvp-public-assets → Upload
# OR via Wrangler:
wrangler r2 object put jvp-public-assets/logo.png --file ./logo.png --env production
wrangler r2 object put jvp-public-assets/style.css --file ./style.css --env production
```

### Upload to jvp-all-access-vault

**Important:** Use the exact folder structure below:

```
all-access/
├── core/
│   ├── resource1.pdf
│   └── guide.md
├── plus/
│   ├── premium-content.zip
│   └── tools.tar.gz
└── inner-circle/
    ├── exclusive.mp4
    └── secret.pdf

drops/
├── drop-1.zip
└── drop-2.tar.gz

replays/
├── session-1.mp4
└── session-2.webm

shop/
├── product-1.pdf
└── invoice.zip
```

Upload via dashboard or CLI:

```bash
wrangler r2 object put jvp-all-access-vault/all-access/core/guide.pdf --file ./guide.pdf --env production
```

---

## Testing

### Test Public Assets (No Auth Required)

```bash
# Should work
curl https://assets.jaypventuresllc.com/logo.png
curl https://assets.jaypventuresllc.com/style.css

# Should return 404
curl https://assets.jaypventuresllc.com/nonexistent.txt
```

### Test Vault (Auth Required)

```bash
# Without token → 401
curl https://vault.jaypventuresllc.com/all-access/core/guide.pdf

# With token (Bearer or cookie)
curl -H "Authorization: Bearer <JWT_TOKEN>" https://vault.jaypventuresllc.com/all-access/core/guide.pdf

# OR via cookie
curl -H "Cookie: jvp_token=<JWT_TOKEN>" https://vault.jaypventuresllc.com/all-access/core/guide.pdf

# Wrong tier → 403
# (if token has tier=core but path is /all-access/inner-circle/)
curl -H "Authorization: Bearer <CORE_TIER_TOKEN>" https://vault.jaypventuresllc.com/all-access/inner-circle/file.pdf
```

---

## Monitoring & Logs

View real-time logs:

```bash
wrangler tail --env production
```

Expected log format:
```
[2024-02-06T12:34:56Z] vault.jaypventuresllc.com /all-access/plus/document.pdf 200 tier=plus
[2024-02-06T12:34:57Z] assets.jaypventuresllc.com /style.css 200
[2024-02-06T12:34:58Z] vault.jaypventuresllc.com /admin/secret.txt 403 tier=core
```

---

## ⚠️ IMPORTANT NOTES

### 1. R2 Folder Structure Must Match

Your R2 vault bucket **must** have these exact prefixes for tier-based access to work:

```
all-access/core/      → accessible to core, plus, inner_circle tiers
all-access/plus/      → accessible to plus, inner_circle tiers
all-access/inner-circle/ → accessible to inner_circle tier only

drops/                → accessible to core, plus, inner_circle
replays/              → accessible to plus, inner_circle
shop/                 → accessible to any authenticated tier
admin/                → ALWAYS 403 (denied)
```

If your files are at different paths, modify the `authorizePath()` function in `src/index.ts`.

---

### 2. Memberstack JWT Must Include Tier Claim

Your Memberstack JWT **must** include a `tier` claim like:

```json
{
  "sub": "user-id-123",
  "tier": "plus",
  "email": "user@example.com",
  "iat": 1707209696,
  "exp": 1707296096
}
```

Valid tier values:
- `"core"`
- `"plus"`
- `"inner_circle"`

**If your JWT doesn't include the `tier` claim**, the Worker will fail during authentication. Contact Memberstack support to add it to your JWT payload.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **404 on vault files** | Check R2 path matches exactly (including case). Use Cloudflare dashboard to verify files exist. |
| **401 Unauthorized** | Ensure JWT is valid, not expired, and includes `tier` claim. |
| **403 Forbidden** | Check user's tier allows the path. See `authorizePath()` rules above. |
| **CORS errors** | Add `Access-Control-Allow-Origin` headers if needed (modify `getSecurityHeaders()`). |
| **Wrangler deploy fails** | Run `wrangler login` and ensure `wrangler.toml` has correct bucket names. |
| **JWT verification fails** | Verify Memberstack public key is in PEM format and set as secret correctly. |

---

## Production Checklist

- [ ] Both R2 buckets created (`jvp-public-assets`, `jvp-all-access-vault`)
- [ ] R2 bindings configured in Workers
- [ ] `MEMBERSTACK_JWT_PUBLIC_KEY` secret set
- [ ] Routes added for both subdomains
- [ ] Files uploaded to correct R2 paths with exact folder structure
- [ ] Tested with sample JWT tokens (all tiers)
- [ ] Verified 401/403/404 responses work correctly
- [ ] Cache headers are appropriate (31536000 for images/js/css, 300 for html/json)
- [ ] Security headers present in all responses
- [ ] Monitoring/logs configured for production

---

## Next Steps

- **Custom domain mapping**: Add `assets.jaypventuresllc.com` and `vault.jaypventuresllc.com` as CNAME records pointing to Workers
- **Analytics**: Enable Cloudflare Analytics Engine for detailed insights
- **Rate limiting**: Add Workers Rate Limiting rules if needed
- **Cache purge**: Use Cloudflare Cache Purge API for file updates

Happy deploying! 🚀
