/**
 * Public Geozane marketing landing page.
 *
 * Ported from the standalone landing-page repo's `src/routes/index.tsx`
 * (TanStack Start file route) into this Vite + React Router DOM SPA.
 *
 * TanStack APIs replaced:
 *   createFileRoute({ head, component })  -> default export + usePageMeta()
 *   Link from "@tanstack/react-router"    -> Link from "react-router-dom"
 *   useServerFn(submitLead)               -> client-side submitLead()
 *                                            (see src/lib/lead-submit.ts)
 *
 * Behaviour changes:
 *   - The nav "Login" button and the hero "Try Geozane" button used to point at
 *     the absolute URL https://rakeshcr92.github.io/terrazone/. They now use
 *     in-app <Link to="/login"> so they respect the /terrazone/ Vite base path.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type * as LeafletNS from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Pencil,
  Trash2,
  Search,
  Check,
  Linkedin,
  Mail,
  Calendar,
} from "lucide-react";
import { SITE, SITE_LINKS } from "@/config/site";
import {
  submitLead,
  buildLeadMailto,
  LeadValidationError,
  type LeadInput,
} from "@/lib/lead-submit";
import { usePageMeta } from "@/lib/page-meta";
import "@/styles/geozane.css";

/* ---------------- Config ---------------- */
const LINKS = {
  demo: "#get-started",
  get call() {
    return SITE?.calendly ?? "";
  },
  youtube: SITE_LINKS.youtube,
  linkedin: SITE_LINKS.linkedin,
  github: SITE_LINKS.github,
};

const C = {
  bg: "#0C0A07",
  card: "#161310",
  cardHover: "#1C1915",
  border: "rgba(255,245,220,0.07)",
  borderStrong: "rgba(255,245,220,0.13)",
  borderGreen: "rgba(74,222,128,0.2)",
  borderBrand: "rgba(240,130,40,0.22)",
  green: "#4ADE80",
  brand: "#F08228",
  amber: "#FBBF24",
  red: "#F87171",
  text: "#FAF7F0",
  muted: "#8A7D6B",
  dimmer: "#4A4035",
  mono: '"JetBrains Mono", ui-monospace, monospace',
  serif: '"Georgia", "Times New Roman", serif',
};

/* ---------------- Page ---------------- */
export default function Landing() {
  usePageMeta(
    "Geozane: Land feasibility intelligence in 60 seconds",
    "Click a parcel. Get a GO, NO-GO, or CONDITIONAL verdict in under 60 seconds, powered by USGS, USDA, elevation, and live zoning data.",
  );

  return (
    <div className="gz-page" style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <Press />
      <Divider />
      <HowItWorks />
      <Divider />
      <DemoSection />
      <Divider />
      <DataSources />
      <Divider />
      <CTA />
      <Footer />
    </div>
  );
}

const Divider = () => (
  <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
);

/* ---------------- Nav ---------------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
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
              ["About", "#about"],
              ["How it works", "#how"],
              ["Demo", "#demo"],
              ["Data", "#data"],
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
            style={{ fontSize: 13, color: C.muted, textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
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
            to="/login"
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
            Login
          </Link>
        </div>
        <span aria-hidden style={{ width: 1 }} />
      </div>
    </nav>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section
      style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* subtle radial bg */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 800px 500px at 50% 60%, rgba(240,130,40,0.06), transparent 65%)",
      }} />

      <div style={{ fontFamily: C.mono, fontSize: 11, color: C.brand, letterSpacing: "0.18em", marginBottom: 20 }}>
        LAND FEASIBILITY INTELLIGENCE
      </div>

      <h1
        style={{
          fontSize: "clamp(44px, 7vw, 80px)",
          fontWeight: 700,
          fontFamily: C.serif,
          lineHeight: 1.06,
          letterSpacing: "-0.025em",
          color: C.text,
          maxWidth: 800,
        }}
        className="gz-fade-up"
      >
        Know what the land<br />
        will allow<span style={{ color: C.brand }}>.</span>
      </h1>

      <p
        style={{
          marginTop: 24,
          fontSize: 19,
          lineHeight: 1.65,
          color: C.muted,
          maxWidth: 560,
        }}
        className="gz-fade-up"
      >
        Drop a pin on any parcel in New Jersey. Geozane screens soil,
        groundwater, zoning, flood exposure, and slope and delivers a
        GO, NO-GO, or CONDITIONAL verdict in under 60 seconds.
      </p>

      <div style={{ marginTop: 40, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }} className="gz-fade-up">
        <Link
          to="/login"
          style={{
            background: C.brand, color: C.bg, fontWeight: 700, fontSize: 16,
            padding: "14px 32px", borderRadius: 8, textDecoration: "none",
            boxShadow: "0 12px 40px -10px rgba(240,130,40,0.55)",
          }}
        >
          Try Geozane
        </Link>
        <a
          href={LINKS.youtube}
          target="_blank"
          rel="noreferrer"
          style={{
            background: "transparent", border: `1px solid ${C.borderStrong}`,
            color: C.text, fontSize: 16, fontWeight: 500,
            padding: "14px 32px", borderRadius: 8, textDecoration: "none",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.borderStrong)}
        >
          Watch the Demo ↗
        </a>
      </div>

      {/* stat strip */}
      <div style={{
        marginTop: 72,
        display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center",
        borderTop: `1px solid ${C.border}`, paddingTop: 40, width: "100%", maxWidth: 640,
      }}>
        {[
          { k: "60s",  v: "Time to verdict" },
          { k: "5+",   v: "Data layers" },
          { k: "100%", v: "Federal data sources" },
          { k: "NJ",   v: "Coverage" },
        ].map((s) => (
          <div key={s.v} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: C.serif, fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>{s.k}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks() {
  const steps = [
    { n: "01", t: "Pick a parcel", d: "Search an address or click anywhere on the map. Drop a pin or draw a polygon." },
    { n: "02", t: "Pull live data", d: "USGS groundwater, USDA soil, NOAA elevation, and municipal zoning records, fetched in parallel." },
    { n: "03", t: "Model the risk", d: "Our engine scores soil stability, water depth, elevation flood risk, and zoning fit." },
    { n: "04", t: "Get the verdict", d: "GO, NO-GO, or CONDITIONAL. Includes an executive summary and the cost of going further." },
  ];
  return (
    <Section id="how" eyebrow="how it works" title="From parcel to verdict in 60 seconds." sub="Four steps. Live data. No spreadsheets.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 48 }}>
        {steps.map((s) => (
          <div
            key={s.n}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, transition: "background 0.2s, border-color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.cardHover; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.card; e.currentTarget.style.borderColor = C.border; }}
          >
            <div style={{ fontFamily: C.serif, fontSize: 32, color: C.brand, lineHeight: 1, opacity: 0.7 }}>{s.n}</div>
            <div style={{ marginTop: 8, fontSize: 17, fontWeight: 600, color: C.text }}>{s.t}</div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, color: C.muted }}>{s.d}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Demo Section ---------------- */
function DemoSection() {
  const [phase, setPhase] = useState<"globe" | "demo">("globe");
  return (
    <Section id="demo" eyebrow="demo preview" title="See exactly what you get." sub="This is a simplified preview of Geozane in action. The real product runs on live USGS, USDA, and zoning data.">
      <div
        className="gz-desktop-only"
        style={{
          marginTop: 48,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          minHeight: 560,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {phase === "globe" ? (
          <GlobePanel onStart={() => setPhase("demo")} />
        ) : (
          <MapDemo onBack={() => setPhase("globe")} />
        )}
      </div>
      <MobileDemoFallback />
      <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.dimmer, fontStyle: "italic" }}>
        Demo uses simulated data for illustration. The live product connects to real USGS, USDA, elevation, and zoning APIs.
      </p>
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <div style={{ fontSize: 16, color: C.text, marginBottom: 12 }}>Want to see it on a real parcel?</div>
        <a
          href={LINKS.demo}
          style={{
            display: "inline-block",
            background: C.brand,
            color: C.bg,
            fontWeight: 700,
            fontSize: 15,
            padding: "12px 28px",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Request a Live Demo →
        </a>
      </div>
    </Section>
  );
}

function MobileDemoFallback() {
  return (
    <div
      className="gz-mobile-only"
      style={{
        marginTop: 48,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ height: 200, background: "linear-gradient(135deg, #0A1117, #050709)", borderRadius: 8, position: "relative", overflow: "hidden", border: `1px solid ${C.border}` }}>
        <svg viewBox="0 0 300 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {[30,60,90,120].map((r,i) => (
            <ellipse key={i} cx="150" cy="100" rx={r*1.3} ry={r*0.8} fill="none" stroke="rgba(200,170,110,0.15)" />
          ))}
          <polygon points="110,70 190,65 200,130 150,140 100,120" fill="rgba(240,130,40,0.15)" stroke="rgba(240,130,40,0.7)" strokeWidth="1.5"/>
        </svg>
      </div>
      <p style={{ marginTop: 16, fontSize: 13, color: C.dimmer }}>
        The interactive demo is best experienced on desktop.
      </p>
    </div>
  );
}

/* ---- Globe (Three.js) ---- */
function GlobePanel({ onStart }: { onStart: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let cleanup = () => {};
    (async () => {
      // The original landing page let this reject unhandled when WebGL was
      // unavailable (headless browsers, blocked GPU, jsdom). The globe is
      // decorative, so failure degrades to the static panel around it.
      try {
        const THREE = await import("three");
        const w = el.clientWidth;
        const h = 440;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.set(0, 0, 5.5);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = "0";
        renderer.domElement.style.left = "0";
        el.appendChild(renderer.domElement);

        const base = new THREE.Mesh(
          new THREE.SphereGeometry(2, 64, 64),
          new THREE.MeshStandardMaterial({ color: 0x120f0a, roughness: 0.85, metalness: 0.15 }),
        );
        scene.add(base);
        const wire = new THREE.Mesh(
          new THREE.SphereGeometry(2.01, 36, 36),
          new THREE.MeshBasicMaterial({ color: 0xf08228, wireframe: true, transparent: true, opacity: 0.10 }),
        );
        scene.add(wire);
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(2.12, 32, 32),
          new THREE.MeshBasicMaterial({ color: 0xf08228, transparent: true, opacity: 0.025 }),
        );
        scene.add(halo);

        // Dot particles scattered on the globe surface
        const dotCount = 500;
        const positions = new Float32Array(dotCount * 3);
        for (let i = 0; i < dotCount; i++) {
          const theta = Math.acos(2 * Math.random() - 1);
          const phi = Math.random() * Math.PI * 2;
          const r = 2.03;
          positions[i * 3]     = r * Math.sin(theta) * Math.cos(phi);
          positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
          positions[i * 3 + 2] = r * Math.cos(theta);
        }
        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const dotMat = new THREE.PointsMaterial({ color: 0xf08228, size: 0.045, transparent: true, opacity: 0.75 });
        const dots = new THREE.Points(dotGeo, dotMat);
        scene.add(dots);

        scene.add(new THREE.AmbientLight(0xfff5dc, 0.25));
        const p1 = new THREE.PointLight(0xf08228, 4); p1.position.set(5, 3, 5); scene.add(p1);
        const p2 = new THREE.PointLight(0x4ade80, 0.8); p2.position.set(-5, -2, -3); scene.add(p2);

        const onResize = () => {
          const W = el.clientWidth;
          camera.aspect = W / h;
          camera.updateProjectionMatrix();
          renderer.setSize(W, h);
        };
        window.addEventListener("resize", onResize);

        const animate = () => {
          base.rotation.y += 0.003;
          wire.rotation.y += 0.003;
          halo.rotation.y += 0.0015;
          dots.rotation.y += 0.003;
          renderer.render(scene, camera);
          raf = requestAnimationFrame(animate);
        };
        animate();

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", onResize);
          renderer.dispose();
          if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
      } catch (err) {
        console.warn("[Geozane] Globe visual unavailable:", err);
      }
    })();
    return () => cleanup();
  }, []);

  const hotspots = [
    { x: "28%", y: "32%", d: "0s" },
    { x: "62%", y: "28%", d: "0.4s" },
    { x: "48%", y: "55%", d: "0.8s" },
    { x: "70%", y: "62%", d: "1.2s" },
    { x: "35%", y: "70%", d: "1.6s" },
  ];

  return (
    <div style={{ padding: 24, position: "relative" }}>
      <div ref={ref} style={{ width: "100%", height: 440, position: "relative" }}>
        {hotspots.map((h, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: h.x,
              top: h.y,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: C.brand,
              boxShadow: `0 0 12px ${C.brand}`,
              animation: `gz-pulse 2s ease-in-out ${h.d} infinite`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <p style={{ fontSize: 14, color: C.muted }}>Geozane analyzes land parcels across New Jersey.</p>
        <button
          onClick={onStart}
          style={{
            marginTop: 16,
            background: C.brand,
            color: C.bg,
            border: "none",
            fontWeight: 700,
            fontSize: 14,
            padding: "10px 22px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Try the Demo Interaction
        </button>
      </div>
    </div>
  );
}

/* ---- Map + Analysis Demo ---- */
type Verdict = "GO" | "CONDITIONAL" | "NO-GO";

function MapDemo({ onBack }: { onBack: () => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  // The original used `any` for every Leaflet ref because the landing repo
  // never installed @types/leaflet. TerraZone's eslint config forbids `any`,
  // so these are properly typed against the Leaflet namespace (type-only
  // import, so the runtime module stays lazily loaded).
  const leafletRef = useRef<{ L: typeof LeafletNS; map: LeafletNS.Map } | null>(null);
  const drawingLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const verticesRef = useRef<LeafletNS.LatLngTuple[]>([]);
  const previewLineRef = useRef<LeafletNS.Polyline | null>(null);
  const polygonRef = useRef<LeafletNS.Polygon | null>(null);
  const drawingActive = useRef(false);
  const [drawing, setDrawing] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "results">("idle");
  const [stepIndex, setStepIndex] = useState(-1);
  const [verdict, setVerdict] = useState<Verdict>("GO");
  const [confidence, setConfidence] = useState(82);
  const [activeTab, setActiveTab] = useState<"Decision" | "Compare" | "Scenarios" | "PDF">("Decision");

  useEffect(() => {
    drawingActive.current = drawing;
  }, [drawing]);

  const runAnalysis = () => {
    setState("loading");
    setStepIndex(0);
    const stagger = [400, 800, 1200, 1600, 2200];
    stagger.forEach((t, i) => setTimeout(() => setStepIndex(i), t));
    setTimeout(() => {
      const verdicts: Verdict[] = ["GO", "GO", "CONDITIONAL", "NO-GO"];
      setVerdict(verdicts[Math.floor(Math.random() * verdicts.length)]);
      setConfidence(65 + Math.floor(Math.random() * 28));
      setState("results");
    }, 2700);
  };

  const finishPolygon = () => {
    const entry = leafletRef.current;
    const layer = drawingLayerRef.current;
    if (!entry || !layer) return;
    const { L } = entry;
    if (previewLineRef.current) layer.removeLayer(previewLineRef.current);
    polygonRef.current = L.polygon(verticesRef.current, {
      color: "#F08228", weight: 2, fillColor: "#F08228", fillOpacity: 0.2,
    }).addTo(layer);
    entry.map.fitBounds(polygonRef.current.getBounds(), { padding: [40, 40] });
    setDrawing(false);
    setTimeout(runAnalysis, 800);
  };

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      const L = await import("leaflet");
      if (!mapRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true }).setView([40.7128, -74.006], 14);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
      leafletRef.current = { L, map };
      drawingLayerRef.current = L.layerGroup().addTo(map);

      map.on("click", (e: LeafletNS.LeafletMouseEvent) => {
        const layer = drawingLayerRef.current;
        if (!drawingActive.current || !layer) return;
        verticesRef.current.push([e.latlng.lat, e.latlng.lng]);
        L.circleMarker(e.latlng, { radius: 4, color: "#F08228", fillColor: "#F08228", fillOpacity: 1, weight: 1 }).addTo(layer);
        if (previewLineRef.current) layer.removeLayer(previewLineRef.current);
        if (verticesRef.current.length >= 2) {
          previewLineRef.current = L.polyline(verticesRef.current, { color: "#F08228", weight: 2 }).addTo(layer);
        }
      });

      map.on("dblclick", (e: LeafletNS.LeafletMouseEvent) => {
        e.originalEvent?.preventDefault?.();
        if (!drawingActive.current || verticesRef.current.length < 3) return;
        finishPolygon();
      });

      cleanup = () => map.remove();
    })();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAll = () => {
    drawingLayerRef.current?.clearLayers();
    verticesRef.current = [];
    previewLineRef.current = null;
    polygonRef.current = null;
    setDrawing(false);
    setState("idle");
    setStepIndex(-1);
  };

  const startDrawing = () => {
    clearAll();
    setDrawing(true);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", height: 600 }}>
      {/* ── LEFT: Map ──────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div ref={mapRef} style={{ position: "absolute", inset: 0, background: "#0B0C10" }} />

        {/* Top toolbar matches Terra Zone */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000,
          background: "rgba(10,10,14,0.92)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", gap: 10, padding: "0 14px", height: 52,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0, marginRight: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #EF4444)", display: "inline-block" }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Geozane</span>
          </div>

          {/* Draw button */}
          <button onClick={startDrawing} style={{
            background: C.brand, color: "#000", fontWeight: 700, fontSize: 13,
            padding: "7px 14px", borderRadius: 6, border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <Pencil size={12} /> Draw Polygon
          </button>

          {/* Clear button */}
          <button onClick={clearAll} style={{
            background: "transparent", color: "#9CA3AF",
            border: "1px solid rgba(255,255,255,0.12)",
            fontSize: 13, padding: "7px 14px", borderRadius: 6, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <Trash2 size={12} /> Clear
          </button>

          {/* Search */}
          <div style={{ marginLeft: "auto", position: "relative" }}>
            <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#6B7280" }} />
            <input placeholder="Search location..." style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", fontSize: 13, padding: "7px 10px 7px 28px",
              borderRadius: 6, width: 220, outline: "none",
            }} />
          </div>
        </div>

        {/* Hint bar */}
        {drawing && (
          <div style={{
            position: "absolute", top: 52, left: 0, right: 0, zIndex: 999,
            background: "rgba(10,10,14,0.8)", height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: C.brand, borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            Click to add vertices · double-click to finish
          </div>
        )}

        {/* Back button */}
        <button onClick={onBack} style={{
          position: "absolute", bottom: 12, left: 12, zIndex: 1000,
          background: "rgba(10,10,14,0.85)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#9CA3AF", fontSize: 12, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
        }}>
          ← Globe
        </button>
      </div>

      {/* ── RIGHT: Decision Panel ──────────────────────────────── */}
      <div style={{ background: "#0D0D0D", borderLeft: "1px solid #2A2A2A", display: "flex", flexDirection: "column", height: 600, overflow: "hidden" }}>
        {/* Tabs at top */}
        <div style={{ display: "flex", borderBottom: "1px solid #2A2A2A", flexShrink: 0 }}>
          {(["Decision", "Compare", "Scenarios", "PDF"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex: 1, background: "transparent", border: "none", padding: "12px 0",
              fontSize: 12, color: activeTab === t ? "#fff" : "#6B7280",
              borderBottom: activeTab === t ? `2px solid ${C.brand}` : "2px solid transparent",
              cursor: "pointer", fontWeight: activeTab === t ? 600 : 400,
            }}>{t}</button>
          ))}
        </div>

        {/* Panel content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }} className="gz-hero-panel">
          {activeTab === "Decision" && (
            <>
              {state === "idle"    && <AnalysisIdle />}
              {state === "loading" && <AnalysisLoading stepIndex={stepIndex} />}
              {state === "results" && <AnalysisResults verdict={verdict} confidence={confidence} />}
            </>
          )}
          {activeTab !== "Decision" && <TabPlaceholder tab={activeTab} hasResults={state === "results"} />}
        </div>
      </div>
    </div>
  );
}

const TAB_META: Record<string, { icon: string; title: string; desc: string; bullets: string[] }> = {
  Compare: {
    icon: "⇄",
    title: "Side-by-side comparison",
    desc: "Compare up to 4 parcels on cost, risk score, and zoning fit.",
    bullets: ["Risk score delta", "Soil & water table overlay", "Estimated carry cost per sqft"],
  },
  Scenarios: {
    icon: "◈",
    title: "Build scenario modeling",
    desc: "Run what-if scenarios residential, mixed-use, or industrial against the same parcel.",
    bullets: ["Zoning variance likelihood", "Setback & FAR impact", "Phase II trigger probability"],
  },
  PDF: {
    icon: "↓",
    title: "Export full report",
    desc: "Download a branded PDF with all data sources, scores, and the executive summary.",
    bullets: ["One-page executive brief", "Source citations & timestamps", "Share-ready for investors or counsel"],
  },
};

function TabPlaceholder({ tab, hasResults }: { tab: string; hasResults: boolean }) {
  const meta = TAB_META[tab];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16, color: C.brand }}>
        {meta.icon}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{meta.title}</div>
      <p style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.6, marginBottom: 20, maxWidth: 230 }}>{meta.desc}</p>
      <div style={{ width: "100%", textAlign: "left", borderTop: "1px solid #2A2A2A", paddingTop: 16 }}>
        {meta.bullets.map((b) => (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.brand, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#6B7280" }}>{b}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, fontSize: 11, color: "#4B5563", fontStyle: "italic" }}>
        {hasResults ? "Available in the full product after analysis." : "Draw a polygon first to run an analysis."}
      </div>
    </div>
  );
}

function AnalysisIdle() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 24px", textAlign: "center",
    }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <MapPin size={24} color="#6B7280" />
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Draw to Analyze</h3>
      <p style={{ fontSize: 13, color: "#9CA3AF", maxWidth: 220, lineHeight: 1.5 }}>
        Draw a polygon on the map to get an instant GO/NO-GO verdict with analysis
      </p>
    </div>
  );
}

function AnalysisLoading({ stepIndex }: { stepIndex: number }) {
  const rows = [
    "Fetching USGS groundwater...",
    "Loading USDA soil data...",
    "Resolving zoning records...",
    "Modeling elevation risk...",
    "Generating verdict...",
  ];
  return (
    <div>
      <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginBottom: 20 }}>Pulling live data…</div>
      {rows.map((r, i) => {
        if (i > stepIndex) return null;
        const done = i < stepIndex;
        return (
          <div key={r} className="gz-fade-up" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: C.muted }}>{r}</span>
              {done && (
                <span style={{ fontSize: 10, color: C.green }}>✓</span>
              )}
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", position: "relative" }}>
              {done ? (
                <div style={{ height: "100%", width: "100%", background: C.green }} />
              ) : (
                <div style={{ height: "100%", width: "40%", background: C.brand, animation: "gz-slide 1s ease-in-out infinite alternate" }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnalysisResults({ verdict, confidence }: { verdict: Verdict; confidence: number }) {
  const vColor = verdict === "GO" ? "#22C55E" : verdict === "CONDITIONAL" ? "#F59E0B" : "#EF4444";
  const vBg    = verdict === "GO" ? "#052E16"  : verdict === "CONDITIONAL" ? "#1C1409"  : "#1C0A0A";
  const vIcon  = verdict === "GO"
    ? <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    : verdict === "CONDITIONAL"
    ? <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    : <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;

  const summaryRows = verdict === "GO" ? [
    { color: "#F97316", label: "DECISION",           icon: "◎", text: "32.9% risk-adjusted ROI with 77/100 feasibility score under B-1 zoning. 1,273 sqm buildable area at $4.5M total cost." },
    { color: "#22C55E", label: "KEY STRENGTH",       icon: "⚡", text: "$4.5M development cost against $6.9M projected revenue yields 32.9% ROI, exceeding the 12% hurdle rate." },
    { color: "#EF4444", label: "PRIMARY RISK",        icon: "△",  text: "Groundwater at 8m depth requires enhanced foundation engineering. Geotechnical boring recommended." },
    { color: "#3B82F6", label: "RECOMMENDED ACTION", icon: "→",  text: "Commission geotechnical boring ($3,000-$8,000). File building permit under B-1. 6-8 week timeline." },
  ] : verdict === "CONDITIONAL" ? [
    { color: "#F97316", label: "DECISION",           icon: "◎", text: "11.5% risk-adjusted ROI marginally viable under current zoning. Conditions must be met before proceeding." },
    { color: "#22C55E", label: "KEY STRENGTH",       icon: "⚡", text: "Site permits 2 floors under R-1 zoning with 67,857 ft² buildable area. Strong soil stability at 75/100." },
    { color: "#EF4444", label: "PRIMARY RISK",        icon: "△",  text: "Groundwater at 8m depth with MODERATE risk. Enhanced foundation engineering required before capital commitment." },
    { color: "#3B82F6", label: "RECOMMENDED ACTION", icon: "→",  text: "Commission geotechnical boring. Consider phased development to reduce upfront capital by ~40%." },
  ] : [
    { color: "#F97316", label: "DECISION",           icon: "◎", text: "ROI below minimum threshold. Zoning restrictions and environmental constraints make development infeasible at current costs." },
    { color: "#22C55E", label: "KEY STRENGTH",       icon: "⚡", text: "Location has good access and road frontage. Potential for rezoning application if long-term hold is viable." },
    { color: "#EF4444", label: "PRIMARY RISK",        icon: "△",  text: "Flood zone designation (AE) and high groundwater depth present significant development risk. Site not recommended." },
    { color: "#3B82F6", label: "RECOMMENDED ACTION", icon: "→",  text: "Do not proceed without rezoning and flood mitigation engineering study. Consider alternative sites." },
  ];

  return (
    <div className="gz-fade-up" style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Verdict card */}
      <div style={{ background: vBg, border: `2px solid ${vColor}`, borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Final Verdict</span>
          <span style={{ background: vColor, color: verdict === "NO-GO" ? "#fff" : "#000", fontWeight: 900, fontSize: 11, padding: "3px 12px", borderRadius: 4 }}>{verdict}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flexShrink: 0 }}>{vIcon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#6B7280", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4 }}>Confidence Score</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 10, borderRadius: 999, background: "#0A0A0A", overflow: "hidden" }}>
                <div style={{ width: `${confidence}%`, height: "100%", background: vColor, transition: "width 0.8s ease-out" }} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", minWidth: 38, textAlign: "right" }}>{confidence}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, fontSize: 8, color: "#6B7280" }}>
              <span>Low</span><span>Medium</span><span>High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Executive Summary</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {summaryRows.map((row) => (
            <div key={row.label} style={{ background: "#1A1A1A", borderLeft: `4px solid ${row.color}`, borderRadius: "0 6px 6px 0", padding: "7px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <span style={{ fontSize: 9, color: row.color }}>{row.icon}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: row.color, letterSpacing: "0.1em" }}>{row.label}</span>
              </div>
              <p style={{ fontSize: 10, color: "#fff", lineHeight: 1.45, margin: 0 }}>{row.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Financial Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {[
            { label: "Total Cost",           value: verdict === "GO" ? "$4.5M" : verdict === "CONDITIONAL" ? "$28.9M" : "$12.1M", iconBg: "rgba(249,115,22,0.2)", iconColor: "#F97316" },
            { label: "Net Revenue",          value: verdict === "GO" ? "$6.9M" : verdict === "CONDITIONAL" ? "$34.2M" : "$9.8M",  iconBg: "rgba(16,185,129,0.2)",  iconColor: "#10B981" },
            { label: "Risk-Adj. Profit",     value: verdict === "GO" ? "$2.4M" : verdict === "CONDITIONAL" ? "$5.4M"  : "-$2.3M", iconBg: "rgba(34,197,94,0.2)",   iconColor: verdict === "NO-GO" ? "#EF4444" : "#22C55E" },
            { label: "Risk-Adj. ROI",        value: verdict === "GO" ? "32.9%" : verdict === "CONDITIONAL" ? "11.5%" : "-4.2%",   iconBg: "rgba(16,185,129,0.2)",  iconColor: "#10B981",
              badge: verdict === "GO" ? "A-Grade" : verdict === "CONDITIONAL" ? "B+ (Good)" : "F" },
          ].map((f) => (
            <div key={f.label} style={{ background: "#1A1A1A", borderRadius: 7, padding: "9px 11px", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: f.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, color: f.iconColor, fontWeight: 700 }}>$</div>
              <div>
                <div style={{ fontSize: 8, fontWeight: 600, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 2 }}>{f.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: f.iconColor }}>{f.value}</span>
                  {f.badge && <span style={{ fontSize: 8, background: "#1F2A20", color: "#10B981", padding: "1px 4px", borderRadius: 3 }}>{f.badge}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Development Specs */}
      <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Development Specifications</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { label: "Site Area",             value: "16,958 ft²", sub: "0.389 acres" },
            { label: "Buildable Area",        value: "13,566 ft²", sub: "0.311 acres" },
            { label: "Property Type",         value: "Residential", sub: "" },
            { label: "Max Floors / Height",   value: verdict === "CONDITIONAL" ? "2 floors / 10.7m" : "3 floors / 12.5m", sub: "" },
            { label: "Foundation Type",       value: "Reinforced Mat", sub: "Feasibility: 77%" },
            { label: "Construction Timeline", value: "~6 months", sub: verdict === "NO-GO" ? "Risk: HIGH" : "Risk: MODERATE", subColor: verdict === "NO-GO" ? "#EF4444" : "#F59E0B" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 8, fontWeight: 600, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: 9, color: s.subColor || "#9CA3AF", marginTop: 1 }}>{s.sub}</div>}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ---------------- Data sources ---------------- */
function DataSources() {
  const items = [
    { t: "USGS", d: "Groundwater levels, hydrology, water table depth across the NJ." },
    { t: "USDA", d: "Soil composition, stability scores, bearing capacity from the SSURGO database." },
    { t: "NOAA / SRTM", d: "Elevation, slope, flood exposure, and topographic risk modeling." },
    { t: "Municipal Zoning", d: "Live zoning records, FAR, setback rules, permitted use, and overlays." },
  ];
  return (
    <Section id="data" eyebrow="data sources" title="Built on the ground truth." sub="Every verdict is traceable to a public, authoritative source.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 48 }}>
        {items.map((i) => (
          <div key={i.t} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{i.t}</div>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: C.muted }}>{i.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Press / About ---------------- */
function Press() {
  return (
    <Section id="about" eyebrow="traction" title="Built for developers, investors, and brokers." sub="Geozane is currently live in New Jersey, with rapid screening replacing weeks of consultant work.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 48 }}>
        {[
          { k: "60s", v: "Time to verdict" },
          { k: "~6 wk", v: "Typical pilot length" },
          { k: "5+", v: "Data layers screened" },
          { k: "NJ", v: "Current coverage" },
        ].map((s) => (
          <div key={s.v} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontFamily: C.serif, fontSize: 40, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>{s.k}</div>
            <div style={{ fontSize: 12, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 12 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- CTA ---------------- */
function CTA() {
  return <CTASection />;
}

/* ---------------- New CTA Section ---------------- */
type FormState = {
  name: string; email: string; company: string; role: string; message: string;
};
const INITIAL_FORM: FormState = { name: "", email: "", company: "", role: "", message: "" };

function CTASection() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mailtoHref, setMailtoHref] = useState("");

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    setMailtoHref("");

    const payload: LeadInput = form;

    try {
      await submitLead(payload);
      setStatus("success");
    } catch (err) {
      console.error(err);

      if (err instanceof LeadValidationError) {
        setErrorMsg(err.message);
      } else {
        // Supabase insert failed (network, RLS, or the `leads` migration has
        // not been applied yet). Offer the email fallback rather than pretend
        // the submission went through.
        setErrorMsg(
          `We couldn't save your details just now. Use the email link below and we'll pick it up from there.`,
        );
        setMailtoHref(buildLeadMailto(payload, SITE.contactEmail));
      }

      setStatus("error");
    }
  };

  return (
    <section id="get-started" style={{ padding: "120px 10vw", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: C.mono, fontSize: 11, color: C.dimmer, letterSpacing: "0.15em" }}>GET STARTED</div>
        <h2 style={{
          marginTop: 12, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700,
          fontFamily: C.serif, letterSpacing: "-0.02em", lineHeight: 1.1, color: C.text,
        }}>Find out if your next site is worth it.</h2>
        <p style={{
          marginTop: 16, fontSize: 18, color: C.muted,
          maxWidth: 520, margin: "16px auto 0", lineHeight: 1.6,
        }}>
          Built for developers, investors, and brokers
        </p>
      </div>

      <div className="gz-cta-grid" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        maxWidth: 900,
        margin: "64px auto 0",
      }}>
        {/* LEFT: Form */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.brand}`,
          borderRadius: 12,
          padding: 36,
        }}>
          <Mail size={24} color={C.green} />
          <div style={{ marginTop: 12, fontSize: 22, fontWeight: 700, color: C.text }}>Stay in the loop</div>
          <p style={{ marginTop: 8, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
            Get early access updates, product launches, and acquisition intelligence insights. No spam.
          </p>

          {status === "success" ? (
            <div style={{
              marginTop: 28, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px 0",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(34,197,94,0.1)", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <Check size={20} color={C.green} />
              </div>
              <div style={{ marginTop: 14, fontSize: 22, fontWeight: 700, color: C.text }}>You're on the list.</div>
              <p style={{ marginTop: 6, fontSize: 14, color: C.muted }}>
                We'll be in touch within 24 hours with next steps.
              </p>
              <p style={{ marginTop: 16, fontSize: 13, color: C.dimmer, fontStyle: "italic" }}>The Geozane Team</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
              <CTAInput name="name" placeholder="Full name" value={form.name} onChange={update("name")} required maxLength={100} />
              <CTAInput name="email" type="email" placeholder="Work email" value={form.email} onChange={update("email")} required maxLength={254} />
              <CTAInput name="company" placeholder="Company (optional)" value={form.company} onChange={update("company")} maxLength={120} />
              <CTASelect value={form.role} onChange={update("role")} />
              <CTATextarea value={form.message} onChange={update("message")} maxLength={2000} />
              {status === "error" && (
                <div style={{ fontSize: 13, color: C.red }}>
                  {errorMsg}
                  {mailtoHref && (
                    <>
                      {" "}
                      <a href={mailtoHref} style={{ color: C.brand, textDecoration: "underline" }}>
                        Email {SITE.contactEmail}
                      </a>
                    </>
                  )}
                </div>
              )}
              <button type="submit" disabled={status === "submitting"} style={{
                marginTop: 4, width: "100%", background: C.green, color: C.bg,
                fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 8,
                border: "none", cursor: status === "submitting" ? "wait" : "pointer",
                transition: "background 0.15s", opacity: status === "submitting" ? 0.7 : 1,
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#D06010")}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.brand)}
              >
                {status === "submitting" ? "Sending..." : "Get Early Access →"}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT: Calendly */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.amber}`,
          borderRadius: 12,
          padding: 36,
        }}>
          <Calendar size={24} color={C.amber} />
          <div style={{ marginTop: 12, fontSize: 22, fontWeight: 700, color: C.text }}>Book a walkthrough</div>
          <p style={{ marginTop: 8, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
            Schedule a 30-minute call with the Geozane team. We'll run the platform live on a parcel of your choosing.
          </p>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Live parcel analysis on a site you pick",
              "Full walkthrough of the 5-phase pipeline",
              "See GO / NO-GO / CONDITIONAL in real time",
              "Q&A with the founding team",
            ].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: "50%", background: "rgba(34,197,94,0.15)",
                  color: C.green, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 16px",
                  marginTop: 2,
                }}>
                  <Check size={10} />
                </span>
                <span style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "28px 0" }} />

          <CalendlyEmbed url={LINKS.call} />

          <p style={{ marginTop: 12, fontSize: 12, color: C.dimmer, textAlign: "center" }}>
            Prefer email? Reach us at{" "}
            <a href={`mailto:${SITE.contactEmail}`} style={{ color: C.green, textDecoration: "none" }}>
              {SITE.contactEmail}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function CTAInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(240,130,40,0.4)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
      style={{
        background: "#080B0E",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "12px 16px",
        color: C.text,
        fontSize: 14,
        width: "100%",
        outline: "none",
        fontFamily: "inherit",
      }}
    />
  );
}

function CTASelect({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <select
      name="role"
      value={value}
      onChange={onChange}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(240,130,40,0.4)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
      style={{
        background: "#080B0E",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "12px 40px 12px 16px",
        color: value ? C.text : "#334155",
        fontSize: 14,
        width: "100%",
        outline: "none",
        fontFamily: "inherit",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='none' stroke='%23F08228' stroke-width='2' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 16px center",
      }}
    >
      <option value="" disabled>Your role</option>
      <option value="Developer / Builder">Developer / Builder</option>
      <option value="Investor / LP">Investor / LP</option>
      <option value="Broker / Agent">Broker / Agent</option>
      <option value="Other">Other</option>
    </select>
  );
}

function CTATextarea({ value, onChange, maxLength }: { value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; maxLength?: number }) {
  return (
    <textarea
      name="message"
      rows={3}
      maxLength={maxLength}
      placeholder="What are you building or acquiring? (optional)"
      value={value}
      onChange={onChange}
      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(240,130,40,0.4)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
      style={{
        background: "#080B0E",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "12px 16px",
        color: C.text,
        fontSize: 14,
        width: "100%",
        outline: "none",
        fontFamily: "inherit",
        resize: "vertical",
      }}
    />
  );
}

function CalendlyEmbed({ url }: { url: string }) {
  const src = `${url}?embed_domain=geozane.com&embed_type=Inline&hide_event_type_details=0&hide_gdpr_banner=1&background_color=080b0e&text_color=f8fafc&primary_color=f08228`;
  return (
    <div className="gz-calendly-wrap" style={{
      background: "#080B0E",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
      overflow: "hidden",
      height: 620,
    }}>
      <iframe
        src={src}
        title="Schedule a Geozane walkthrough"
        width="100%"
        height="100%"
        frameBorder={0}
        style={{ display: "block", border: 0 }}
      />
    </div>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "40px 24px", marginTop: 40 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 5, height: 5, background: C.brand, transform: "rotate(45deg)", display: "inline-block" }} />
          <span style={{ color: C.text, fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>Geozane</span>
          <span style={{ color: C.dimmer, fontSize: 12, marginLeft: 8 }}>© {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {[["About","#about"],["Features","#how"],["Data","#data"]].map(([l,h]) => (
            <a key={l} href={h} style={{ color: C.muted, fontSize: 13, textDecoration: "none" }}>{l}</a>
          ))}
          <Link to="/team" style={{ color: C.muted, fontSize: 13, textDecoration: "none" }}>Team</Link>
          <Link to="/pilot" style={{ color: C.muted, fontSize: 13, textDecoration: "none" }}>Pilot</Link>
          <Link to="/book" style={{ color: C.muted, fontSize: 13, textDecoration: "none" }}>Book a Call</Link>
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" style={{ color: C.muted }}>
            <Linkedin size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Section wrapper ---------------- */
function Section({ id, eyebrow, title, sub, children }: {
  id?: string; eyebrow?: string; title?: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ padding: "96px 24px", maxWidth: 1280, margin: "0 auto" }}>
      {eyebrow && (
        <div style={{
          fontSize: 12, color: C.muted, fontStyle: "italic",
          textAlign: "center", letterSpacing: "0.01em",
        }}>{eyebrow}</div>
      )}
      {title && (
        <h2 style={{
          marginTop: 12, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700,
          fontFamily: C.serif, letterSpacing: "-0.02em", lineHeight: 1.1, color: C.text, textAlign: "center",
        }}>{title}</h2>
      )}
      {sub && (
        <p style={{
          marginTop: 16, fontSize: 18, color: C.muted, textAlign: "center",
          maxWidth: 640, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6,
        }}>{sub}</p>
      )}
      {children}
    </section>
  );
}
