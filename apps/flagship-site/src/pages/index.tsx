import React from "react";

const actions = [
  { href: "/services", label: "Review services" },
  { href: "/pricing", label: "View pricing" },
  { href: "/trust", label: "Read trust center" },
  { href: "/contact", label: "Start intake" },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "72px 24px",
        color: "#111827",
        background: "linear-gradient(180deg, #f8f5f0 0%, #ede6dc 100%)",
        fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
      }}
    >
      <section style={{ maxWidth: 920, margin: "0 auto" }}>
        <p style={{ margin: "0 0 16px", color: "#7a1f2a", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
          JayPVentures LLC
        </p>
        <h1 style={{ maxWidth: 760, margin: 0, fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: .95, letterSpacing: "-.05em" }}>
          Governance, automation, and revenue infrastructure.
        </h1>
        <p style={{ maxWidth: 680, margin: "28px 0 0", color: "#4b5563", fontSize: 20, lineHeight: 1.6 }}>
          A concise flagship entry for operators who need accountable systems, controlled intake, and visible trust standards before work begins.
        </p>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34 }} aria-label="Primary actions">
          {actions.map((action, index) => (
            <a
              key={action.href}
              href={action.href}
              style={{
                borderRadius: 999,
                padding: "13px 18px",
                background: index === 0 ? "#7a1f2a" : "rgba(255,255,255,.72)",
                border: "1px solid rgba(17,24,39,.12)",
                color: index === 0 ? "#fff" : "#111827",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {action.label}
            </a>
          ))}
        </nav>
      </section>
    </main>
  );
}
