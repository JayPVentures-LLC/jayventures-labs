/**
 * AssetLoader - Utility for loading and managing assets
 *
 * Provides runtime access to asset provenance data and asset validation.
 */

import AssetPaths from "./assetPaths";

export interface AssetProvenanceData {
  metadata: {
    version: string;
    lastUpdated: string;
    governance: string;
    categories: string[];
  };
  assets: {
    "production-logos": {
      category: string;
      description: string;
      items: AssetItem[];
    };
    "design-references": {
      category: string;
      description: string;
      items: AssetItem[];
    };
    "generated-concepts": {
      category: string;
      description: string;
      items: AssetItem[];
    };
    "preview-utilities": {
      category: string;
      description: string;
      items: AssetItem[];
    };
  };
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

let cachedProvenance: AssetProvenanceData | null = null;

/**
 * Load asset provenance data
 * Caches result after first load
 */
export async function loadAssetProvenance(): Promise<AssetProvenanceData> {
  if (cachedProvenance) {
    return cachedProvenance;
  }

  try {
    const response = await fetch(AssetPaths.Governance.ProvenanceUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to load asset provenance: ${response.statusText}`
      );
    }
    cachedProvenance = await response.json();
    return cachedProvenance;
  } catch (error) {
    console.error("Error loading asset provenance:", error);
    throw error;
  }
}

/**
 * Get all production logo assets
 */
export async function getProductionLogos(): Promise<AssetItem[]> {
  const provenance = await loadAssetProvenance();
  return provenance.assets["production-logos"].items;
}

/**
 * Get all design reference assets
 */
export async function getDesignReferences(): Promise<AssetItem[]> {
  const provenance = await loadAssetProvenance();
  return provenance.assets["design-references"].items;
}

/**
 * Get all generated concept assets
 */
export async function getGeneratedConcepts(): Promise<AssetItem[]> {
  const provenance = await loadAssetProvenance();
  return provenance.assets["generated-concepts"].items;
}

/**
 * Get asset by ID
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
 * Get asset by filename
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
 * Get governance rules
 */
export async function getGovernanceRules(): Promise<string[]> {
  const provenance = await loadAssetProvenance();
  return provenance.governance.rules;
}

/**
 * Validate asset usage
 * Returns true if asset is approved for production use
 */
export async function validateAssetForProduction(
  assetId: string
): Promise<boolean> {
  const asset = await getAssetById(assetId);
  if (!asset) {
    return false;
  }

  // Only production-logos can be used in production
  const provenance = await loadAssetProvenance();
  const isProductionLogo = provenance.assets["production-logos"].items.some(
    (item) => item.id === assetId
  );

  return isProductionLogo && asset.approved !== false;
}

/**
 * Get asset path from ID
 */
export async function getAssetPath(assetId: string): Promise<string | null> {
  const asset = await getAssetById(assetId);
  if (!asset) {
    return null;
  }

  const provenance = await loadAssetProvenance();

  // Determine which category the asset belongs to
  for (const [categoryKey, category] of Object.entries(provenance.assets)) {
    const found = category.items.find((item) => item.id === assetId);
    if (found) {
      if (categoryKey === "production-logos") {
        return `${AssetPaths.Root}/logos/${asset.file}`;
      } else if (categoryKey === "design-references") {
        return `${AssetPaths.Root}/reference/${asset.file}`;
      } else if (categoryKey === "generated-concepts") {
        return `${AssetPaths.Root}/generated/${asset.file}`;
      } else if (categoryKey === "preview-utilities") {
        return `${AssetPaths.Root}/preview/${asset.file}`;
      }
    }
  }

  return null;
}

export const AssetLoader = {
  loadAssetProvenance,
  getProductionLogos,
  getDesignReferences,
  getGeneratedConcepts,
  getAssetById,
  getAssetByFilename,
  getGovernanceRules,
  validateAssetForProduction,
  getAssetPath,
};

export default AssetLoader;
