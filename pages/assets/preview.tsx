import React, { useEffect, useState } from "react";
import AssetPaths from "../../config/assetPaths";

interface ProvenanceData {
  metadata: {
    version: string;
    lastUpdated: string;
    governance: string;
  };
  assets: {
    "production-logos": {
      items: Array<any>;
    };
    "design-references": {
      items: Array<any>;
    };
    "generated-concepts": {
      items: Array<any>;
    };
    "preview-utilities": {
      items: Array<any>;
    };
  };
  governance: {
    rules: string[];
    reviewProcess: string;
    changeLog: Array<any>;
  };
}

export default function AssetPreview() {
  const [provenance, setProvenance] = useState<ProvenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProvenance = async () => {
      try {
        const response = await fetch("/assets/governance/asset-provenance.json");
        if (!response.ok) {
          throw new Error(`Failed to load provenance: ${response.statusText}`);
        }
        const data: ProvenanceData = await response.json();
        setProvenance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadProvenance();
  }, []);

  if (loading) {
    return <div className="p-8">Loading asset governance data...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (!provenance) {
    return <div className="p-8">No provenance data found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Production Logos Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Production Logos
            </h2>
            <p className="text-gray-600">
              Approved production brand assets - authoritative for all brand
              communications
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {provenance.assets["production-logos"].items.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                imagePath={`${AssetPaths.Root}/logos/${asset.file}`}
                category="production-logo"
              />
            ))}
          </div>
        </section>

        {/* Design References Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Design References
            </h2>
            <p className="text-gray-600">
              Inspiration materials and ecosystem resources - for design guidance
              only, not for production use
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {provenance.assets["design-references"].items.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                imagePath={`${AssetPaths.Root}/reference/${asset.file}`}
                category="design-reference"
              />
            ))}
          </div>
        </section>

        {/* Generated Concepts Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Generated Concepts
            </h2>
            <p className="text-gray-600">
              AI-generated and exploratory renders - for review and iteration,
              not approved for production
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {provenance.assets["generated-concepts"].items.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                imagePath={`${AssetPaths.Root}/generated/${asset.file}`}
                category="generated-concept"
              />
            ))}
          </div>
        </section>

        {/* Governance Rules Section */}
        <section className="mb-16 bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Governance Rules
          </h2>
          <div className="space-y-3">
            {provenance.governance.rules.map((rule, index) => (
              <div key={index} className="flex items-start">
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

        {/* Change Log Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Change Log</h2>
          <div className="space-y-4">
            {provenance.governance.changeLog.map((entry, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold text-gray-900">{entry.date}</p>
                <p className="text-gray-700">{entry.change}</p>
                <p className="text-sm text-gray-500">By: {entry.author}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

interface AssetCardProps {
  asset: {
    id: string;
    name: string;
    file: string;
    approved?: boolean;
    source?: string;
    notes?: string;
    brand?: string;
    version?: string;
  };
  imagePath: string;
  category: string;
}

function AssetCard({ asset, imagePath, category }: AssetCardProps) {
  const categoryColor = {
    "production-logo": "bg-green-50 border-green-200",
    "design-reference": "bg-blue-50 border-blue-200",
    "generated-concept": "bg-yellow-50 border-yellow-200",
    "preview-utility": "bg-gray-50 border-gray-200",
  }[category] || "bg-gray-50 border-gray-200";

  const statusBadge = {
    "production-logo": (
      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
        Production
      </span>
    ),
    "design-reference": (
      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
        Reference
      </span>
    ),
    "generated-concept": (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
        {asset.approved ? "Approved" : "Exploratory"}
      </span>
    ),
    "preview-utility": (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
        Utility
      </span>
    ),
  }[category];

  return (
    <div className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${categoryColor}`}>
      {/* Image Placeholder */}
      <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
        <div className="text-gray-400 text-center p-4">
          <p className="text-sm">Asset: {asset.file}</p>
          <p className="text-xs mt-2">(Image would display here)</p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
        </div>

        <div className="mb-3 flex justify-between items-center">
          {statusBadge}
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
          {asset.file}
        </p>
      </div>
    </div>
  );
}
