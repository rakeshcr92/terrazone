import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { logEvent } from "@/lib/analytics";

type PilotFeedbackProps = {
  verdict?: string | null;
  confidenceScore?: number | null;
  siteArea?: number | null;
  activeTab?: string;
};

export function PilotFeedback({
  verdict = null,
  confidenceScore = null,
  siteArea = null,
  activeTab = "decision",
}: PilotFeedbackProps) {
  const [usefulnessRating, setUsefulnessRating] = useState<number | null>(null);
  const [trustRating, setTrustRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");

  async function handleSubmit() {
    if (!usefulnessRating || !trustRating) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    await logEvent({
      eventName: "feedback_submitted",
      properties: {
        usefulness_rating: usefulnessRating,
        trust_rating: trustRating,
        comment: comment.trim() || null,
        verdict,
        confidence_score: confidenceScore,
        site_area: siteArea,
        active_tab: activeTab,
      },
    });

    setStatus("submitted");
  }

  if (status === "submitted") {
    return (
      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <p className="text-sm font-semibold text-emerald-300">Feedback submitted</p>
        <p className="mt-1 text-sm text-white/55">
          Thanks — this is now logged with your pilot activity.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
          <MessageSquare className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Pilot feedback</h3>
          <p className="mt-1 text-sm text-white/50">
            Help us understand whether this result is useful enough for real screening.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <RatingRow
          label="How useful was this result?"
          value={usefulnessRating}
          onChange={setUsefulnessRating}
        />

        <RatingRow
          label="How much do you trust this result?"
          value={trustRating}
          onChange={setTrustRating}
        />

        <label className="block">
          <span className="mb-2 block text-sm text-white/65">
            What felt missing, wrong, or confusing?
          </span>
          <textarea
            className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-orange-400"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Example: zoning source was unclear, groundwater risk needs citation..."
          />
        </label>

        {status === "error" && (
          <p className="text-sm text-red-300">
            Please add both ratings before submitting.
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={status === "submitting"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {status === "submitting" ? "Submitting..." : "Submit feedback"}
        </button>
      </div>
    </section>
  );
}

type RatingRowProps = {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
};

function RatingRow({ label, value, onChange }: RatingRowProps) {
  return (
    <div>
      <p className="mb-2 text-sm text-white/65">{label}</p>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`flex h-11 items-center justify-center rounded-xl border text-sm font-semibold transition ${
              value === rating
                ? "border-orange-400 bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.25)]"
                : "border-white/10 bg-black/40 text-white/60 hover:border-orange-400/50 hover:text-white"
            }`}
            aria-label={`${label} ${rating}`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-white/35">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}