import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setIsCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setIsCheckingSession(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const authAction =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName.trim() || null,
                company: company.trim() || null,
                role: role.trim() || null,
              },
            },
          });

    const { error } = await authAction;

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setMessage(
      mode === "login"
        ? "Logged in successfully."
        : "Account created. Check your email if confirmation is enabled.",
    );

    setIsSubmitting(false);
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-white/60">Checking session...</p>
      </div>
    );
  }

  // Successful sign-in / sign-up fires onAuthStateChange above, which sets
  // `session` and lands the user on the protected product at /app.
  // (`/` is now the public Geozane landing page.)
  if (session) {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(249,115,22,0.16),transparent_28%),linear-gradient(135deg,#050505,#080808_45%,#020202)]" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_0.82fr]">
        <section className="hidden items-center justify-center px-16 lg:flex">
          <div className="w-full max-w-2xl">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.32em] text-orange-400">
                TerraZone private pilot
              </p>

              <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight tracking-[-0.04em] text-white">
                Screen a parcel before the site visit.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-white/55">
                Access is limited while we test parcel analysis, report generation,
                and feedback loops with early users.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#080808]/80 p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                    Pilot workspace
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Princeton, NJ sample parcel
                  </p>
                </div>

                <span className="rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
                  Protected
                </span>
              </div>

              <div className="relative h-72 overflow-hidden rounded-2xl border border-white/10 bg-black">
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

                <div className="absolute left-14 top-14 h-28 w-40 rotate-[-8deg] rounded-xl border-2 border-orange-400 bg-orange-500/25 shadow-[0_0_40px_rgba(249,115,22,0.25)]" />

                <div className="absolute left-10 top-28 h-1 w-64 rotate-[-12deg] bg-white/10" />
                <div className="absolute left-24 top-10 h-52 w-1 rotate-[24deg] bg-white/10" />
                <div className="absolute right-16 top-20 h-44 w-1 rotate-[-18deg] bg-white/10" />

                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-black/80 p-4 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                        Verdict preview
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        Conditional
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-white/40">Confidence</p>
                      <p className="mt-1 text-2xl font-bold text-orange-400">
                        79%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-xs text-white/35">
              Sign in is required so feedback and report activity can be tied to
              pilot users.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/75 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-orange-400">
                Private access
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
                {mode === "login" ? "Sign in" : "Create account"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/55">
                Sign in to run parcel analysis and submit pilot feedback.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-white/65">Email</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-black outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-white/65">
                  Password
                </span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-black outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  placeholder="••••••••"
                />
              </label>

              {mode === "signup" && (
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <label className="block">
                    <span className="mb-2 block text-sm text-white/65">
                      Full name
                    </span>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-black outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      autoComplete="name"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/65">
                      Company
                    </span>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-black outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                      type="text"
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      placeholder="Company name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/65">Role</span>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-black outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                      type="text"
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                      placeholder="Developer, broker, consultant..."
                    />
                  </label>
                </div>
              )}

              {message && (
                <p className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/70">
                  {message}
                </p>
              )}

              <button
                className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <button
              className="mt-6 text-sm text-white/55 transition hover:text-white"
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setMessage("");
              }}
            >
              {mode === "login"
                ? "Need pilot access? Create an account"
                : "Already have access? Sign in"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}