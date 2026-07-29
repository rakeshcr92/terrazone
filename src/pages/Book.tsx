/**
 * Public Geozane booking page (Calendly embed).
 *
 * Ported from the landing-page repo's `src/routes/book.tsx`.
 * createFileRoute -> default export + usePageMeta(); TanStack Link -> react-router-dom Link.
 */
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "@/config/site";
import { usePageMeta } from "@/lib/page-meta";
import "@/styles/geozane.css";

const C = {
  bg: "#050709",
  card: "#0D1117",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",
  brand: "#F08228",
  green: "#22C55E",
  text: "#F8FAFC",
  muted: "#64748B",
  dimmer: "#334155",
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

function Nav() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 56,
        background: "rgba(5,7,9,0.9)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          height: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.brand,
              boxShadow: `0 0 10px ${C.brand}`,
            }}
          />
          <span
            style={{
              fontFamily: C.mono,
              color: C.brand,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            GEOZANE
          </span>
        </Link>
        <Link to="/" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </div>
    </nav>
  );
}

export default function Book() {
  usePageMeta(
    "Book a Call: Geozane",
    "Schedule a 30-minute Geozane walkthrough. We'll run the platform live on a parcel of your choosing.",
  );

  return (
    <div className="gz-page" style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav />
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "64px 24px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
          gap: 40,
          alignItems: "start",
        }}
        className="gz-book-grid"
      >
        <LeftPanel />
        <CalendlyPanel />
      </main>
    </div>
  );
}

function LeftPanel() {
  const bullets = [
    "Live parcel analysis on a site you pick",
    "Full walkthrough of the 5-phase pipeline",
    "See GO / NO-GO / CONDITIONAL in real time",
    "Soil, groundwater, elevation & zoning data",
    "Financial modeling and ROI estimates",
    "Q&A with the founding team",
  ];

  return (
    <div style={{ position: "sticky", top: 80 }}>
      <div
        style={{
          fontFamily: C.mono,
          fontSize: 11,
          color: C.brand,
          letterSpacing: "0.2em",
          marginBottom: 16,
        }}
      >
        BOOK A CALL
      </div>
      <h1
        style={{
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: C.text,
          marginBottom: 16,
        }}
      >
        20 minutes.
        <br />
        <span style={{ color: C.brand }}>Live parcel demo.</span>
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: C.muted, marginBottom: 32 }}>
        Pick any parcel in New Jersey. We'll run Geozane live on the call and walk you through
        the full feasibility analysis: soil, water, zoning, and a GO/NO-GO verdict.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
        {bullets.map((b) => (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(240,130,40,0.12)",
                color: C.brand,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "0 0 18px",
              }}
            >
              <Check size={10} />
            </span>
            <span style={{ fontSize: 14, color: "#94A3B8" }}>{b}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.borderStrong}`,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 10,
            color: C.dimmer,
            letterSpacing: "0.12em",
            marginBottom: 8,
          }}
        >
          ALSO AVAILABLE
        </div>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
          Interested in a 30-day pilot? Learn what's included before the call.
        </p>
        <Link
          to="/pilot"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.brand,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          View the Pilot Program →
        </Link>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: C.dimmer }}>
        Prefer async?{" "}
        <a href={`mailto:${SITE.contactEmail}`} style={{ color: C.brand, textDecoration: "none" }}>
          {SITE.contactEmail}
        </a>
      </p>
    </div>
  );
}

function CalendlyPanel() {
  const src = `${SITE.calendly}?embed_domain=geozane.com&embed_type=Inline&hide_event_type_details=0&hide_gdpr_banner=1&background_color=080b0e&text_color=f8fafc&primary_color=f08228`;
  return (
    <div
      style={{
        background: "#080B0E",
        border: `1px solid ${C.borderStrong}`,
        borderTop: `2px solid ${C.brand}`,
        borderRadius: 12,
        overflow: "hidden",
        minHeight: 700,
      }}
    >
      <iframe
        src={src}
        title="Schedule a Geozane walkthrough"
        width="100%"
        height="700"
        frameBorder={0}
        style={{ display: "block", border: 0 }}
      />
    </div>
  );
}
