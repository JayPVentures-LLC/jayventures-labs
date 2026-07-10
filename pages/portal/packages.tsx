/**
 * JPV-OS Portal Packages Page
 * 
 * Purchase package page (checkout) with governance-compliant display.
 */

import React from 'react';
import {
  DashboardLayout,
  RoleNav,
  CheckoutPage,
  UserRole,
} from '../../components/jpvos';

interface PortalPackagesProps {
  currentRole?: UserRole;
}

const packages = [
  {
    id: 'core',
    name: 'All Ventures Access · Core',
    price: '$39/mo',
    description: 'Entry tier for recurring access, curated updates, and the first layer of venture benefits.',
    features: [
      'Recurring ecosystem updates',
      'Early access to drops and shifts',
      'Priority invitations to selected public experiences',
      'Member community access',
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
      'Direct support channel access',
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
      'Governance visibility and reporting access',
    ],
    ctaLabel: 'Select Inner Circle',
  },
];

export default function PortalPackages({ currentRole = 'member' }: PortalPackagesProps) {
  const navItems = [
    { href: '/portal', label: 'Overview', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/dashboard', label: 'Dashboard', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/packages', label: 'Packages', requiredRoles: ['member', 'partner', 'admin'] as UserRole[] },
    { href: '/portal/governance', label: 'Governance', requiredRoles: ['partner', 'admin'] as UserRole[] },
    { href: '/portal/audit', label: 'Audit', requiredRoles: ['admin'] as UserRole[] },
    { href: '/portal/settings', label: 'Settings', requiredRoles: ['admin'] as UserRole[] },
  ];

  const handleSelectPackage = (packageId: string) => {
    // In production, this would redirect to Stripe checkout
    console.log('Selected package:', packageId);
    // window.location.href = `/checkout/${packageId}`;
  };

  return (
    <DashboardLayout
      header={
        <RoleNav
          items={navItems}
          currentPath="/portal/packages"
          currentRole={currentRole}
          brandName="JPV-OS Portal"
          userDisplayName="User"
        />
      }
    >
      <CheckoutPage
        packages={packages}
        title="Membership Packages"
        subtitle="Choose the access tier that fits your needs. All memberships include People Protection enforcement, audit logging, human review availability, and clear appeal pathways."
        onSelectPackage={handleSelectPackage}
        termsUrl="/terms"
        privacyUrl="/privacy"
        supportEmail="venture@jaypventuresllc.com"
      />
    </DashboardLayout>
  );
}
