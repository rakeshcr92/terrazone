/**
 * Public Geozane pilot-program page.
 *
 * Ported from the landing-page repo's `src/routes/pilot.tsx`.
 * createFileRoute -> default export + usePageMeta(); TanStack Link -> react-router-dom Link.
 */
import { Check, Calendar, MapPin, TrendingUp, Shield, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "@/config/site";
import { usePageMeta } from "@/lib/page-meta";
import "@/styles/geozane.css";

const C = {
  bg: "#050709",
  card: "#0D1117",
  cardHover: "#13191F",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",
  brand: "#F08228",
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF4444",
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
        <div style={{ display: "flex", gap: 16 }}>
          <Link to="/" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>
            ← Back to Home
          </Link>
          <Link
            to="/book"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.bg,
              background: C.brand,
              padding: "6px 16px",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Book a Call
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function Pilot() {
  usePageMeta(
    "Pilot Program: Geozane",
    "Join the Geozane pilot program. Get full platform access for 30 to 40 days, run unlimited parcel analyses, and work directly with the founding team.",
  );

  return (
    <div className="gz-page" style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <WhatYouGet />
      <WhoIsItFor />
      <Timeline />
      <PilotCTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section
      style={{
        padding: "100px 24px 80px",
        maxWidth: 900,
        margin: "0 auto",
        textAlign: "center",
        position: "relative",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 700px 400px at 50% 0%, rgba(240,130,40,0.07), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "inline-block",
          fontFamily: C.mono,
          fontSize: 11,
          color: C.brand,
          letterSpacing: "0.2em",
          border: `1px solid rgba(240,130,40,0.3)`,
          borderRadius: 4,
          padding: "4px 12px",
          marginBottom: 24,
        }}
      >
        PILOT PROGRAM
      </div>
      <h1
        style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          color: C.text,
          margin: "0 0 20px",
        }}
      >
        30 days. Unlimited parcels.
        <br />
        <span style={{ color: C.brand }}>Real decisions.</span>
      </h1>
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.6,
          color: C.muted,
          maxWidth: 560,
          margin: "0 auto 40px",
        }}
      >
        The Geozane pilot gives you full platform access to run site feasibility analyses on your
        real pipeline, with direct support from the founding team.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          to="/book"
          style={{
            background: C.brand,
            color: C.bg,
            fontWeight: 700,
            fontSize: 15,
            padding: "14px 28px",
            borderRadius: 8,
            textDecoration: "none",
            boxShadow: "0 10px 40px -10px rgba(240,130,40,0.5)",
          }}
        >
          Apply for the Pilot →
        </Link>
        <a
          href={`mailto:${SITE.contactEmail}`}
          style={{
            background: "transparent",
            border: `1px solid rgba(255,255,255,0.12)`,
            color: C.text,
            fontSize: 15,
            fontWeight: 500,
            padding: "14px 28px",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Email Us
        </a>
      </div>
    </section>
  );
}

function WhatYouGet() {
  const items = [
    {
      icon: <MapPin size={20} color={C.brand} />,
      title: "Unlimited parcel analyses",
      desc: "Run as many site screenings as you need during the pilot. No per-report limits.",
    },
    {
      icon: <TrendingUp size={20} color={C.brand} />,
      title: "Full 5-phase pipeline",
      desc: "Soil, groundwater, elevation, zoning, and financial modeling. The complete stack.",
    },
    {
      icon: <Shield size={20} color={C.brand} />,
      title: "GO / NO-GO / CONDITIONAL verdicts",
      desc: "Every analysis returns a verdict with confidence score and executive summary.",
    },
    {
      icon: <Users size={20} color={C.brand} />,
      title: "Direct founding team access",
      desc: "Weekly check-ins with the Geozane team to review findings and answer questions.",
    },
    {
      icon: <Clock size={20} color={C.brand} />,
      title: "60-second turnaround",
      desc: "Results in under a minute. No waiting on consultants or manual lookups.",
    },
    {
      icon: <Calendar size={20} color={C.brand} />,
      title: "PDF reports for your pipeline",
      desc: "Exportable reports for every site, ready to share with LPs, partners, or lenders.",
    },
  ];

  return (
    <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 11,
            color: C.dimmer,
            letterSpacing: "0.15em",
            marginBottom: 12,
          }}
        >
          WHAT YOU GET
        </div>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: C.text,
          }}
        >
          Everything you need to screen your pipeline.
        </h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {items.map((item) => (
          <div
            key={item.title}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(240,130,40,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.icon}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{item.title}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: C.muted }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhoIsItFor() {
  const personas = [
    {
      label: "Real Estate Developers",
      desc: "Filter a 20-site pipeline down to the 3 worth paying a consultant for. Stop spending on sites that fail basic feasibility.",
    },
    {
      label: "Investors & LPs",
      desc: "Validate sponsor site selections independently. Know the groundwater depth, zoning fit, and risk score before you commit capital.",
    },
    {
      label: "Brokers & Advisors",
      desc: "Win mandates by showing clients a GO/NO-GO on their shortlist before the first meeting. Differentiate with data.",
    },
  ];

  return (
    <section
      style={{
        padding: "80px 24px",
        background: "rgba(255,255,255,0.01)",
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              fontFamily: C.mono,
              fontSize: 11,
              color: C.dimmer,
              letterSpacing: "0.15em",
              marginBottom: 12,
            }}
          >
            WHO IT'S FOR
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: C.text,
            }}
          >
            Built for the people who evaluate land.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {personas.map((p, i) => (
            <div
              key={p.label}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderTop: `2px solid ${i === 0 ? C.brand : C.border}`,
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 12 }}>
                {p.label}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: C.muted }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  const steps = [
    {
      week: "Week 1",
      title: "Onboarding call",
      desc: "30-minute kickoff with the founding team. We configure the platform for your market and pipeline.",
    },
    {
      week: "Weeks 1-4",
      title: "Active pilot",
      desc: "Full platform access. Run analyses on real sites. Weekly check-in calls to review findings.",
    },
    {
      week: "Week 4",
      title: "Pilot debrief",
      desc: "We review every analysis, discuss edge cases, and help you build your screening workflow.",
    },
    {
      week: "Post-pilot",
      title: "Transition to production",
      desc: "Pilot customers get priority placement and pilot pricing when Geozane goes to production.",
    },
  ];

  return (
    <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 11,
            color: C.dimmer,
            letterSpacing: "0.15em",
            marginBottom: 12,
          }}
        >
          HOW IT WORKS
        </div>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: C.text,
          }}
        >
          From kickoff to production in 30 days.
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {steps.map((s, i) => (
          <div
            key={s.week}
            style={{
              display: "flex",
              gap: 24,
              padding: "24px 0",
              borderBottom: i < steps.length - 1 ? `1px solid ${C.border}` : "none",
            }}
          >
            <div style={{ flex: "0 0 100px" }}>
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: 11,
                  color: C.brand,
                  letterSpacing: "0.12em",
                }}
              >
                {s.week.toUpperCase()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                {s.title}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: C.muted }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PilotCTA() {
  const bullets = [
    "30-40 day full-access pilot",
    "Unlimited parcel analyses",
    "Weekly founding team check-ins",
    "PDF reports for every site",
    "Priority pricing post-pilot",
    "Currently covering New Jersey",
  ];

  return (
    <section
      style={{
        padding: "80px 24px",
        background: "rgba(240,130,40,0.03)",
        borderTop: `1px solid rgba(240,130,40,0.12)`,
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: C.card,
          border: `1px solid rgba(240,130,40,0.2)`,
          borderTop: `2px solid ${C.brand}`,
          borderRadius: 16,
          padding: "48px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 11,
            color: C.brand,
            letterSpacing: "0.15em",
            marginBottom: 12,
          }}
        >
          APPLY NOW
        </div>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: C.text,
            marginBottom: 16,
          }}
        >
          Ready to screen your pipeline?
        </h2>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.6, marginBottom: 32 }}>
          Book a 30-minute intro call. We'll confirm the pilot is a fit and get you onboarded
          within the week.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            maxWidth: 480,
            margin: "0 auto 32px",
            textAlign: "left",
          }}
        >
          {bullets.map((b) => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "rgba(240,130,40,0.15)",
                  color: C.brand,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 16px",
                }}
              >
                <Check size={9} />
              </span>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>{b}</span>
            </div>
          ))}
        </div>
        <Link
          to="/book"
          style={{
            display: "inline-block",
            background: C.brand,
            color: C.bg,
            fontWeight: 700,
            fontSize: 16,
            padding: "14px 36px",
            borderRadius: 8,
            textDecoration: "none",
            boxShadow: "0 10px 40px -10px rgba(240,130,40,0.5)",
          }}
        >
          Book Your Intro Call →
        </Link>
        <p style={{ marginTop: 16, fontSize: 12, color: C.dimmer }}>
          Or email us at{" "}
          <a href={`mailto:${SITE.contactEmail}`} style={{ color: C.brand, textDecoration: "none" }}>
            {SITE.contactEmail}
          </a>
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 24px" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.brand }} />
          <span style={{ fontFamily: C.mono, color: C.brand, fontSize: 14, fontWeight: 600 }}>
            GEOZANE
          </span>
        </Link>
        <span style={{ color: C.dimmer, fontSize: 12 }}>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
