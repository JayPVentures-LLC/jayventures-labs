import type { Env } from "../../config/env";
import { getKeyVaultSecret, resolveSecret } from "./keyVault.service";

export type WorkerEventMessage =
  | {
      type: "discord-retry";
      payload: {
        userId: string;
        brand?: "jaypventures" | "jaypventuresllc";
        reason: string;
      };
    }
  | {
      type: "archive";
      payload: {
        source: string;
        event: string;
        timestamp: string;
        data: Record<string, unknown>;
      };
    }
  | {
      type: "STRIPE_ENTITLEMENT_SYNCED";
      payload: {
        subject_id: string;
        discord_user_id: string;
        tier: string;
        action: string;
      };
    };

function parseConnectionString(connectionString: string): { instrumentationKey?: string; ingestionEndpoint?: string } {
  const pairs = Object.fromEntries(connectionString.split(";").map((part) => {
    const [key, ...rest] = part.split("=");
    return [key, rest.join("=")];
  }));
  return {
    instrumentationKey: pairs.InstrumentationKey,
    ingestionEndpoint: pairs.IngestionEndpoint,
  };
}

async function getArchiveToken(env: Env): Promise<string | null> {
  return resolveSecret(env.AZURE_ARCHIVE_TOKEN, env, env.AZURE_ARCHIVE_TOKEN_SECRET_NAME);
}

export async function enqueueWorkerEvent(env: Env, message: WorkerEventMessage): Promise<void> {
  if (!env.WORKER_EVENTS_QUEUE) return;
  await env.WORKER_EVENTS_QUEUE.send(message);
}

export async function sendTelemetry(env: Env, eventName: string, properties: Record<string, unknown>): Promise<void> {
  if (!env.APPINSIGHTS_CONNECTION_STRING) return;
  const parsed = parseConnectionString(env.APPINSIGHTS_CONNECTION_STRING);
  if (!parsed.instrumentationKey) return;

  const endpoint = `${(parsed.ingestionEndpoint ?? "https://dc.services.visualstudio.com").replace(/\/$/, "")}/v2/track`;
  await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        name: "Microsoft.ApplicationInsights.Event",
        time: new Date().toISOString(),
        iKey: parsed.instrumentationKey,
        data: {
          baseType: "EventData",
          baseData: {
            name: eventName,
            properties: Object.fromEntries(Object.entries(properties).map(([key, value]) => [key, String(value)])),
          },
        },
      },
    ]),
  });
}

export async function archiveEvent(env: Env, payload: WorkerEventMessage & { type: "archive" }): Promise<void> {
  if (!env.AZURE_ARCHIVE_ENDPOINT) return;
  const token = await getArchiveToken(env);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  await fetch(env.AZURE_ARCHIVE_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(payload.payload),
  });
}
