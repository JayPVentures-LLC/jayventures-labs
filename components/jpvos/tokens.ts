export type UserRole = "member" | "partner" | "admin";

export const roleConfig: Record<UserRole, {
  label: string;
  description: string;
  href: string;
}> = {
  member: {
    label: "Members",
    description: "Community access, subscriptions, and membership routing.",
    href: "/?role=member"
  },
  partner: {
    label: "Partners",
    description: "Enterprise packages, collaboration intake, and delivery visibility.",
    href: "/?role=partner"
  },
  admin: {
    label: "Admin",
    description: "Protected operations, governance review, and infrastructure oversight.",
    href: "/?role=admin"
  }
};

export const gradients = {
  shell: "linear-gradient(135deg, rgba(9,11,21,0.98), rgba(18,18,36,0.94))",
  edge: "linear-gradient(90deg, rgba(77,166,255,0.85), rgba(217,70,239,0.75))",
  panel: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))"
};

export const shadows = {
  soft: "0 18px 60px rgba(0,0,0,0.35)",
  glow: "0 0 36px rgba(99,102,241,0.28)"
};

export const transitions = {
  fast: "160ms ease",
  base: "220ms ease",
  slow: "360ms ease"
};
