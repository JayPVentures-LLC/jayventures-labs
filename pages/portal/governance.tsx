/**
 * JPV-OS Portal Governance Page
 * 
 * Governance and compliance status panel for Partners and Admins.
 */

import React from 'react';
import {
  DashboardLayout,
  RoleNav,
  GovernancePanel,
  Card,
  Grid,
  colors,
  typography,
  spacing,
  radii,
  UserRole,
} from '../../components/jpvos';

interface PortalGovernanceProps {
  currentRole?: UserRole;
}

const mockGovernanceStatus = {
  peopleProtection: 'enforced' as const,
  auditability: 'active' as const,
  humanReview: 'available' as const,
  appealPath: 'open' as const,
  lastAuditAt: '2026-05-12',
  nextReviewAt: '2026-05-19',
};

const governancePolicies = [
  {
    name: 'People Protection',
    description: 'Human dignity, consent, and anti-exploitation safeguards',
    status: 'active',
    lastReview: '2026-05-10',
    docLink: '/PEOPLE-PROTECTION.md',
  },
  {
    name: 'Security Policy',
    description: 'System security, authentication, and data protection',
    status: 'active',
    lastReview: '2026-05-08',
    docLink: '/SECURITY.md',
  },
  {
    name: 'Governance Framework',
    description: 'Decision accountability, risk tiers, and oversight',
    status: 'active',
    lastReview: '2026-05-10',
    docLink: '/GOVERNANCE.md',
  },
  {
    name: 'Privacy Policy',
    description: 'Data collection, processing, and retention standards',
    status: 'active',
    lastReview: '2026-05-01',
    docLink: '/privacy',
  },
];

const complianceMetrics = [
  { label: 'Policy Compliance', value: '100%', status: 'success' },
  { label: 'Audit Coverage', value: '98.2%', status: 'success' },
  { label: 'Review Completion', value: '100%', status: 'success' },
  { label: 'Appeal Resolution', value: '< 24h', status: 'success' },
];

export default function PortalGovernance({ currentRole = 'partner' }: PortalGovernanceProps) {
  const navItems = [
    { href: '/portal', label: 'Overview', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/dashboard', label: 'Dashboard', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/packages', label: 'Packages', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/governance', label: 'Governance', requiredRoles: ['partner', 'admin'] as UserRole[] },
    { href: '/portal/audit', label: 'Audit', requiredRoles: ['admin'] as UserRole[] },
    { href: '/portal/settings', label: 'Settings', requiredRoles: ['admin'] as UserRole[] },
  ];

  return (
    <DashboardLayout
      header={
        <RoleNav
          items={navItems}
          currentPath="/portal/governance"
          currentRole={currentRole}
          brandName="JPV-OS Portal"
          userDisplayName="User"
        />
      }
      title="Governance"
      subtitle="System compliance, policy status, and accountability oversight"
    >
      {/* Compliance Metrics */}
      <Grid columns={4} gap="md">
        {complianceMetrics.map((metric) => (
          <Card key={metric.label} padding="md">
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  color: colors.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: typography.tracking.wide,
                }}
              >
                {metric.label}
              </p>
              <p
                style={{
                  margin: `${spacing[2]} 0 0`,
                  fontSize: typography.sizes['2xl'],
                  fontWeight: typography.weights.bold,
                  color: colors.status.success,
                }}
              >
                {metric.value}
              </p>
            </div>
          </Card>
        ))}
      </Grid>

      {/* Main Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing[6],
          marginTop: spacing[6],
        }}
        className="governance-grid"
      >
        {/* Governance Status Panel */}
        <GovernancePanel
          status={mockGovernanceStatus}
          deploymentReady={true}
          systemName="JPV-OS"
          onRequestReview={() => console.log('Review requested')}
          onViewAuditLog={currentRole === 'admin' ? () => { const win = globalThis as unknown as { location?: { href: string } }; if (win.location) win.location.href = '/portal/audit'; } : undefined}
        />

        {/* Active Policies */}
        <Card title="Active Policies" subtitle="Governance documents and review status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {governancePolicies.map((policy) => (
              <div
                key={policy.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: `${spacing[3]} 0`,
                  borderBottom: `1px solid ${colors.border.muted}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <a
                    href={policy.docLink}
                    style={{
                      display: 'block',
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.medium,
                      color: colors.text.primary,
                      textDecoration: 'none',
                    }}
                  >
                    {policy.name}
                  </a>
                  <p
                    style={{
                      margin: `${spacing[1]} 0 0`,
                      fontSize: typography.sizes.xs,
                      color: colors.text.muted,
                    }}
                  >
                    {policy.description}
                  </p>
                  <p
                    style={{
                      margin: `${spacing[1]} 0 0`,
                      fontSize: typography.sizes.xs,
                      color: colors.text.muted,
                    }}
                  >
                    Last reviewed: {policy.lastReview}
                  </p>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: `${spacing[1]} ${spacing[2]}`,
                    borderRadius: radii.full,
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: typography.tracking.wide,
                    backgroundColor: colors.status.successMuted,
                    color: colors.status.success,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'currentColor',
                      marginRight: spacing[1.5],
                    }}
                  />
                  Active
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Governance Principles */}
      <Card
        title="Governance Principles"
        subtitle="Core requirements for production-ready systems"
        style={{ marginTop: spacing[6] }}
      >
        <Grid columns={3} gap="md">
          {[
            {
              title: 'People Protection',
              description: 'Human dignity, consent, autonomy, and anti-exploitation safeguards are non-negotiable production requirements.',
            },
            {
              title: 'Auditability',
              description: 'All decisions, entitlement changes, and administrative actions are logged and reviewable.',
            },
            {
              title: 'Human Review',
              description: 'Material decisions affecting access, identity, or opportunity require accountable human oversight.',
            },
            {
              title: 'Appealability',
              description: 'Users can request support, appeal decisions, and access remediation pathways.',
            },
            {
              title: 'Anti-Capture',
              description: 'Systems resist institutional override, partner pressure, and emergency authority abuse.',
            },
            {
              title: 'Interoperability',
              description: 'Architecture avoids vendor lock-in and supports data portability where feasible.',
            },
          ].map((principle) => (
            <div
              key={principle.title}
              style={{
                padding: spacing[4],
                backgroundColor: colors.background.elevated,
                borderRadius: radii.lg,
                border: `1px solid ${colors.border.muted}`,
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                }}
              >
                {principle.title}
              </h4>
              <p
                style={{
                  margin: `${spacing[2]} 0 0`,
                  fontSize: typography.sizes.xs,
                  color: colors.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                {principle.description}
              </p>
            </div>
          ))}
        </Grid>
      </Card>

      <style>{`
        @media (max-width: 1024px) {
          .governance-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
