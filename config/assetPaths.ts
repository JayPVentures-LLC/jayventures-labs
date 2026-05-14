/**
 * AssetPaths - Authoritative asset path configuration
 *
 * This module serves as the single source of truth for all asset paths in the application.
 * All asset references should use constants from this module to ensure consistency,
 * maintainability, and proper governance.
 *
 * Asset Structure:
 * - logos/: Production-ready brand logos
 * - reference/: Design references, inspiration, and ecosystem boards
 * - generated/: AI-generated and concept renders
 * - preview/: Preview and utility assets
 * - governance/: Asset metadata and provenance tracking
 */

const Root = "/assets";

/**
 * Production Logos - Authoritative brand assets
 */
export const Logos = {
  Master: `${Root}/logos/jpv-master.png`,
  JPVOS: `${Root}/logos/jpv-os.png`,
  JayPVentures: `${Root}/logos/jaypventures.png`,
  Labs: `${Root}/logos/jaypvlabs.png`,
  Institute: `${Root}/logos/jpv-institute.png`,
  Init: `${Root}/logos/init.png`,
} as const;

/**
 * Design References - Inspiration and ecosystem resources
 * These assets support design decisions but are not production logos
 */
export const References = {
  AllBrandsBoard: `${Root}/reference/allbrands-logos.png`,
  EcosystemInspo: `${Root}/reference/ecosystem-inspo.png`,
  PosterDirection: `${Root}/reference/poster-direction.png`,
} as const;

/**
 * Generated Concepts - AI and concept renders
 * These assets are exploratory and used for iteration
 */
export const Generated = {
  AIPosterV1: `${Root}/generated/ai-poster-v1.png`,
  AIPosterV2: `${Root}/generated/ai-poster-v2.png`,
  ConceptRenders: `${Root}/generated/concept-renders`,
} as const;

/**
 * Preview Assets - Utility assets for UI/preview components
 */
export const Preview = {
  BackgroundImage: `${Root}/preview/asset-preview-bg.png`,
} as const;

/**
 * Governance - Asset metadata and provenance
 */
export const Governance = {
  ProvenanceFile: `${Root}/governance/asset-provenance.json`,
  ProvenanceUrl: `${Root}/governance/asset-provenance.json`, // Can be fetched at runtime
} as const;

/**
 * Asset Categories - For governance classification
 */
export enum AssetCategory {
  ProductionLogo = "production-logo",
  DesignReference = "design-reference",
  GeneratedConcept = "generated-concept",
  PreviewUtility = "preview-utility",
}

/**
 * Type definitions for asset metadata
 */
export interface AssetMetadata {
  id: string;
  path: string;
  name: string;
  category: AssetCategory;
  version?: string;
  lastUpdated?: string;
  source?: string;
  license?: string;
  approved?: boolean;
  notes?: string;
}

export const AssetPaths = {
  Root,
  Logos,
  References,
  Generated,
  Preview,
  Governance,
  Category: AssetCategory,
} as const;

export default AssetPaths;
