// Entitlement Service: CRUD for entitlements in KV, schema enforcement
import { Entitlement, Brand, Tier, EntitlementStatus } from '../types/entitlement.types';

export async function getEntitlement(userId: string, brand: Brand): Promise<Entitlement | null> {
  // Fetches the full entitlement record for a user (all brands/guilds)
  return null;
}

export async function updateEntitlement(entitlement: Entitlement): Promise<void> {
  // Updates the full entitlement record for a user (all brands/guilds)
}
