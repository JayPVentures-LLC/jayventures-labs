import type { CRMRecord } from "../../types/crm";
import type { Env } from "../../types/env";
import type { IntegrationResult } from "../../types/integration";
import { postJson } from "../../utils/http";
import { getDataLakeToken } from "../../utils/runtimeSecrets";

export async function pushToDataLake(env: Env, record: CRMRecord): Promise<IntegrationResult> {
  if (!env.DATALAKE_ENDPOINT) {
    return { name: "data_lake", status: "skipped", detail: "missing_env" };
  }

  const token = await getDataLakeToken(env);
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await postJson(
    env.DATALAKE_ENDPOINT,
    {
      record,
      capturedAt: new Date().toISOString(),
    },
    headers
  );

  if (!response.ok) {
    return { name: "data_lake", status: "error", detail: "data_lake_failed" };
  }

  return { name: "data_lake", status: "ok" };
}
