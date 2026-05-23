/**
 * AssetLoader - Utility for loading and managing assets.
 *
 * Provides runtime access to asset provenance data and asset validation.
 */

import AssetPaths from "./assetPaths";

export type AssetCategoryKey =
  | "production-logos"
  | "design-references"
  | "generated-concepts"
  | "preview-utilities";

export interface AssetProvenanceData {
  metadata: {
    version: string;
    lastUpdated: string;
    governance: string;
    categories: string[];
  };
  assets: Record<
    AssetCategoryKey,
    {
      category: string;
      description: string;
      items: AssetItem[];
    }
  >;
  governance: {
    rules: string[];
    reviewProcess: string;
    changeLog: Array<{
      date: string;
      change: string;
      author: string;
    }>;
  };
}

export interface AssetItem {
  id: string;
  name: string;
  file: string;
  brand?: string;
  approved?: boolean;
  version?: string;
  source?: string;
  license?: string;
  notes?: string;
}

const categoryPathPrefix: Record<AssetCategoryKey, string> = {
  "production-logos": `${AssetPaths.Root}/logos`,
  "design-references": `${AssetPaths.Root}/reference`,
  "generated-concepts": `${AssetPaths.Root}/generated`,
  "preview-utilities": `${AssetPaths.Root}/preview`,
};

let cachedProvenance: AssetProvenanceData | null = null;
let inFlightProvenance: Promise<AssetProvenanceData> | null = null;

/**
 * Load asset provenance data.
 * Caches the resolved result and deduplicates concurrent first loads.
 */
export async function loadAssetProvenance(): Promise<AssetProvenanceData> {
  if (cachedProvenance) {
    return cachedProvenance;
  }

  if (inFlightProvenance) {
    return inFlightProvenance;
  }

  inFlightProvenance = fetch(AssetPaths.Governance.ProvenanceFile)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to load asset provenance: ${response.statusText}`
        );
      }

      const data = (await response.json()) as AssetProvenanceData;
      cachedProvenance = data;
      return data;
    })
    .finally(() => {
      inFlightProvenance = null;
    });

  return inFlightProvenance;
}

export function clearAssetProvenanceCache(): void {
  cachedProvenance = null;
  inFlightProvenance = null;
}

/**
 * Get all production logo assets.
 */
export async function getProductionLogos(): Promise<AssetItem[]> {
  const provenance = await loadAssetProvenance();
  return provenance.assets["production-logos"].items;
}

/**
 * Get all design reference assets.
 */
export async function getDesignReferences(): Promise<AssetItem[]> {
  const provenance = await loadAssetProvenance();
  return provenance.assets["design-references"].items;
}

/**
 * Get all generated concept assets.
 */
export async function getGeneratedConcepts(): Promise<AssetItem[]> {
  const provenance = await loadAssetProvenance();
  return provenance.assets["generated-concepts"].items;
}

/**
 * Get all preview utility assets.
 */
export async function getPreviewUtilities(): Promise<AssetItem[]> {
  const provenance = await loadAssetProvenance();
  return provenance.assets["preview-utilities"].items;
}

export function getAssetPathForCategory(
  categoryKey: AssetCategoryKey,
  asset: AssetItem
): string {
  return `${categoryPathPrefix[categoryKey]}/${asset.file}`;
}

/**
 * Get asset by ID.
 */
export async function getAssetById(assetId: string): Promise<AssetItem | null> {
  const provenance = await loadAssetProvenance();

  for (const category of Object.values(provenance.assets)) {
    const found = category.items.find((item) => item.id === assetId);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Get asset by filename.
 */
export async function getAssetByFilename(
  filename: string
): Promise<AssetItem | null> {
  const provenance = await loadAssetProvenance();

  for (const category of Object.values(provenance.assets)) {
    const found = category.items.find((item) => item.file === filename);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Get governance rules.
 */
export async function getGovernanceRules(): Promise<string[]> {
  const provenance = await loadAssetProvenance();
  return provenance.governance.rules;
}

/**
 * Validate asset usage.
 * Returns true if asset is approved for production use.
 */
export async function validateAssetForProduction(
  assetId: string
): Promise<boolean> {
  const asset = await getAssetById(assetId);
  if (!asset) {
    return false;
  }

  const provenance = await loadAssetProvenance();
  const isProductionLogo = provenance.assets["production-logos"].items.some(
    (item) => item.id === assetId
  );

  return isProductionLogo && asset.approved !== false;
}

/**
 * Get asset path from ID.
 */
export async function getAssetPath(assetId: string): Promise<string | null> {
  const provenance = await loadAssetProvenance();

  for (const [categoryKey, category] of Object.entries(provenance.assets) as Array<
    [AssetCategoryKey, { items: AssetItem[] }]
  >) {
    const found = category.items.find((item) => item.id === assetId);
    if (found) {
      return getAssetPathForCategory(categoryKey, found);
    }
  }

  return null;
}

export const AssetLoader = {
  loadAssetProvenance,
  clearAssetProvenanceCache,
  getProductionLogos,
  getDesignReferences,
  getGeneratedConcepts,
  getPreviewUtilities,
  getAssetById,
  getAssetByFilename,
  getGovernanceRules,
  validateAssetForProduction,
  getAssetPath,
  getAssetPathForCategory,
};

export default AssetLoader;
