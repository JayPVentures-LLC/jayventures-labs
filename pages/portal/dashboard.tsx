/**
 * JPV-OS Portal Dashboard Page
 * 
 * Main dashboard interface with governance status, role-aware navigation,
 * and responsive layout for Members, Partners, and Admin audiences.
 */

import React from 'react';
import {
  DashboardLayout,
  RoleNav,
  GovernancePanel,
  Card,
  Grid,
  StatCard,
  colors,
  typography,
  spacing,
  radii,
  UserRole,
} from '../../components/jpvos';

// Mock data for demonstration - in production, this would come from API/props
const mockGovernanceStatus = {
  peopleProtection: 'enforced' as const,
  auditability: 'active' as const,
  humanReview: 'available' as const,
  appealPath: 'open' as const,
  lastAuditAt: '2026-05-12',
  nextReviewAt: '2026-05-19',
};

const mockStats = [
  { label: 'Active Members', value: '4,247', change: '+12% from last month', changeType: 'positive' as const },
  { label: 'Monthly Revenue', value: '$127.4K', change: '+8% from last month', changeType: 'positive' as const },
  { label: 'Governance Score', value: '98.2%', change: 'All systems nominal', changeType: 'neutral' as const },
  { label: 'Support Tickets', value: '3', change: '-67% from last week', changeType: 'positive' as const },
];

const mockRecentActivity = [
  { type: 'member_joined', description: 'New member joined Core tier', timestamp: '2 minutes ago' },
  { type: 'audit_complete', description: 'Weekly audit completed successfully', timestamp: '1 hour ago' },
  { type: 'governance_update', description: 'People Protection policy reviewed', timestamp: '3 hours ago' },
  { type: 'member_upgraded', description: 'Member upgraded to Plus tier', timestamp: '5 hours ago' },
  { type: 'support_resolved', description: 'Support ticket #142 resolved', timestamp: '1 day ago' },
];

interface PortalDashboardProps {
  currentRole?: UserRole;
  currentPath?: string;
}

function ActivityIcon({ type }: { type: string }) {
  const iconColors: Record<string, string> = {
    member_joined: colors.status.success,
    member_upgraded: colors.status.info,
    audit_complete: colors.interactive.primary,
    governance_update: colors.roles.admin,
    support_resolved: colors.status.success,
  };

  return (
    <div
      style={{
        width: '32px',
        height: '32px',
        borderRadius: radii.full,
        backgroundColor: `${iconColors[type] || colors.text.muted}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: iconColors[type] || colors.text.muted,
        }}
      />
    </div>
  );
}

function QuickActions({ role }: { role: UserRole }) {
  const actions = [
    { label: 'View Members', href: '/portal/members', roles: ['admin', 'partner'] },
    { label: 'View Packages', href: '/portal/packages', roles: ['member', 'partner', 'admin'] },
    { label: 'Audit Log', href: '/portal/audit', roles: ['admin'] },
    { label: 'Settings', href: '/portal/settings', roles: ['admin'] },
    { label: 'Support', href: '/contact', roles: ['member', 'partner', 'admin'] },
  ];

  const visibleActions = actions.filter((a) => a.roles.includes(role));

  return (
    <Card title="Quick Actions" padding="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
        {visibleActions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: `${spacing[3]} ${spacing[4]}`,
              borderRadius: radii.md,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              color: colors.text.secondary,
              textDecoration: 'none',
              transition: 'background-color 150ms ease-out',
            }}
          >
            {action.label}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginLeft: 'auto', opacity: 0.5 }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        ))}
      </div>
    </Card>
  );
}

export default function PortalDashboard({
  currentRole = 'member',
  currentPath = '/portal/dashboard',
}: PortalDashboardProps) {
  const navItems = [
    { href: '/portal', label: 'Overview', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/dashboard', label: 'Dashboard', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/packages', label: 'Packages', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/governance', label: 'Governance', requiredRoles: ['partner', 'admin'] as UserRole[] },
    { href: '/portal/audit', label: 'Audit', requiredRoles: ['admin'] as UserRole[] },
    { href: '/portal/settings', label: 'Settings', requiredRoles: ['admin'] as UserRole[] },
  ];

  const handleRequestReview = () => {
    // In production, this would trigger a review request
    console.log('Review requested');
  };

  const handleViewAuditLog = () => {
    // In production, this would use Next.js router
    // For now, using location from globalThis for SSR safety
    const win = globalThis as unknown as { location?: { href: string } };
    if (win.location) {
      win.location.href = '/portal/audit';
    }
  };

  return (
    <DashboardLayout
      header={
        <RoleNav
          items={navItems}
          currentPath={currentPath}
          currentRole={currentRole}
          brandName="JPV-OS Portal"
          userDisplayName="User"
        />
      }
      title="Dashboard"
      subtitle="Overview of your JPV-OS ecosystem activity and governance status"
    >
      {/* Stats Grid */}
      <Grid columns={4} gap="md">
        {mockStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </Grid>

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: spacing[6],
          marginTop: spacing[6],
        }}
        className="dashboard-content-grid"
      >
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
          {/* Governance Panel - visible to partners and admins */}
          {(currentRole === 'admin' || currentRole === 'partner') && (
            <GovernancePanel
              status={mockGovernanceStatus}
              deploymentReady={true}
              onRequestReview={handleRequestReview}
              onViewAuditLog={currentRole === 'admin' ? handleViewAuditLog : undefined}
            />
          )}

          {/* Recent Activity */}
          <Card title="Recent Activity" subtitle="Latest ecosystem events">
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {mockRecentActivity.map((activity, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                    padding: `${spacing[2]} 0`,
                    borderBottom:
                      index < mockRecentActivity.length - 1
                        ? `1px solid ${colors.border.muted}`
                        : 'none',
                  }}
                >
                  <ActivityIcon type={activity.type} />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: typography.sizes.sm,
                        color: colors.text.primary,
                      }}
                    >
                      {activity.description}
                    </p>
                    <p
                      style={{
                        margin: `${spacing[0.5]} 0 0`,
                        fontSize: typography.sizes.xs,
                        color: colors.text.muted,
                      }}
                    >
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
          <QuickActions role={currentRole} />

          {/* System Status */}
          <Card title="System Status" padding="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {[
                { name: 'API Gateway', status: 'operational' },
                { name: 'Entitlement System', status: 'operational' },
                { name: 'Payment Processing', status: 'operational' },
                { name: 'Audit Logging', status: 'operational' },
              ].map((system) => (
                <div
                  key={system.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: `${spacing[2]} 0`,
                  }}
                >
                  <span
                    style={{
                      fontSize: typography.sizes.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    {system.name}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1.5],
                      fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.medium,
                      color: colors.status.success,
                      textTransform: 'uppercase',
                      letterSpacing: typography.tracking.wide,
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'currentColor',
                      }}
                    />
                    {system.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
