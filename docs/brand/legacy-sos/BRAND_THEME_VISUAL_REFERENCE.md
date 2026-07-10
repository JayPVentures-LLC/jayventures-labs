# Brand Theme Visual Reference

Quick reference guide for the dual-brand visual system.

---

## 🎨 Color Palettes

### JayPVentures LLC (Enterprise)
**Theme Mode**: `enterprise`  
**Atmosphere**: Dark, authoritative, precision-focused

```
Background:   #0B0B10  (dark charcoal)
Panel:        rgba(255,255,255,0.04)  (translucent dark)
Text:         #FFFFFF  (white)
Muted Text:   rgba(255,255,255,0.72)  (soft white)
Primary:      #E11D48  (crimson red)
Accent:       #F59E0B  (amber)
Border:       rgba(255,255,255,0.10)  (subtle white)
```

### jaypventures (Creator)
**Theme Mode**: `iridescent`  
**Atmosphere**: Light, creative, multi-dimensional

```
Background:   #F7F7FB  (soft lavender)
Panel:        linear-gradient(145deg, rgba(255,255,255,0.95), rgba(243,240,255,0.92))
Text:         #0B0B10  (dark charcoal)
Muted Text:   #4B5563  (gray)
Primary:      #6D28D9  (violet)
Accent:       #22D3EE  (cyan)
Border:       rgba(15, 23, 42, 0.12)  (subtle dark)
```

---

## 🌈 Iridescent Accent Colors (Creator Only)

```
Cyan:     #4DEBFF
Violet:   #8B5CFF
Magenta:  #FF3DF0
Lime:     #B6FF4D
```

**Used in**: Gradient borders, gradient text, brand dot indicator

---

## 📦 Component Styling Examples

### Service Card (Enterprise)
```
Background:   rgba(255,255,255,0.04)
Border:       1px solid rgba(255,255,255,0.10)
Text Color:   #FFFFFF
CTA Color:    #E11D48 (crimson)
Shadow:       None
```

### Service Card (Creator)
```
Background:   linear-gradient(145deg, rgba(255,255,255,0.95), rgba(243,240,255,0.92))
Border:       1px solid rgba(109, 40, 217, 0.15)
Text Color:   #0B0B10
CTA Color:    Gradient (cyan → violet → magenta)
Shadow:       0 4px 12px rgba(109, 40, 217, 0.08)
```

---

## ✨ Hover Effects

### Blog Card Hover (Enterprise)
```
Transform:    translateY(-2px)
Box Shadow:   0 8px 20px rgba(0, 0, 0, 0.2)
Transition:   0.2s ease
```

### Blog Card Hover (Creator)
```
Transform:    translateY(-2px)
Box Shadow:   0 8px 20px rgba(109, 40, 217, 0.15)  (violet glow)
Transition:   0.2s ease
```

---

## 🧩 CSS Utility Classes

### `.panel-iridescent`
Creator brand panel styling
```css
background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(243,240,255,0.92));
border: 1px solid rgba(109, 40, 217, 0.15);
```

### `.card-iridescent`
Creator brand card with shadow
```css
background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(243,240,255,0.92));
border: 1px solid rgba(109, 40, 217, 0.15);
box-shadow: 0 4px 12px rgba(109, 40, 217, 0.08);
```

### `.text-iridescent`
Gradient text effect
```css
background: linear-gradient(90deg, #4DEBFF, #8B5CFF, #FF3DF0);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### `.border-iridescent`
Gradient border using CSS masking
```css
/* See TRACK_A_UI_POLISH_COMPLETE.md for full implementation */
```

---

## 🔄 Schematic Overlays

### Enterprise: `data-schematics="on"`
Grid pattern with subtle white lines
```css
opacity: 0.18;
background-image:
  linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
background-size: 32px 32px;
mask-image: radial-gradient(circle at 30% 10%, black 20%, transparent 70%);
```

### Creator: `data-schematics="soft"`
Radial gradients with iridescent colors
```css
opacity: 0.08;
background-image:
  radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.20), transparent 45%),
  radial-gradient(circle at 70% 40%, rgba(109, 40, 217, 0.16), transparent 50%);
```

---

## 📱 Responsive Breakpoints

```
Mobile:        < 768px   (1 column)
Tablet:        768-1024px (2 columns)
Desktop:       > 1024px  (2 columns)
```

All brand colors and gradients remain consistent across breakpoints.

---

## 🎯 Usage in Code

### Detecting Brand Mode
```tsx
import { useBrandConfig } from '@/hooks/useBrandConfig'

const cfg = useBrandConfig()
const isIridescent = cfg.theme.mode === 'iridescent'
```

### Conditional Styling
```tsx
<div 
  className={isIridescent ? 'panel-iridescent' : ''}
  style={{
    border: isIridescent ? undefined : '1px solid var(--brand-border)',
    background: isIridescent ? undefined : 'var(--brand-panel)',
  }}
>
  Content
</div>
```

### Using CSS Variables
```tsx
<h1 style={{ color: 'var(--brand-text)' }}>Title</h1>
<p style={{ color: 'var(--brand-muted)' }}>Subtitle</p>
<a style={{ color: 'var(--brand-primary)' }}>Link</a>
```

---

## 🖼️ Visual Comparison

### Services Page

**Enterprise (`/jaypventures-llc/services`)**:
- Dark charcoal background
- Translucent dark panels
- White text, red CTAs
- Sharp, minimal aesthetic
- Grid schematic overlay

**Creator (`/jaypventures/services`)**:
- Soft lavender background
- Iridescent gradient panels
- Dark text, gradient CTAs
- Warm, inviting aesthetic
- Soft radial glow overlay

### Blog Page

**Enterprise (`/jaypventures-llc/blog`)**:
- Dark cards with sharp borders
- White text
- Dark shadow on hover
- Minimal, professional

**Creator (`/jaypventures/blog`)**:
- Gradient cards with violet borders
- Dark text on light gradient
- Violet glow on hover
- Playful, premium

---

## 🔧 CSS Variable Reference

### Global Variables (Always Available)
```css
--iridescent-cyan: #4DEBFF
--iridescent-violet: #8B5CFF
--iridescent-magenta: #FF3DF0
--iridescent-lime: #B6FF4D
```

### Brand-Driven Variables (Updated on Theme Switch)
```css
--brand-bg
--brand-panel
--brand-text
--brand-muted
--brand-primary
--brand-accent
--brand-border
```

### Legacy Variables (For Compatibility)
```css
--color-brand-primary
--color-brand-secondary
--color-brand-accent
```

---

## ✅ Quick Testing Checklist

- [ ] Creator services show iridescent panels
- [ ] Enterprise services show dark panels
- [ ] Text uses `var(--brand-text)` and is readable
- [ ] CTAs use correct colors (red for enterprise, gradient for creator)
- [ ] Hover effects work with brand-specific shadows
- [ ] BrandToggle switches theme instantly without flash
- [ ] Query params preserve on brand switch
- [ ] Schematic overlays render correctly
- [ ] Mobile layout collapses to 1 column

---

**Last Updated**: Session 6, February 2026  
**Related**: `TRACK_A_UI_POLISH_COMPLETE.md` (full implementation details)
