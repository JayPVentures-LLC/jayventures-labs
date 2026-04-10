import { getEnv } from "./config/env";
import { renderRoute } from "./lib/render";

export default {
  async fetch(request: Request, rawEnv: Record<string, string>): Promise<Response> {
    const url = new URL(request.url);
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
      return new Response(
        "<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><title>Not Found</title><body style=\"font-family:sans-serif;background:#07090c;color:#f4f4f1;padding:40px\"><h1>404</h1><p>The requested page was not found.</p><p><a href=\"/\" style=\"color:#f4f4f1\">Return home</a></p></body></html>",
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=UTF-8" },
        }
      );
    }

    if (request.method === "HEAD") {
      return new Response(null, {
        status: rendered.status ?? 200,
        headers: { "Content-Type": rendered.contentType },
      });
    }

    return new Response(rendered.body, {
      status: rendered.status ?? 200,
      headers: { "Content-Type": rendered.contentType },
    });
  },
};
