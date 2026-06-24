import { supabase } from "@/integrations/supabase/client";

type AnalyticsProperties = Record<string, unknown>;

type LogEventInput = {
  eventName: string;
  userId?: string | null;
  parcelId?: string | null;
  reportId?: string | null;
  properties?: AnalyticsProperties;
};

export async function logEvent({
  eventName,
  userId = null,
  parcelId = null,
  reportId = null,
  properties = {},
}: LogEventInput) {
  try {
    // TODO: Remove `as any` after Supabase types are regenerated with analytics_events.
    const { error } = await (supabase as any).from("analytics_events").insert({
      event_name: eventName,
      user_id: userId,
      parcel_id: parcelId,
      report_id: reportId,
      properties,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[Analytics] Supabase insert error:", error);
    }
  } catch (error) {
    console.error("[Analytics] Failed to log event:", error);
  }
}

export function createTimer() {
  const startTime = Date.now();

  return {
    stop() {
      return Date.now() - startTime;
    },
  };
}