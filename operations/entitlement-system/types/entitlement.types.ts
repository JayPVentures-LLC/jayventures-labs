export type Brand = "jaypventures" | "jaypventuresllc";

export type Tier = "free" | "member" | "premium" | "enterprise";

export type EntitlementStatus = "active" | "inactive" | "expired" | "revoked";

export type EntitlementSource = "stripe" | "admin" | "import";

export interface DiscordMeta {
  discordId: string;
  lastSyncedAt?: string;
}

export interface BrandEntitlement {
  brand: Brand;
  tier: Tier;
  status: EntitlementStatus;
  guildId: string;
  roleIds: string[];
  expiresAt: number;
  source: EntitlementSource;
  lastEventId?: string;
  updatedAt: string;
}

export interface Entitlement {
  userId: string;
  status: EntitlementStatus;
  expiresAt: number;
  source: EntitlementSource;
  override?: boolean;
  overrideReason?: string;
  updatedAt: string;
  discord?: DiscordMeta;
  entitlements: BrandEntitlement[];
}

export interface BrandEntitlementInput {
  userId: string;
  brand: Brand;
  tier: Tier;
  status: EntitlementStatus;
  expiresAt: number;
  source: EntitlementSource;
  discordId?: string;
  roleIds: string[];
  lastEventId?: string;
  override?: boolean;
  overrideReason?: string;
}

export interface EntitlementLookup {
  userId?: string;
  discordId?: string;
}
