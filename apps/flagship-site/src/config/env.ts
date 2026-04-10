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
  const siteOrigin = stripTrailingSlash(readString(raw, "SITE_ORIGIN", "https://jaypventuresllc.com"));

  return {
    SITE_ORIGIN: siteOrigin,
    MICROSOFT_BOOKINGS_URL: readString(
      raw,
      "MICROSOFT_BOOKINGS_URL",
      "https://outlook.office.com/book/JAYPVENTURESLLCConsultations1@jaypventuresllc.com/?ismsaljsauthenabled"
    ),
    STRIPE_ALL_VENTURES_CORE_URL: readString(raw, "STRIPE_ALL_VENTURES_CORE_URL", `${siteOrigin}/contact#apply-membership-core`),
    STRIPE_ALL_VENTURES_PLUS_URL: readString(raw, "STRIPE_ALL_VENTURES_PLUS_URL", `${siteOrigin}/contact#apply-membership-plus`),
    STRIPE_ALL_VENTURES_INNER_CIRCLE_URL: readString(
      raw,
      "STRIPE_ALL_VENTURES_INNER_CIRCLE_URL",
      `${siteOrigin}/contact#apply-membership-inner-circle`
    ),
    CREATOR_PORTAL_URL: readString(raw, "CREATOR_PORTAL_URL", `${siteOrigin}/creator#creator-portal`),
    INNER_CIRCLE_PORTAL_URL: readString(raw, "INNER_CIRCLE_PORTAL_URL", `${siteOrigin}/all-ventures-access#inner-circle-portal`),
  };
}
