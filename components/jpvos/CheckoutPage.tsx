/**
 * JPV-OS Purchase Package Page (Checkout)
 * 
 * Production-ready checkout interface with:
 * - Clear pricing display
 * - Governance-compliant purchase flow
 * - Consent and terms visibility
 * - Appealability and support paths
 */

import React from 'react';
import { colors, typography, spacing, radii, shadows, transitions, breakpoints } from './tokens';

export interface PackageOption {
  id: string;
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel?: string;
  ctaDestination?: string;
}

export interface CheckoutPageProps {
  packages: PackageOption[];
  title?: string;
  subtitle?: string;
  onSelectPackage?: (packageId: string) => void;
  termsUrl?: string;
  privacyUrl?: string;
  supportEmail?: string;
}

const defaultPackages: PackageOption[] = [
  {
    id: 'core',
    name: 'All Ventures Access · Core',
    price: '$39/mo',
    description: 'Entry tier for recurring access, curated updates, and the first layer of venture benefits.',
    features: [
      'Recurring ecosystem updates',
      'Early access to drops and shifts',
      'Priority invitations to selected public experiences',
    ],
    ctaLabel: 'Select Core',
  },
  {
    id: 'plus',
    name: 'All Ventures Access · Plus',
    price: '$79/mo',
    description: 'Expands the access layer with richer member benefits and more active ecosystem connection.',
    features: [
      'Everything in Core',
      'Expanded venture updates and member-first drops',
      'Higher-priority access to select creator and ecosystem opportunities',
    ],
    highlighted: true,
    ctaLabel: 'Select Plus',
  },
  {
    id: 'inner-circle',
    name: 'All Ventures Access · Inner Circle',
    price: '$199/mo',
    description: 'The highest membership tier, designed around premium visibility and gated command-center style access.',
    features: [
      'Everything in Plus',
      'Inner Circle Transparency Portal access',
      'Creator Command Center access where eligible',
      'Premium routing and ecosystem priority',
    ],
    ctaLabel: 'Select Inner Circle',
  },
];

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PackageCard({
  pkg,
  onSelect,
}: {
  pkg: PackageOption;
  onSelect?: (id: string) => void;
}) {
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    backgroundColor: pkg.highlighted ? colors.background.cardHover : colors.background.card,
    border: pkg.highlighted
      ? `2px solid ${colors.interactive.primary}`
      : `1px solid ${colors.border.default}`,
    borderRadius: radii.xl,
    padding: spacing[6],
    transition: transitions.default,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const highlightBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: `-${spacing[3]}`,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: `${spacing[1]} ${spacing[4]}`,
    borderRadius: radii.full,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: typography.tracking.wide,
    background: colors.border.glow,
    color: colors.text.primary,
    boxShadow: shadows.glow,
  };

  const nameStyle: React.CSSProperties = {
    margin: pkg.highlighted ? `${spacing[2]} 0 0` : 0,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    letterSpacing: typography.tracking.tight,
  };

  const priceStyle: React.CSSProperties = {
    margin: `${spacing[4]} 0`,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: typography.tracking.tight,
    background: pkg.highlighted
      ? 'linear-gradient(135deg, #ffffff 0%, #818cf8 100%)'
      : 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const descriptionStyle: React.CSSProperties = {
    margin: 0,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 1.6,
  };

  const featureListStyle: React.CSSProperties = {
    listStyle: 'none',
    margin: `${spacing[6]} 0`,
    padding: 0,
    flex: 1,
  };

  const featureItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: `${spacing[2]} 0`,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  };

  const featureIconStyle: React.CSSProperties = {
    flexShrink: 0,
    marginTop: '2px',
    color: pkg.highlighted ? colors.interactive.primary : colors.status.success,
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: `${spacing[3]} ${spacing[4]}`,
    borderRadius: radii.lg,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    cursor: 'pointer',
    transition: transitions.default,
    border: 'none',
    fontFamily: typography.fonts.body,
    backgroundColor: pkg.highlighted ? colors.interactive.primary : colors.interactive.secondary,
    color: colors.text.primary,
  };

  return (
    <div style={cardStyle}>
      {pkg.highlighted && <span style={highlightBadgeStyle}>Most Popular</span>}

      <h3 style={nameStyle}>{pkg.name}</h3>
      <p style={priceStyle}>{pkg.price}</p>
      <p style={descriptionStyle}>{pkg.description}</p>

      <ul style={featureListStyle}>
        {pkg.features.map((feature, index) => (
          <li key={index} style={featureItemStyle}>
            <span style={featureIconStyle}>
              <CheckIcon />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button type="button" style={buttonStyle} onClick={() => onSelect?.(pkg.id)}>
        {pkg.ctaLabel || `Select ${pkg.name}`}
      </button>
    </div>
  );
}

export function CheckoutPage({
  packages = defaultPackages,
  title = 'Select Your Package',
  subtitle = 'Choose the membership tier that fits your needs. All packages include governance-compliant access with clear terms, human review support, and appeal pathways.',
  onSelectPackage,
  termsUrl = '/terms',
  privacyUrl = '/privacy',
  supportEmail = 'venture@jaypventuresllc.com',
}: CheckoutPageProps) {
  const handleSelectPackage = (packageId: string) => {
    if (onSelectPackage) {
      onSelectPackage(packageId);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `${spacing[8]} ${spacing[4]}`,
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: spacing[10],
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: typography.tracking.tight,
    background: 'linear-gradient(180deg, #ffffff 0%, #d4d4d8 50%, #a1a1aa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const subtitleStyle: React.CSSProperties = {
    margin: `${spacing[4]} auto 0`,
    maxWidth: '720px',
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
    lineHeight: 1.6,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: spacing[6],
    alignItems: 'stretch',
  };

  const footerStyle: React.CSSProperties = {
    marginTop: spacing[12],
    textAlign: 'center',
  };

  const disclaimerStyle: React.CSSProperties = {
    padding: spacing[6],
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    border: `1px solid ${colors.border.default}`,
    maxWidth: '720px',
    margin: '0 auto',
  };

  const disclaimerTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: typography.tracking.wider,
    marginBottom: spacing[3],
  };

  const disclaimerTextStyle: React.CSSProperties = {
    margin: 0,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 1.7,
  };

  const linkStyle: React.CSSProperties = {
    color: colors.interactive.primary,
    textDecoration: 'none',
  };

  return (
    <div style={{ backgroundColor: colors.background.primary, minHeight: '100vh' }}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <h1 style={titleStyle}>{title}</h1>
          <p style={subtitleStyle}>{subtitle}</p>
        </header>

        <div style={gridStyle} className="checkout-grid">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} onSelect={handleSelectPackage} />
          ))}
        </div>

        <footer style={footerStyle}>
          <div style={disclaimerStyle}>
            <h4 style={disclaimerTitleStyle}>Governance Compliance Notice</h4>
            <p style={disclaimerTextStyle}>
              All memberships are subject to our{' '}
              <a href={termsUrl} style={linkStyle}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href={privacyUrl} style={linkStyle}>
                Privacy Policy
              </a>
              . JPV-OS memberships include People Protection enforcement, auditability logging, and
              human review availability. You may request support or appeal access decisions by
              contacting{' '}
              <a href={`mailto:${supportEmail}`} style={linkStyle}>
                {supportEmail}
              </a>
              . Cancellation is available at any time through your member portal.
            </p>
          </div>

          <div
            style={{
              marginTop: spacing[6],
              display: 'flex',
              justifyContent: 'center',
              gap: spacing[4],
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/governance"
              style={{
                ...linkStyle,
                fontSize: typography.sizes.sm,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Governance Framework
            </a>
            <a
              href="/trust"
              style={{
                ...linkStyle,
                fontSize: typography.sizes.sm,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Trust Center
            </a>
          </div>
        </footer>
      </div>

      <style>{`
        @media (max-width: ${breakpoints.lg}) {
          .checkout-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: ${breakpoints.md}) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default CheckoutPage;
