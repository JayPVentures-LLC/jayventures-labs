export type DiscordEntitlementTier = "community" | "vip";

export type DiscordEntitlementAction =
  | "ENTITLEMENT_ACTIVE"
  | "ENTITLEMENT_INACTIVE";

export type DiscordReflectionEnv = {
  DISCORD_BOT_TOKEN?: string;
  DISCORD_GUILD_ID?: string;
  DISCORD_ROLE_COMMUNITY_ID?: string;
  DISCORD_ROLE_VIP_ID?: string;
};

export type DiscordRoleSyncInput = {
  subject_id: string;
  discord_user_id: string;
  tier: DiscordEntitlementTier;
  action: DiscordEntitlementAction;
};

export class DiscordReflectionError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "DiscordReflectionError";
  }
}

export function getDiscordRoleIdForTier(
  env: DiscordReflectionEnv,
  tier: DiscordEntitlementTier,
): string {
  if (tier === "community" && env.DISCORD_ROLE_COMMUNITY_ID) {
    return env.DISCORD_ROLE_COMMUNITY_ID;
  }

  if (tier === "vip" && env.DISCORD_ROLE_VIP_ID) {
    return env.DISCORD_ROLE_VIP_ID;
  }

  throw new DiscordReflectionError(
    "missing_discord_role_mapping",
    `Missing Discord role mapping for tier: ${tier}`,
  );
}

export async function syncDiscordRole(
  env: DiscordReflectionEnv,
  input: DiscordRoleSyncInput,
): Promise<{ result: "role_added" | "role_removed"; role_id: string }> {
  if (!input.subject_id) {
    throw new DiscordReflectionError("missing_subject_id", "Missing subject_id.");
  }

  if (!input.discord_user_id) {
    throw new DiscordReflectionError("missing_discord_user_id", "Missing discord_user_id.");
  }

  if (!env.DISCORD_GUILD_ID) {
    throw new DiscordReflectionError("missing_discord_guild_id", "Missing DISCORD_GUILD_ID.");
  }

  if (!env.DISCORD_BOT_TOKEN) {
    throw new DiscordReflectionError("missing_discord_bot_token", "Missing DISCORD_BOT_TOKEN.");
  }

  const role_id = getDiscordRoleIdForTier(env, input.tier);

  const method =
    input.action === "ENTITLEMENT_ACTIVE"
      ? "PUT"
      : input.action === "ENTITLEMENT_INACTIVE"
        ? "DELETE"
        : undefined;

  if (!method) {
    throw new DiscordReflectionError(
      "unsupported_entitlement_sync_action",
      `Unsupported entitlement action: ${input.action}`,
    );
  }

  const url =
    `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}` +
    `/members/${input.discord_user_id}/roles/${role_id}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new DiscordReflectionError(
      "discord_api_error",
      `Discord API returned ${response.status}.`,
    );
  }

  return {
    result: method === "PUT" ? "role_added" : "role_removed",
    role_id,
  };
}
