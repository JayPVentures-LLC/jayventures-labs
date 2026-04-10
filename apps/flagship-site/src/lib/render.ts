import { brandProfiles } from "../content/brands";
import { buildCtaMap } from "../content/ctaMap";
import { insightArticles } from "../content/insights";
import {
  getCreatorOffers,
  getEnterpriseOffers,
  getMusicOffers,
  getTravelOffers,
} from "../content/offers";
import { getMembershipCheckoutLinks, getMembershipTiers } from "../content/memberships";
import {
  creatorSignals,
  ecosystemSignals,
  homeProofPoints,
  livestreamFormats,
  partnershipGroups,
  primaryNavigation,
  siteMeta,
  trustPillars,
} from "../content/site";
import { governanceMarkdown, privacySummary, securityMarkdown, termsSummary } from "../content/trust";
import type { Env } from "../config/env";
import type { BrandMode, CtaLink, Offer, PublicRoute } from "../content/types";

interface PageDefinition {
  canonicalPath: string;
  description: string;
  mode: BrandMode;
  title: string;
  body: string;
}

interface RenderedRoute {
  body: string;
  contentType: string;
  status?: number;
}

export const publicRoutes: readonly PublicRoute[] = [
  "/",
  "/services",
  "/pricing",
  "/ventures",
  "/creator",
  "/all-ventures-access",
  "/music",
  "/travel",
  "/partnerships",
  "/insights",
  "/trust",
  "/contact",
  "/privacy",
  "/terms",
  "/GOVERNANCE.md",
  "/SECURITY.md",
] as const;

const enterprisePackages = [
  {
    title: "Essential",
    price: "$5,000-$9,000",
    summary: "Governance baseline, light automation, and compliance starter systems for creators, founders, and small teams.",
    details: "2-4 weeks · discovery workshops · risk register · early automation wins",
  },
  {
    title: "Growth",
    price: "$15,000-$35,000",
    summary: "Governance operating model, automation blueprint, and validated prototype for scaling teams.",
    details: "6-10 weeks · roadmap · prototype/MVP · readiness plan",
  },
  {
    title: "Pro",
    price: "$40,000-$95,000",
    summary: "Multi-system automation and auditability pipelines for serious operators and regulated innovators.",
    details: "10-16 weeks · policy library · KPI dashboard · deeper systems integration",
  },
  {
    title: "Enterprise",
    price: "$150,000+",
    summary: "End-to-end governance, automation at scale, and audit-ready system design across divisions.",
    details: "Multi-quarter · executive reporting · implementation oversight",
  },
];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isNavActive(itemHref: string, pagePath: string): boolean {
  if (itemHref === "/insights") {
    return pagePath === "/insights" || pagePath.startsWith("/insights/");
  }

  return itemHref === pagePath;
}

function renderLinks(links: CtaLink[], accent = false): string {
  return `<div class="cta-row">${links
    .map((link, index) => {
      const kind = index === 0 || accent ? "button-primary" : "button-secondary";
      const target = link.destination.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "";
      const note = link.note ? `<span class="cta-note">${escapeHtml(link.note)}</span>` : "";
      return `<a class="button ${kind}" href="${escapeHtml(link.destination)}"${target}>${escapeHtml(link.label)}</a>${note}`;
    })
    .join("")}</div>`;
}

function renderOfferRows(offers: Offer[]): string {
  return `<div class="offer-stack">${offers
    .map((offer) => {
      const target = offer.ctaDestination.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "";
      const badges = offer.badges?.length
        ? `<div class="pill-row">${offer.badges.map((badge) => `<span class="pill">${escapeHtml(badge)}</span>`).join("")}</div>`
        : "";

      return `
        <article class="offer-row">
          <div>
            <div class="eyebrow">${escapeHtml(offer.lane.replaceAll("_", " "))}</div>
            <h3>${escapeHtml(offer.title)}</h3>
            <p class="muted">${escapeHtml(offer.summary)}</p>
            ${badges}
          </div>
          <div class="offer-meta">
            <div class="price">${escapeHtml(offer.displayedPrice)}</div>
            <div class="small-copy">${escapeHtml(offer.qualificationRule)}</div>
            <a class="button button-secondary" href="${escapeHtml(offer.ctaDestination)}"${target}>${escapeHtml(offer.ctaLabel)}</a>
          </div>
        </article>`;
    })
    .join("")}</div>`;
}

function renderMembershipGrid(env: Env): string {
  const links = getMembershipCheckoutLinks(env);
  return `<div class="tier-grid">${getMembershipTiers()
    .map((tier) => {
      const href = links[tier.checkoutKey];
      return `
        <article class="tier-panel">
          <div class="eyebrow">${escapeHtml(tier.audience)}</div>
          <h3>${escapeHtml(tier.title)}</h3>
          <div class="price">${escapeHtml(tier.price)}</div>
          <p class="muted">${escapeHtml(tier.summary)}</p>
          <ul class="bullet-list">
            ${tier.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
          <a class="button button-primary" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Join ${escapeHtml(tier.title.split("·")[1]?.trim() ?? tier.title)}</a>
        </article>`;
    })
    .join("")}</div>`;
}

function renderInsightsList(): string {
  return `<div class="insight-list">${insightArticles
    .map(
      (article) => `
      <article class="insight-card">
        <div class="eyebrow">${escapeHtml(article.kicker)} · ${escapeHtml(article.readingTime)}</div>
        <h3>${escapeHtml(article.title)}</h3>
        <p class="muted">${escapeHtml(article.summary)}</p>
        <a class="button button-secondary" href="/insights/${escapeHtml(article.slug)}">Read insight</a>
      </article>`
    )
    .join("")}</div>`;
}

function renderMetricRail(items: Array<{ label: string; value: string }>): string {
  return `<div class="metric-rail">${items
    .map(
      (item) => `
      <div class="metric-cell">
        <span class="metric-label">${escapeHtml(item.label)}</span>
        <span class="metric-value">${escapeHtml(item.value)}</span>
      </div>`
    )
    .join("")}</div>`;
}

function renderPackagesGrid(): string {
  return `<div class="route-grid">${enterprisePackages
    .map(
      (item) => `
      <article class="route-panel">
        <div class="eyebrow">Enterprise package</div>
        <h3>${escapeHtml(item.title)}</h3>
        <div class="price">${escapeHtml(item.price)}</div>
        <p class="muted">${escapeHtml(item.summary)}</p>
        <div class="small-copy">${escapeHtml(item.details)}</div>
      </article>`
    )
    .join("")}</div>`;
}

function renderBrandProfiles(): string {
  return `<div class="route-grid">${brandProfiles
    .map(
      (profile) => `
      <article class="route-panel">
        <div class="eyebrow">${escapeHtml(profile.mode === "llc" ? "Authority layer" : "Proof layer")}</div>
        <h3>${escapeHtml(profile.label)}</h3>
        <p class="muted">${escapeHtml(profile.promise)}</p>
        <div class="small-copy"><strong>Audience:</strong> ${escapeHtml(profile.audience)}</div>
        <div class="doc-callout"><strong>Palette:</strong> ${profile.palette.map((item) => escapeHtml(item)).join(" · ")}</div>
      </article>`
    )
    .join("")}</div>`;
}

function renderLivestreamFormats(): string {
  return `<div class="feature-grid">${livestreamFormats
    .map(
      (format) => `
      <article class="feature-block">
        <div class="eyebrow">${escapeHtml(format.meta)}</div>
        <h3>${escapeHtml(format.title)}</h3>
        <p class="muted">${escapeHtml(format.description)}</p>
      </article>`
    )
    .join("")}</div>`;
}

function renderPartnershipGroups(): string {
  return `<div class="two-col">${partnershipGroups
    .map(
      (group) => `
      <article class="band-panel">
        <div class="eyebrow">${escapeHtml(group.heading)}</div>
        <h3>${escapeHtml(group.heading)}</h3>
        <ul class="brand-group-list">
          ${group.brands.map((brand) => `<li>${escapeHtml(brand)}</li>`).join("")}
        </ul>
      </article>`
    )
    .join("")}</div>`;
}

function pageLayout(env: Env, page: PageDefinition): string {
  const canonical = `${env.SITE_ORIGIN}${page.canonicalPath}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)} | ${escapeHtml(siteMeta.siteName)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(page.title)} | ${escapeHtml(siteMeta.siteName)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="theme-color" content="#0a0c0f">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root { --bg:#07090c; --surface:rgba(13,16,22,.92); --line:rgba(255,255,255,.1); --ink:#f4f4f1; --muted:rgba(244,244,241,.74); --soft:rgba(244,244,241,.56); --enterprise:#b11226; --enterprise-deep:#5b0812; --creator:#4f7bd0; --creator-deep:#1d3156; --gold:#e6d0a0; --max:1180px; --radius-xl:28px; --shadow:0 30px 80px rgba(0,0,0,.35); }
    * { box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body { margin:0; background:radial-gradient(circle at top left, rgba(177,18,38,.22), transparent 30%), radial-gradient(circle at 80% 20%, rgba(134,184,255,.12), transparent 28%), linear-gradient(180deg, #0d1016 0%, #07090c 45%, #050608 100%); color:var(--ink); font-family:"IBM Plex Sans","Segoe UI",sans-serif; line-height:1.6; min-height:100vh; }
    body.mode-creator { background:radial-gradient(circle at top right, rgba(134,184,255,.24), transparent 28%), radial-gradient(circle at 15% 10%, rgba(177,18,38,.18), transparent 22%), linear-gradient(180deg, #0b0f15 0%, #06080b 42%, #050608 100%); }
    a { color:inherit; text-decoration:none; }
    .skip-link { position:absolute; left:-9999px; top:12px; padding:12px 16px; border-radius:999px; background:#fff; color:#111; z-index:999; }
    .skip-link:focus { left:12px; }
    .site-header { position:sticky; top:0; z-index:50; backdrop-filter:blur(18px); background:rgba(5,7,10,.82); border-bottom:1px solid var(--line); }
    .header-inner,.shell { max-width:var(--max); margin:0 auto; padding-left:24px; padding-right:24px; }
    .header-inner { display:flex; align-items:center; justify-content:space-between; gap:18px; min-height:78px; }
    .brand-lockup { display:flex; flex-direction:column; gap:4px; }
    .brand-title { font-family:"DM Serif Display",serif; font-size:26px; }
    .brand-subtitle { font-size:11px; letter-spacing:.26em; text-transform:uppercase; color:var(--soft); }
    .nav { display:flex; gap:14px; flex-wrap:wrap; justify-content:flex-end; font-size:13px; color:var(--muted); }
    .nav a { padding:8px 0; border-bottom:1px solid transparent; }
    .nav a.active,.nav a:hover { color:var(--ink); border-color:rgba(255,255,255,.4); }
    .hero-stage { padding:72px 0 28px; }
    .hero-grid { display:grid; grid-template-columns:minmax(0,1.35fr) minmax(280px,.9fr); gap:28px; }
    .poster,.support-panel,.offer-row,.tier-panel,.insight-card,.feature-block,.route-panel,.doc-panel,.band-panel,.metric-rail,.timeline-panel { background:linear-gradient(180deg, rgba(18,22,29,.92), rgba(11,14,19,.94)); border:1px solid var(--line); border-radius:var(--radius-xl); box-shadow:var(--shadow); }
    .poster { padding:34px; min-height:520px; position:relative; overflow:hidden; }
    .poster::before { content:""; position:absolute; inset:0; background:linear-gradient(135deg, rgba(177,18,38,.18), transparent 42%), radial-gradient(circle at 80% 22%, rgba(134,184,255,.13), transparent 28%); pointer-events:none; animation:drift 10s ease-in-out infinite alternate; }
    body.mode-creator .poster::before { background:linear-gradient(135deg, rgba(79,123,208,.22), transparent 42%), radial-gradient(circle at 70% 20%, rgba(177,18,38,.14), transparent 30%); }
    .hero-kicker,.eyebrow { display:inline-block; margin-bottom:12px; text-transform:uppercase; letter-spacing:.2em; font-size:11px; color:var(--gold); }
    .hero-title,h1,h2,h3 { font-family:"DM Serif Display",serif; font-weight:400; line-height:1.04; margin:0; }
    .hero-title { max-width:8ch; font-size:clamp(3rem,7vw,6.2rem); letter-spacing:-.03em; }
    .hero-copy,.muted,p,li,.small-copy { color:var(--muted); }
    .hero-copy { font-size:18px; max-width:48rem; margin:18px 0 0; }
    .cta-row { display:flex; gap:14px; flex-wrap:wrap; margin-top:28px; align-items:center; }
    .cta-note { font-size:12px; color:var(--soft); width:100%; }
    .button { display:inline-flex; align-items:center; justify-content:center; min-height:46px; padding:0 18px; border-radius:999px; border:1px solid transparent; font-size:13px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; }
    .button-primary { background:linear-gradient(180deg, var(--enterprise), var(--enterprise-deep)); color:#fff9f7; }
    .button-secondary { background:rgba(255,255,255,.02); border-color:rgba(255,255,255,.18); color:var(--ink); }
    body.mode-creator .button-primary { background:linear-gradient(180deg, var(--creator), var(--creator-deep)); }
    .support-panel,.feature-block,.route-panel,.band-panel,.doc-panel,.timeline-panel,.insight-card,.tier-panel { padding:24px; }
    .support-panel { display:grid; gap:18px; align-content:start; }
    .support-panel h2 { font-size:clamp(1.8rem,3vw,2.5rem); }
    .metric-rail { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:1px; overflow:hidden; margin-top:26px; }
    .metric-cell { padding:18px; background:rgba(255,255,255,.02); min-height:118px; }
    .metric-label { display:block; text-transform:uppercase; letter-spacing:.18em; font-size:10px; color:var(--soft); }
    .metric-value { display:block; margin-top:10px; font-size:18px; font-weight:600; color:var(--ink); }
    .section { padding:18px 0 34px; }
    .section-heading { max-width:760px; margin-bottom:22px; }
    .section-heading h2 { font-size:clamp(2rem,3.5vw,3.4rem); }
    .two-col,.route-grid,.insight-list,.tier-grid,.feature-grid,.band-grid,.trust-strip { display:grid; gap:20px; }
    .two-col { grid-template-columns:repeat(2, minmax(0,1fr)); }
    .route-grid { grid-template-columns:repeat(auto-fit, minmax(240px,1fr)); }
    .insight-list { grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); }
    .tier-grid { grid-template-columns:repeat(auto-fit, minmax(260px,1fr)); }
    .feature-grid { grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); }
    .band-grid { grid-template-columns:1.15fr .85fr; align-items:stretch; }
    .trust-strip { grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); }
    .offer-stack { display:grid; gap:16px; }
    .offer-row { padding:24px; display:grid; gap:18px; grid-template-columns:1.3fr .7fr; align-items:start; }
    .offer-row h3,.insight-card h3,.tier-panel h3,.feature-block h3,.route-panel h3,.band-panel h3,.doc-panel h3,.timeline-panel h3 { font-size:1.65rem; margin-bottom:10px; }
    .offer-meta { display:grid; gap:12px; justify-items:start; align-content:start; }
    .price { font-size:1.7rem; font-weight:700; color:var(--ink); }
    .bullet-list,.plain-list,.brand-group-list,.article-list { margin:0; padding-left:18px; display:grid; gap:10px; }
    .plain-list,.brand-group-list { padding-left:0; list-style:none; }
    .pill-row { display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }
    .pill { border:1px solid rgba(255,255,255,.16); border-radius:999px; padding:6px 10px; font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--ink); background:rgba(255,255,255,.05); }
    .brand-group-list li { padding:14px 0; border-bottom:1px solid rgba(255,255,255,.08); }
    .brand-group-list li:last-child { border-bottom:0; }
    .footer { border-top:1px solid var(--line); margin-top:54px; padding:34px 0 52px; }
    .footer-grid { display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:24px; }
    .footer-links { display:grid; gap:8px; font-size:14px; color:var(--muted); }
    .footer-links a:hover { color:var(--ink); }
    .page-shell { padding-bottom:52px; }
    .doc-callout { margin-top:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,.08); font-size:13px; color:var(--soft); }
    .article-prose { display:grid; gap:22px; }
    .article-section { padding:22px 0; border-top:1px solid rgba(255,255,255,.08); }
    .article-section:first-child { border-top:0; padding-top:0; }
    .article-meta { display:flex; gap:12px; flex-wrap:wrap; color:var(--soft); font-size:13px; text-transform:uppercase; letter-spacing:.12em; }
    @keyframes drift { from { transform:translate3d(0,0,0) scale(1); } to { transform:translate3d(-18px,18px,0) scale(1.04); } }
    @media (max-width:980px) { .hero-grid,.band-grid,.two-col,.offer-row,.footer-grid { grid-template-columns:1fr; } .hero-stage { padding-top:42px; } .poster { min-height:auto; } .metric-rail { grid-template-columns:1fr; } .nav { gap:10px 14px; } }
    @media (max-width:760px) { .header-inner { align-items:flex-start; padding-top:18px; padding-bottom:18px; } .nav { font-size:12px; } .shell,.header-inner { padding-left:18px; padding-right:18px; } .poster,.support-panel,.feature-block,.route-panel,.doc-panel,.tier-panel,.insight-card,.offer-row,.band-panel { padding:20px; } .hero-title { max-width:10ch; } }
  </style>
</head>
<body class="mode-${page.mode}">
  <a class="skip-link" href="#content">Skip to content</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand-lockup" href="/" aria-label="JayPVentures LLC home">
        <span class="brand-title">JayPVentures LLC</span>
        <span class="brand-subtitle">Governance by Design · Creator Proof Layer</span>
      </a>
      <nav class="nav" aria-label="Primary navigation">
        ${primaryNavigation.map((item) => `<a href="${item.href}" class="${isNavActive(item.href, page.canonicalPath) ? "active" : ""}">${item.label}</a>`).join("")}
      </nav>
    </div>
  </header>
  <main id="content" class="page-shell">
    ${page.body}
  </main>
  <footer class="footer">
    <div class="shell footer-grid">
      <div><div class="eyebrow">JayPVentures LLC</div><h3>One operating system. Two public layers.</h3><p class="muted">Enterprise systems, creator monetization, memberships, and trust infrastructure designed to reinforce one another.</p></div>
      <div class="footer-links"><a href="/services">Services</a><a href="/ventures">Ventures</a><a href="/all-ventures-access">All Ventures Access</a><a href="/trust">Trust Center</a><a href="/GOVERNANCE.md">GOVERNANCE.md</a><a href="/SECURITY.md">SECURITY.md</a></div>
      <div class="footer-links"><a href="mailto:${escapeHtml(siteMeta.contactEmail)}">${escapeHtml(siteMeta.contactEmail)}</a><a href="${escapeHtml(siteMeta.linkedInUrl)}" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><span>Security: ${escapeHtml(siteMeta.securityEmail)}</span></div>
    </div>
  </footer>
</body>
</html>`;
}

function renderPage(env: Env, page: PageDefinition): RenderedRoute {
  return {
    body: pageLayout(env, page),
    contentType: "text/html; charset=UTF-8",
    status: 200,
  };
}

function renderHome(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);

  return {
    canonicalPath: "/",
    description: "JayPVentures LLC is the enterprise authority layer for governance-by-design, automation, monetization systems, and a dual-entity creator ecosystem.",
    mode: "llc",
    title: "JayPVentures Flagship",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Enterprise editorial authority · dual-entity ecosystem</div>
            <h1 class="hero-title">Systems you can prove. Ventures you can scale.</h1>
            <p class="hero-copy">JayPVentures LLC leads with governance, monetization architecture, and operational clarity. jaypventures extends that system into creator momentum, recurring membership, music, travel, and collaborative ventures.</p>
            ${renderLinks([ctaMap.enterpriseDiscovery, ctaMap.ecosystemOverview], true)}
            ${renderMetricRail([
              { label: "Authority layer", value: "Governance, automation, compliance, and enterprise-grade system design." },
              { label: "Proof layer", value: "Creator programming, membership conversion, and public venture momentum." },
              { label: "Conversion path", value: "Bookings for consultative offers. Stripe for memberships and future direct digital sales." },
            ])}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Why this site exists</div><h2>One flagship presence with the full ecosystem visible.</h2></div>
            <p class="muted">The root domain converts enterprise buyers first, then shows the deeper creator and membership system as proof, venture depth, and monetization logic.</p>
            <ul class="plain-list">${homeProofPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            <div class="doc-callout">Trust links, route logic, and premium surfaces are part of the public system architecture, not an afterthought.</div>
          </aside>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Enterprise first</div><h2>Start at the authority layer. Expand into the ventures that prove it.</h2><p class="muted">The website leads with strategy, governance, and system architecture, then opens into the creator-facing ecosystem that shows those systems working in public.</p></div>
        <div class="feature-grid">${ecosystemSignals.map((item) => `<article class="feature-block"><div class="eyebrow">${escapeHtml(item.label)}</div><h3>${escapeHtml(item.label)}</h3><p class="muted">${escapeHtml(item.value)}</p></article>`).join("")}</div>
      </section>
      <section class="section shell">
        <div class="band-grid">
          <article class="band-panel"><div class="eyebrow">JayPVentures LLC</div><h3>Enterprise systems, monetization design, and high-trust execution.</h3><p class="muted">This layer attracts founders, operators, organizations, and premium service buyers who need clarity, control, and accountable digital infrastructure.</p>${renderLinks([ctaMap.servicesOverview, ctaMap.trustCenter])}</article>
          <article class="band-panel"><div class="eyebrow">jaypventures</div><h3>Creator energy, recurring community, and venture expansion.</h3><p class="muted">This layer turns audience attention into memberships, premium access, creator services, partnerships, and public venture momentum.</p>${renderLinks([{ label: "Explore Creator Layer", type: "application", destination: "/creator" }, { label: "See Membership Tiers", type: "stripe_checkout", destination: "/all-ventures-access" }])}</article>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Brand system</div><h2>Two public modes. One operating backbone.</h2><p class="muted">The enterprise shell stays calm and authoritative. The creator shell carries more energy without fragmenting the flagship structure.</p></div>
        ${renderBrandProfiles()}
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Ecosystem lanes</div><h2>The full public system</h2><p class="muted">Each lane has its own public story, but all of them feed the same operational backbone.</p></div>
        <div class="route-grid">${[
          ["Services", "High-trust enterprise offers and implementation paths.", "/services"],
          ["Pricing", "Engagement ladders, membership tiers, and recurring revenue logic.", "/pricing"],
          ["Ventures", "The bridge page across creator programming, memberships, and proof.", "/ventures"],
          ["Creator", "Public creator-services surface and creator ecosystem overview.", "/creator"],
          ["Music", "Artist, release, and collaboration lane.", "/music"],
          ["Travel", "Travel inquiries, itinerary builds, and operations-led planning.", "/travel"],
        ].map(([title, copy, href]) => `<article class="route-panel"><h3>${title}</h3><p class="muted">${copy}</p><a class="button button-secondary" href="${href}">Open</a></article>`).join("")}</div>
      </section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Final CTA</div><h2>Build the operating system first. Let the ecosystem compound after that.</h2><p class="muted">Book a discovery call if you want the enterprise layer built right, then use the rest of the ecosystem as a leverage engine rather than a distraction.</p></div>${renderLinks([ctaMap.enterpriseDiscovery, ctaMap.contactRouting])}</section>`,
  };
}
function renderServices(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);
  const offers = getEnterpriseOffers(env);

  return {
    canonicalPath: "/services",
    description: "Enterprise-first JayPVentures LLC services across governance, automation, monetization architecture, prototyping, and audit-ready systems.",
    mode: "llc",
    title: "Services",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">JayPVentures LLC services</div>
            <h1 class="hero-title">Governance-by-design for AI, automation, and monetization systems.</h1>
            <p class="hero-copy">These offers are built for operators who want measurable system design, cleaner routing, and accountable execution rather than vague advisory.</p>
            ${renderLinks([ctaMap.enterpriseDiscovery, ctaMap.enterpriseApplication], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Core lanes</div><h2>Strategy, architecture, delivery, and trust in one service stack.</h2></div>
            <ul class="plain-list">
              <li>Strategy and governance operating models</li>
              <li>Automation and AI systems with visible controls</li>
              <li>Platform and prototype builds that can mature into production systems</li>
              <li>Compliance and audit readiness as an operating advantage</li>
            </ul>
          </aside>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Offer structure</div><h2>Start with a fit call or go deeper into paid decision work.</h2><p class="muted">Consultative offers route through Microsoft Bookings. High-touch build engagements route through an application layer so scope stays intentional.</p></div>
        ${renderOfferRows(offers)}
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Engagement ladders</div><h2>Packages for credibility, growth, and serious operational change.</h2></div>
        ${renderPackagesGrid()}
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Trust posture</div><h2>Service design includes governance, disclosure, and review paths from the start.</h2></div>
        <div class="trust-strip">${trustPillars.map((pillar) => `<article class="feature-block"><h3>${escapeHtml(pillar.title)}</h3><p class="muted">${escapeHtml(pillar.summary)}</p></article>`).join("")}</div>
      </section>`,
  };
}

function renderPricing(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);

  return {
    canonicalPath: "/pricing",
    description: "Enterprise engagement ladders, recurring membership tiers, and the pricing logic behind the JayPVentures flagship ecosystem.",
    mode: "llc",
    title: "Pricing",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Pricing architecture</div>
            <h1 class="hero-title">Consultative first. Membership second. High-touch work by application.</h1>
            <p class="hero-copy">The public pricing model is simple on purpose: Bookings for advice and scoped sessions, Stripe Checkout for memberships, and application routing for deeper system builds.</p>
            ${renderLinks([ctaMap.enterpriseDiscovery, ctaMap.contactRouting], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Commercial rules</div><h2>Pricing stays legible because the routing logic is explicit.</h2></div>
            <ul class="plain-list">
              <li>No instant checkout for high-ticket implementation in v1.</li>
              <li>Membership conversion is handled through Stripe Checkout and Billing.</li>
              <li>Portal access is gated behind entitlement and approved access paths.</li>
            </ul>
          </aside>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Enterprise packages</div><h2>Service ladders for increasing complexity and accountability.</h2></div>
        ${renderPackagesGrid()}
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Membership tiers</div><h2>All Ventures Access is the recurring connective tissue.</h2><p class="muted">Each tier maps to more differentiated access, proximity, and visibility into the ecosystem. Checkout happens through Stripe, while the gated experiences remain tied to the existing worker-hosted surfaces.</p></div>
        ${renderMembershipGrid(env)}
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Route map</div><h2>When to book, when to apply, when to subscribe.</h2></div>
        <div class="two-col">
          <article class="doc-panel"><h3>Book</h3><ul class="bullet-list"><li>Fit calls and consultations</li><li>Strategy sessions and deep dives</li><li>Music, creator, and travel planning sessions</li></ul></article>
          <article class="doc-panel"><h3>Apply or Subscribe</h3><ul class="bullet-list"><li>Enterprise, creator, music, and travel builds go through an application path.</li><li>All Ventures Access Core, Plus, and Inner Circle go through Stripe Checkout.</li><li>Portal entry is public-facing only as a teaser; access stays gated.</li></ul></article>
        </div>
      </section>`,
  };
}

function renderVentures(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);

  return {
    canonicalPath: "/ventures",
    description: "The bridge page across JayPVentures LLC, jaypventures, All Ventures Access, Music, Travel, and the broader public ecosystem.",
    mode: "creator",
    title: "Ventures",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Ecosystem bridge</div>
            <h1 class="hero-title">Public venture depth without losing the enterprise hierarchy.</h1>
            <p class="hero-copy">This is where the flagship site shows how creator momentum, memberships, music, travel, and partnerships work as proof for the enterprise operating model rather than as disconnected side projects.</p>
            ${renderLinks([ctaMap.enterpriseDiscovery, ctaMap.creatorPortal], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">What stays shared</div><h2>Capture, entitlement, metrics, routing, and trust stay centralized.</h2></div>
            <p class="muted">What changes across the lanes is tone, emotional promise, and the nature of the buyer or audience. The infrastructure remains consistent.</p>
          </aside>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Brand roles</div><h2>One operating system, two public jobs.</h2></div>
        ${renderBrandProfiles()}
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Creator proof</div><h2>Programming and venture rhythm make the system visible in public.</h2></div>
        <div class="two-col">
          <article class="band-panel"><h3>Creator signals</h3><ul class="bullet-list">${creatorSignals.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
          <article class="band-panel"><h3>Route logic</h3><ul class="bullet-list"><li>Public pages build trust and commercial clarity.</li><li>Bookings handle consultative time-based offers.</li><li>Stripe handles recurring membership conversion.</li><li>Portal access stays gated behind the worker-backed entitlement model.</li></ul></article>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Livestream formats</div><h2>Public programming with stronger rhythm and conversion intent.</h2></div>
        ${renderLivestreamFormats()}
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Open the lanes</div><h2>Explore the public sides of the ecosystem.</h2></div>
        <div class="route-grid">${[
          ["Creator", "Creator services, public rhythm, and audience-to-revenue architecture.", "/creator"],
          ["All Ventures Access", "Recurring access across the ecosystem.", "/all-ventures-access"],
          ["Music", "Creative systems, releases, and collaboration pathways.", "/music"],
          ["Travel", "Planning, itinerary, and experience design pathways.", "/travel"],
          ["Partnerships", "Brand, affiliate, and collaboration intake.", "/partnerships"],
          ["Trust Center", "Governance, security, and public accountability.", "/trust"],
        ].map(([title, copy, href]) => `<article class="route-panel"><h3>${title}</h3><p class="muted">${copy}</p><a class="button button-secondary" href="${href}">Open</a></article>`).join("")}</div>
      </section>`,
  };
}

function renderCreator(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);
  const offers = getCreatorOffers(env);

  return {
    canonicalPath: "/creator",
    description: "Public creator brand overview and creator services for jaypventures, tied directly into the broader JayPVentures ecosystem.",
    mode: "creator",
    title: "Creator",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">jaypventures creator layer</div>
            <h1 class="hero-title">Creator momentum with clearer offers, stronger monetization, and better routing.</h1>
            <p class="hero-copy">The creator layer turns attention into recurring membership, collaboration, and higher-trust opportunities without leaving the flagship system.</p>
            ${renderLinks([
              { label: "Book Creator Fit Call", type: "booking", destination: env.MICROSOFT_BOOKINGS_URL },
              ctaMap.creatorPortal,
            ], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Creator system</div><h2>Audience energy should route somewhere useful.</h2></div>
            <ul class="plain-list">${creatorSignals.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </aside>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Public creator offers</div><h2>Sessions, build sprints, and recurring support.</h2><p class="muted">The page explains the commercial logic publicly, but deeper creator surfaces remain gated to preserve signal quality and operational clarity.</p></div>
        ${renderOfferRows(offers)}
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Programming rhythm</div><h2>Creator-facing momentum is built around recurring formats, not random spikes.</h2></div>
        ${renderLivestreamFormats()}
      </section>
      <section class="section shell">
        <div class="band-grid">
          <article class="band-panel"><div class="eyebrow">Portal teaser</div><h3>Existing creator surfaces stay separate and gated.</h3><p class="muted">The flagship site explains the creator and member experience, then hands approved access off to the worker-hosted portal.</p>${renderLinks([ctaMap.creatorPortal, { label: "See Membership Tiers", type: "stripe_checkout", destination: "/all-ventures-access" }])}</article>
          <article class="band-panel"><div class="eyebrow">Application path</div><h3>High-touch creator work still requires fit.</h3><p class="muted">If the request is a full build, creator sprint, or recurring operating support, the next step is application and routing rather than blind checkout.</p>${renderLinks([ctaMap.creatorApplication, ctaMap.contactRouting])}</article>
        </div>
      </section>`,
  };
}

function renderAllVenturesAccess(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);

  return {
    canonicalPath: "/all-ventures-access",
    description: "All Ventures Access membership tiers, recurring access logic, and the gated experience routing for the JayPVentures ecosystem.",
    mode: "creator",
    title: "All Ventures Access",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Membership architecture</div>
            <h1 class="hero-title">All Ventures Access is a routed ecosystem experience, not a throwaway subscription.</h1>
            <p class="hero-copy">Membership captures recurring intent, unlocks differentiated access, and routes supporters into deeper visibility and premium surfaces across the ecosystem.</p>
            ${renderLinks([ctaMap.membershipCore, ctaMap.membershipInnerCircle], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Commercial model</div><h2>Checkout goes through Stripe. Access flows through entitlement.</h2></div>
            <ul class="plain-list"><li>Stripe Checkout and Billing handle recurring payment lifecycle.</li><li>The entitlement worker turns purchase state into actual access.</li><li>Premium portals remain separate, gated surfaces.</li></ul>
          </aside>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Membership tiers</div><h2>Core, Plus, and Inner Circle map to increasingly differentiated access.</h2></div>
        ${renderMembershipGrid(env)}
      </section>
      <section class="section shell">
        <div class="band-grid">
          <article class="band-panel"><div class="eyebrow">Creator Portal</div><h3>Member and creator routing surface</h3><p class="muted">Use the public site to understand the logic, then move into the gated creator surface when your entitlement and access level allow it.</p>${renderLinks([ctaMap.creatorPortal])}</article>
          <article class="band-panel"><div class="eyebrow">Inner Circle</div><h3>Premium transparency and command-center style access</h3><p class="muted">The Inner Circle layer is for higher-trust members who want deeper visibility, better routing, and more privileged access to the system.</p>${renderLinks([ctaMap.innerCirclePortal])}</article>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Why this matters</div><h2>The membership tier is the connective tissue between public attention and premium infrastructure.</h2></div>
        <div class="two-col">
          <article class="doc-panel"><h3>Public value</h3><ul class="bullet-list"><li>Clear explanation of what members are buying</li><li>Visible differentiation between tiers</li><li>Cleaner handoff from public site to Stripe Checkout</li></ul></article>
          <article class="doc-panel"><h3>Operational value</h3><ul class="bullet-list"><li>Entitlement sync feeds portal access</li><li>Billing lifecycle stays externalized in Stripe</li><li>Premium access remains controllable and auditable</li></ul></article>
        </div>
      </section>`,
  };
}
