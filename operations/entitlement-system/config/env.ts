export interface Env {
    JPV_INTERNAL_TEST_TOKEN?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_WEBHOOK_SECRET_SECRET_NAME?: string;
  STRIPE_SECRET_KEY?: string;
  DISCORD_BOT_TOKEN?: string;
  DISCORD_BOT_TOKEN_SECRET_NAME?: string;
  DISCORD_GUILD_ID?: string;
  DISCORD_ROLE_COMMUNITY_ID?: string;
  DISCORD_ROLE_VIP_ID?: string;
  DISCORD_GUILD_ID_CREATOR?: string;
  DISCORD_ROLE_CREATOR_COMMUNITY_ID?: string;
  DISCORD_ROLE_CREATOR_VIP_ID?: string;
  DISCORD_GUILD_ID_LABS?: string;
  DISCORD_ROLE_LABS_MEMBER_ID?: string;
  DISCORD_ROLE_LABS_RESEARCHER_ID?: string;
  DISCORD_ROLE_LABS_STUDENT_ID?: string;

  MS_TENANT_ID?: string;
  MS_CLIENT_ID?: string;
  MS_CLIENT_SECRET?: string;
  MS_TEAM_ID_LLC?: string;
  MS_GROUP_ID_LLC_CLIENTS?: string;
  MS_GROUP_ID_LLC_PARTNERS?: string;
  MS_GROUP_ID_LLC_ENTERPRISE?: string;
  OAUTH_STATE_SECRET?: string;
  ACTIVATION_TOKEN_SECRET?: string;
  PUBLIC_BASE_URL?: string;
  DISCORD_OAUTH_REDIRECT_URI?: string;
  ENTITLEMENT_ACTIVATION_URL?: string;
  ADMIN_OVERRIDE_KEY?: string;
  ADMIN_OVERRIDE_KEY_SECRET_NAME?: string;
  ENTITLEMENT_KV: KVNamespace;
  IDEMPOTENCY_KV: KVNamespace;
  RETRY_QUEUE_KV?: KVNamespace;
  METRICS_KV?: KVNamespace;
  WORKER_EVENTS_QUEUE?: Queue<unknown>;
  AZURE_KEY_VAULT_URL?: string;
  AZURE_TENANT_ID?: string;
  AZURE_CLIENT_ID?: string;
  AZURE_CLIENT_SECRET?: string;
  APPINSIGHTS_CONNECTION_STRING?: string;
  AZURE_ARCHIVE_ENDPOINT?: string;
  AZURE_ARCHIVE_TOKEN?: string;
  AZURE_ARCHIVE_TOKEN_SECRET_NAME?: string;
  LOG_LEVEL?: string;
}

function assertKv(value: unknown, key: keyof Env): KVNamespace {
  if (!value || typeof (value as KVNamespace).get !== "function" || typeof (value as KVNamespace).put !== "function") {
    throw new Error(`Missing required KV binding: ${key}`);
  }
  return value as KVNamespace;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function getEnv(env: Record<string, unknown>): Env {
  return {
    STRIPE_WEBHOOK_SECRET: optionalString(env.STRIPE_WEBHOOK_SECRET),
    STRIPE_WEBHOOK_SECRET_SECRET_NAME: optionalString(env.STRIPE_WEBHOOK_SECRET_SECRET_NAME),
    STRIPE_SECRET_KEY: optionalString(env.STRIPE_SECRET_KEY),
    DISCORD_BOT_TOKEN: optionalString(env.DISCORD_BOT_TOKEN),
    DISCORD_GUILD_ID: optionalString(env.DISCORD_GUILD_ID),
    DISCORD_ROLE_COMMUNITY_ID: optionalString(env.DISCORD_ROLE_COMMUNITY_ID),
    DISCORD_ROLE_VIP_ID: optionalString(env.DISCORD_ROLE_VIP_ID),
    DISCORD_GUILD_ID_CREATOR: optionalString(env.DISCORD_GUILD_ID_CREATOR),
    DISCORD_ROLE_CREATOR_COMMUNITY_ID: optionalString(env.DISCORD_ROLE_CREATOR_COMMUNITY_ID),
    DISCORD_ROLE_CREATOR_VIP_ID: optionalString(env.DISCORD_ROLE_CREATOR_VIP_ID),
    DISCORD_GUILD_ID_LABS: optionalString(env.DISCORD_GUILD_ID_LABS),
    DISCORD_ROLE_LABS_MEMBER_ID: optionalString(env.DISCORD_ROLE_LABS_MEMBER_ID),
    DISCORD_ROLE_LABS_RESEARCHER_ID: optionalString(env.DISCORD_ROLE_LABS_RESEARCHER_ID),
    DISCORD_ROLE_LABS_STUDENT_ID: optionalString(env.DISCORD_ROLE_LABS_STUDENT_ID),

    MS_TENANT_ID: optionalString(env.MS_TENANT_ID),
    MS_CLIENT_ID: optionalString(env.MS_CLIENT_ID),
    MS_CLIENT_SECRET: optionalString(env.MS_CLIENT_SECRET),
    MS_TEAM_ID_LLC: optionalString(env.MS_TEAM_ID_LLC),
    MS_GROUP_ID_LLC_CLIENTS: optionalString(env.MS_GROUP_ID_LLC_CLIENTS),
    MS_GROUP_ID_LLC_PARTNERS: optionalString(env.MS_GROUP_ID_LLC_PARTNERS),
    MS_GROUP_ID_LLC_ENTERPRISE: optionalString(env.MS_GROUP_ID_LLC_ENTERPRISE),
    OAUTH_STATE_SECRET: optionalString(env.OAUTH_STATE_SECRET),
    ACTIVATION_TOKEN_SECRET: optionalString(env.ACTIVATION_TOKEN_SECRET),
    PUBLIC_BASE_URL: optionalString(env.PUBLIC_BASE_URL),
    DISCORD_OAUTH_REDIRECT_URI: optionalString(env.DISCORD_OAUTH_REDIRECT_URI),
    ENTITLEMENT_ACTIVATION_URL: optionalString(env.ENTITLEMENT_ACTIVATION_URL),
    ADMIN_OVERRIDE_KEY: optionalString(env.ADMIN_OVERRIDE_KEY),
    ADMIN_OVERRIDE_KEY_SECRET_NAME: optionalString(env.ADMIN_OVERRIDE_KEY_SECRET_NAME),
    ENTITLEMENT_KV: assertKv(env.ENTITLEMENT_KV, "ENTITLEMENT_KV"),
    IDEMPOTENCY_KV: assertKv(env.IDEMPOTENCY_KV, "IDEMPOTENCY_KV"),
    RETRY_QUEUE_KV: env.RETRY_QUEUE_KV as KVNamespace | undefined,
    METRICS_KV: env.METRICS_KV as KVNamespace | undefined,
    WORKER_EVENTS_QUEUE: env.WORKER_EVENTS_QUEUE as Queue<unknown> | undefined,
    AZURE_KEY_VAULT_URL: optionalString(env.AZURE_KEY_VAULT_URL),
    AZURE_TENANT_ID: optionalString(env.AZURE_TENANT_ID),
    AZURE_CLIENT_ID: optionalString(env.AZURE_CLIENT_ID),
    AZURE_CLIENT_SECRET: optionalString(env.AZURE_CLIENT_SECRET),
    APPINSIGHTS_CONNECTION_STRING: optionalString(env.APPINSIGHTS_CONNECTION_STRING),
    AZURE_ARCHIVE_ENDPOINT: optionalString(env.AZURE_ARCHIVE_ENDPOINT),
    AZURE_ARCHIVE_TOKEN: optionalString(env.AZURE_ARCHIVE_TOKEN),
    AZURE_ARCHIVE_TOKEN_SECRET_NAME: optionalString(env.AZURE_ARCHIVE_TOKEN_SECRET_NAME),
    LOG_LEVEL: optionalString(env.LOG_LEVEL),
  };
}
