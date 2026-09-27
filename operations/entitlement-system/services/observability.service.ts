import type { Env } from "../config/env";
export type WorkerEventMessage =
 | {type:"discord-retry";payload:{userId:string;brand?:"jaypventures"|"jaypventuresllc";reason:string}}
 | {type:"archive";payload:{source:string;event:string;timestamp:string;data:Record<string,unknown>}};
export async function enqueueWorkerEvent(env:Env,message:WorkerEventMessage):Promise<void>{if(env.WORKER_EVENTS_QUEUE)await env.WORKER_EVENTS_QUEUE.send(message);}
export async function sendTelemetry(env:Env,eventName:string,properties:Record<string,unknown>):Promise<void>{if(!env.RETRY_QUEUE_KV)return;const id=crypto.randomUUID();await env.RETRY_QUEUE_KV.put(`telemetry:${eventName}:${id}`,JSON.stringify({eventName,properties,observedAt:new Date().toISOString()}),{expirationTtl:60*60*24*30});}
export async function archiveEvent(env:Env,payload:WorkerEventMessage&{type:"archive"}):Promise<void>{if(!env.RETRY_QUEUE_KV)return;const id=crypto.randomUUID();await env.RETRY_QUEUE_KV.put(`archive:${id}`,JSON.stringify(payload.payload));}
