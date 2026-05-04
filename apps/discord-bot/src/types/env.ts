export interface Env {
  /** Ed25519 public key (hex) from the Discord Developer Portal — used to verify interaction signatures */
  DISCORD_PUBLIC_KEY: string;
  /** Application ID — shown as "Application ID" in the Discord Developer Portal */
  DISCORD_APP_ID: string;
  /** OAuth2 Client ID (same as Application ID for most apps) */
  DISCORD_CLIENT_ID: string;
  /** OAuth2 Client Secret — set via `wrangler secret put DISCORD_CLIENT_SECRET` */
  DISCORD_CLIENT_SECRET: string;
  /** Bot token for direct Discord API calls — set via `wrangler secret put DISCORD_BOT_TOKEN` */
  DISCORD_BOT_TOKEN: string;
  /** Public site origin, no trailing slash — used for OAuth2 redirect URIs and success page */
  SITE_ORIGIN: string;
  /** Optional KV namespace for OAuth2 state storage (prevents CSRF in the linked-roles flow) */
  LINKED_ROLES_KV?: KVNamespace;
}
