// Entitlement Types: Brand, Tier, Entitlement, Status, Discord metadata

export type Brand = 'jaypventures' | 'jaypventures-llc';

export type Tier = 'free' | 'member' | 'premium' | 'enterprise';

export type EntitlementStatus = 'active' | 'inactive' | 'expired' | 'revoked';

export interface DiscordMeta {
  discordId: string;
  roles: string[];
}

export interface Entitlement {
  userId: string;
  brand: Brand;
  tier: Tier;
  status: EntitlementStatus;
  expiresAt: number;
  source: 'stripe' | 'admin' | 'import';
  discord?: DiscordMeta;
  override?: boolean;
}

export interface StripeEvent {
  id: string;
  type: string;
  data: any;
}
