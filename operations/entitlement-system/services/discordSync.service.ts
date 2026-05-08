import type { Env } from "../config/env";
import type { Brand, Entitlement } from "../types/entitlement.types";
import type { RetryTask } from "../types/discord.types";
import { syncDiscordRoles as syncSingleBrand } from "./discord.service";
import { enqueueRetryTask, processRetryQueue } from "../utils/retry-queue";
import { logger } from "../utils/logger";
import { getEntitlement, setDiscordSyncTimestamp } from "./entitlement.service";
import { writeAuditEvent } from "./audit.service";
import { sendTelemetry } from "./azure/observability.service";

export interface DiscordSyncResult {
  brand: Brand;
  guildId: string;
  addedRoles: string[];
  removedRoles: string[];
  skipped: boolean;
  success: boolean;
  dryRun: boolean;
  error?: string;
}

export async function syncDiscordRoles(
  entitlement: Entitlement,
  env: Env,
  options?: { brand?: Brand; dryRun?: boolean }
): Promise<DiscordSyncResult[]> {
  const dryRun = options?.dryRun ?? false;
  const entries = options?.brand
    ? entitlement.entitlements.filter((entry) => entry.brand === options.brand)
    : entitlement.entitlements;

  const results: DiscordSyncResult[] = [];

  for (const entry of entries) {
    try {
      const result = await syncSingleBrand(entitlement, entry, env, { dryRun });

      if (!result.skipped) {
        logger.log("info", dryRun ? "Discord sync dry-run" : "Discord sync completed", {
          userId: entitlement.userId,
          brand: entry.brand,
          addedRoles: result.addRoles,
          removedRoles: result.removeRoles,
          dryRun,
        });
      }

      try {
        await writeAuditEvent(env, {
          type: "discord_sync",
          subject: entitlement.userId,
          status: result.success ? "success" : result.skipped ? "info" : "failure",
          reason: result.error,
          data: {
            brand: entry.brand,
            guildId: entry.guildId,
            addedRoles: result.addRoles,
            removedRoles: result.removeRoles,
            dryRun,
          },
        });
      } catch (auditError) {
        logger.log("warn", "Failed to write Discord sync audit event", {
          userId: entitlement.userId,
          error: auditError instanceof Error ? auditError.message : String(auditError),
        });
      }

      results.push({
        brand: entry.brand,
        guildId: entry.guildId,
        addedRoles: result.addRoles,
        removedRoles: result.removeRoles,
        skipped: result.skipped,
        success: result.success,
        dryRun,
        error: result.error,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.log("error", "Discord sync failed", { userId: entitlement.userId, brand: entry.brand, error: message });
      if (!dryRun) {
        await enqueueRetryTask(env, {
          type: "discord-sync",
          payload: {
            userId: entitlement.userId,
            brand: entry.brand,
            reason: message,
          },
        });
      }
      results.push({
        brand: entry.brand,
        guildId: entry.guildId,
        addedRoles: [],
        removedRoles: [],
        skipped: false,
        success: false,
        dryRun,
        error: message,
      });
    }
  }

  if (!dryRun && results.some((result) => result.success)) {
    await setDiscordSyncTimestamp(entitlement.userId, new Date().toISOString(), env);
  }

  try {
    await sendTelemetry(env, "discord_roles_synced", {
      userId: entitlement.userId,
      totalBrands: String(results.length),
      succeeded: String(results.filter((r) => r.success).length),
      skipped: String(results.filter((r) => r.skipped).length),
      failed: String(results.filter((r) => !r.success && !r.skipped).length),
      dryRun: String(dryRun),
    });
  } catch (telemetryError) {
    logger.log("warn", "Failed to emit Discord sync telemetry", {
      error: telemetryError instanceof Error ? telemetryError.message : String(telemetryError),
    });
  }

  return results;
}

export async function processQueuedDiscordSync(
  env: Env,
  options?: { force?: boolean }
): Promise<{ processed: number; succeeded: number; failed: number }> {
  return processRetryQueue(
    env,
    async (task: RetryTask) => {
      const entitlement = await getEntitlement(task.payload.userId, env);
      if (!entitlement) {
        throw new Error(`Entitlement not found for retry task ${task.id}`);
      }
      await syncDiscordRoles(entitlement, env, { brand: task.payload.brand });
    },
    options
  );
}
