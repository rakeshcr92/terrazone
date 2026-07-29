// Site configuration for the public Geozane marketing pages.
//
// Ported from the standalone landing-page repo (geozane-ai-env-map).
// Only client-safe values live here. The original repo also documented
// Google Apps Script / EmailJS secrets that were read by a TanStack Start
// server function; TerraZone is a client-only SPA and has no server runtime,
// so those integrations are NOT ported. Lead capture now writes directly to
// the Supabase `leads` table instead (see src/lib/lead-submit.ts).

export const SITE = {
  calendly: "https://calendly.com/123udayaraja/30min",
  contactEmail: "hello@geozane.com",
};

/** External links used across the public marketing pages. */
export const SITE_LINKS = {
  youtube: "https://www.youtube.com/watch?v=zlquYUPCopI",
  linkedin: "https://www.linkedin.com/company/geozane/",
  github: "https://github.com/geozane",
};
