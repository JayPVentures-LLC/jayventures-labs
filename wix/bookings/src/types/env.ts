export interface Env {
  ENVIRONMENT: "local" | "dev" | "prod";

  INTAKE_HMAC_SECRET: string;

  SHAREPOINT_SITE_ID?: string;
  SHAREPOINT_LIST_ID?: string;
  SHAREPOINT_MEMBERS_LIST_ID?: string;
  SHAREPOINT_ACCESS_TOKEN?: string;

  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;

  MEMBERSTACK_WEBHOOK_SECRET?: string;
  MEMBERSTACK_JWT_PUBLIC_KEY?: string;

  EMAIL_API_KEY?: string;

  DATALAKE_ENDPOINT?: string;
  DATALAKE_TOKEN?: string;

  IDEMPOTENCY_KV?: KVNamespace;
  METRICS_KV?: KVNamespace;
  CREATOR_DATA_KV?: KVNamespace;
  INNER_CIRCLE_MEMBER_KV?: KVNamespace;
  ADMIN_UPLOAD_TOKEN?: string;
}
