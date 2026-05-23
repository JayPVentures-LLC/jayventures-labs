import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DiscordReflectionError,
  getDiscordRoleIdForTier,
  syncDiscordRole,
} from "../operations/entitlement-system/services/discordReflection.service";

describe("Discord entitlement reflection", () => {
  const env = {
    DISCORD_BOT_TOKEN: "test-bot-token",
    DISCORD_GUILD_ID: "guild-1",
    DISCORD_ROLE_COMMUNITY_ID: "role-community",
    DISCORD_ROLE_VIP_ID: "role-vip",
  };

  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("maps community tier to the community Discord role", () => {
    expect(getDiscordRoleIdForTier(env, "community")).toBe("role-community");
  });

  it("maps vip tier to the vip Discord role", () => {
    expect(getDiscordRoleIdForTier(env, "vip")).toBe("role-vip");
  });

  it("fails closed when role mapping is missing", () => {
    expect(() => getDiscordRoleIdForTier({}, "vip")).toThrow(DiscordReflectionError);
  });

  it("adds a mapped role for active entitlement", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await syncDiscordRole(env, {
      subject_id: "subject-1",
      discord_user_id: "discord-1",
      tier: "vip",
      action: "ENTITLEMENT_ACTIVE",
    });

    expect(result).toEqual({ result: "role_added", role_id: "role-vip" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://discord.com/api/v10/guilds/guild-1/members/discord-1/roles/role-vip",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("removes a mapped role for inactive entitlement", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await syncDiscordRole(env, {
      subject_id: "subject-1",
      discord_user_id: "discord-1",
      tier: "vip",
      action: "ENTITLEMENT_INACTIVE",
    });

    expect(result).toEqual({ result: "role_removed", role_id: "role-vip" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://discord.com/api/v10/guilds/guild-1/members/discord-1/roles/role-vip",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("fails closed when discord_user_id is missing", async () => {
    await expect(
      syncDiscordRole(env, {
        subject_id: "subject-1",
        discord_user_id: "",
        tier: "vip",
        action: "ENTITLEMENT_ACTIVE",
      }),
    ).rejects.toMatchObject({ code: "missing_discord_user_id" });
  });

  it("fails closed when subject_id is missing", async () => {
    await expect(
      syncDiscordRole(env, {
        subject_id: "",
        discord_user_id: "discord-1",
        tier: "vip",
        action: "ENTITLEMENT_ACTIVE",
      }),
    ).rejects.toMatchObject({ code: "missing_subject_id" });
  });

  it("fails closed on Discord API error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    await expect(
      syncDiscordRole(env, {
        subject_id: "subject-1",
        discord_user_id: "discord-1",
        tier: "vip",
        action: "ENTITLEMENT_ACTIVE",
      }),
    ).rejects.toMatchObject({ code: "discord_api_error" });
  });
});
