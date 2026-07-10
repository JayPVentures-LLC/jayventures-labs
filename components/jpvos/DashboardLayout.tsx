/**
 * JPV-OS Responsive Dashboard Layout
 * 
 * Infrastructure-grade layout with structured cards and clean hierarchy.
 * Supports responsive grid system for dashboard content.
 */

import React from 'react';
import { colors, typography, spacing, radii, shadows, transitions, breakpoints } from './tokens';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

// Card Component
export function Card({
  children,
  title,
  subtitle,
  actions,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  const paddingMap = {
    none: '0',
    sm: spacing[4],
    md: spacing[6],
    lg: spacing[8],
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: colors.background.card,
      border: `1px solid ${colors.border.default}`,
    },
    elevated: {
      backgroundColor: colors.background.card,
      border: `1px solid ${colors.border.default}`,
      boxShadow: shadows.lg,
    },
    outlined: {
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border.subtle}`,
    },
    glow: {
      backgroundColor: colors.background.card,
      border: `1px solid ${colors.border.default}`,
      boxShadow: shadows.glow,
    },
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: radii.lg,
    overflow: 'hidden',
    transition: transitions.default,
    ...variantStyles[variant],
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    padding: paddingMap[padding],
  };

  return (
    <div style={cardStyle}>
      {(title || actions) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: `${spacing[4]} ${paddingMap[padding]}`,
            borderBottom: `1px solid ${colors.border.muted}`,
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                  letterSpacing: typography.tracking.tight,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: `${spacing[1]} 0 0`,
                  fontSize: typography.sizes.sm,
                  color: colors.text.muted,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div style={contentStyle}>{children}</div>
    </div>
  );
}

// Grid Component
export function Grid({ children, columns = 2, gap = 'md' }: GridProps) {
  const gapMap = {
    sm: spacing[3],
    md: spacing[4],
    lg: spacing[6],
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: gapMap[gap],
  };

  return (
    <>
      <div style={gridStyle} className="jpvos-grid">
        {children}
      </div>
      <style>{`
        @media (max-width: ${breakpoints.lg}) {
          .jpvos-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: ${breakpoints.md}) {
          .jpvos-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

// Stat Card Component
export function StatCard({ label, value, change, changeType = 'neutral', icon }: StatCardProps) {
  const changeColors = {
    positive: colors.status.success,
    negative: colors.status.error,
    neutral: colors.text.muted,
  };

  return (
    <Card variant="default" padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
            {label}
          </p>
          <p
            style={{
              margin: `${spacing[2]} 0 0`,
              fontSize: typography.sizes['3xl'],
              fontWeight: typography.weights.bold,
              color: colors.text.primary,
              letterSpacing: typography.tracking.tight,
              lineHeight: 1,
            }}
          >
            {value}
          </p>
          {change && (
            <p
              style={{
                margin: `${spacing[2]} 0 0`,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium,
                color: changeColors[changeType],
              }}
            >
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: radii.lg,
              backgroundColor: colors.background.elevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.text.muted,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// Main Dashboard Layout
export function DashboardLayout({
  children,
  sidebar,
  header,
  footer,
  title,
  subtitle,
  actions,
}: DashboardLayoutProps) {
  const layoutStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
    fontFamily: typography.fonts.body,
  };

  const mainContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  };

  const contentWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
  };

  const sidebarStyle: React.CSSProperties = {
    width: '280px',
    flexShrink: 0,
    backgroundColor: colors.background.elevated,
    borderRight: `1px solid ${colors.border.default}`,
    padding: spacing[4],
    display: 'none',
  };

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    padding: spacing[6],
    maxWidth: '100%',
    overflow: 'auto',
  };

  const headerContainerStyle: React.CSSProperties = {
    marginBottom: spacing[6],
    paddingBottom: spacing[6],
    borderBottom: `1px solid ${colors.border.muted}`,
  };

  const titleRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: spacing[4],
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: typography.tracking.tight,
    background: 'linear-gradient(180deg, #ffffff 0%, #d4d4d8 50%, #a1a1aa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const subtitleStyle: React.CSSProperties = {
    margin: `${spacing[2]} 0 0`,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  };

  const footerStyle: React.CSSProperties = {
    padding: `${spacing[4]} ${spacing[6]}`,
    borderTop: `1px solid ${colors.border.default}`,
    backgroundColor: colors.background.elevated,
  };

  return (
    <div style={layoutStyle}>
      <div style={mainContainerStyle}>
        {header}

        <div style={contentWrapperStyle}>
          {sidebar && (
            <aside style={sidebarStyle} className="dashboard-sidebar">
              {sidebar}
            </aside>
          )}

          <main style={mainContentStyle}>
            {(title || actions) && (
              <header style={headerContainerStyle}>
                <div style={titleRowStyle}>
                  <div>
                    {title && <h1 style={titleStyle}>{title}</h1>}
                    {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
                  </div>
                  {actions && <div style={{ display: 'flex', gap: spacing[3] }}>{actions}</div>}
                </div>
              </header>
            )}

            {children}
          </main>
        </div>

        {footer && <footer style={footerStyle}>{footer}</footer>}
      </div>

      <style>{`
        @media (min-width: ${breakpoints.lg}) {
          .dashboard-sidebar {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default DashboardLayout;
