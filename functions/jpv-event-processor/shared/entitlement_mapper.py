from datetime import datetime, timezone

CREATOR_PRODUCTS = {
    "jaypventures_vip",
    "jaypventures_community"
}

LABS_PRODUCTS = {
    "jaypvlabs_research",
    "jaypvlabs_member"
}

ENTERPRISE_PRODUCTS = {
    "jaypventures_llc_consulting",
    "jaypventures_llc_infrastructure",
    "jaypventures_llc_automation"
}


def map_stripe_event_to_entitlement(event: dict) -> dict | None:
    event_type = event.get("type")
    data = event.get("data", {}).get("object", {})

    supported_events = {
        "checkout.session.completed",
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.payment_succeeded",
        "invoice.payment_failed"
    }

    if event_type not in supported_events:
        return None

    customer_id = data.get("customer")
    subscription_id = data.get("subscription") or data.get("id")
    metadata = data.get("metadata", {}) or {}

    product_key = metadata.get("jpv_product_key", "unknown")
    discord_user_id = metadata.get("discord_user_id")

    entity = resolve_entity(product_key)
    tier = resolve_tier(product_key)

    active = event_type not in {
        "customer.subscription.deleted",
        "invoice.payment_failed"
    }

    subject_id = discord_user_id or customer_id or subscription_id

    if not subject_id:
        raise ValueError("Unable to resolve entitlement subject_id.")

    return {
        "id": f"{subject_id}:{product_key}",
        "subject_id": subject_id,
        "stripe_customer_id": customer_id,
        "stripe_subscription_id": subscription_id,
        "discord_user_id": discord_user_id,
        "product_key": product_key,
        "entity": entity,
        "tier": tier,
        "active": active,
        "source": "stripe",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }


def resolve_entity(product_key: str) -> str:
    if product_key in CREATOR_PRODUCTS:
        return "jaypventures"

    if product_key in LABS_PRODUCTS:
        return "jaypVLabs"

    if product_key in ENTERPRISE_PRODUCTS:
        return "JayPVentures LLC"

    return "unclassified"


def resolve_tier(product_key: str) -> str:
    if "vip" in product_key:
        return "vip"

    if "community" in product_key:
        return "community"

    if "research" in product_key:
        return "research"

    if "consulting" in product_key:
        return "enterprise-client"

    if "infrastructure" in product_key or "automation" in product_key:
        return "enterprise-client"

    return "standard"
