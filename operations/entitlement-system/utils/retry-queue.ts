import type { Env } from "../config/env";
import type { RetryTask } from "../types/discord.types";
import { logger } from "./logger";
import type { WorkerEventMessage } from "../services/azure/observability.service";
import { enqueueWorkerEvent } from "../services/azure/observability.service";

function keyFor(taskId: string): string {
  return `retry:${taskId}`;
}

export async function enqueueRetryTask(
  env: Env,
  task: Omit<RetryTask, "id" | "createdAt" | "attempts" | "runAfter"> & { attempts?: number; delaySeconds?: number }
): Promise<RetryTask> {
  const retryTask: RetryTask = {
    id: crypto.randomUUID(),
    type: task.type,
    attempts: task.attempts ?? 0,
    runAfter: Date.now() + ((task.delaySeconds ?? 60) * 1000),
    createdAt: new Date().toISOString(),
    payload: task.payload,
  };

  if (env.WORKER_EVENTS_QUEUE) {
    const message: WorkerEventMessage = {
      type: "discord-retry",
      payload: retryTask.payload,
    };
    await enqueueWorkerEvent(env, message);
    return retryTask;
  }

  if (!env.RETRY_QUEUE_KV) {
    logger.log("warn", "Retry persistence missing; task not persisted", { task: retryTask });
    return retryTask;
  }

  await env.RETRY_QUEUE_KV.put(keyFor(retryTask.id), JSON.stringify(retryTask), { expirationTtl: 60 * 60 * 24 * 7 });
  return retryTask;
}

export async function listRetryTasks(env: Env): Promise<RetryTask[]> {
  if (!env.RETRY_QUEUE_KV || typeof env.RETRY_QUEUE_KV.list !== "function") {
    return [];
  }

  const listed = await env.RETRY_QUEUE_KV.list({ prefix: "retry:" });
  const tasks = await Promise.all(
    listed.keys.map(async (entry) => {
      const raw = await env.RETRY_QUEUE_KV?.get(entry.name);
      return raw ? (JSON.parse(raw) as RetryTask) : null;
    })
  );

  return tasks.filter((task): task is RetryTask => Boolean(task));
}

export async function removeRetryTask(env: Env, taskId: string): Promise<void> {
  if (!env.RETRY_QUEUE_KV) return;
  await env.RETRY_QUEUE_KV.delete(keyFor(taskId));
}

export async function processRetryQueue(
  env: Env,
  handler: (task: RetryTask) => Promise<void>,
  options?: { force?: boolean }
): Promise<{ processed: number; succeeded: number; failed: number }> {
  const tasks = await listRetryTasks(env);
  const due = options?.force ? tasks : tasks.filter((task) => task.runAfter <= Date.now());

  let succeeded = 0;
  let failed = 0;

  for (const task of due) {
    try {
      await handler(task);
      await removeRetryTask(env, task.id);
      succeeded += 1;
    } catch (error) {
      failed += 1;
      const attempts = task.attempts + 1;
      if (!env.RETRY_QUEUE_KV) {
        continue;
      }
      const next: RetryTask = {
        ...task,
        attempts,
        runAfter: Date.now() + Math.min(2 ** attempts * 60_000, 60 * 60 * 1000),
      };
      await env.RETRY_QUEUE_KV.put(keyFor(task.id), JSON.stringify(next), { expirationTtl: 60 * 60 * 24 * 7 });
      logger.log("warn", "Retry task rescheduled", {
        taskId: task.id,
        attempts,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { processed: due.length, succeeded, failed };
}
