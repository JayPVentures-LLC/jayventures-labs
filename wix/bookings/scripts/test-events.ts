import crypto from "crypto";

const baseUrl = process.env.JVP_BASE_URL || "http://127.0.0.1:8787";
const secret = process.env.INTAKE_HMAC_SECRET || "localdevsecret";

async function postEvent(payload: unknown) {
  const body = JSON.stringify(payload, null, 2);
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  const response = await fetch(`${baseUrl}/webhook/intake`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-jvp-signature": signature,
    },
    body,
  });

  const text = await response.text();
  return { status: response.status, text };
}

async function getMetrics() {
  const response = await fetch(`${baseUrl}/metrics`);
  const text = await response.text();
  return { status: response.status, text };
}

function nowIso() {
  return new Date().toISOString();
}

async function run() {
  const baseId = Date.now();

  const subscriptionCreated = {
    source: "memberstack",
    eventType: "subscription.created",
    idempotencyKey: `memberstack:sub:${baseId}:created`,
    occurredAt: nowIso(),
    payload: {
      id: "mem_123",
      email: "test@email.com",
      tier: "Core",
      name: "Test Member",
    },
  };

  const subscriptionUpdated = {
    source: "memberstack",
    eventType: "subscription.updated",
    idempotencyKey: `memberstack:sub:${baseId}:updated`,
    occurredAt: nowIso(),
    payload: {
      id: "mem_123",
      email: "test@email.com",
      tier: "Plus",
      name: "Test Member",
    },
  };

  const subscriptionCancelled = {
    source: "memberstack",
    eventType: "subscription.cancelled",
    idempotencyKey: `memberstack:sub:${baseId}:cancelled`,
    occurredAt: nowIso(),
    payload: {
      id: "mem_123",
      email: "test@email.com",
      tier: "Plus",
      name: "Test Member",
    },
  };

  const bookingCreated = {
    source: "bookings",
    eventType: "booking.created",
    idempotencyKey: `bookings:created:${baseId}`,
    occurredAt: nowIso(),
    payload: {
      serviceName: "JayPVentures LLC - Strategy Session 60 Minutes",
      customerName: "Test Client",
      customerEmail: "test@email.com",
      startDateTime: "2026-02-10T10:00:00Z",
      endDateTime: "2026-02-10T11:00:00Z",
      servicePrice: "$350",
      bookingId: `BOOKING_${baseId}`,
    },
  };

  console.log("POST subscription.created");
  console.log(await postEvent(subscriptionCreated));
  console.log("GET metrics");
  console.log(await getMetrics());

  console.log("POST subscription.updated");
  console.log(await postEvent(subscriptionUpdated));
  console.log("GET metrics");
  console.log(await getMetrics());

  console.log("POST subscription.cancelled");
  console.log(await postEvent(subscriptionCancelled));
  console.log("GET metrics");
  console.log(await getMetrics());

  console.log("POST booking.created");
  console.log(await postEvent(bookingCreated));
  console.log("GET metrics");
  console.log(await getMetrics());
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
