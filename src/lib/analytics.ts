import { supabase } from "@/integrations/supabase/client";

type AnalyticsProperties = Record<string, unknown>;

type LogEventInput = {
  eventName: string;
  userId?: string | null;
  parcelId?: string | null;
  reportId?: string | null;
  properties?: AnalyticsProperties;
};

type AnalyticsEventInsert = {
  event_name: string;
  user_id: string | null;
  parcel_id: string | null;
  report_id: string | null;
  properties: AnalyticsProperties;
  created_at: string;
};

type AnalyticsClient = {
  from: (table: "analytics_events") => {
    insert: (payload: AnalyticsEventInsert) => Promise<{ error: unknown }>;
  };
};

export async function logEvent({
  eventName,
  userId = null,
  parcelId = null,
  reportId = null,
  properties = {},
}: LogEventInput) {
  try {
    const analyticsClient = supabase as unknown as AnalyticsClient;

    const { error } = await analyticsClient.from("analytics_events").insert({
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