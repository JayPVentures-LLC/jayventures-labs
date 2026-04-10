export interface Env {
  SITE_ORIGIN: string;
  MICROSOFT_BOOKINGS_URL: string;
  STRIPE_ALL_VENTURES_CORE_URL: string;
  STRIPE_ALL_VENTURES_PLUS_URL: string;
  STRIPE_ALL_VENTURES_INNER_CIRCLE_URL: string;
  CREATOR_PORTAL_URL: string;
  INNER_CIRCLE_PORTAL_URL: string;
}

function readString(raw: Record<string, unknown>, key: keyof Env, fallback?: string): string {
  const value = raw[key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (fallback) {
    return fallback;
  }
  throw new Error(`Missing required environment variable: ${key}`);
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getEnv(raw: Record<string, unknown>): Env {
  return {
    SITE_ORIGIN: stripTrailingSlash(readString(raw, "SITE_ORIGIN", "https://jaypventuresllc.com")),
    MICROSOFT_BOOKINGS_URL: readString(
      raw,
      "MICROSOFT_BOOKINGS_URL",
      "https://outlook.office.com/book/JAYPVENTURESLLCConsultations1@jaypventuresllc.com/?ismsaljsauthenabled"
    ),
    STRIPE_ALL_VENTURES_CORE_URL: readString(raw, "STRIPE_ALL_VENTURES_CORE_URL", "https://replace-me.example/checkout/all-ventures-core"),
    STRIPE_ALL_VENTURES_PLUS_URL: readString(raw, "STRIPE_ALL_VENTURES_PLUS_URL", "https://replace-me.example/checkout/all-ventures-plus"),
    STRIPE_ALL_VENTURES_INNER_CIRCLE_URL: readString(
      raw,
      "STRIPE_ALL_VENTURES_INNER_CIRCLE_URL",
      "https://replace-me.example/checkout/all-ventures-inner-circle"
    ),
    CREATOR_PORTAL_URL: readString(raw, "CREATOR_PORTAL_URL", "https://replace-me.example/app/creator"),
    INNER_CIRCLE_PORTAL_URL: readString(raw, "INNER_CIRCLE_PORTAL_URL", "https://replace-me.example/app/inner-circle"),
  };
}
