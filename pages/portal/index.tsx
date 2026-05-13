/**
 * JPV-OS Portal Index Page
 * 
 * Portal overview and entry point for members, partners, and administrators.
 */

import React from 'react';
import {
  DashboardLayout,
  RoleNav,
  Card,
  Grid,
  colors,
  typography,
  spacing,
  radii,
  shadows,
  UserRole,
} from '../../components/jpvos';

interface PortalIndexProps {
  currentRole?: UserRole;
}

const portalSections = [
  {
    title: 'Dashboard',
    description: 'View your activity, metrics, and ecosystem status at a glance.',
    href: '/portal/dashboard',
    roles: ['member', 'partner', 'admin'] as UserRole[],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: 'Packages',
    description: 'Browse and select membership tiers with governance-compliant access.',
    href: '/portal/packages',
    roles: ['member', 'partner', 'admin'] as UserRole[],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: 'Governance',
    description: 'Review compliance status, policies, and accountability oversight.',
    href: '/portal/governance',
    roles: ['partner', 'admin'] as UserRole[],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Audit Log',
    description: 'Access decision records, entitlement changes, and system events.',
    href: '/portal/audit',
    roles: ['admin'] as UserRole[],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: 'Settings',
    description: 'Configure system preferences and administrative options.',
    href: '/portal/settings',
    roles: ['admin'] as UserRole[],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function SectionCard({
  section,
}: {
  section: (typeof portalSections)[0];
}) {
  return (
    <a
      href={section.href}
      style={{
        display: 'block',
        textDecoration: 'none',
        backgroundColor: colors.background.card,
        border: `1px solid ${colors.border.default}`,
        borderRadius: radii.xl,
        padding: spacing[6],
        transition: 'all 200ms ease-out',
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
        const target = e.currentTarget as unknown as { style: Record<string, string> };
        target.style.borderColor = colors.interactive.primary;
        target.style.boxShadow = shadows.glow;
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
        const target = e.currentTarget as unknown as { style: Record<string, string> };
        target.style.borderColor = colors.border.default;
        target.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: radii.lg,
          background: colors.border.glow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.text.primary,
          marginBottom: spacing[4],
        }}
      >
        {section.icon}
      </div>
      <h3
        style={{
          margin: 0,
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.semibold,
          color: colors.text.primary,
          letterSpacing: typography.tracking.tight,
        }}
      >
        {section.title}
      </h3>
      <p
        style={{
          margin: `${spacing[2]} 0 0`,
          fontSize: typography.sizes.sm,
          color: colors.text.secondary,
          lineHeight: 1.6,
        }}
      >
        {section.description}
      </p>
    </a>
  );
}

export default function PortalIndex({ currentRole = 'member' }: PortalIndexProps) {
  const navItems = [
    { href: '/portal', label: 'Overview', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/dashboard', label: 'Dashboard', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/packages', label: 'Packages', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/governance', label: 'Governance', requiredRoles: ['partner', 'admin'] as UserRole[] },
    { href: '/portal/audit', label: 'Audit', requiredRoles: ['admin'] as UserRole[] },
    { href: '/portal/settings', label: 'Settings', requiredRoles: ['admin'] as UserRole[] },
  ];

  const visibleSections = portalSections.filter((s) => s.roles.includes(currentRole));

  return (
    <DashboardLayout
      header={
        <RoleNav
          items={navItems}
          currentPath="/portal"
          currentRole={currentRole}
          brandName="JPV-OS Portal"
          userDisplayName="User"
        />
      }
      title="Portal Overview"
      subtitle="Access your JPV-OS ecosystem resources and governance tools"
    >
      {/* Welcome Section */}
      <Card variant="glow" padding="lg" style={{ marginBottom: spacing[8] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[6] }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: radii.xl,
              background: colors.border.iridescent,
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s linear infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: typography.sizes['2xl'],
                fontWeight: typography.weights.bold,
                color: colors.text.primary,
              }}
            >
              JP
            </span>
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: typography.sizes['2xl'],
                fontWeight: typography.weights.bold,
                color: colors.text.primary,
                background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Welcome to JPV-OS
            </h2>
            <p
              style={{
                margin: `${spacing[2]} 0 0`,
                fontSize: typography.sizes.base,
                color: colors.text.secondary,
                maxWidth: '600px',
              }}
            >
              Your governance-first ecosystem portal. Access dashboard metrics, membership packages,
              compliance status, and administrative tools based on your role.
            </p>
          </div>
        </div>
      </Card>

      {/* Portal Sections Grid */}
      <Grid columns={3} gap="lg">
        {visibleSections.map((section) => (
          <SectionCard key={section.href} section={section} />
        ))}
      </Grid>

      {/* Governance Notice */}
      <Card style={{ marginTop: spacing[8] }} padding="md">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: spacing[4],
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: radii.lg,
              backgroundColor: colors.status.infoMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.status.info,
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
                color: colors.text.primary,
              }}
            >
              Governance-First Architecture
            </h3>
            <p
              style={{
                margin: `${spacing[2]} 0 0`,
                fontSize: typography.sizes.sm,
                color: colors.text.secondary,
                lineHeight: 1.6,
              }}
            >
              All portal activity is subject to People Protection enforcement, auditability logging,
              and human review availability. You can request support or appeal any access decision.
              View the{' '}
              <a href="/GOVERNANCE.md" style={{ color: colors.interactive.primary }}>
                Governance Framework
              </a>{' '}
              for details.
            </p>
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </DashboardLayout>
  );
}
