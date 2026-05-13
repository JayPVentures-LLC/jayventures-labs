/**
 * JPV-OS Design System Tokens
 * Premium dark interface with metallic typography and iridescent edge glow
 * 
 * Design principles:
 * - Infrastructure-grade visual hierarchy
 * - Structured card layouts
 * - Metallic text treatments
 * - Subtle iridescent accents
 */

export const colors = {
  // Core surfaces
  background: {
    primary: '#07090c',
    elevated: '#0d1117',
    card: '#111419',
    cardHover: '#161b22',
    overlay: 'rgba(7, 9, 12, 0.95)',
  },
  
  // Borders with iridescent gradient capability
  border: {
    default: '#21262d',
    subtle: '#30363d',
    muted: '#1a1f26',
    glow: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
    iridescent: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7, #06b6d4, #6366f1)',
  },
  
  // Metallic text system
  text: {
    primary: '#f4f4f5',
    secondary: '#a1a1aa',
    muted: '#71717a',
    metallic: 'linear-gradient(180deg, #ffffff 0%, #d4d4d8 50%, #a1a1aa 100%)',
    accent: '#818cf8',
  },
  
  // Status indicators
  status: {
    success: '#22c55e',
    successMuted: 'rgba(34, 197, 94, 0.15)',
    warning: '#f59e0b',
    warningMuted: 'rgba(245, 158, 11, 0.15)',
    error: '#ef4444',
    errorMuted: 'rgba(239, 68, 68, 0.15)',
    info: '#06b6d4',
    infoMuted: 'rgba(6, 182, 212, 0.15)',
  },
  
  // Role-specific accents
  roles: {
    admin: '#f59e0b',
    partner: '#8b5cf6',
    member: '#06b6d4',
    guest: '#71717a',
  },
  
  // Interactive states
  interactive: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryActive: '#4338ca',
    secondary: '#27272a',
    secondaryHover: '#3f3f46',
  },
} as const;

export const typography = {
  fonts: {
    display: '"SF Pro Display", "Inter", system-ui, -apple-system, sans-serif',
    body: '"SF Pro Text", "Inter", system-ui, -apple-system, sans-serif',
    mono: '"SF Mono", "JetBrains Mono", monospace',
  },
  
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  tracking: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
} as const;

export const radii = {
  none: '0',
  sm: '0.25rem',
  default: '0.5rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.25)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)',
  glowStrong: '0 0 30px rgba(99, 102, 241, 0.5)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.25)',
} as const;

export const transitions = {
  fast: '150ms ease-out',
  default: '200ms ease-out',
  slow: '300ms ease-out',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Role-based access levels
export type UserRole = 'admin' | 'partner' | 'member' | 'guest';

export const roleConfig: Record<UserRole, {
  label: string;
  color: string;
  permissions: string[];
}> = {
  admin: {
    label: 'Administrator',
    color: colors.roles.admin,
    permissions: ['governance', 'audit', 'override', 'review', 'configure'],
  },
  partner: {
    label: 'Partner',
    color: colors.roles.partner,
    permissions: ['dashboard', 'reports', 'review'],
  },
  member: {
    label: 'Member',
    color: colors.roles.member,
    permissions: ['dashboard', 'purchases'],
  },
  guest: {
    label: 'Guest',
    color: colors.roles.guest,
    permissions: ['public'],
  },
} as const;
