/**
 * useAssets - React hook for asset management.
 *
 * Provides convenient access to assets in React components with built-in
 * loading states, error handling, and cleanup-safe async effects.
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
  previewUtilities: AssetItem[];
  provenance: AssetProvenanceData | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to load all assets on mount.
 */
export function useAssets(): UseAssetsReturn {
  const [logos, setLogos] = useState<AssetItem[]>([]);
  const [references, setReferences] = useState<AssetItem[]>([]);
  const [generated, setGenerated] = useState<AssetItem[]>([]);
  const [previewUtilities, setPreviewUtilities] = useState<AssetItem[]>([]);
  const [provenance, setProvenance] = useState<AssetProvenanceData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadAssets = async () => {
      setLoading(true);
      setError(null);

      try {
        const [logosData, refsData, genData, utilityData, provenanceData] =
          await Promise.all([
            AssetLoader.getProductionLogos(),
            AssetLoader.getDesignReferences(),
            AssetLoader.getGeneratedConcepts(),
            AssetLoader.getPreviewUtilities(),
            AssetLoader.loadAssetProvenance(),
          ]);

        if (isCancelled) {
          return;
        }

        setLogos(logosData);
        setReferences(refsData);
        setGenerated(genData);
        setPreviewUtilities(utilityData);
        setProvenance(provenanceData);
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadAssets();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    logos,
    references,
    generated,
    previewUtilities,
    provenance,
    loading,
    error,
  };
}

/**
 * Hook to load a specific asset by ID.
 */
export function useAssetById(assetId: string) {
  const [asset, setAsset] = useState<AssetItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadAsset = async () => {
      setLoading(true);
      setError(null);

      try {
        const foundAsset = await AssetLoader.getAssetById(assetId);
        if (!isCancelled) {
          setAsset(foundAsset);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadAsset();

    return () => {
      isCancelled = true;
    };
  }, [assetId]);

  return { asset, loading, error };
}

/**
 * Hook to validate asset for production use.
 */
export function useAssetValidation(assetId: string) {
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const validate = async () => {
      setLoading(true);
      setError(null);

      try {
        const valid = await AssetLoader.validateAssetForProduction(assetId);
        if (!isCancelled) {
          setIsValid(valid);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    validate();

    return () => {
      isCancelled = true;
    };
  }, [assetId]);

  return { isValid, loading, error };
}

/**
 * Hook to get asset path.
 */
export function useAssetPath(assetId: string) {
  const [path, setPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadPath = async () => {
      setLoading(true);
      setError(null);

      try {
        const assetPath = await AssetLoader.getAssetPath(assetId);
        if (!isCancelled) {
          setPath(assetPath);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadPath();

    return () => {
      isCancelled = true;
    };
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
