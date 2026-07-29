/**
 * Public Geozane team page.
 *
 * Ported from the landing-page repo's `src/routes/team.tsx`.
 * createFileRoute -> default export + usePageMeta(); TanStack Link -> react-router-dom Link.
 * The logo anchor was `<a href="/">`, which ignores the /terrazone/ base path;
 * it is now a <Link to="/">.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageMeta, useScrollToTop } from "@/lib/page-meta";
import "@/styles/geozane.css";

const C = {
  bg: "#0C0A07",
  card: "#161310",
  cardHover: "#1C1915",
  border: "rgba(255,245,220,0.07)",
  borderStrong: "rgba(255,245,220,0.13)",
  borderBrand: "rgba(240,130,40,0.22)",
  green: "#4ADE80",
  brand: "#F08228",
  amber: "#FBBF24",
  text: "#FAF7F0",
  muted: "#8A7D6B",
  dimmer: "#4A4035",
};

const TEAM = [
  {
    role: "CEO",
    name: "Sravya Pogiri",
    description: "Chief Executive Officer - Sets the vision and drives Geozane's growth strategy.",
  },
  {
    role: "COO",
    name: "Gnana Varshita Chakka",
    description: "Chief Operating Officer - Keeps operations running smoothly and scales execution.",
  },
  {
    role: "CTO",
    name: "Surya Prabakaran Gopinath Thangamani",
    description: "Chief Technology Officer - Architects the intelligence platform powering every verdict.",
  },
  {
    role: "CMO",
    name: "Sridhyan Samanvaya Nuguri",
    description: "Chief Marketing Officer - Shapes Geozane's brand and go-to-market presence.",
  },
  {
    role: "CDO",
    name: "Rakesh Kumar Cavala Ramesh Kumar",
    description: "Chief Data Officer - Curates and governs the data layers that make 60-second insights possible.",
  },
  {
    role: "CBO",
    name: "Udaya Raja",
    description: "Chief Business Officer - Builds partnerships and opens new revenue channels.",
  },
];

function Nav() {
  const [scrolled] = useState(false);
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 56,
        background: "rgba(5,7,9,0.8)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${C.border}`,
        boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.04)" : "none",
        transition: "box-shadow 0.2s",
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
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ width: 5, height: 5, background: C.brand, transform: "rotate(45deg)", display: "inline-block" }} />
          <span style={{ color: C.text, fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>Geozane</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="hidden md:flex">
          {(
            [
              ["About", "/#about"],
              ["How it works", "/#how"],
              ["Demo", "/#demo"],
              ["Data", "/#data"],
            ] as [string, string][]
          ).map(([label, href]) => (
            <a
              key={href}
              href={href}
              style={{ fontSize: 13, color: C.muted, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              {label}
            </a>
          ))}
          <Link
            to="/team"
            style={{ fontSize: 13, color: C.brand, textDecoration: "none", fontWeight: 600 }}
          >
            Team
          </Link>
          <Link
            to="/pilot"
            style={{ fontSize: 13, color: C.muted, textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
          >
            Pilot Program
          </Link>
          <Link
            to="/book"
            style={{ fontSize: 13, fontWeight: 700, color: C.bg, background: C.brand, padding: "6px 16px", borderRadius: 6, textDecoration: "none" }}
          >
            Book a Call
          </Link>
        </div>
        <span aria-hidden style={{ width: 1 }} />
      </div>
    </nav>
  );
}

export default function Team() {
  usePageMeta("Team Geozane", "Meet the team behind Geozane.");
  useScrollToTop();

  return (
    <div className="gz-page" style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav />

      {/* Header */}
      <section style={{ textAlign: "center", padding: "80px 24px 48px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, background: "rgba(240,130,40,0.08)", border: `1px solid ${C.borderBrand}`, borderRadius: 20, padding: "6px 14px" }}>
          <span style={{ width: 5, height: 5, background: C.brand, transform: "rotate(45deg)", display: "inline-block" }} />
          <span style={{ fontSize: 11, color: C.brand, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>The Team</span>
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          Built by people who{" "}
          <span style={{ color: C.brand }}>care about land.</span>
        </h1>
        <p style={{ fontSize: 18, color: C.muted, maxWidth: 520, margin: "0 auto" }}>
          Six leaders. One mission make land feasibility intelligence accessible to every developer in 60 seconds.
        </p>
      </section>

      {/* Cards grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
        {TEAM.map(({ role, name, description }) => (
          <TeamCard key={role} role={role} name={name} description={description} />
        ))}
      </section>
    </div>
  );
}

function TeamCard({ role, name, description }: { role: string; name: string; description: string }) {
  const [hovered, setHovered] = useState(false);

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.cardHover : C.card,
        border: `1px solid ${hovered ? C.borderStrong : C.border}`,
        borderRadius: 16,
        padding: "32px 28px",
        transition: "background 0.2s, border-color 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-3px)" : "none",
        cursor: "default",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.brand}33, ${C.brand}11)`,
          border: `1px solid ${C.borderBrand}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 700,
          color: C.brand,
          marginBottom: 20,
          letterSpacing: "0.02em",
        }}
      >
        {initials}
      </div>

      {/* Role badge */}
      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.brand,
            background: "rgba(240,130,40,0.1)",
            border: `1px solid ${C.borderBrand}`,
            borderRadius: 4,
            padding: "3px 8px",
          }}
        >
          {role}
        </span>
      </div>

      <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10, color: C.text }}>
        {name}
      </h3>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}
