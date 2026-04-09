import type { Env } from "../config/env";
import type { Brand, Entitlement } from "../types/entitlement.types";
import type { RetryTask } from "../types/discord.types";
import { syncDiscordRoles as syncSingleBrand } from "./discord.service";
import { enqueueRetryTask, processRetryQueue } from "../utils/retry-queue";
import { logger } from "../utils/logger";
import { getEntitlement, setDiscordSyncTimestamp } from "./entitlement.service";

export interface DiscordSyncResult {
  brand: Brand;
  guildId: string;
  addedRoles: string[];
  removedRoles: string[];
  skipped: boolean;
  success: boolean;
  error?: string;
}

export async function syncDiscordRoles(
  entitlement: Entitlement,
  env: Env,
  options?: { brand?: Brand }
): Promise<DiscordSyncResult[]> {
  const entries = options?.brand
    ? entitlement.entitlements.filter((entry) => entry.brand === options.brand)
    : entitlement.entitlements;

  const results: DiscordSyncResult[] = [];

  for (const entry of entries) {
    try {
      const result = await syncSingleBrand(entitlement, entry, env);
      results.push({
        brand: entry.brand,
        guildId: entry.guildId,
        addedRoles: result.addRoles,
        removedRoles: result.removeRoles,
        skipped: result.skipped,
        success: result.success,
        error: result.error,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.log("error", "Discord sync failed", { userId: entitlement.userId, brand: entry.brand, error: message });
      await enqueueRetryTask(env, {
        type: "discord-sync",
        payload: {
          userId: entitlement.userId,
          brand: entry.brand,
          reason: message,
        },
      });
      results.push({
        brand: entry.brand,
        guildId: entry.guildId,
        addedRoles: [],
        removedRoles: [],
        skipped: false,
        success: false,
        error: message,
      });
    }
  }

  if (results.some((result) => result.success)) {
    await setDiscordSyncTimestamp(entitlement.userId, new Date().toISOString(), env);
  }

  return results;
}

export async function processQueuedDiscordSync(env: Env): Promise<{ processed: number; succeeded: number; failed: number }> {
  return processRetryQueue(env, async (task: RetryTask) => {
    const entitlement = await getEntitlement(task.payload.userId, env);
    if (!entitlement) {
      throw new Error(`Entitlement not found for retry task ${task.id}`);
    }
    await syncDiscordRoles(entitlement, env, { brand: task.payload.brand });
  });
}
