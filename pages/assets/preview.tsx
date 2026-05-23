import React from "react";
import AssetLoader, {
  AssetCategoryKey,
  AssetItem,
  AssetProvenanceData,
} from "../../config/assetLoader";
import { useAssets } from "../../config/useAssets";

type AssetSectionProps = {
  title: string;
  description: string;
  categoryKey: AssetCategoryKey;
  categoryLabel: string;
  assets: AssetItem[];
};

export default function AssetPreview() {
  const { logos, references, generated, previewUtilities, provenance, loading, error } =
    useAssets();

  if (loading) {
    return <div className="p-8">Loading asset governance data...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error.message}</div>;
  }

  if (!provenance) {
    return <div className="p-8">No provenance data found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header provenance={provenance} />

        <AssetSection
          title="Production Logos"
          description="Approved production brand assets - authoritative for brand communications."
          categoryKey="production-logos"
          categoryLabel="Production"
          assets={logos}
        />

        <AssetSection
          title="Design References"
          description="Inspiration materials and ecosystem resources for design guidance only."
          categoryKey="design-references"
          categoryLabel="Reference"
          assets={references}
        />

        <AssetSection
          title="Generated Concepts"
          description="AI-generated and exploratory renders for review and iteration."
          categoryKey="generated-concepts"
          categoryLabel="Exploratory"
          assets={generated}
        />

        <AssetSection
          title="Preview Utilities"
          description="Utility assets used by internal preview and governance surfaces."
          categoryKey="preview-utilities"
          categoryLabel="Utility"
          assets={previewUtilities}
        />

        <GovernanceRules provenance={provenance} />
        <ChangeLog provenance={provenance} />
      </div>
    </div>
  );
}

function Header({ provenance }: { provenance: AssetProvenanceData }) {
  return (
    <div className="mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Enterprise Asset Governance
      </h1>
      <p className="text-lg text-gray-600 mb-2">
        Authoritative asset management system for JayPV brands
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          <strong>Version:</strong> {provenance.metadata.version} •{" "}
          <strong>Last Updated:</strong> {provenance.metadata.lastUpdated}
        </p>
        <p className="text-sm text-blue-700 mt-2">
          {provenance.metadata.governance}
        </p>
      </div>
    </div>
  );
}

function AssetSection({
  title,
  description,
  categoryKey,
  categoryLabel,
  assets,
}: AssetSectionProps) {
  if (assets.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            imagePath={AssetLoader.getAssetPathForCategory(categoryKey, asset)}
            categoryKey={categoryKey}
            categoryLabel={categoryLabel}
          />
        ))}
      </div>
    </section>
  );
}

function GovernanceRules({ provenance }: { provenance: AssetProvenanceData }) {
  return (
    <section className="mb-16 bg-white border border-gray-200 rounded-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Governance Rules
      </h2>
      <div className="space-y-3">
        {provenance.governance.rules.map((rule) => (
          <div key={rule} className="flex items-start">
            <span className="flex-shrink-0 h-6 w-6 text-green-500 mr-3 mt-0.5">
              ✓
            </span>
            <p className="text-gray-700">{rule}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Review Process
        </h3>
        <p className="text-gray-700">{provenance.governance.reviewProcess}</p>
      </div>
    </section>
  );
}

function ChangeLog({ provenance }: { provenance: AssetProvenanceData }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Change Log</h2>
      <div className="space-y-4">
        {provenance.governance.changeLog.map((entry) => (
          <div key={`${entry.date}-${entry.change}`} className="border-l-4 border-blue-500 pl-4">
            <p className="font-semibold text-gray-900">{entry.date}</p>
            <p className="text-gray-700">{entry.change}</p>
            <p className="text-sm text-gray-500">By: {entry.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

type AssetCardProps = {
  asset: AssetItem;
  imagePath: string;
  categoryKey: AssetCategoryKey;
  categoryLabel: string;
};

function AssetCard({ asset, imagePath, categoryKey, categoryLabel }: AssetCardProps) {
  const categoryColor: Record<AssetCategoryKey, string> = {
    "production-logos": "bg-green-50 border-green-200",
    "design-references": "bg-blue-50 border-blue-200",
    "generated-concepts": "bg-yellow-50 border-yellow-200",
    "preview-utilities": "bg-gray-50 border-gray-200",
  };

  const badgeColor: Record<AssetCategoryKey, string> = {
    "production-logos": "bg-green-100 text-green-800",
    "design-references": "bg-blue-100 text-blue-800",
    "generated-concepts": "bg-yellow-100 text-yellow-800",
    "preview-utilities": "bg-gray-100 text-gray-800",
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${categoryColor[categoryKey]}`}
    >
      <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
        <img
          src={imagePath}
          alt={asset.name}
          className="max-h-full max-w-full object-contain p-4"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2 gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${badgeColor[categoryKey]}`}
          >
            {categoryLabel}
          </span>
        </div>

        <div className="mb-3 flex justify-between items-center">
          {asset.approved !== undefined && (
            <span
              className={`text-xs font-medium ${
                asset.approved ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {asset.approved ? "✓ Approved" : "⚠ Unapproved"}
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm">
          {asset.brand && (
            <p className="text-gray-700">
              <strong>Brand:</strong> {asset.brand}
            </p>
          )}
          {asset.source && (
            <p className="text-gray-700">
              <strong>Source:</strong> {asset.source}
            </p>
          )}
          {asset.version && (
            <p className="text-gray-700">
              <strong>Version:</strong> {asset.version}
            </p>
          )}
        </div>

        {asset.notes && (
          <p className="mt-3 text-sm text-gray-600 italic border-t border-gray-300 pt-3">
            {asset.notes}
          </p>
        )}

        <p className="mt-3 text-xs text-gray-500 font-mono break-all">
          {imagePath}
        </p>
      </div>
    </div>
  );
}
