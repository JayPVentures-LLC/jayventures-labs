/**
 * JPV-OS Role-Aware Navigation
 * 
 * Responsive navigation with role-based menu visibility.
 * Supports Members, Partners, and Admin audience routes.
 */

import React, { useState } from 'react';
import { colors, typography, spacing, radii, shadows, transitions, UserRole, roleConfig } from './tokens';

export interface NavItem {
  href: string;
  label: string;
  requiredRoles?: UserRole[];
  icon?: React.ReactNode;
  badge?: string;
}

export interface RoleNavProps {
  items: NavItem[];
  currentPath: string;
  currentRole: UserRole;
  brandName?: string;
  onNavigate?: (href: string) => void;
  userDisplayName?: string;
}

const defaultNavItems: NavItem[] = [
  { href: '/', label: 'Overview', requiredRoles: ['member', 'partner', 'admin'] },
  { href: '/dashboard', label: 'Dashboard', requiredRoles: ['member', 'partner', 'admin'] },
  { href: '/packages', label: 'Packages', requiredRoles: ['member', 'partner', 'admin'] },
  { href: '/governance', label: 'Governance', requiredRoles: ['partner', 'admin'] },
  { href: '/audit', label: 'Audit Log', requiredRoles: ['admin'] },
  { href: '/settings', label: 'Settings', requiredRoles: ['admin'] },
];

function hasAccess(item: NavItem, role: UserRole): boolean {
  if (!item.requiredRoles || item.requiredRoles.length === 0) {
    return true;
  }
  return item.requiredRoles.includes(role);
}

function RoleBadge({ role }: { role: UserRole }) {
  const config = roleConfig[role];
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: `${spacing[0.5]} ${spacing[2]}`,
        borderRadius: radii.full,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
        textTransform: 'uppercase',
        letterSpacing: typography.tracking.wide,
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      {config.label}
    </span>
  );
}

export function RoleNav({
  items = defaultNavItems,
  currentPath,
  currentRole,
  brandName = 'JPV-OS',
  onNavigate,
  userDisplayName,
}: RoleNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredItems = items.filter((item) => hasAccess(item, currentRole));

  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else if (
      typeof globalThis !== 'undefined' &&
      typeof window !== 'undefined' &&
      typeof window.location?.assign === 'function'
    ) {
      window.location.assign(href);
    }
    setMobileMenuOpen(false);
  };

  const navStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backgroundColor: colors.background.elevated,
    borderBottom: `1px solid ${colors.border.default}`,
    backdropFilter: 'blur(12px)',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: `0 ${spacing[4]}`,
  };

  const innerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    textDecoration: 'none',
    color: colors.text.primary,
  };

  const logoTextStyle: React.CSSProperties = {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.tracking.tight,
    background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const desktopNavStyle: React.CSSProperties = {
    display: 'none',
    alignItems: 'center',
    gap: spacing[1],
  };

  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[2]} ${spacing[3]}`,
    borderRadius: radii.md,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: isActive ? colors.text.primary : colors.text.secondary,
    backgroundColor: isActive ? colors.background.cardHover : 'transparent',
    textDecoration: 'none',
    transition: transitions.default,
    cursor: 'pointer',
    border: 'none',
    fontFamily: typography.fonts.body,
  });

  const userSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    marginLeft: spacing[4],
    paddingLeft: spacing[4],
    borderLeft: `1px solid ${colors.border.default}`,
  };

  const mobileMenuButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: radii.md,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border.default}`,
    color: colors.text.secondary,
    cursor: 'pointer',
    transition: transitions.default,
  };

  const mobileMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.elevated,
    borderBottom: `1px solid ${colors.border.default}`,
    padding: spacing[4],
    boxShadow: shadows.lg,
  };

  const mobileNavItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[3]} ${spacing[4]}`,
    borderRadius: radii.md,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: isActive ? colors.text.primary : colors.text.secondary,
    backgroundColor: isActive ? colors.background.cardHover : 'transparent',
    textDecoration: 'none',
    transition: transitions.default,
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: typography.fonts.body,
  });

  return (
    <nav style={navStyle} aria-label="Main navigation">
      <div style={containerStyle}>
        <div style={innerStyle}>
          {/* Logo */}
          <a href="/" style={logoStyle} onClick={() => handleNavigate('/')}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: radii.md,
                background: colors.border.glow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#fff', fontWeight: typography.weights.bold, fontSize: typography.sizes.sm }}>
                JP
              </span>
            </div>
            <span style={logoTextStyle}>{brandName}</span>
          </a>

          {/* Desktop Navigation */}
          <div style={{ ...desktopNavStyle, display: 'flex' }} className="desktop-nav">
            {filteredItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                style={navItemStyle(currentPath === item.href)}
                type="button"
              >
                {item.icon}
                {item.label}
                {item.badge && (
                  <span
                    style={{
                      padding: `${spacing[0.5]} ${spacing[1.5]}`,
                      borderRadius: radii.full,
                      fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.semibold,
                      backgroundColor: colors.interactive.primary,
                      color: colors.text.primary,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* User Section */}
          <div style={userSectionStyle}>
            {userDisplayName && (
              <span
                style={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.secondary,
                  display: 'none',
                }}
                className="user-name"
              >
                {userDisplayName}
              </span>
            )}
            <RoleBadge role={currentRole} />

            {/* Mobile Menu Button */}
            <button
              type="button"
              style={mobileMenuButtonStyle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="mobile-menu-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={mobileMenuStyle}>
            {filteredItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                style={mobileNavItemStyle(currentPath === item.href)}
                type="button"
              >
                {item.icon}
                {item.label}
                {item.badge && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: `${spacing[0.5]} ${spacing[1.5]}`,
                      borderRadius: radii.full,
                      fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.semibold,
                      backgroundColor: colors.interactive.primary,
                      color: colors.text.primary,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Responsive styles injected via style tag */}
      <style>{`
        @media (min-width: 768px) {
          .mobile-menu-btn {
            display: none !important;
          }
          .user-name {
            display: block !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}

export default RoleNav;


