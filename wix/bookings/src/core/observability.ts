import type { Env } from "../types/env";

export type WorkerEventMessage = { type: "archive"; payload: { source: string; event: string; timestamp: string; data: Record<string, unknown> } };

export async function enqueueArchive(env: Env, payload: WorkerEventMessage["payload"]): Promise<void> {
  if (env.WORKER_EVENTS_QUEUE) await env.WORKER_EVENTS_QUEUE.send({ type: "archive", payload });
}
export async function archiveEvent(env: Env, payload: WorkerEventMessage): Promise<void> {
  if (!env.METRICS_KV) return;
  const id=crypto.randomUUID();
  await env.METRICS_KV.put(`jpv:archive:${id}`,JSON.stringify(payload.payload));
}
export async function sendTelemetry(env: Env,eventName:string,properties:Record<string,unknown>):Promise<void>{
  if(!env.METRICS_KV)return;
  const id=crypto.randomUUID();
  await env.METRICS_KV.put(`jpv:telemetry:${eventName}:${id}`,JSON.stringify({eventName,properties,observedAt:new Date().toISOString()}),{expirationTtl:60*60*24*30});
}
