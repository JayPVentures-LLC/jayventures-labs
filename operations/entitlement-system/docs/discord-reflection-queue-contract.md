# Discord Reflection Queue Contract

## Purpose

Discord role sync is a reflection of verified entitlement state. It is not an entitlement authority.

## Queue Event

``text
stripe-entitlement-synced
``

## Required Payload

``ts
{
  type: "stripe-entitlement-synced";
  payload: {
    userId: string;
    brand?: Brand;
  };
}
``

## Execution Path

``text
stripe-entitlement-synced
-> getEntitlement(userId)
-> syncDiscordRoles(entitlement, env, optional brand)
-> sendTelemetry("stripe_entitlement_synced_discord_reflected")
-> ack on success
-> retry on failure
``

## Safety Standard

- No Discord mutation runs without a stored entitlement.
- Discord remains reflection only.
- Entitlement state remains the source of truth.
- Queue failures retry through the Worker queue failure path.
- Discord retry events remain supported for operational recovery.
