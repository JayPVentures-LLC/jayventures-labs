/**
 * useAssets - React hook for asset management
 *
 * Provides convenient access to assets in React components with
 * built-in loading states and error handling.
 */

import { useEffect, useState } from "react";
import AssetLoader, {
  AssetProvenanceData,
  AssetItem,
} from "./assetLoader";

interface UseAssetsReturn {
  logos: AssetItem[];
  references: AssetItem[];
  generated: AssetItem[];
  provenance: AssetProvenanceData | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to load all assets on mount
 */
export function useAssets(): UseAssetsReturn {
  const [logos, setLogos] = useState<AssetItem[]>([]);
  const [references, setReferences] = useState<AssetItem[]>([]);
  const [generated, setGenerated] = useState<AssetItem[]>([]);
  const [provenance, setProvenance] = useState<AssetProvenanceData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const [logosData, refsData, genData, provenanceData] = await Promise.all([
          AssetLoader.getProductionLogos(),
          AssetLoader.getDesignReferences(),
          AssetLoader.getGeneratedConcepts(),
          AssetLoader.loadAssetProvenance(),
        ]);

        setLogos(logosData);
        setReferences(refsData);
        setGenerated(genData);
        setProvenance(provenanceData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  return { logos, references, generated, provenance, loading, error };
}

/**
 * Hook to load a specific asset by ID
 */
export function useAssetById(assetId: string) {
  const [asset, setAsset] = useState<AssetItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAsset = async () => {
      try {
        const foundAsset = await AssetLoader.getAssetById(assetId);
        setAsset(foundAsset);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [assetId]);

  return { asset, loading, error };
}

/**
 * Hook to validate asset for production use
 */
export function useAssetValidation(assetId: string) {
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const validate = async () => {
      try {
        const valid = await AssetLoader.validateAssetForProduction(assetId);
        setIsValid(valid);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [assetId]);

  return { isValid, loading, error };
}

/**
 * Hook to get asset path
 */
export function useAssetPath(assetId: string) {
  const [path, setPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPath = async () => {
      try {
        const assetPath = await AssetLoader.getAssetPath(assetId);
        setPath(assetPath);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    loadPath();
  }, [assetId]);

  return { path, loading, error };
}

export const AssetHooks = {
  useAssets,
  useAssetById,
  useAssetValidation,
  useAssetPath,
};

export default AssetHooks;
