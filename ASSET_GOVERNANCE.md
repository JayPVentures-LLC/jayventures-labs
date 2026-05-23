# Enterprise Asset Governance System

## Overview

The Enterprise Asset Governance System provides a centralized, authoritative approach to managing assets across the JayPV ecosystem. This system ensures that all brand assets are properly categorized, approved, and tracked.

## Directory Structure

```
public/assets/
├── logos/
│   ├── jpv-master.png
│   ├── jpv-os.png
│   ├── jaypventures.png
│   ├── jaypvlabs.png
│   ├── jpv-institute.png
│   └── init.png
│
├── reference/
│   ├── allbrands-logos.png
│   ├── ecosystem-inspo.png
│   └── poster-direction.png
│
├── generated/
│   ├── ai-poster-v1.png
│   ├── ai-poster-v2.png
│   └── concept-renders/
│
├── preview/
│   └── asset-preview-bg.png
│
└── governance/
    └── asset-provenance.json
```

## Asset Categories

### 1. **Production Logos** (`logos/`)
- Approved production-ready brand assets
- Used for official communications, marketing, and products
- Governed by brand governance rules
- All assets in this category must be approved before use
- **Assets:**
  - `jpv-master.png` - Master enterprise logo
  - `jpv-os.png` - JPV-OS product logo
  - `jaypventures.png` - JayPVentures creator ecosystem
  - `jaypvlabs.png` - JayPV Labs institutional brand
  - `jpv-institute.png` - Institute division
  - `init.png` - Initiative/program branding

### 2. **Design References** (`reference/`)
- Inspiration materials and ecosystem resources
- **Not** for production use - reference only
- Used to guide design decisions and maintain consistency
- **Assets:**
  - `allbrands-logos.png` - All brand variants in one view
  - `ecosystem-inspo.png` - Visual inspiration for ecosystem design
  - `poster-direction.png` - Poster and campaign design direction

### 3. **Generated Concepts** (`generated/`)
- AI-generated and exploratory renders
- For review and iteration only
- Requires approval before production deployment
- **Assets:**
  - `ai-poster-v1.png` - AI concept v1
  - `ai-poster-v2.png` - AI concept v2
  - `concept-renders/` - Directory for concept explorations

### 4. **Preview Utilities** (`preview/`)
- UI components and preview page assets
- Used for documentation and internal tools
- **Assets:**
  - `asset-preview-bg.png` - Background for preview page

## Configuration Files

### `config/assetPaths.ts`
Provides TypeScript constants for all asset paths. This is the **authoritative** source for asset paths in code.

**Usage:**
```typescript
import AssetPaths from "@/config/assetPaths";

// Access production logos
const masterLogo = AssetPaths.Logos.Master;      // "/assets/logos/jpv-master.png"
const jpvosLogo = AssetPaths.Logos.JPVOS;        // "/assets/logos/jpv-os.png"

// Access design references
const brandBoard = AssetPaths.References.AllBrandsBoard;  // "/assets/reference/allbrands-logos.png"

// Access generated concepts
const poster = AssetPaths.Generated.AIPosterV1;  // "/assets/generated/ai-poster-v1.png"

// Get governance metadata
const provenanceFile = AssetPaths.Governance.ProvenanceFile;
```

### `config/assetLoader.ts`
Runtime utilities for loading provenance data and validating assets.

**Usage:**
```typescript
import AssetLoader from "@/config/assetLoader";

// Load all production logos
const logos = await AssetLoader.getProductionLogos();

// Get asset by ID
const jpvosAsset = await AssetLoader.getAssetById("jpv-os");

// Validate asset for production use
const isApproved = await AssetLoader.validateAssetForProduction("jpv-os");

// Get full asset path with validation
const path = await AssetLoader.getAssetPath("jpv-os");
```

### `public/assets/governance/asset-provenance.json`
Machine-readable metadata for all assets including:
- Asset names and file paths
- Category classifications
- Approval status
- Brand associations
- Governance rules
- Change history

## Governance Rules

1. **All production assets must be approved before use**
   - Only approved logos in the `logos/` directory
   - Check approval status in provenance file

2. **Design references are for inspiration only**
   - Never use reference assets as production logos
   - Use only for design guidance and consistency

3. **Generated concepts require approval before production deployment**
   - Keep in `generated/` directory until approved
   - Move to appropriate production directory after approval

4. **Asset paths should be referenced through `assetPaths.ts` constants only**
   - Never hardcode asset paths in code
   - Always use constants from `config/assetPaths.ts`
   - This enables centralized management and quick updates

5. **Any new assets must have metadata entries in the provenance file**
   - Update `asset-provenance.json` when adding new assets
   - Include all required metadata fields

## Preview Page

Access the asset governance preview at `/assets/preview`

The preview page displays:
- **Production Logos** - All approved brand logos with metadata
- **Design References** - Inspiration and ecosystem materials
- **Generated Concepts** - AI renders and exploratory concepts
- **Governance Rules** - All asset governance rules
- **Change Log** - History of asset governance changes

## Integration Guide

### Importing Assets in Components

```typescript
import AssetPaths from "@/config/assetPaths";

export function BrandHeader() {
  return (
    <img
      src={AssetPaths.Logos.Master}
      alt="JPV Master Logo"
    />
  );
}
```

### Server-Side Asset Loading

```typescript
import AssetLoader from "@/config/assetLoader";

export async function getStaticProps() {
  const logos = await AssetLoader.getProductionLogos();
  
  return {
    props: { logos },
    revalidate: 3600, // Revalidate every hour
  };
}
```

### Conditional Asset Usage

```typescript
import AssetLoader from "@/config/assetLoader";

export async function loadAssetForDisplay(assetId: string) {
  const isApproved = await AssetLoader.validateAssetForProduction(assetId);
  
  if (!isApproved) {
    throw new Error(`Asset ${assetId} is not approved for production`);
  }
  
  return AssetLoader.getAssetPath(assetId);
}
```

## Adding New Assets

### Step 1: Add Asset File
Place the asset file in the appropriate directory:
- Production logos → `public/assets/logos/`
- Design references → `public/assets/reference/`
- Generated concepts → `public/assets/generated/`
- Preview utilities → `public/assets/preview/`

### Step 2: Update Provenance
Add metadata to `public/assets/governance/asset-provenance.json`:

```json
{
  "id": "unique-asset-id",
  "name": "Human-readable asset name",
  "file": "filename.png",
  "category": "production-logo",
  "approved": true,
  "version": "1.0",
  "source": "Brand governance",
  "notes": "Usage notes and context"
}
```

### Step 3: Update Constants (if needed)
If adding a new category or changing structure, update `config/assetPaths.ts`.

### Step 4: Validate
Run the asset preview page to confirm proper display and metadata.

## Best Practices

1. **Always use constants** - Reference `AssetPaths.*` in code, never hardcode paths
2. **Check approval status** - Use `AssetLoader.validateAssetForProduction()` before use
3. **Update metadata** - Keep provenance file in sync with physical assets
4. **Version assets** - Include version numbers for critical brand assets
5. **Document sources** - Track asset origin and creation metadata
6. **Review regularly** - Audit assets quarterly for obsolescence

## Troubleshooting

### Asset Not Found
- Check file exists in correct directory
- Verify filename matches provenance entry
- Check for case sensitivity issues

### Provenance File Not Loading
- Verify `public/assets/governance/asset-provenance.json` exists
- Check JSON syntax validity
- Verify fetch path is correct

### Asset Not Displayed in Preview
- Ensure metadata entry exists in provenance file
- Check category classification is correct
- Verify file path in metadata matches actual file

## Support

For questions about the asset governance system, refer to:
- `config/assetPaths.ts` - Asset path constants
- `config/assetLoader.ts` - Runtime utilities
- `/assets/preview` - Visual governance dashboard
- `public/assets/governance/asset-provenance.json` - Asset metadata
