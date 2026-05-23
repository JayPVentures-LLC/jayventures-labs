# Asset Governance - Quick Start Guide

## TL;DR

Asset governance is now centralized through TypeScript constants. **Never hardcode asset paths.**

## Use These Imports

```typescript
import AssetPaths from "@/config/assetPaths";
import AssetLoader from "@/config/assetLoader";
import { useAssets, useAssetById } from "@/config/useAssets";
```

## Common Usage Patterns

### 1. Display a Production Logo

```typescript
import AssetPaths from "@/config/assetPaths";

export function Header() {
  return (
    <img
      src={AssetPaths.Logos.Master}
      alt="JPV Master Logo"
    />
  );
}
```

### 2. Use React Hook in Component

```typescript
import { useAssets } from "@/config/useAssets";

export function BrandGrid() {
  const { logos, loading, error } = useAssets();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {logos.map((logo) => (
        <img key={logo.id} src={`/assets/logos/${logo.file}`} />
      ))}
    </div>
  );
}
```

### 3. Server-Side Asset Loading

```typescript
import AssetLoader from "@/config/assetLoader";

export async function getStaticProps() {
  const logos = await AssetLoader.getProductionLogos();

  return {
    props: { logos },
    revalidate: 3600,
  };
}
```

### 4. Validate Asset Before Use

```typescript
import AssetLoader from "@/config/assetLoader";

const isApproved = await AssetLoader.validateAssetForProduction("jpv-os");

if (!isApproved) {
  throw new Error("Asset not approved for production");
}
```

## Available Asset Constants

### Production Logos
```
AssetPaths.Logos.Master        // "/assets/logos/jpv-master.png"
AssetPaths.Logos.JPVOS         // "/assets/logos/jpv-os.png"
AssetPaths.Logos.JayPVentures  // "/assets/logos/jaypventures.png"
AssetPaths.Logos.Labs          // "/assets/logos/jaypvlabs.png"
AssetPaths.Logos.Institute     // "/assets/logos/jpv-institute.png"
AssetPaths.Logos.Init          // "/assets/logos/init.png"
```

### Design References
```
AssetPaths.References.AllBrandsBoard    // "/assets/reference/allbrands-logos.png"
AssetPaths.References.EcosystemInspo    // "/assets/reference/ecosystem-inspo.png"
AssetPaths.References.PosterDirection   // "/assets/reference/poster-direction.png"
```

### Generated Concepts
```
AssetPaths.Generated.AIPosterV1    // "/assets/generated/ai-poster-v1.png"
AssetPaths.Generated.AIPosterV2    // "/assets/generated/ai-poster-v2.png"
AssetPaths.Generated.ConceptRenders // "/assets/generated/concept-renders"
```

## Asset Loader Methods

```typescript
// Get all assets by category
await AssetLoader.getProductionLogos();
await AssetLoader.getDesignReferences();
await AssetLoader.getGeneratedConcepts();

// Get specific asset
await AssetLoader.getAssetById("jpv-os");
await AssetLoader.getAssetByFilename("jpv-master.png");

// Validate and retrieve
await AssetLoader.validateAssetForProduction("jpv-os"); // Returns boolean
await AssetLoader.getAssetPath("jpv-os");              // Returns full path

// Load metadata
await AssetLoader.loadAssetProvenance();
```

## Asset Governance Rules

1. ✓ Use `AssetPaths.*` constants for all asset references
2. ✓ Validate production use with `validateAssetForProduction()`
3. ✓ Reference logos only from `logos/` directory
4. ✓ Use design references for inspiration only
5. ✓ Get approval before using generated concepts in production

## View All Assets

Visit `/assets/preview` to see the complete asset governance dashboard with:
- All production logos and metadata
- Design references and inspiration materials
- Generated concepts and exploratory renders
- Governance rules and change log

## Questions?

Refer to `ASSET_GOVERNANCE.md` for comprehensive documentation.
