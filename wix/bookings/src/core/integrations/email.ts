import type { CRMRecord } from "../../types/crm";
import type { Env } from "../../types/env";
import type { IntegrationResult } from "../../types/integration";
import { postJson } from "../../utils/http";

export async function sendEmail(env: Env, record: CRMRecord): Promise<IntegrationResult> {
  if (!env.EMAIL_API_KEY) {
    return { name: "email", status: "skipped", detail: "missing_env" };
  }

  const response = await postJson(env.EMAIL_API_KEY, {
    record,
  });

  if (!response.ok) {
    return { name: "email", status: "error", detail: "email_webhook_failed" };
  }

  return { name: "email", status: "ok" };
}
