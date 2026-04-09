import type { Env } from "./types/env";
import { handleIntake } from "./routes/intake";
import { getMetricsSnapshot } from "./core/metrics";
import { handleInnerCircleBackfill, handleInnerCircleMetrics, handleInnerCirclePortal } from "./routes/innerCircle";
import { handleCreatorMetrics, handleCreatorPortal, handleCreatorUpload } from "./routes/creatorPortal";
import { archiveEvent, sendTelemetry, type WorkerEventMessage } from "./core/azure/observability";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/webhook/intake") {
      return handleIntake(request, env);
    }

    if (url.pathname === "/health") {
      return new Response("JayPVentures Unified Intake Engine Live", { status: 200 });
    }

    if (url.pathname === "/metrics") {
      const snapshot = await getMetricsSnapshot(env);
      return new Response(JSON.stringify(snapshot, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/inner-circle") {
      return handleInnerCirclePortal(request, env);
    }

    if (url.pathname === "/inner-circle/metrics") {
      return handleInnerCircleMetrics(request, env);
    }

    if (url.pathname === "/inner-circle/backfill") {
      return handleInnerCircleBackfill(request, env);
    }

    if (url.pathname === "/creator") {
      return handleCreatorPortal(request, env);
    }

    if (url.pathname === "/creator/metrics") {
      return handleCreatorMetrics(request, env);
    }

    if (url.pathname === "/creator/upload") {
      return handleCreatorUpload(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },

  async queue(batch: MessageBatch<WorkerEventMessage>, env: Env, ctx: ExecutionContext): Promise<void> {
    for (const message of batch.messages) {
      try {
        await archiveEvent(env, message.body);
        await sendTelemetry(env, `${message.body.payload.source}_${message.body.payload.event}`, message.body.payload.data);
        message.ack();
      } catch (error) {
        ctx.waitUntil(sendTelemetry(env, "bookings_queue_failure", {
          type: message.body.type,
          error: error instanceof Error ? error.message : String(error),
        }));
        message.retry();
      }
    }
  },
};
