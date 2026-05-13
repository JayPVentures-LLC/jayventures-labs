# How to Add Your Logos

## Step 1: Prepare Your Logo Files

You'll need 4 logo files in PNG format:

### For JayPVentures LLC (Infrastructure)
- **jaypventures-logo.png** - Main logo for header/navigation
- **jaypventures-llc-logo.png** - Square version for ecosystem section
- **jaypventures-footer-logo.png** - Compact version for footer

### For jaypventures (Creator Platform)
- **jaypventures-creator-logo.png** - Brand logo for ecosystem section

## Step 2: Export Your Logos

For each logo, export as:
- **Format**: PNG
- **Background**: Transparent (no background)
- **Resolution**: 2x the display size (e.g., 400x120px for a 200x60px display logo)
- **Color Space**: sRGB (web standard)
- **DPI**: 72 DPI

### File Size Specifications

| Logo | Display Size | Export Size | Purpose |
|------|-------------|------------|---------|
| jaypventures-logo.png | 200x60px | 400x120px | Header nav |
| jaypventures-llc-logo.png | 150x150px | 300x300px | Ecosystem brand |
| jaypventures-creator-logo.png | 150x150px | 300x300px | Creator platform |
| jaypventures-footer-logo.png | 120x40px | 240x80px | Footer |

## Step 3: Add Files to Website

1. Open file explorer
2. Navigate to: `C:\Users\jaypv\jaypventures-landing\public\logos\`
3. Drop your PNG files into this folder

That's it! The website will automatically find and display them.

## Step 4: Verify Logos Display

1. **Refresh the page** (`Ctrl+F5` or `Cmd+Shift+R`)
2. Clear browser cache if needed: `Ctrl+Shift+Delete`
3. Restart dev server: Stop and run `npm run dev` again
4. Check:
   - Header logo appears in top-left
   - Ecosystem section shows both brand logos
   - Footer logo displays

## Step 5: If Logos Don't Show

**Check the browser console:**
1. Open DevTools: `F12`
2. Go to "Console" tab
3. Look for 404 errors with logo filenames
4. Verify:
   - File exists in `/public/logos/`
   - Filename matches exactly
   - File is actually PNG format

## Logo Design Tips

### Header Logo (jaypventures-logo.png)
- **Shape**: Horizontal/landscape ratio
- **Style**: Should work at small sizes (header is ~60px tall)
- **Colors**: Works best with your brand color (#b30000 red)
- **Usage**: Don't make it too wide; aim for 3:1 ratio max

### Ecosystem Logos (llc + creator)
- **Shape**: Square preferred (150x150px display)
- **Style**: Can be more detailed than header logo
- **Colors**: Each brand can have distinct colors
- **Usage**: Displayed side-by-side

### Footer Logo (jaypventures-footer-logo.png)
- **Shape**: Horizontal/landscape
- **Style**: Simplified, compact version of header logo
- **Colors**: Works with light grays
- **Usage**: Small, with text next to it

## File Quality Checklist

- [ ] All files are PNG format
- [ ] All files have transparent backgrounds
- [ ] Filenames match exactly (case-sensitive on Mac/Linux)
- [ ] Files placed in `/public/logos/` folder
- [ ] Resolution is at least 2x display size
- [ ] Logos are legible at minimum display size
- [ ] Color contrast is clear against white/dark backgrounds

## Troubleshooting

### Logos show as broken badges
**Solution**: Check file exists in `/public/logos/` folder

### Only some logos show
**Solution**: Some files may be missing. Check all 4 are present

### Wrong size/distorted
**Solution**: Adjust the CSS in component files:
- Header: `src/components/Header.tsx` (line ~25)
- Ecosystem: `src/components/Ecosystem.tsx` (line ~15)
- Footer: `src/components/Footer.tsx` (line ~25)

### Still not working
**Solution**: 
1. Restart dev server: `npm run dev`
2. Hard refresh browser: `Ctrl+Shift+R`
3. Clear cache: `Ctrl+Shift+Delete`

## Example File Structure

```
jaypventures-landing/
├── public/
│   └── logos/
│       ├── jaypventures-logo.png
│       ├── jaypventures-llc-logo.png
│       ├── jaypventures-creator-logo.png
│       └── jaypventures-footer-logo.png
├── src/
└── ...
```

## Fallback Design

If logos aren't found, the website automatically displays:
- **Header**: "JP" red badge
- **Ecosystem LLC**: "JP" red badge
- **Ecosystem Creator**: "V" neon badge
- **Footer**: "JP" red badge

This ensures the site always looks professional while you're setting up logos.

---

## Questions?

1. **Can I use different colors?** Yes, logos display as-is with full color
2. **Can I use the same logo twice?** Yes, if both brands use same mark
3. **What if my logo has a background?** Use Photoshop or online tools to remove background (make transparent)
4. **Can I update logos later?** Yes, just replace files and refresh browser

**You're all set to add your logos!** 🎨
