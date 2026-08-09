export const JPV_DESIGN_SYSTEM_CSS = String.raw`
:root {
  color-scheme: dark;
  --jpv-void: #050508;
  --jpv-surface: #0e1016;
  --jpv-elevated: #14161f;
  --jpv-white: #f5f7fa;
  --jpv-gray: #9ba2af;
  --jpv-line: rgba(245, 247, 250, 0.12);
  --jpv-pink: #ff2d97;
  --jpv-violet: #b12dff;
  --jpv-deep-violet: #5a00ff;
  --jpv-cyan: #00d4ff;
  --jpv-mint: #00ffe5;
  --jpv-success: #24c78b;
  --jpv-danger: #ff5a6b;
  --jpv-max: 1180px;
  --jpv-radius-sm: 8px;
  --jpv-radius-md: 14px;
  --jpv-radius-lg: 22px;
  --jpv-shadow: 0 18px 48px rgba(0, 0, 0, 0.5);
  --jpv-signal: linear-gradient(
    100deg,
    var(--jpv-pink),
    var(--jpv-violet) 34%,
    var(--jpv-deep-violet) 58%,
    var(--jpv-cyan) 82%,
    var(--jpv-mint)
  );
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  background: var(--jpv-void);
}

body,
body.mode-creator {
  margin: 0;
  background:
    radial-gradient(circle at 84% 7%, rgba(90, 0, 255, 0.15), transparent 32rem),
    radial-gradient(circle at 16% 88%, rgba(0, 212, 255, 0.1), transparent 30rem),
    var(--jpv-void) !important;
  color: var(--jpv-white);
  font-family: "IBM Plex Sans", Inter, Arial, sans-serif;
  line-height: 1.65;
  min-height: 100vh;
}

a {
  color: inherit;
}

.skip-link {
  background: var(--jpv-white) !important;
  color: var(--jpv-void) !important;
}

.site-header {
  background: rgba(5, 5, 8, 0.88) !important;
  border-bottom: 1px solid var(--jpv-line) !important;
  backdrop-filter: blur(18px);
}

.header-inner,
.shell {
  max-width: var(--jpv-max);
}

.brand-title,
.hero-title,
h1,
h2,
h3 {
  color: var(--jpv-white) !important;
  font-family: "Space Grotesk", "IBM Plex Sans", Arial, sans-serif !important;
  font-weight: 600 !important;
  letter-spacing: -0.035em;
}

.brand-title {
  font-size: 22px !important;
}

.brand-subtitle,
.muted,
p,
li,
.small-copy,
.cta-note,
.footer-links {
  color: var(--jpv-gray) !important;
}

.nav {
  color: var(--jpv-gray) !important;
}

.nav a {
  border-bottom: 1px solid transparent;
}

.nav a.active,
.nav a:hover,
.footer-links a:hover {
  color: var(--jpv-cyan) !important;
  border-color: rgba(0, 212, 255, 0.45) !important;
}

.poster,
.support-panel,
.offer-row,
.tier-panel,
.insight-card,
.feature-block,
.route-panel,
.doc-panel,
.band-panel,
.metric-rail,
.timeline-panel {
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.018)) !important;
  border: 1px solid var(--jpv-line) !important;
  border-radius: var(--jpv-radius-lg) !important;
  box-shadow: var(--jpv-shadow) !important;
}

.poster::before,
.support-panel::before,
.offer-row::before,
.tier-panel::before,
.insight-card::before,
.feature-block::before,
.route-panel::before,
.doc-panel::before,
.band-panel::before,
.timeline-panel::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--jpv-signal);
}

.hero-kicker,
.eyebrow {
  color: var(--jpv-cyan) !important;
  font-family: "IBM Plex Mono", monospace !important;
  font-size: 10px !important;
  font-weight: 600;
  letter-spacing: 0.15em !important;
}

.hero-title {
  max-width: 13ch !important;
  font-size: clamp(2.8rem, 6vw, 5.8rem) !important;
  line-height: 0.96 !important;
}

.hero-copy {
  color: var(--jpv-gray) !important;
}

.button {
  border-radius: 999px !important;
  transition:
    transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 220ms cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

.button:hover {
  transform: translateY(-1px);
}

.button:focus-visible,
.nav a:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.35);
}

.button-primary,
body.mode-creator .button-primary {
  background: var(--jpv-signal) !important;
  color: var(--jpv-white) !important;
}

.button-secondary {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: var(--jpv-line) !important;
  color: var(--jpv-white) !important;
}

.metric-rail {
  background: var(--jpv-line) !important;
}

.metric-cell {
  background: rgba(20, 22, 31, 0.92) !important;
}

.metric-label {
  color: var(--jpv-cyan) !important;
  font-family: "IBM Plex Mono", monospace !important;
}

.metric-value,
.price {
  color: var(--jpv-white) !important;
}

.pill {
  background: rgba(255, 255, 255, 0.035) !important;
  border-color: var(--jpv-line) !important;
  color: var(--jpv-gray) !important;
}

.brand-group-list li,
.article-section,
.doc-callout {
  border-color: var(--jpv-line) !important;
}

.footer {
  background: rgba(5, 5, 8, 0.94) !important;
  border-top: 1px solid var(--jpv-line) !important;
}

::selection {
  background: rgba(177, 45, 255, 0.45);
  color: var(--jpv-white);
}

@media (max-width: 760px) {
  .site-header {
    position: relative;
  }

  .header-inner {
    display: grid !important;
  }

  .nav {
    overflow-x: auto;
    flex-wrap: nowrap !important;
    padding-bottom: 4px;
  }

  .nav a {
    white-space: nowrap;
  }

  .hero-stage {
    padding-top: 34px !important;
  }

  .hero-title {
    font-size: clamp(2.6rem, 14vw, 4.4rem) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export const JPV_DESIGN_SYSTEM_VERSION = "2.1.0";
