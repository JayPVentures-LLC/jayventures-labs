import json
import logging
import os
from datetime import datetime, timezone

import azure.functions as func
from azure.cosmos import CosmosClient

from shared.entitlement_mapper import map_stripe_event_to_entitlement
from shared.discord_sync import sync_discord_roles
from shared.audit import build_audit_event

app = func.FunctionApp()

COSMOS_ENDPOINT = os.environ["COSMOS_ENDPOINT"]
COSMOS_KEY = os.environ["COSMOS_KEY"]
DATABASE_NAME = os.environ.get("COSMOS_DATABASE", "jpv-entitlements-db")
ENTITLEMENTS_CONTAINER = os.environ.get("COSMOS_ENTITLEMENTS_CONTAINER", "entitlements")
AUDIT_CONTAINER = os.environ.get("COSMOS_AUDIT_CONTAINER", "audit_events")

client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
database = client.get_database_client(DATABASE_NAME)
entitlements = database.get_container_client(ENTITLEMENTS_CONTAINER)
audit_events = database.get_container_client(AUDIT_CONTAINER)


@app.queue_trigger(
    arg_name="msg",
    queue_name="stripe-events",
    connection="AzureWebJobsStorage"
)
def process_stripe_event(msg: func.QueueMessage) -> None:
    raw = msg.get_body().decode("utf-8")

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        logging.error("Invalid JSON in queue message.")
        raise exc

    event_id = payload.get("id")
    event_type = payload.get("type")

    if not event_id or not event_type:
        raise ValueError("Stripe event is missing id or type.")

    logging.info("Processing Stripe event %s of type %s", event_id, event_type)

    entitlement = map_stripe_event_to_entitlement(payload)

    if entitlement:
        entitlement["updated_at"] = datetime.now(timezone.utc).isoformat()
        entitlements.upsert_item(entitlement)

        discord_result = sync_discord_roles(entitlement)

        audit = build_audit_event(
            source="stripe",
            event_id=event_id,
            event_type=event_type,
            status="processed",
            subject_id=entitlement["subject_id"],
            details={
                "entity": entitlement["entity"],
                "tier": entitlement["tier"],
                "discord_sync": discord_result
            }
        )
    else:
        audit = build_audit_event(
            source="stripe",
            event_id=event_id,
            event_type=event_type,
            status="ignored",
            subject_id="unmapped",
            details={
                "reason": "event_type_not_monetization_relevant"
            }
        )

    audit_events.upsert_item(audit)

    logging.info("Completed Stripe event %s", event_id)
