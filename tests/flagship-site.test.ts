import { describe, expect, it } from "vitest";
import worker from "../apps/flagship-site/src/index";
import { insightArticles } from "../apps/flagship-site/src/content/insights";
import { publicRoutes } from "../apps/flagship-site/src/lib/render";

function createRawEnv() {
  return {
    SITE_ORIGIN: "https://jaypventuresllc.com",
    MICROSOFT_BOOKINGS_URL: "https://bookings.example/discovery",
    STRIPE_ALL_VENTURES_CORE_URL: "https://checkout.example/core",
    STRIPE_ALL_VENTURES_PLUS_URL: "https://checkout.example/plus",
    STRIPE_ALL_VENTURES_INNER_CIRCLE_URL: "https://checkout.example/inner-circle",
    CREATOR_PORTAL_URL: "https://app.example/creator",
    INNER_CIRCLE_PORTAL_URL: "https://app.example/inner-circle",
  };
}

async function fetchRoute(pathname: string, init?: RequestInit) {
  const request = new Request(`https://jaypventuresllc.com${pathname}`, init);
  return worker.fetch(request as never, createRawEnv(), {} as ExecutionContext);
}

describe("flagship site worker", () => {
  it("serves every planned public route and insight article", async () => {
    const routes = [...publicRoutes, ...insightArticles.map((article) => `/insights/${article.slug}`)];

    for (const route of routes) {
      const response = await fetchRoute(route);
      expect(response.status).toBe(200);

      const contentType = response.headers.get("Content-Type") ?? "";
      if (route.endsWith(".md")) {
        expect(contentType).toContain("text/markdown");
      } else {
        expect(contentType).toContain("text/html");
        const html = await response.text();
        expect(html).toContain('<main id="content"');
        expect(html).toContain("Skip to content");
      }
    }
  });

  it("keeps internal links inside the planned route set", async () => {
    const routable = new Set<string>([...publicRoutes, ...insightArticles.map((article) => `/insights/${article.slug}`)]);
    const htmlRoutes = publicRoutes.filter((route) => !route.endsWith(".md"));

    for (const route of htmlRoutes) {
      const response = await fetchRoute(route);
      const html = await response.text();
      const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);

      for (const href of hrefs) {
        if (!href.startsWith("/")) continue;
        const [path] = href.split("#");
        expect(routable.has(path || "/")).toBe(true);
      }
    }
  });

  it("exposes the expected contact anchors and conversion links", async () => {
    const home = await (await fetchRoute("/")).text();
    const creator = await (await fetchRoute("/creator")).text();
    const membership = await (await fetchRoute("/all-ventures-access")).text();
    const trust = await (await fetchRoute("/trust")).text();
    const contact = await (await fetchRoute("/contact")).text();

    expect(home).toContain("https://bookings.example/discovery");
    expect(home).toContain('href="/ventures"');

    expect(creator).toContain("https://app.example/creator");
    expect(membership).toContain("https://checkout.example/core");
    expect(membership).toContain("https://app.example/inner-circle");

    expect(trust).toContain('href="/GOVERNANCE.md"');
    expect(trust).toContain('href="/SECURITY.md"');

    expect(contact).toContain('id="apply-enterprise"');
    expect(contact).toContain('id="apply-creator"');
    expect(contact).toContain('id="apply-music"');
    expect(contact).toContain('id="apply-travel"');
  });

  it("redirects trailing slashes and rejects unsupported methods", async () => {
    const redirect = await fetchRoute("/services/");
    expect(redirect.status).toBe(301);
    expect(redirect.headers.get("Location")).toBe("https://jaypventuresllc.com/services");

    const post = await fetchRoute("/services", { method: "POST" });
    expect(post.status).toBe(405);
  });

  it("returns 404 for unknown routes", async () => {
    const response = await fetchRoute("/not-real");
    expect(response.status).toBe(404);
  });
});
