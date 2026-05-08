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
  "/cookies",
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
        <div class="eyebrow">${escapeHtml(profile.mode === "llc" ? "Primary firm" : "Associated brand")}</div>
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
  <meta name="theme-color" content="#f3efe8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
    :root { --bg:#f3efe8; --surface:#ffffff; --surface-alt:#f7f3ee; --line:rgba(17,24,39,.10); --ink:#111827; --muted:#4b5563; --soft:#6b7280; --enterprise:#7a1f2a; --enterprise-deep:#5f1720; --creator:#1d4c8f; --creator-deep:#153962; --gold:#8a6a3b; --max:1180px; --radius-xl:18px; --radius-sm:10px; --shadow:0 18px 42px rgba(17,24,39,.06); }
    * { box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body { margin:0; background:linear-gradient(180deg, #f8f5f0 0%, #f3efe8 55%, #ede6dc 100%); color:var(--ink); font-family:"IBM Plex Sans","Segoe UI",sans-serif; line-height:1.65; min-height:100vh; }
    body.mode-creator { background:linear-gradient(180deg, #faf7f2 0%, #f3efe8 58%, #ebe5db 100%); }
    a { color:inherit; text-decoration:none; }
    .skip-link { position:absolute; left:-9999px; top:12px; padding:12px 16px; border-radius:999px; background:#111827; color:#fff; z-index:999; }
    .skip-link:focus { left:12px; }
    .site-header { position:sticky; top:0; z-index:50; backdrop-filter:blur(12px); background:rgba(248,245,240,.92); border-bottom:1px solid var(--line); }
    .header-inner,.shell { max-width:var(--max); margin:0 auto; padding-left:28px; padding-right:28px; }
    .header-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; min-height:80px; }
    .brand-lockup { display:flex; flex-direction:column; gap:4px; }
    .brand-title { font-family:"Fraunces", Georgia, serif; font-size:24px; letter-spacing:-.02em; }
    .brand-subtitle { font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--soft); }
    .nav { display:flex; gap:18px; flex-wrap:wrap; justify-content:flex-end; font-size:14px; color:var(--muted); }
    .nav a { padding:8px 0; border-bottom:1px solid transparent; }
    .nav a.active,.nav a:hover { color:var(--enterprise); border-color:rgba(122,31,42,.35); }
    .hero-stage { padding:76px 0 28px; }
    .hero-grid { display:grid; grid-template-columns:minmax(0,1.3fr) minmax(280px,.85fr); gap:24px; }
    .poster,.support-panel,.offer-row,.tier-panel,.insight-card,.feature-block,.route-panel,.doc-panel,.band-panel,.metric-rail,.timeline-panel { background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-xl); box-shadow:var(--shadow); }
    .poster { padding:40px; min-height:460px; }
    .hero-kicker,.eyebrow { display:inline-block; margin-bottom:12px; text-transform:uppercase; letter-spacing:.18em; font-size:11px; color:var(--gold); }
    .hero-title,h1,h2,h3 { font-family:"Fraunces", Georgia, serif; font-weight:500; line-height:1.05; margin:0; color:var(--ink); }
    .hero-title { max-width:12ch; font-size:clamp(2.8rem,5vw,4.8rem); letter-spacing:-.03em; }
    .hero-copy,.muted,p,li,.small-copy { color:var(--muted); }
    .hero-copy { font-size:18px; max-width:48rem; margin:18px 0 0; }
    .cta-row { display:flex; gap:14px; flex-wrap:wrap; margin-top:28px; align-items:center; }
    .cta-note { font-size:12px; color:var(--soft); width:100%; }
    .button { display:inline-flex; align-items:center; justify-content:center; min-height:44px; padding:0 18px; border-radius:var(--radius-sm); border:1px solid transparent; font-size:14px; font-weight:600; }
    .button-primary { background:var(--enterprise); color:#fff; }
    .button-secondary { background:var(--surface); border-color:rgba(17,24,39,.14); color:var(--ink); }
    body.mode-creator .button-primary { background:var(--creator); }
    .support-panel,.feature-block,.route-panel,.band-panel,.doc-panel,.timeline-panel,.insight-card,.tier-panel { padding:26px; }
    .support-panel { display:grid; gap:18px; align-content:start; }
    .support-panel h2 { font-size:clamp(1.7rem,2.5vw,2.3rem); }
    .metric-rail { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:1px; overflow:hidden; margin-top:28px; background:var(--line); }
    .metric-cell { padding:18px; background:var(--surface-alt); min-height:118px; }
    .metric-label { display:block; text-transform:uppercase; letter-spacing:.14em; font-size:10px; color:var(--soft); }
    .metric-value { display:block; margin-top:10px; font-size:16px; font-weight:600; color:var(--ink); line-height:1.45; }
    .section { padding:22px 0 34px; }
    .section-heading { max-width:780px; margin-bottom:22px; }
    .section-heading h2 { font-size:clamp(2rem,3.1vw,3rem); }
    .two-col,.route-grid,.insight-list,.tier-grid,.feature-grid,.band-grid,.trust-strip { display:grid; gap:20px; }
    .two-col { grid-template-columns:repeat(2, minmax(0,1fr)); }
    .route-grid { grid-template-columns:repeat(auto-fit, minmax(240px,1fr)); }
    .insight-list { grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); }
    .tier-grid { grid-template-columns:repeat(auto-fit, minmax(260px,1fr)); }
    .feature-grid { grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); }
    .band-grid { grid-template-columns:1.15fr .85fr; align-items:stretch; }
    .trust-strip { grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); }
    .offer-stack { display:grid; gap:16px; }
    .offer-row { padding:26px; display:grid; gap:18px; grid-template-columns:1.3fr .7fr; align-items:start; }
    .offer-row h3,.insight-card h3,.tier-panel h3,.feature-block h3,.route-panel h3,.band-panel h3,.doc-panel h3,.timeline-panel h3 { font-size:1.5rem; margin-bottom:10px; }
    .offer-meta { display:grid; gap:12px; justify-items:start; align-content:start; }
    .price { font-size:1.6rem; font-weight:700; color:var(--ink); }
    .bullet-list,.plain-list,.brand-group-list,.article-list { margin:0; padding-left:18px; display:grid; gap:10px; }
    .plain-list,.brand-group-list { padding-left:0; list-style:none; }
    .pill-row { display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }
    .pill { border:1px solid rgba(17,24,39,.12); border-radius:999px; padding:5px 10px; font-size:11px; letter-spacing:.08em; color:var(--soft); background:var(--surface-alt); }
    .brand-group-list li { padding:14px 0; border-bottom:1px solid rgba(17,24,39,.08); }
    .brand-group-list li:last-child { border-bottom:0; }
    .footer { border-top:1px solid var(--line); margin-top:54px; padding:34px 0 52px; background:#f6f1e9; }
    .footer-grid { display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:24px; }
    .footer-links { display:grid; gap:8px; font-size:14px; color:var(--muted); }
    .footer-links a:hover { color:var(--enterprise); }
    .page-shell { padding-bottom:52px; }
    .doc-callout { margin-top:14px; padding-top:12px; border-top:1px solid rgba(17,24,39,.08); font-size:13px; color:var(--soft); }
    .article-prose { display:grid; gap:22px; }
    .article-section { padding:22px 0; border-top:1px solid rgba(17,24,39,.08); }
    .article-section:first-child { border-top:0; padding-top:0; }
    .article-meta { display:flex; gap:12px; flex-wrap:wrap; color:var(--soft); font-size:13px; text-transform:uppercase; letter-spacing:.12em; }
    @media (max-width:980px) { .hero-grid,.band-grid,.two-col,.offer-row,.footer-grid { grid-template-columns:1fr; } .hero-stage { padding-top:42px; } .poster { min-height:auto; } .metric-rail { grid-template-columns:1fr; } .nav { gap:10px 14px; } }
    @media (max-width:760px) { .header-inner { align-items:flex-start; padding-top:18px; padding-bottom:18px; } .nav { font-size:12px; } .shell,.header-inner { padding-left:18px; padding-right:18px; } .poster,.support-panel,.feature-block,.route-panel,.doc-panel,.tier-panel,.insight-card,.offer-row,.band-panel { padding:20px; } .hero-title { max-width:11ch; } }
  </style>
</head>
<body class="mode-${page.mode}">
  <a class="skip-link" href="#content">Skip to content</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand-lockup" href="/" aria-label="JayPVentures LLC home">
        <span class="brand-title">JayPVentures LLC</span>
        <span class="brand-subtitle">Governance, automation, and executive systems design</span>
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
      <div><div class="eyebrow">JayPVentures LLC</div><h3>Executive systems, governance, and commercial infrastructure.</h3><p class="muted">The flagship site leads with the firm, not the side projects. Associated portfolio lines remain secondary and do not dilute the primary offer.</p></div>
      <div class="footer-links"><a href="/services">Services</a><a href="/pricing">Pricing</a><a href="/trust">Trust Center</a><a href="/contact">Contact</a><a href="/GOVERNANCE.md">GOVERNANCE.md</a><a href="/SECURITY.md">SECURITY.md</a></div>
      <div class="footer-links"><a href="mailto:${escapeHtml(siteMeta.contactEmail)}">${escapeHtml(siteMeta.contactEmail)}</a><a href="${escapeHtml(siteMeta.linkedInUrl)}" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="/privacy">Privacy</a><a href="/cookies">Cookies</a><a href="/terms">Terms</a><span>Security: ${escapeHtml(siteMeta.securityEmail)}</span></div>
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
    description: "JayPVentures LLC is an executive services firm focused on governance, automation, and revenue infrastructure for organizations that require control and accountable execution.",
    mode: "llc",
    title: "JayPVentures Flagship",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">JayPVentures LLC</div>
            <h1 class="hero-title">Governance, automation, and revenue infrastructure.</h1>
            <p class="hero-copy">JayPVentures LLC helps operators organize high-trust systems: clear decisions, auditable workflows, and commercial paths that are easier to run.</p>
            ${renderLinks([ctaMap.enterpriseDiscovery, ctaMap.contactRouting], true)}
            ${renderMetricRail([
              { label: "Focus", value: "Governance, automation, revenue systems." },
              { label: "Model", value: "Consult first. Scope second. Build with controls." },
              { label: "Standard", value: "Visible trust, security, and review paths." },
            ])}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Release-ready focus</div><h2>A concise flagship site with clear routing.</h2></div>
            <p class="muted">The public experience now leads with the firm, explains the offer quickly, and sends serious inquiries into controlled intake.</p>
            <ul class="plain-list">${homeProofPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            <div class="doc-callout">Trust, governance, and disclosure remain visible because expensive work requires visible standards.</div>
          </aside>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Core lanes</div><h2>Three lanes. One operating system.</h2><p class="muted">The site is organized around the work buyers need to understand first.</p></div>
        <div class="feature-grid">${ecosystemSignals.map((item) => `<article class="feature-block"><div class="eyebrow">${escapeHtml(item.label)}</div><h3>${escapeHtml(item.label)}</h3><p class="muted">${escapeHtml(item.value)}</p></article>`).join("")}</div>
      </section>
      <section class="section shell">
        <div class="band-grid">
          <article class="band-panel"><div class="eyebrow">Primary offer</div><h3>Governance, automation, and commercial infrastructure.</h3><p class="muted">This is the lead story. The work is designed for founders, operators, and leadership teams who want structure that can withstand scrutiny.</p>${renderLinks([ctaMap.servicesOverview, ctaMap.pricingOverview])}</article>
          <article class="band-panel"><div class="eyebrow">Trust layer</div><h3>Standards are visible before the engagement starts.</h3><p class="muted">Governance and security are public because premium advisory work depends on visible operating standards, not vague positioning.</p>${renderLinks([ctaMap.trustCenter, ctaMap.governanceDoc])}</article>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Engagement scale</div><h2>Structured for serious work.</h2><p class="muted">Packages communicate range and posture. Final scope is still qualified through direct consultation.</p></div>
        ${renderPackagesGrid()}
      </section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Next step</div><h2>Start with a qualified conversation.</h2><p class="muted">If the work is important, start with consultation and scope alignment. Secondary portfolio lines remain available, but they are not the center of the flagship experience.</p></div>${renderLinks([ctaMap.enterpriseDiscovery, ctaMap.contactRouting])}</section>`,
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
    description: "Portfolio overview across JayPVentures LLC, jaypventures, All Ventures Access, Music, Travel, and the associated public business lines.",
    mode: "creator",
    title: "Ventures",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Portfolio overview</div>
            <h1 class="hero-title">Associated portfolio lines supported by the same operating standards.</h1>
            <p class="hero-copy">This section explains how the creator, membership, music, travel, and partnership lines sit alongside the primary firm without displacing it.</p>
            ${renderLinks([ctaMap.enterpriseDiscovery, ctaMap.creatorPortal], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Shared standards</div><h2>Infrastructure, routing, and trust remain centralized.</h2></div>
            <p class="muted">What changes across the lines is audience, offer structure, and commercial framing. The infrastructure and standards remain consistent.</p>
          </aside>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Brand roles</div><h2>One operating system, two public jobs.</h2></div>
        ${renderBrandProfiles()}
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Public-facing operations</div><h2>Programming, membership, and offers are governed as business lines.</h2></div>
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
        <div class="section-heading"><div class="eyebrow">Portfolio routes</div><h2>Review the public-facing business lines.</h2></div>
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
    description: "Public creator brand overview and creator services for jaypventures, presented as an associated brand within the JayPVentures portfolio.",
    mode: "creator",
    title: "Creator",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">jaypventures</div>
            <h1 class="hero-title">A public-facing creator brand with defined offers, membership routing, and controlled access.</h1>
            <p class="hero-copy">jaypventures is the creator and membership-facing brand in the portfolio. It is presented with clearer service paths, better membership structure, and gated access where appropriate.</p>
            ${renderLinks([
              { label: "Book Creator Fit Call", type: "booking", destination: env.MICROSOFT_BOOKINGS_URL },
              ctaMap.creatorPortal,
            ], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Commercial structure</div><h2>Public creator interest should route into defined services and access tiers.</h2></div>
            <ul class="plain-list">${creatorSignals.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </aside>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Creator offers</div><h2>Sessions, scoped builds, and recurring support.</h2><p class="muted">The public page explains the commercial structure, while deeper creator surfaces remain gated to preserve quality and access control.</p></div>
        ${renderOfferRows(offers)}
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Programming rhythm</div><h2>Creator-facing momentum is built around recurring formats, not random spikes.</h2></div>
        ${renderLivestreamFormats()}
      </section>
      <section class="section shell">
        <div class="band-grid">
          <article class="band-panel" id="creator-portal"><div class="eyebrow">Portal access</div><h3>Creator surfaces remain separate and gated.</h3><p class="muted">The public site explains the creator and member experience, then routes approved users into the worker-hosted portal or the public access guidance route.</p>${renderLinks([ctaMap.creatorPortal, { label: "Review Membership", type: "stripe_checkout", destination: "/all-ventures-access" }])}</article>
          <article class="band-panel"><div class="eyebrow">Scope review</div><h3>Higher-touch creator work still requires qualification.</h3><p class="muted">If the request is a full build, creator sprint, or recurring operating support, the next step is application and scope review rather than instant checkout.</p>${renderLinks([ctaMap.creatorApplication, ctaMap.contactRouting])}</article>
        </div>
      </section>`,
  };
}

function renderAllVenturesAccess(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);

  return {
    canonicalPath: "/all-ventures-access",
    description: "All Ventures Access membership tiers, recurring access logic, and gated benefit routing across the JayPVentures portfolio.",
    mode: "creator",
    title: "All Ventures Access",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Membership</div>
            <h1 class="hero-title">All Ventures Access is a membership program with defined access levels and gated benefits.</h1>
            <p class="hero-copy">This program is designed to support recurring revenue, clearer member expectations, and controlled access to premium portfolio surfaces.</p>
            ${renderLinks([ctaMap.membershipCore, ctaMap.membershipInnerCircle], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Operating model</div><h2>Checkout goes through Stripe. Access is governed through entitlement.</h2></div>
            <ul class="plain-list"><li>Stripe Checkout and Billing handle recurring payment lifecycle.</li><li>The entitlement worker turns purchase state into actual access.</li><li>Premium portals remain separate, gated surfaces.</li></ul>
          </aside>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Membership tiers</div><h2>Core, Plus, and Inner Circle map to clearly differentiated access levels.</h2></div>
        ${renderMembershipGrid(env)}
      </section>
      <section class="section shell">
        <div class="band-grid">
          <article class="band-panel" id="creator-portal"><div class="eyebrow">Creator Portal</div><h3>Member and creator routing surface</h3><p class="muted">Use the public site to understand the logic, then move into the gated creator surface when your entitlement and access level allow it.</p>${renderLinks([ctaMap.creatorPortal])}</article>
          <article class="band-panel" id="inner-circle-portal"><div class="eyebrow">Inner Circle</div><h3>Premium transparency and command-center style access</h3><p class="muted">The Inner Circle layer is for higher-trust members who want deeper visibility, better routing, and more privileged access to the system.</p>${renderLinks([ctaMap.innerCirclePortal])}</article>
        </div>
      </section>
      <section class="section shell">
        <div class="section-heading"><div class="eyebrow">Commercial purpose</div><h2>The membership program connects public interest to paid access in a controlled way.</h2></div>
        <div class="two-col">
          <article class="doc-panel"><h3>Public value</h3><ul class="bullet-list"><li>Clear explanation of what members are buying</li><li>Visible differentiation between tiers</li><li>Cleaner handoff from public site to Stripe Checkout</li></ul></article>
          <article class="doc-panel"><h3>Operational value</h3><ul class="bullet-list"><li>Entitlement sync feeds portal access</li><li>Billing lifecycle stays externalized in Stripe</li><li>Premium access remains controllable and auditable</li></ul></article>
        </div>
      </section>`,
  };
}
function renderMusic(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);
  const offers = getMusicOffers(env);

  return {
    canonicalPath: "/music",
    description: "JayPVentures Music public offer page for strategy, collaboration, release systems, and recurring creative direction.",
    mode: "creator",
    title: "Music",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Music</div>
            <h1 class="hero-title">Music strategy, release planning, and collaboration delivered with structure.</h1>
            <p class="hero-copy">The music line supports artists and collaborators who need clearer release planning, better creative structure, and more disciplined commercial packaging.</p>
            ${renderLinks([
              { label: "Book Music Fit Call", type: "booking", destination: env.MICROSOFT_BOOKINGS_URL },
              ctaMap.musicApplication,
            ], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Scope</div><h2>Releases, collaborations, and music-specific operating support.</h2></div>
            <ul class="plain-list"><li>Production strategy and release planning</li><li>Creative systems for consistency and output</li><li>Collaboration sessions and campaign packaging</li><li>Recurring direction when the music lane needs stronger cadence</li></ul>
          </aside>
        </div>
      </section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Music offers</div><h2>Sessions and build paths for artists and collaborators.</h2></div>${renderOfferRows(offers)}</section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Programming influence</div><h2>Music also benefits from the broader creator rhythm.</h2></div>${renderLivestreamFormats()}</section>
    `,
  };
}

function renderTravel(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);
  const offers = getTravelOffers(env);

  return {
    canonicalPath: "/travel",
    description: "JayPVentures Travel public offer page for inquiries, planning sessions, itinerary builds, and higher-touch travel operations.",
    mode: "creator",
    title: "Travel",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Travel</div>
            <h1 class="hero-title">Travel planning and itinerary services delivered with stronger operational control.</h1>
            <p class="hero-copy">The travel line is built for custom planning, itinerary development, and higher-touch coordination where clarity and logistics matter.</p>
            ${renderLinks([
              { label: "Book Travel Inquiry", type: "booking", destination: env.MICROSOFT_BOOKINGS_URL },
              ctaMap.travelApplication,
            ], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Service structure</div><h2>Built for custom planning, not generic booking widgets.</h2></div>
            <ul class="plain-list"><li>Trip inquiry and route clarity</li><li>Custom planning and itinerary design</li><li>Group strategy and expectation alignment</li><li>High-touch travel operations for more complex work</li></ul>
          </aside>
        </div>
      </section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Travel offers</div><h2>Planning support and higher-touch travel operations.</h2></div>${renderOfferRows(offers)}</section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Commercial fit</div><h2>Travel remains a controlled service line within the broader portfolio.</h2></div><div class="two-col"><article class="doc-panel"><h3>Client value</h3><ul class="bullet-list"><li>Clearer planning and expectations</li><li>Better itinerary structure</li><li>Stronger handling of group complexity</li></ul></article><article class="doc-panel"><h3>Operating value</h3><ul class="bullet-list"><li>Intentional intake instead of vague requests</li><li>Application routing for heavier operational work</li><li>A consistent flagship shell across the portfolio</li></ul></article></div></section>
    `,
  };
}

function renderPartnerships(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);

  return {
    canonicalPath: "/partnerships",
    description: "Collaborative brands, affiliate and performance partners, and partnership intake across the JayPVentures ecosystem.",
    mode: "creator",
    title: "Partnerships",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Partnerships</div>
            <h1 class="hero-title">Commercial relationships evaluated for fit, leverage, and operating discipline.</h1>
            <p class="hero-copy">Partnerships are evaluated against brand fit, commercial usefulness, and the standards of the primary firm. The public site makes that expectation explicit from the start.</p>
            ${renderLinks([ctaMap.contactRouting, ctaMap.creatorApplication], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Intake standard</div><h2>Partnerships are evaluated for fit, leverage, and commercial coherence.</h2></div>
            <ul class="plain-list"><li>Brand fit with the public identity</li><li>Operational clarity and realistic deliverables</li><li>Member, creator, or venture leverage</li><li>Potential for repeatable proof rather than one-off noise</li></ul>
          </aside>
        </div>
      </section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Current lanes</div><h2>Partnership depth across premium, growth, and volume categories.</h2></div>${renderPartnershipGroups()}</section>
    `,
  };
}

function renderInsightsIndex(): PageDefinition {
  return {
    canonicalPath: "/insights",
    description: "Code-managed insights and operating notes across governance, conversion, memberships, and the dual-entity ecosystem.",
    mode: "llc",
    title: "Insights",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Insights and operating notes</div>
            <h1 class="hero-title">Authority content that explains how the system actually works.</h1>
            <p class="hero-copy">The insights surface exists to deepen trust, explain the architecture, and make the commercial and governance logic legible to serious buyers and members.</p>
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Editorial posture</div><h2>Plain language, operational logic, and visible standards.</h2></div>
            <p class="muted">This content is written as part of the flagship system architecture, not as filler.</p>
          </aside>
        </div>
      </section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Published</div><h2>Current insights</h2></div>${renderInsightsList()}</section>
    `,
  };
}

function renderInsightArticle(slug: string): PageDefinition | null {
  const article = insightArticles.find((item) => item.slug === slug);
  if (!article) return null;

  return {
    canonicalPath: `/insights/${article.slug}`,
    description: article.summary,
    mode: article.slug === "operating-a-dual-entity-ecosystem" || article.slug === "all-ventures-access-is-a-system" ? "creator" : "llc",
    title: article.title,
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">${escapeHtml(article.kicker)}</div>
            <h1 class="hero-title">${escapeHtml(article.title)}</h1>
            <p class="hero-copy">${escapeHtml(article.summary)}</p>
            <div class="article-meta"><span>${escapeHtml(article.publishedAt)}</span><span>${escapeHtml(article.readingTime)}</span></div>
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Return path</div><h2>Authority content should route back into the system.</h2></div>
            ${renderLinks([{ label: "Back to Insights", type: "application", destination: "/insights" }, { label: "Open Contact Routing", type: "application", destination: "/contact" }])}
          </aside>
        </div>
      </section>
      <section class="section shell article-prose">${article.sections.map((section) => `<section class="article-section"><div class="eyebrow">Section</div><h2>${escapeHtml(section.heading)}</h2>${section.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`).join("")}</section>
    `,
  };
}

function renderTrust(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);

  return {
    canonicalPath: "/trust",
    description: "JayPVentures LLC trust center covering governance, security, disclosure, and operational standards.",
    mode: "llc",
    title: "Trust Center",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Trust center</div>
            <h1 class="hero-title">Governance, security, and disclosure are part of the product.</h1>
            <p class="hero-copy">Trust language is not decorative here. Public standards, review paths, and disclosure routes exist to improve conversion and keep operations legible.</p>
            ${renderLinks([ctaMap.governanceDoc, ctaMap.securityDoc], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Public standards</div><h2>Serious buyers should be able to see how the system is governed.</h2></div>
            <p class="muted">The trust layer should feel operational, plain to read, and directly tied to the way offers and premium surfaces are routed.</p>
          </aside>
        </div>
      </section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Pillars</div><h2>Core standards behind the flagship ecosystem.</h2></div><div class="trust-strip">${trustPillars.map((pillar) => `<article class="feature-block"><h3>${escapeHtml(pillar.title)}</h3><p class="muted">${escapeHtml(pillar.summary)}</p></article>`).join("")}</div></section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Trust routes</div><h2>Direct links to public governance and security documentation.</h2></div><div class="two-col"><article class="doc-panel"><h3>Governance</h3><p class="muted">Principles, risk tiers, and disclosure expectations that keep the system reviewable over time.</p><a class="button button-secondary" href="/GOVERNANCE.md">Read GOVERNANCE.md</a></article><article class="doc-panel"><h3>Security</h3><p class="muted">Security expectations across the flagship site, bookings worker, entitlement worker, and related automation surfaces.</p><a class="button button-secondary" href="/SECURITY.md">Read SECURITY.md</a></article></div></section>
    `,
  };
}

function renderContact(env: Env): PageDefinition {
  const ctaMap = buildCtaMap(env);

  return {
    canonicalPath: "/contact",
    description: "Unified contact and routing page for enterprise inquiries, creator builds, memberships, partnerships, and responsible disclosure.",
    mode: "llc",
    title: "Contact",
    body: `
      <section class="hero-stage shell">
        <div class="hero-grid">
          <section class="poster">
            <div class="hero-kicker">Contact and routing</div>
            <h1 class="hero-title">One contact page. Clear next steps by lane.</h1>
            <p class="hero-copy">Use this page to route into enterprise, creator, music, travel, partnership, or trust-related conversations without collapsing everything into one vague inbox.</p>
            ${renderLinks([ctaMap.enterpriseDiscovery, { label: "Email Venture Team", type: "application", destination: `mailto:${siteMeta.contactEmail}` }], true)}
          </section>
          <aside class="support-panel">
            <div><div class="eyebrow">Primary contacts</div><h2>Enterprise inquiries, partnerships, and disclosure routes.</h2></div>
            <ul class="plain-list"><li><a href="mailto:${escapeHtml(siteMeta.contactEmail)}">${escapeHtml(siteMeta.contactEmail)}</a></li><li><a href="mailto:${escapeHtml(siteMeta.securityEmail)}">${escapeHtml(siteMeta.securityEmail)}</a></li><li><a href="${escapeHtml(siteMeta.linkedInUrl)}" target="_blank" rel="noopener noreferrer">LinkedIn company page</a></li></ul>
          </aside>
        </div>
      </section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Route by lane</div><h2>Choose the right path before asking for a build.</h2></div><div class="route-grid"><article class="route-panel" id="apply-enterprise"><div class="eyebrow">Enterprise</div><h3>JayPVentures LLC</h3><p class="muted">Governance, automation, monetization architecture, and higher-trust implementation work.</p>${renderLinks([ctaMap.enterpriseDiscovery, ctaMap.enterpriseApplication])}</article><article class="route-panel" id="apply-creator"><div class="eyebrow">Creator</div><h3>jaypventures creator</h3><p class="muted">Creator monetization, offer architecture, and recurring support for public-facing growth.</p>${renderLinks([{ label: "Book Creator Fit Call", type: "booking", destination: env.MICROSOFT_BOOKINGS_URL }, ctaMap.creatorApplication])}</article><article class="route-panel" id="apply-membership-core"><div class="eyebrow">Membership</div><h3>All Ventures Access Core</h3><p class="muted">Request the Core tier if you want the lightest ongoing access path and a guided onboarding handoff.</p>${renderLinks([{ label: "Book Core Access Call", type: "booking", destination: env.MICROSOFT_BOOKINGS_URL }, { label: "Email Core Access", type: "application", destination: `mailto:${siteMeta.contactEmail}?subject=All%20Ventures%20Access%20Core` }])}</article><article class="route-panel" id="apply-membership-plus"><div class="eyebrow">Membership</div><h3>All Ventures Access Plus</h3><p class="muted">Use this route for deeper member access, stronger routing, and recurring support expectations.</p>${renderLinks([{ label: "Book Plus Access Call", type: "booking", destination: env.MICROSOFT_BOOKINGS_URL }, { label: "Email Plus Access", type: "application", destination: `mailto:${siteMeta.contactEmail}?subject=All%20Ventures%20Access%20Plus` }])}</article><article class="route-panel" id="apply-membership-inner-circle"><div class="eyebrow">Membership</div><h3>All Ventures Access Inner Circle</h3><p class="muted">Use this route for premium membership review, higher-trust access, and command-center style visibility.</p>${renderLinks([{ label: "Book Inner Circle Review", type: "booking", destination: env.MICROSOFT_BOOKINGS_URL }, { label: "Email Inner Circle Review", type: "application", destination: `mailto:${siteMeta.contactEmail}?subject=All%20Ventures%20Access%20Inner%20Circle` }])}</article><article class="route-panel" id="apply-music"><div class="eyebrow">Music</div><h3>JayPVentures Music</h3><p class="muted">Production strategy, collaboration, and recurring creative direction.</p>${renderLinks([{ label: "Book Music Call", type: "booking", destination: env.MICROSOFT_BOOKINGS_URL }, ctaMap.musicApplication])}</article><article class="route-panel" id="apply-travel"><div class="eyebrow">Travel</div><h3>JayPVentures Travel</h3><p class="muted">Travel planning, custom itineraries, and higher-touch travel operations.</p>${renderLinks([{ label: "Book Travel Inquiry", type: "booking", destination: env.MICROSOFT_BOOKINGS_URL }, ctaMap.travelApplication])}</article></div></section>
    `,
  };
}

function renderPrivacy(): PageDefinition {
  return {
    canonicalPath: "/privacy",
    description: "Privacy summary for bookings, memberships, inquiries, and related digital services in the JayPVentures ecosystem.",
    mode: "llc",
    title: "Privacy",
    body: `
      <section class="hero-stage shell"><div class="hero-grid"><section class="poster"><div class="hero-kicker">Privacy</div><h1 class="hero-title">Operational data stays tied to service delivery, trust, and review needs.</h1><p class="hero-copy">This summary explains the baseline privacy posture for the flagship website, bookings flows, memberships, and related platform services.</p></section><aside class="support-panel"><div><div class="eyebrow">Questions</div><h2>For privacy requests or questions, use the venture inbox.</h2></div><a class="button button-secondary" href="mailto:${escapeHtml(siteMeta.contactEmail)}">${escapeHtml(siteMeta.contactEmail)}</a></aside></div></section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Summary</div><h2>How privacy is handled at a practical level.</h2></div><article class="doc-panel"><ul class="bullet-list">${privacySummary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article></section>
    `,
  };
}

function renderCookies(): PageDefinition {
  return {
    canonicalPath: "/cookies",
    description: "Cookie notice for the flagship website and associated public JayPVentures routes.",
    mode: "llc",
    title: "Cookies",
    body: `
      <section class="hero-stage shell"><div class="hero-grid"><section class="poster"><div class="hero-kicker">Cookies</div><h1 class="hero-title">Cookie use is kept intentionally narrow.</h1><p class="hero-copy">The flagship site is designed to avoid unnecessary tracking. Essential technical behavior may be used for routing, security, and service continuity. Non-essential analytics should not be enabled without updating this notice and the related consent flow.</p></section><aside class="support-panel"><div><div class="eyebrow">Current posture</div><h2>No non-essential cookie banner is required until non-essential analytics or tracking are enabled.</h2></div><a class="button button-secondary" href="/privacy">Review privacy notice</a></aside></div></section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Summary</div><h2>How cookies and local storage should be handled.</h2></div><article class="doc-panel"><ul class="bullet-list"><li>Essential technical storage may be used for security, routing, and session integrity.</li><li>Non-essential analytics and advertising cookies should remain disabled until an explicit consent flow is added.</li><li>If analytics is enabled later, update this notice and implement consent-aware loading before deployment.</li></ul></article></section>
    `,
  };
}
function renderTerms(): PageDefinition {
  return {
    canonicalPath: "/terms",
    description: "Public terms summary for informational site content, consultative engagements, memberships, and gated access surfaces.",
    mode: "llc",
    title: "Terms",
    body: `
      <section class="hero-stage shell"><div class="hero-grid"><section class="poster"><div class="hero-kicker">Terms</div><h1 class="hero-title">Public content is informational. Paid access and services may add more specific terms.</h1><p class="hero-copy">This page sets the baseline expectations for using the public site, paid offers, and restricted portal surfaces.</p></section><aside class="support-panel"><div><div class="eyebrow">Questions</div><h2>Ask before you buy if the route or scope is unclear.</h2></div><a class="button button-secondary" href="/contact">Open contact routing</a></aside></div></section>
      <section class="section shell"><div class="section-heading"><div class="eyebrow">Summary</div><h2>Terms that shape the public flagship experience.</h2></div><article class="doc-panel"><ul class="bullet-list">${termsSummary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article></section>
    `,
  };
}

function getMarkdownDocument(pathname: string): string | null {
  switch (pathname) {
    case "/GOVERNANCE.md":
      return governanceMarkdown;
    case "/SECURITY.md":
      return securityMarkdown;
    default:
      return null;
  }
}

function renderPlainText(pathname: string, env: Env): RenderedRoute | null {
  if (pathname === "/robots.txt") {
    return {
      body: `User-agent: *\nAllow: /\nSitemap: ${env.SITE_ORIGIN}/sitemap.xml\n`,
      contentType: "text/plain; charset=UTF-8",
      status: 200,
    };
  }

  if (pathname === "/sitemap.xml") {
    const routes = [...publicRoutes, ...insightArticles.map((article) => `/insights/${article.slug}`)];
    return {
      body: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${env.SITE_ORIGIN}${route}</loc></url>`).join("")}</urlset>`,
      contentType: "application/xml; charset=UTF-8",
      status: 200,
    };
  }

  if (pathname === "/.well-known/security.txt") {
    return {
      body: `Contact: mailto:${siteMeta.securityEmail}\nExpires: 2027-04-10T00:00:00.000Z\nPreferred-Languages: en\nCanonical: ${env.SITE_ORIGIN}/.well-known/security.txt\nPolicy: ${env.SITE_ORIGIN}/SECURITY.md\n`,
      contentType: "text/plain; charset=UTF-8",
      status: 200,
    };
  }

  return null;
}
export function renderRoute(pathname: string, env: Env): RenderedRoute | null {
  const plainText = renderPlainText(pathname, env);
  if (plainText) {
    return plainText;
  }

  const markdown = getMarkdownDocument(pathname);
  if (markdown) {
    return {
      body: markdown,
      contentType: "text/markdown; charset=UTF-8",
      status: 200,
    };
  }

  let page: PageDefinition | null = null;

  switch (pathname) {
    case "/":
      page = renderHome(env);
      break;
    case "/services":
      page = renderServices(env);
      break;
    case "/pricing":
      page = renderPricing(env);
      break;
    case "/ventures":
      page = renderVentures(env);
      break;
    case "/creator":
      page = renderCreator(env);
      break;
    case "/all-ventures-access":
      page = renderAllVenturesAccess(env);
      break;
    case "/music":
      page = renderMusic(env);
      break;
    case "/travel":
      page = renderTravel(env);
      break;
    case "/partnerships":
      page = renderPartnerships(env);
      break;
    case "/insights":
      page = renderInsightsIndex();
      break;
    case "/trust":
      page = renderTrust(env);
      break;
    case "/contact":
      page = renderContact(env);
      break;
    case "/privacy":
      page = renderPrivacy();
      break;
    case "/cookies":
      page = renderCookies();
      break;
    case "/terms":
      page = renderTerms();
      break;
    default:
      if (pathname.startsWith("/insights/")) {
        page = renderInsightArticle(pathname.slice("/insights/".length));
      }
  }

  return page ? renderPage(env, page) : null;
}
