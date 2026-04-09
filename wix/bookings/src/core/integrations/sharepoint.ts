import type { CRMRecord } from "../../types/crm";
import type { Env } from "../../types/env";
import type { IntegrationResult } from "../../types/integration";
import { getSharePointAccessToken } from "../../utils/runtimeSecrets";

export async function pushToSharePoint(env: Env, record: CRMRecord): Promise<IntegrationResult> {
  const accessToken = await getSharePointAccessToken(env);
  if (!env.SHAREPOINT_SITE_ID || !env.SHAREPOINT_LIST_ID || !accessToken) {
    return { name: "sharepoint", status: "skipped", detail: "missing_env" };
  }

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${env.SHAREPOINT_SITE_ID}/lists/${env.SHAREPOINT_LIST_ID}/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: record }),
    }
  );

  if (!response.ok) {
    return { name: "sharepoint", status: "error", detail: "list_item_failed" };
  }

  return { name: "sharepoint", status: "ok" };
}
