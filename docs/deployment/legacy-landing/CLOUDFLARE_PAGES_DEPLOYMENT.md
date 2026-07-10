# Cloudflare Pages Deployment Guide

## Quick Start (5 minutes)

### Step 1: Connect GitHub Repository
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Select **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select repository: `jaypventures-llc/jaypventuresllc.com` (or your fork)
6. Click **Begin setup**

### Step 2: Configure Build Settings
- **Project name:** `jaypventures-landing`
- **Production branch:** `main` (or your preferred branch)
- **Build command:** `npm run build`
- **Build output directory:** `out`
- **Root directory:** `/` (leave empty if Next.js is at root)

### Step 3: Environment Variables (Optional)
If you have environment variables, add them in the Pages dashboard:
- `NEXT_PUBLIC_API_URL=https://api.jaypventures.com`
- `NEXT_PUBLIC_CONTACT_EMAIL=hello@jaypventures.com`

### Step 4: Deploy
1. Click **Save and Deploy**
2. Cloudflare automatically builds and deploys
3. Your site is live at `https://<project-name>.pages.dev`

---

## Advanced Setup

### Custom Domain
1. In Cloudflare Pages project settings → **Domains**
2. Add custom domain: `jaypventures.com`
3. Update DNS records (Cloudflare provides instructions)
4. SSL/TLS certificate auto-provisioned (free)

### Automatic Deployments
- **Production:** Automatically triggers on pushes to `main` branch
- **Preview:** Automatic preview builds on all pull requests
- **Rollback:** One-click rollback to previous deployments

### Monitor Deployments
- Dashboard shows build logs in real-time
- Failed builds prevent deployments (safety feature)
- View deployment history and analytics

---

## Local Testing Before Deploy

### Build Locally
```bash
cd ./jaypventures-landing
npm run build
```

### Test the Static Output
```bash
# Option 1: Using npx serve
npx serve -s out -l 3000

# Option 2: Using Python
python -m http.server 8000 --directory out

# Option 3: Using Docker (if you want to test the container)
docker compose up -d
```

Then visit `http://localhost:3000` (or 8000) to preview exactly what will be deployed.

---

## What Gets Deployed

| File/Folder | Deployed? | Notes |
|-------------|-----------|-------|
| `out/` | ✅ Yes | Static HTML/CSS/JS from Next.js build |
| `node_modules/` | ❌ No | Cloudflare builds fresh dependencies |
| `.git/` | ❌ No | Git history not needed |
| `src/` | ❌ No | Source code not deployed |
| `public/` | ✅ Yes | Included in `out/` after build |

---

## Performance & Caching

**Cloudflare Pages automatically:**
- Compresses assets (gzip, brotli)
- Caches on global CDN (120+ data centers)
- Serves from edge location nearest to user
- Revalidates cache on new deployments

**Cache headers from your nginx.conf apply if using Workers, but Pages handles caching automatically.**

---

## Troubleshooting

### Build Fails with "npm run build"
- Check `package.json` scripts
- Verify all dependencies are in `package.json` (not just installed locally)
- View full build logs in Cloudflare dashboard

### Site shows 404 on routes
- Next.js static export creates `out/index.html` for root
- For nested routes, Pages automatically serves `out/page/index.html`
- This is built-in behavior; no additional configuration needed

### Environment variables not working
- Ensure variables are added to Cloudflare Pages dashboard (not just `.env.local`)
- Prefix with `NEXT_PUBLIC_` to access in browser
- Rebuild after adding variables

### Custom domain not working
- Allow 24-48 hours for DNS propagation
- Verify domain is added in Cloudflare Pages settings
- Check Cloudflare nameservers are active

---

## Going Live Checklist

- [ ] Repository connected to Cloudflare Pages
- [ ] Build settings configured (`npm run build` → `out/`)
- [ ] Environment variables set (if needed)
- [ ] Preview deployment successful
- [ ] Custom domain configured (if using custom domain)
- [ ] SSL/TLS certificate active (auto-provisioned)
- [ ] Analytics enabled (optional, in dashboard)
- [ ] Test all page routes in production
- [ ] Test forms/interactive elements
- [ ] Monitor error logs first week

---

## Next Steps

### Add Analytics
Cloudflare Pages includes basic analytics:
- Page views
- Unique visitors
- Bounce rate
- Top pages

Enable in **Pages** → **Project** → **Analytics**

### Monitor Uptime
Cloudflare automatically monitors your site for uptime. View in dashboard.

### Scale for Growth
As traffic increases:
- Cloudflare handles scaling automatically (no action needed)
- Pay only for actual traffic (on paid plans)
- Global CDN reduces latency worldwide

---

## Local Development Workflow

### Option 1: Next.js Dev Server (Recommended for development)
```bash
cd jaypventures-landing
npm run dev
# Visit http://localhost:3000
```

### Option 2: Docker (If you want to test production-like environment)
```bash
cd jaypventures-landing
docker compose up -d
# Visit http://localhost
```

### Option 3: Cloudflare Pages Preview (Test before merging)
- Push to feature branch
- Open pull request
- Cloudflare automatically creates preview deployment
- Share preview URL with team
- Merge when ready

---

## Comparison: Local Dev vs Production

| Aspect | `npm run dev` | Docker | Cloudflare Pages |
|--------|---------------|--------|-------------------|
| **Speed** | Fast (~2s reload) | Slower (~5s rebuild) | Instant (CDN) |
| **Environment** | Dev mode | Production | Production |
| **Reloading** | Hot reload | Manual restart | N/A (static) |
| **Best for** | Development | Testing container | End users |

---

## Support & Resources

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Next.js Static Export:** https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **Custom Domains:** https://developers.cloudflare.com/pages/configuration/custom-domain/
- **Environment Variables:** https://developers.cloudflare.com/pages/configuration/build-configuration/
- **Troubleshooting:** https://developers.cloudflare.com/pages/troubleshooting/

---

## Summary

**Cloudflare Pages is the ideal choice for your Next.js static export because:**
1. ✅ Zero configuration needed (it just works)
2. ✅ Automatic CI/CD on every git push
3. ✅ Global CDN included (free)
4. ✅ Unlimited bandwidth (free tier)
5. ✅ Automatic SSL/TLS
6. ✅ Preview deployments on PRs
7. ✅ One-click rollbacks
8. ✅ No server management needed

Your site will be live in minutes with just a few clicks!
