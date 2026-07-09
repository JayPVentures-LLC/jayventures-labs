/**
 * JPV-OS Governance Status Panel
 * 
 * Displays governance compliance, auditability status, and human review indicators.
 * Supports People Protection enforcement visibility and appealability paths.
 */

import React from 'react';
import { colors, typography, spacing, radii, shadows, transitions } from './tokens';

export interface GovernanceStatus {
  peopleProtection: 'enforced' | 'review_required' | 'pending';
  auditability: 'active' | 'degraded' | 'offline';
  humanReview: 'available' | 'required' | 'in_progress';
  appealPath: 'open' | 'closed';
  lastAuditAt?: string;
  nextReviewAt?: string;
}

export interface GovernancePanelProps {
  status: GovernanceStatus;
  deploymentReady?: boolean;
  systemName?: string;
  onRequestReview?: () => void;
  onViewAuditLog?: () => void;
}

const statusStyles: Record<string, React.CSSProperties> = {
  enforced: { backgroundColor: colors.status.successMuted, color: colors.status.success },
  active: { backgroundColor: colors.status.successMuted, color: colors.status.success },
  available: { backgroundColor: colors.status.successMuted, color: colors.status.success },
  open: { backgroundColor: colors.status.successMuted, color: colors.status.success },
  review_required: { backgroundColor: colors.status.warningMuted, color: colors.status.warning },
  required: { backgroundColor: colors.status.warningMuted, color: colors.status.warning },
  in_progress: { backgroundColor: colors.status.infoMuted, color: colors.status.info },
  pending: { backgroundColor: colors.status.warningMuted, color: colors.status.warning },
  degraded: { backgroundColor: colors.status.warningMuted, color: colors.status.warning },
  offline: { backgroundColor: colors.status.errorMuted, color: colors.status.error },
  closed: { backgroundColor: colors.status.errorMuted, color: colors.status.error },
};

const statusLabels: Record<string, string> = {
  enforced: 'Enforced',
  active: 'Active',
  available: 'Available',
  open: 'Open',
  review_required: 'Review Required',
  required: 'Required',
  in_progress: 'In Progress',
  pending: 'Pending',
  degraded: 'Degraded',
  offline: 'Offline',
  closed: 'Closed',
};

function StatusBadge({ value }: { value: string }) {
  const style = statusStyles[value] || statusStyles.pending;
  const label = statusLabels[value] || value;
  
  return (
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
        ...style,
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
      {label}
    </span>
  );
}

function GovernanceRow({ label, value, description }: { label: string; value: string; description?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: `${spacing[3]} 0`,
        borderBottom: `1px solid ${colors.border.muted}`,
      }}
    >
      <div style={{ flex: 1 }}>
        <span
          style={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.text.primary,
          }}
        >
          {label}
        </span>
        {description && (
          <p
            style={{
              margin: `${spacing[1]} 0 0`,
              fontSize: typography.sizes.xs,
              color: colors.text.muted,
            }}
          >
            {description}
          </p>
        )}
      </div>
      <StatusBadge value={value} />
    </div>
  );
}

export function GovernancePanel({
  status,
  deploymentReady = true,
  systemName = 'JPV-OS',
  onRequestReview,
  onViewAuditLog,
}: GovernancePanelProps) {
  const panelStyle: React.CSSProperties = {
    backgroundColor: colors.background.card,
    border: `1px solid ${colors.border.default}`,
    borderRadius: radii.lg,
    padding: spacing[6],
    boxShadow: shadows.lg,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingBottom: spacing[4],
    borderBottom: `1px solid ${colors.border.subtle}`,
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    letterSpacing: typography.tracking.tight,
  };

  const subtitleStyle: React.CSSProperties = {
    margin: `${spacing[1]} 0 0`,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: typography.tracking.wider,
  };

  const deploymentBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1.5],
    padding: `${spacing[1.5]} ${spacing[3]}`,
    borderRadius: radii.full,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    backgroundColor: deploymentReady ? colors.status.successMuted : colors.status.warningMuted,
    color: deploymentReady ? colors.status.success : colors.status.warning,
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing[2]} ${spacing[4]}`,
    borderRadius: radii.md,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    cursor: 'pointer',
    transition: transitions.default,
    border: 'none',
    fontFamily: typography.fonts.body,
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: colors.interactive.primary,
    color: colors.text.primary,
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: colors.interactive.secondary,
    color: colors.text.secondary,
    border: `1px solid ${colors.border.default}`,
  };

  return (
    <section style={panelStyle} aria-labelledby="governance-heading">
      <header style={headerStyle}>
        <div>
          <h2 id="governance-heading" style={titleStyle}>
            Governance Status
          </h2>
          <p style={subtitleStyle}>{systemName} Compliance</p>
        </div>
        <div style={deploymentBadgeStyle}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'currentColor',
            }}
          />
          {deploymentReady ? 'Deployment Ready' : 'Review Required'}
        </div>
      </header>

      <div style={{ marginBottom: spacing[4] }}>
        <GovernanceRow
          label="People Protection"
          value={status.peopleProtection}
          description="Human dignity, consent, and anti-exploitation safeguards"
        />
        <GovernanceRow
          label="Auditability"
          value={status.auditability}
          description="Decision logging and forensic review capability"
        />
        <GovernanceRow
          label="Human Review"
          value={status.humanReview}
          description="Accountable oversight for material decisions"
        />
        <GovernanceRow
          label="Appeal Path"
          value={status.appealPath}
          description="Remediation and reversal pathway availability"
        />
      </div>

      {(status.lastAuditAt || status.nextReviewAt) && (
        <div
          style={{
            display: 'flex',
            gap: spacing[6],
            padding: `${spacing[3]} 0`,
            marginBottom: spacing[4],
            borderTop: `1px solid ${colors.border.muted}`,
          }}
        >
          {status.lastAuditAt && (
            <div>
              <span
                style={{
                  fontSize: typography.sizes.xs,
                  color: colors.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: typography.tracking.wide,
                }}
              >
                Last Audit
              </span>
              <p
                style={{
                  margin: `${spacing[1]} 0 0`,
                  fontSize: typography.sizes.sm,
                  color: colors.text.secondary,
                }}
              >
                {status.lastAuditAt}
              </p>
            </div>
          )}
          {status.nextReviewAt && (
            <div>
              <span
                style={{
                  fontSize: typography.sizes.xs,
                  color: colors.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: typography.tracking.wide,
                }}
              >
                Next Review
              </span>
              <p
                style={{
                  margin: `${spacing[1]} 0 0`,
                  fontSize: typography.sizes.sm,
                  color: colors.text.secondary,
                }}
              >
                {status.nextReviewAt}
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: spacing[3] }}>
        {onRequestReview && (
          <button style={primaryButtonStyle} onClick={onRequestReview} type="button">
            Request Review
          </button>
        )}
        {onViewAuditLog && (
          <button style={secondaryButtonStyle} onClick={onViewAuditLog} type="button">
            View Audit Log
          </button>
        )}
      </div>
    </section>
  );
}

export default GovernancePanel;
