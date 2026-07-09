# Cloudflare Worker - Quick Reference

## Implementation Summary

**Production-ready Cloudflare Worker** for JAYPVENTURES LLC serving R2 content across two domains with JWT-based tier access control.

### Key Features Implemented

✅ **Two Domain Routes**
- `assets.jaypventuresllc.com/*` — Public assets, no auth
- `vault.jaypventuresllc.com/*` — Private vault, JWT required

✅ **Authentication**
- JWT via Bearer token in `Authorization` header OR `jvp_token` cookie
- RS256 signature verification using WebCrypto (no external libraries)
- Token expiration validation

✅ **Tier-Based Access Control**
- Supported tiers: `core`, `plus`, `inner_circle`
- Path-based authorization rules:
  - `/all-access/core/` → core+plus+inner_circle
  - `/all-access/plus/` → plus+inner_circle
  - `/all-access/inner-circle/` → inner_circle only
  - `/shop/` → any authenticated tier
  - `/replays/` → plus+inner_circle
  - `/drops/` → core+plus+inner_circle
  - `/admin/` → always 403 (deny all)

✅ **HTTP Caching**
- Public assets: 31536000 seconds (1 year) for images/css/js
- Public assets: 300 seconds (5 min) for html/json
- Vault content: `private, no-store`

✅ **Security**
- Protection against directory traversal (`..`, backslashes)
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- GET/HEAD only (POST, PUT, DELETE blocked)
- Structured logging without PII

✅ **R2 Integration**
- Stream files directly from R2
- Range request support for video/PDF streaming
- MIME type detection from file extension
- HTTP 404 for missing files

---

## File Structure

```
src/
└── index.ts                    # Main Worker handler (production code)

wrangler.toml                   # Cloudflare bindings & routes config
tsconfig.json                   # TypeScript config
package.json                    # Dependencies (Wrangler, TypeScript)
CLOUDFLARE_SETUP.md             # Full deployment guide
CLOUDFLARE_QUICK_REF.md         # This file
```

---

## Deployment Quick Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set JWT Public Key Secret

```bash
wrangler secret put MEMBERSTACK_JWT_PUBLIC_KEY --env production
# Paste your Memberstack RS256 public key (PEM format)
```

### 3. Deploy Worker

```bash
wrangler deploy --env production
```

### 4. Verify Routes

Test public assets (no auth):
```bash
curl https://assets.jaypventuresllc.com/logo.png
```

Test vault (with token):
```bash
curl -H "Authorization: Bearer <YOUR_JWT>" \
  https://vault.jaypventuresllc.com/all-access/plus/document.pdf
```

---

## Modular Code Functions

All functions in `src/index.ts` follow clean separation of concerns:

| Function | Purpose |
|----------|---------|
| `parseRequest()` | Extract domain, path, method, headers |
| `chooseBucket()` | Determine which R2 bucket to use |
| `authenticate()` | Extract & verify JWT from header/cookie |
| `verifyJWT()` | Validate RS256 signature & expiration |
| `importPublicKey()` | Convert PEM key to WebCrypto format |
| `authorizePath()` | Check if user tier is allowed for path |
| `isSafePath()` | Prevent directory traversal attacks |
| `getMimeType()` | Infer MIME type from file extension |
| `getCacheHeaders()` | Return appropriate Cache-Control based on content |
| `getSecurityHeaders()` | Security headers for all responses |
| `logEvent()` | Structured logging (domain, path, code, tier) |
| `getObject()` | Fetch file from R2 with range request support |
| `buildResponse()` | Construct HTTP response with all headers |

---

## Configuration (wrangler.toml)

```toml
# Bindings (auto-injected by Cloudflare)
PUBLIC_BUCKET = "jvp-public-assets"
VAULT_BUCKET = "jvp-all-access-vault"

# Routes
assets.jaypventuresllc.com/* → jvp-worker
vault.jaypventuresllc.com/*  → jvp-worker

# Secrets (set separately)
MEMBERSTACK_JWT_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----..."
```

---

## ⚠️ TWO CRITICAL NOTES

### 1. R2 Folder Structure

**Must match exactly** for access control to work:

```
R2: jvp-all-access-vault/
├── all-access/core/...
├── all-access/plus/...
├── all-access/inner-circle/...
├── drops/...
├── replays/...
├── shop/...
└── admin/...(always 403)
```

Modify `authorizePath()` if your structure differs.

### 2. Memberstack JWT Must Include Tier

Your JWT **must** have a `tier` claim:

```json
{
  "sub": "user-id",
  "tier": "plus",      // ← REQUIRED
  "email": "user@example.com",
  "iat": 1707209696,
  "exp": 1707296096
}
```

Without it, `authenticate()` will fail.

---

## Testing Checklist

- [ ] Deploy Worker to production
- [ ] Test public asset: `curl https://assets.jaypventuresllc.com/logo.png` (200)
- [ ] Test public 404: `curl https://assets.jaypventuresllc.com/missing.txt` (404)
- [ ] Test vault no auth: `curl https://vault.jaypventuresllc.com/all-access/plus/file.pdf` (401)
- [ ] Test vault with token: `curl -H "Authorization: Bearer <TOKEN>" ...` (200 or 403)
- [ ] Test wrong tier: Use core-tier token on `/all-access/inner-circle/` (403)
- [ ] Test cache headers: `curl -I https://assets.jaypventuresllc.com/style.css` (max-age=31536000)
- [ ] Test security headers: `curl -I ...` (X-Content-Type-Options, X-Frame-Options present)
- [ ] Test admin path: Always returns 403 regardless of tier

---

## Performance Optimizations

- **No external dependencies** — Uses WebCrypto for JWT verification
- **Stream responses** — R2 body streamed directly to client
- **Range request support** — Videos/PDFs can resume/seek
- **CloudFlare caching** — Long TTLs for immutable assets
- **Minimal logging** — Structured events only, no request bodies

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| 401 on all vault requests | JWT missing/expired | Check token in header/cookie, verify expiration |
| 403 on valid token | Tier not allowed | Check user tier vs. path rules (see `authorizePath()`) |
| JWT verification failed | Wrong public key | Regenerate secret with correct Memberstack PEM key |
| 404 on vault files | Wrong R2 path | Verify file exists in jvp-all-access-vault, match folder structure |
| Cache headers wrong | Content-Type mismatch | Check `getMimeType()` logic, override if needed |
| Directory traversal attempt | Security filter | Baseline protection active; modify `isSafePath()` if needed |

---

## Next Steps

1. Create R2 buckets: `jvp-public-assets`, `jvp-all-access-vault`
2. Upload files to correct paths in R2
3. Set `MEMBERSTACK_JWT_PUBLIC_KEY` secret
4. Deploy: `npm run deploy`
5. Add DNS CNAME records for subdomains
6. Monitor logs: `npm run logs`

---

**Status**: ✅ Production Ready
**No external libraries** | **WebCrypto JWT verification** | **Range request support** | **Tier-based access control**

Deploy with confidence! 🚀
