// --- Access Gate Layer Start ---
export interface Env {
  ENTITLEMENTS_KV: KVNamespace;
  STRIPE_WEBHOOK_SECRET: string;
}

type EntitlementRecord = {
  active: boolean;
  customerId: string;
  email?: string;
  plan?: string;
  updatedAt: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function getEntitlement(env: Env, subject: string): Promise<EntitlementRecord | null> {
  const raw = await env.ENTITLEMENTS_KV.get(`entitlement:${subject}`);
  return raw ? JSON.parse(raw) : null;
}

async function setEntitlement(env: Env, subject: string, record: EntitlementRecord) {
  await env.ENTITLEMENTS_KV.put(`entitlement:${subject}`, JSON.stringify(record));
}

type RequireAccessResult =
  | { allowed: true; subject: string; entitlement: EntitlementRecord }
  | { allowed: false; response: Response };

async function requireAccess(request: Request, env: Env): Promise<RequireAccessResult> {
  const subject = request.headers.get("x-jpv-subject") || new URL(request.url).searchParams.get("subject");

  if (!subject) {
    return {
      allowed: false,
      response: json({ error: "ACCESS_DENIED", reason: "missing_subject" }, 401),
    };
  }

  const entitlement = await getEntitlement(env, subject);
  if (!entitlement?.active) {
    return {
      allowed: false,
      response: json(
        {
          error: "ACCESS_DENIED",
          reason: "no_active_entitlement",
          message: "Access requires an active JPV entitlement.",
        },
        403
      ),
    };
  }

  return { allowed: true, subject, entitlement };
}
// --- Access Gate Layer End ---

import { getEnv } from "./config/env";
import { JPV_DESIGN_SYSTEM_CSS, JPV_DESIGN_SYSTEM_VERSION } from "./lib/jpvDesignSystem";
import { renderRoute } from "./lib/render";

function applyDesignSystem(html: string): string {
  return html
    .replace('<meta name="theme-color" content="#f3efe8">', '<meta name="theme-color" content="#050508">')
    .replace(
      /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Fraunces:[^"]+" rel="stylesheet">/,
      '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">'
    )
    .replace(
      "</head>",
      `<link rel="stylesheet" href="/jpv-design-system.css?v=${JPV_DESIGN_SYSTEM_VERSION}"><meta name="jpv-design-system" content="${JPV_DESIGN_SYSTEM_VERSION}"></head>`
    );
}

export default {
  async fetch(request: Request, rawEnv: Record<string, string>): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/jpv-design-system.css") {
      return new Response(JPV_DESIGN_SYSTEM_CSS, {
        headers: {
          "Content-Type": "text/css; charset=UTF-8",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          "X-JPV-Design-System": JPV_DESIGN_SYSTEM_VERSION,
        },
      });
    }

    if (url.pathname === "/health") {
      return json({
        status: "ok",
        system: "JPV Access Layer",
        designSystem: JPV_DESIGN_SYSTEM_VERSION,
      });
    }

    if (url.pathname === "/protected") {
      const access = await requireAccess(request, rawEnv as unknown as Env);
      if (!access.allowed) return access.response;
      return json({
        access: "granted",
        subject: access.subject,
        entitlement: access.entitlement,
        message: "Welcome to the gated JPV system layer.",
      });
    }

    if (url.pathname === "/admin/grant-access" && request.method === "POST") {
      const body = await request.json<any>();
      if (!body.subject || !body.customerId) {
        return json({ error: "BAD_REQUEST", reason: "subject_and_customerId_required" }, 400);
      }
      await setEntitlement(rawEnv as unknown as Env, body.subject, {
        active: true,
        customerId: body.customerId,
        email: body.email,
        plan: body.plan ?? "JPV_ACCESS",
        updatedAt: new Date().toISOString(),
      });
      return json({ status: "granted", subject: body.subject });
    }

    if (url.pathname === "/admin/revoke-access" && request.method === "POST") {
      const body = await request.json<any>();
      if (!body.subject) return json({ error: "BAD_REQUEST", reason: "subject_required" }, 400);
      const existing = await getEntitlement(rawEnv as unknown as Env, body.subject);
      await setEntitlement(rawEnv as unknown as Env, body.subject, {
        active: false,
        customerId: existing?.customerId ?? "unknown",
        email: existing?.email,
        plan: existing?.plan,
        updatedAt: new Date().toISOString(),
      });
      return json({ status: "revoked", subject: body.subject });
    }

    const pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Allow: "GET, HEAD",
        },
      });
    }

    if (url.pathname !== pathname) {
      const redirectUrl = new URL(url.toString());
      redirectUrl.pathname = pathname;
      return Response.redirect(redirectUrl.toString(), 301);
    }

    const env = getEnv(rawEnv);
    const rendered = renderRoute(pathname, env);

    if (!rendered) {
      const notFound = applyDesignSystem(
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050508"><title>Not Found</title></head><body style="padding:40px"><main><h1>404</h1><p>The requested page was not found.</p><p><a href="/">Return home</a></p></main></body></html>'
      );
      return new Response(notFound, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=UTF-8" },
      });
    }

    if (request.method === "HEAD") {
      return new Response(null, {
        status: rendered.status ?? 200,
        headers: {
          "Content-Type": rendered.contentType,
          "X-JPV-Design-System": JPV_DESIGN_SYSTEM_VERSION,
        },
      });
    }

    const body = rendered.contentType.startsWith("text/html") ? applyDesignSystem(rendered.body) : rendered.body;

    return new Response(body, {
      status: rendered.status ?? 200,
      headers: {
        "Content-Type": rendered.contentType,
        "X-JPV-Design-System": JPV_DESIGN_SYSTEM_VERSION,
      },
    });
  },
};
