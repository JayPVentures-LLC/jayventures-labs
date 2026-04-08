export type IntegrationStatus = "ok" | "skipped" | "error";

export interface IntegrationResult {
  name: string;
  status: IntegrationStatus;
  detail?: string;
}
