import os
import requests

DISCORD_API = "https://discord.com/api/v10"


def sync_discord_roles(entitlement: dict) -> dict:
    discord_user_id = entitlement.get("discord_user_id")

    if not discord_user_id:
        return {
            "status": "skipped",
            "reason": "missing_discord_user_id"
        }

    bot_token = os.environ["DISCORD_BOT_TOKEN"]

    guild_id, role_id = resolve_discord_target(entitlement)

    if not guild_id or not role_id:
        return {
            "status": "skipped",
            "reason": "unmapped_entity_or_tier"
        }

    headers = {
        "Authorization": f"Bot {bot_token}",
        "Content-Type": "application/json"
    }

    url = f"{DISCORD_API}/guilds/{guild_id}/members/{discord_user_id}/roles/{role_id}"

    if entitlement.get("active"):
        response = requests.put(url, headers=headers, timeout=10)
        action = "role_added"
    else:
        response = requests.delete(url, headers=headers, timeout=10)
        action = "role_removed"

    if response.status_code not in [200, 201, 204]:
        raise RuntimeError(
            f"Discord sync failed: {response.status_code} {response.text}"
        )

    return {
        "status": "synced",
        "action": action,
        "guild_id": guild_id,
        "role_id": role_id
    }


def resolve_discord_target(entitlement: dict) -> tuple[str | None, str | None]:
    entity = entitlement.get("entity")
    tier = entitlement.get("tier")

    if entity == "jaypventures":
        guild_id = os.environ.get("DISCORD_CREATOR_GUILD_ID")
        role_id = (
            os.environ.get("DISCORD_ROLE_VIP_ID")
            if tier == "vip"
            else os.environ.get("DISCORD_ROLE_COMMUNITY_ID")
        )
        return guild_id, role_id

    if entity == "jaypVLabs":
        return (
            os.environ.get("DISCORD_LABS_GUILD_ID"),
            os.environ.get("DISCORD_ROLE_LABS_MEMBER_ID")
        )

    if entity == "JayPVentures LLC":
        return (
            os.environ.get("DISCORD_ENTERPRISE_GUILD_ID"),
            os.environ.get("DISCORD_ROLE_ENTERPRISE_CLIENT_ID")
        )

    return None, None
