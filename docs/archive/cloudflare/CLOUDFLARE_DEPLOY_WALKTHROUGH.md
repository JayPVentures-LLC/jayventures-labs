# Cloudflare Worker Deployment - Complete Walkthrough

## What You'll Get After Deploy

### ✅ Public Assets (No Auth)
```
https://assets.jaypventuresllc.com/logo.png
https://assets.jaypventuresllc.com/style.css
https://assets.jaypventuresllc.com/app.js
```
Returns: 200 OK (with 1-year cache headers)

### ✅ Private Vault (JWT Auth Required)
```
https://vault.jaypventuresllc.com/all-access/plus/guide.pdf
https://vault.jaypventuresllc.com/replays/session.mp4
https://vault.jaypventuresllc.com/drops/exclusive.zip
```
Returns:
- **401** if no JWT token
- **403** if tier doesn't match path
- **200** if authorized (with no-store cache)

---

## Step-by-Step Deployment

### **Phase 1: Local Setup (5 minutes)**

#### 1.1 Install Cloudflare CLI
```bash
npm install -g @cloudflare/wrangler
# or if you have it locally:
npm install
```

**Output:**
```
npm warn deprecated ...
added 150 packages in 45s
```

#### 1.2 Login to Cloudflare
```bash
wrangler login
```

**Output:**
```
 ⛅ wrangler 3.26.0
Attempting to login to Cloudflare...
Opening a link in your default browser: https://dash.cloudflare.com/oauth/authorize?...

Successfully logged in via OAuth!
```

---

### **Phase 2: Create R2 Buckets (2 minutes via Dashboard)**

Go to https://dash.cloudflare.com → **R2** → **Buckets**

Manually create these buckets (they're private by default):
1. `jvp-public-assets`
2. `jvp-all-access-vault`

**Screenshot After Creation:**
```
Buckets
├── jvp-public-assets        (Private)
└── jvp-all-access-vault     (Private)
```

---

### **Phase 3: Set JWT Secret (2 minutes)**

Before deploying, add your Memberstack public key as a secret:

```bash
wrangler secret put MEMBERSTACK_JWT_PUBLIC_KEY --env production
```

**Terminal Interaction:**
```
 ⛅ wrangler 3.26.0 secret put MEMBERSTACK_JWT_PUBLIC_KEY --env production

Enter a secret value for 'MEMBERSTACK_JWT_PUBLIC_KEY':
█

✓ Uploaded secret MEMBERSTACK_JWT_PUBLIC_KEY to environment production
```

Paste your Memberstack RS256 public key (looks like this):
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890...
(many lines of base64)
-----END PUBLIC KEY-----
```

---

### **Phase 4: Deploy Worker (2 minutes)**

```bash
npm run build
npm run deploy
```

**or directly:**

```bash
wrangler deploy --env production
```

**Full Terminal Output:**
```
PS C:\Users\jaypv\Downloads\SOS> wrangler deploy --env production

 ⛅ wrangler 3.26.0

✓ Parsed wrangler.toml successfully
✓ Compiled src/index.ts successfully (523 lines)
✓ Uploading Worker bundle
✓ Publishing Worker

✏️  Worker now live at:
👉 https://jvp-worker.<your-account-id>.workers.dev

🎉 SUCCESS! Your Worker has been deployed!

Deployed routes:
  ✓ assets.jaypventuresllc.com/*
  ✓ vault.jaypventuresllc.com/*

Next steps:
  1. Upload files to R2 buckets
  2. Test endpoints
  3. View logs: wrangler tail --env production
```

---

### **Phase 5: Upload Files to R2 (5 minutes)**

#### 5a. Upload to Public Bucket

**Via Dashboard:** R2 → jvp-public-assets → Upload

```
Files uploaded:
├── logo.png           (150 KB)
├── style.css          (45 KB)
├── app.js             (250 KB)
└── index.html         (8 KB)
```

**Or via CLI:**
```bash
wrangler r2 object put jvp-public-assets/logo.png --file ./logo.png --env production
wrangler r2 object put jvp-public-assets/style.css --file ./style.css --env production
wrangler r2 object put jvp-public-assets/app.js --file ./app.js --env production
```

**Output:**
```
✓ Uploaded logo.png to jvp-public-assets/
✓ Uploaded style.css to jvp-public-assets/
✓ Uploaded app.js to jvp-public-assets/
```

#### 5b. Upload to Vault Bucket (Must match folder structure!)

```bash
# Core tier content
wrangler r2 object put jvp-all-access-vault/all-access/core/guide.pdf --file ./guide.pdf --env production

# Plus tier content
wrangler r2 object put jvp-all-access-vault/all-access/plus/playbook.docx --file ./playbook.docx --env production

# Inner circle tier content
wrangler r2 object put jvp-all-access-vault/all-access/inner-circle/exclusive.mp4 --file ./exclusive.mp4 --env production

# Other paths
wrangler r2 object put jvp-all-access-vault/drops/drop-1.zip --file ./drop.zip --env production
wrangler r2 object put jvp-all-access-vault/replays/session.mp4 --file ./session.mp4 --env production
wrangler r2 object put jvp-all-access-vault/shop/product.pdf --file ./product.pdf --env production
```

**Output:**
```
✓ Uploaded guide.pdf to jvp-all-access-vault/all-access/core/
✓ Uploaded playbook.docx to jvp-all-access-vault/all-access/plus/
✓ Uploaded exclusive.mp4 to jvp-all-access-vault/all-access/inner-circle/
✓ Uploaded drop-1.zip to jvp-all-access-vault/drops/
✓ Uploaded session.mp4 to jvp-all-access-vault/replays/
✓ Uploaded product.pdf to jvp-all-access-vault/shop/
```

---

### **Phase 6: Add DNS Routes (2 minutes)**

Go to **Cloudflare Dashboard** → **DNS**

Add two CNAME records:

#### Record 1 (Public Assets)
```
Type:     CNAME
Name:     assets
Target:   jvp-worker.<your-account-id>.workers.dev
Proxied:  ✓ (orange cloud)
TTL:      Auto
```

#### Record 2 (Vault)
```
Type:     CNAME
Name:     vault
Target:   jvp-worker.<your-account-id>.workers.dev
Proxied:  ✓ (orange cloud)
TTL:      Auto
```

**DNS Records After (in dashboard):**
```
Type | Name                      | Target                              | Status
-----|---------------------------|-------------------------------------|--------
CNAME| assets                    | jvp-worker.xxx.workers.dev        | ✓ Proxied
CNAME| vault                     | jvp-worker.xxx.workers.dev        | ✓ Proxied
```

---

## **Phase 7: Test Everything (3 minutes)**

### Test 1: Public Asset (No Auth)

```bash
curl https://assets.jaypventuresllc.com/logo.png -v
```

**SUCCESS Response:**
```
HTTP/2 200 OK
content-type: image/png
cache-control: public, max-age=31536000, immutable
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: strict-origin-when-cross-origin

[PNG binary data...]
```

### Test 2: Public Asset Not Found

```bash
curl https://assets.jaypventuresllc.com/missing.png -v
```

**FAIL Response:**
```
HTTP/2 404 Not Found
content-type: text/plain
cache-control: public, max-age=300

Not Found
```

### Test 3: Vault Without Token (Should Fail)

```bash
curl https://vault.jaypventuresllc.com/all-access/plus/guide.pdf -v
```

**FAIL Response:**
```
HTTP/2 401 Unauthorized
content-type: text/plain
cache-control: private, no-store

Unauthorized
```

### Test 4: Vault With Valid Token (Should Succeed)

First, get a JWT from Memberstack with `tier: "plus"`:

```bash
# Example JWT (get real one from Memberstack):
JWT_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInRpZXIiOiJwbHVzIiwiZXhwIjoxNzA3MzAwMDAwfQ.signature..."

curl https://vault.jaypventuresllc.com/all-access/plus/guide.pdf \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -v
```

**SUCCESS Response:**
```
HTTP/2 200 OK
content-type: application/pdf
cache-control: private, no-store
x-content-type-options: nosniff
x-frame-options: DENY

[PDF binary data...]
```

### Test 5: Vault With Wrong Tier (Should Fail with 403)

Use a `tier: "core"` token but access `/all-access/inner-circle/`:

```bash
CORE_JWT="eyJ...tier...core...signature"

curl https://vault.jaypventuresllc.com/all-access/inner-circle/exclusive.mp4 \
  -H "Authorization: Bearer $CORE_JWT" \
  -v
```

**FAIL Response:**
```
HTTP/2 403 Forbidden
content-type: text/plain
cache-control: private, no-store

Forbidden
```

### Test 6: Vault Admin Path (Always 403)

```bash
# Even with valid inner_circle token, /admin/ is always denied
curl https://vault.jaypventuresllc.com/admin/secret.txt \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -v
```

**FAIL Response:**
```
HTTP/2 403 Forbidden
Forbidden
```

---

## **Phase 8: Monitor Logs (Ongoing)**

Watch real-time requests:

```bash
wrangler tail --env production
```

**Terminal Output:**
```
✓ Tailing live logs... (Ctrl+C to stop)

[2024-02-06 12:34:56.123] assets.jaypventuresllc.com /logo.png 200
[2024-02-06 12:34:57.456] assets.jaypventuresllc.com /style.css 200
[2024-02-06 12:34:58.789] vault.jaypventuresllc.com /all-access/plus/guide.pdf 200 tier=plus
[2024-02-06 12:34:59.012] vault.jaypventuresllc.com /admin/secret.txt 403 tier=plus
[2024-02-06 12:35:00.345] vault.jaypventuresllc.com /all-access/core/missing.pdf 404 tier=core
[2024-02-06 12:35:01.678] vault.jaypventuresllc.com /missing-auth 401
```

---

## **What Your Live URLs Look Like**

### Public Assets
```
https://assets.jaypventuresllc.com/logo.png          ✅ 200 OK (cached 1 year)
https://assets.jaypventuresllc.com/style.css         ✅ 200 OK (cached 1 year)
https://assets.jaypventuresllc.com/app.js            ✅ 200 OK (cached 1 year)
https://assets.jaypventuresllc.com/notfound.txt      ❌ 404 Not Found
```

### Private Vault (Requires JWT)
```
# Core tier user
https://vault.jaypventuresllc.com/all-access/core/guide.pdf         ✅ 200 OK
https://vault.jaypventuresllc.com/drops/drop-1.zip                  ✅ 200 OK
https://vault.jaypventuresllc.com/all-access/inner-circle/file.pdf  ❌ 403 Forbidden

# Plus tier user
https://vault.jaypventuresllc.com/all-access/plus/playbook.docx     ✅ 200 OK
https://vault.jaypventuresllc.com/replays/session.mp4               ✅ 200 OK
https://vault.jaypventuresllc.com/all-access/inner-circle/file.pdf  ❌ 403 Forbidden

# Inner circle tier user (highest)
https://vault.jaypventuresllc.com/all-access/inner-circle/exclusive.mp4  ✅ 200 OK
https://vault.jaypventuresllc.com/all-access/core/guide.pdf              ✅ 200 OK
https://vault.jaypventuresllc.com/all-access/plus/playbook.docx          ✅ 200 OK

# Anyone (including no auth)
https://vault.jaypventuresllc.com/missing-token                      ❌ 401 Unauthorized
https://vault.jaypventuresllc.com/admin/secret.txt                  ❌ 403 Forbidden (always)
```

---

## **Complete Timeline**

| Step | Time | Action |
|------|------|--------|
| 1 | 2 min | `npm install && wrangler login` |
| 2 | 2 min | Create R2 buckets in dashboard |
| 3 | 2 min | `wrangler secret put MEMBERSTACK_JWT_PUBLIC_KEY` |
| 4 | 2 min | `wrangler deploy --env production` |
| 5 | 5 min | Upload files to R2 via CLI/dashboard |
| 6 | 2 min | Add 2 CNAME records in DNS |
| 7 | 3 min | Test all 6 endpoints |
| **Total** | **~18 minutes** | **Worker live & fully functional** |

---

## **Common Issues During Deploy**

| Problem | Cause | Fix |
|---------|-------|-----|
| `wrangler: command not found` | Not installed globally | `npm install -g @cloudflare/wrangler` |
| `Bucket not found` | Typo in bucket name | Check R2 bucket name exactly matches `wrangler.toml` |
| `MEMBERSTACK_JWT_PUBLIC_KEY not found` | Secret not set | `wrangler secret put MEMBERSTACK_JWT_PUBLIC_KEY --env production` |
| DNS not resolving | CNAME not created or proxied | Check Cloudflare DNS, ensure orange cloud (proxied) |
| 401 on all vault requests | JWT missing or invalid | Ensure token in `Authorization: Bearer <token>` header |
| 403 on correct path | Tier mismatch | Verify JWT `tier` claim matches path (use logs to debug) |

---

## **After Deploy: Regular Maintenance**

### Update Files in R2
```bash
# Update public assets
wrangler r2 object put jvp-public-assets/new-logo.png --file ./new-logo.png --env production

# Update vault content
wrangler r2 object put jvp-all-access-vault/all-access/plus/updated.pdf --file ./updated.pdf --env production
```

### View Worker Metrics (Optional)
```bash
wrangler analytics engine
```

### Redeploy Worker Code
```bash
# If you modify src/index.ts
npm run build
npm run deploy
```

---

## **Your Worker is Live! 🚀**

After these 8 phases (~18 min):
- ✅ Public assets served globally with long cache
- ✅ Private vault protected with JWT auth
- ✅ Tier-based access control active
- ✅ Logs streaming in real-time
- ✅ Ready for production traffic

**Example: Embed in your site**
```html
<!-- Public assets (no auth) -->
<img src="https://assets.jaypventuresllc.com/logo.png" alt="Logo">
<link rel="stylesheet" href="https://assets.jaypventuresllc.com/style.css">

<!-- Private vault (needs JWT) -->
<a href="https://vault.jaypventuresllc.com/all-access/plus/guide.pdf" 
   data-jwt-token="YOUR_TOKEN_HERE">
  Download Guide (Plus Members Only)
</a>
```

---

**Questions?** Check `CLOUDFLARE_SETUP.md` for detailed troubleshooting.
