# Quick Start: Deploy to Cloudflare Pages

## Step-by-Step (5 minutes)

### 1. Ensure Git Repository
```bash
cd ./jaypventures-landing
git init
git add .
git commit -m "Initial commit: Next.js landing page"
git push origin main
```

### 2. Connect to Cloudflare Pages
1. Open https://dash.cloudflare.com/
2. Click **Pages** in sidebar
3. Click **Create a project** → **Connect to Git**
4. Authorize GitHub and select your repository
5. Fill in these settings:

```
Project name:        jaypventures-landing
Production branch:   main
Build command:       npm run build
Build output dir:    out
```

6. Click **Save and Deploy**

### 3. Wait for First Deployment
- Cloudflare builds and deploys automatically
- First build takes ~2-3 minutes
- You'll get a preview URL like: `https://jaypventures-landing.pages.dev`

### 4. Add Custom Domain (Optional)
1. In Pages dashboard → **Settings** → **Domains**
2. Add custom domain: `jaypventures.com`
3. Update DNS to Cloudflare nameservers
4. SSL/TLS certificate auto-provisioned

---

## ✅ Deploy Checklist

- [ ] Repository pushed to GitHub
- [ ] Cloudflare account created
- [ ] Repository connected to Cloudflare Pages
- [ ] Build settings configured
- [ ] First deployment successful
- [ ] Preview URL working
- [ ] Custom domain added (if needed)
- [ ] SSL certificate active

---

## What Happens Next (Automatic)

✅ **Every time you push to GitHub:**
1. Cloudflare detects changes
2. Runs `npm run build`
3. Deploys `out/` directory
4. Site updates instantly (global CDN)

✅ **Pull Requests:**
1. Cloudflare creates preview deployment
2. Share preview URL with team
3. Merge when ready

✅ **Issues?**
- Check Cloudflare Pages dashboard for build logs
- Common fixes: Ensure `package.json` has all dependencies

---

## Alternative: Test Locally First

Before pushing to GitHub, test the build locally:

```bash
# Clean disk space if needed
cd ./jaypventures-landing
rm -rf node_modules .next

# Install dependencies
npm install

# Build
npm run build

# Test the static output
npx serve -s out -l 3000
# Visit http://localhost:3000
```

---

## Done!

Your site is now deployed to Cloudflare Pages with:
- ✅ Global CDN (120+ data centers)
- ✅ Automatic SSL/TLS
- ✅ Automatic CI/CD on git push
- ✅ Unlimited bandwidth
- ✅ One-click rollbacks
- ✅ Preview deployments on PRs

No server management. No Docker. Just git push and deploy.

**Questions?** Check the full guide: `CLOUDFLARE_PAGES_DEPLOYMENT.md`
