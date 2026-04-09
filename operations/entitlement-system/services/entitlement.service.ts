// Entitlement Service: CRUD for entitlements in KV, schema enforcement
import { Entitlement, Brand, Tier, EntitlementStatus } from '../types/entitlement.types';

export async function getEntitlement(userId: string, brand: Brand): Promise<Entitlement | null> {
  // TODO: Fetch entitlement from KV
  return null;
}

export async function updateEntitlement(entitlement: Entitlement): Promise<void> {
  // TODO: Write entitlement to KV
}
