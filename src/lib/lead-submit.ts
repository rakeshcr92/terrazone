import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side replacement for the landing page's TanStack Start server
 * function (`src/lib/lead-submit.functions.ts` in the geozane-ai-env-map repo).
 *
 * WHAT CHANGED AND WHY
 * --------------------
 * The original `submitLead` was a `createServerFn({ method: "POST" })` handler
 * that ran on a Nitro server and did two things with secrets that must never
 * reach the browser:
 *   1. POSTed the lead to a Google Apps Script webhook (GOOGLE_APPS_SCRIPT_URL)
 *   2. Sent a confirmation email through the EmailJS REST API
 *      (EMAILJS_SERVICE_ID / EMAILJS_TEMPLATE_ID / EMAILJS_PUBLIC_KEY /
 *      EMAILJS_PRIVATE_KEY)
 *
 * TerraZone is a static client-only SPA deployed to GitHub Pages. It has no
 * server runtime and no way to hold those secrets, so neither integration was
 * ported. Leads are instead written straight to a Supabase `leads` table,
 * protected by an anon-insert-only RLS policy.
 *
 * CONSEQUENCES YOU SHOULD KNOW ABOUT:
 *   - The `supabase/migrations/20260729_create_leads.sql` migration MUST be
 *     applied to the project before this succeeds in production. Until then
 *     submissions fail and the form surfaces the mailto fallback.
 *   - No confirmation email is sent to the lead any more. If you want that
 *     back, add a Supabase Edge Function (or a DB webhook) that fires on
 *     insert into `leads`.
 *   - Validation is now client-side only and therefore advisory. The DB
 *     constraints in the migration are the real enforcement point.
 */

export type LeadInput = {
  name: string;
  email: string;
  company?: string;
  role?: string;
  message?: string;
};

type LeadRow = {
  name: string;
  email: string;
  company: string;
  role: string;
  message: string;
  source: string;
  created_at: string;
};

/**
 * Mirrors the `stripTags` helper from the original server function so the
 * stored values keep the same shape.
 */
const stripTags = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/[\r\n]+/g, " ")
    .trim();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LeadValidationError extends Error {}

/**
 * Same field limits the original zod schema enforced.
 */
function validate(input: LeadInput): LeadRow {
  const name = stripTags(input.name ?? "").slice(0, 100);
  const email = (input.email ?? "").trim().toLowerCase().slice(0, 254);

  if (!name) {
    throw new LeadValidationError("Name is required");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new LeadValidationError("Please enter a valid email address");
  }

  return {
    name,
    email,
    company: stripTags(input.company ?? "").slice(0, 120),
    role: stripTags(input.role ?? "").slice(0, 60),
    message: stripTags(input.message ?? "").slice(0, 2000),
    source: "website-cta",
    created_at: new Date().toISOString(),
  };
}

/**
 * The generated Supabase types in src/integrations/supabase/types.ts do not
 * include `leads`, so we narrow the client the same way src/lib/analytics.ts
 * does for `analytics_events`.
 */
type LeadsClient = {
  from: (table: "leads") => {
    insert: (payload: LeadRow) => Promise<{ error: { message: string } | null }>;
  };
};

export async function submitLead(input: LeadInput): Promise<void> {
  const row = validate(input);

  const leadsClient = supabase as unknown as LeadsClient;
  const { error } = await leadsClient.from("leads").insert(row);

  if (error) {
    console.error("[submitLead] Supabase insert failed:", error);
    throw new Error(error.message);
  }
}

/**
 * Fallback used by the CTA form when the Supabase insert fails (for example
 * because the migration has not been applied yet). Keeps the user's typed
 * details rather than silently dropping them.
 */
export function buildLeadMailto(input: LeadInput, contactEmail: string): string {
  const body = [
    `Name: ${input.name ?? ""}`,
    `Email: ${input.email ?? ""}`,
    `Company: ${input.company ?? ""}`,
    `Role: ${input.role ?? ""}`,
    "",
    input.message ?? "",
  ].join("\n");

  return `mailto:${contactEmail}?subject=${encodeURIComponent(
    "Geozane early access request",
  )}&body=${encodeURIComponent(body)}`;
}
