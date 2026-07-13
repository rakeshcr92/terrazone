import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

export default function Login() {
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        : supabase.auth.signUp({ email, password });

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-white/70">Checking session...</p>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
            TerraZone Pilot Access
          </p>
          <h1 className="mt-3 text-3xl font-bold">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Secure access for pilot users before running parcel analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Email</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@company.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Password</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
            />
          </label>

          {message && (
            <p className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
              {message}
            </p>
          )}

          <button
            className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
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
          className="mt-6 text-sm text-white/60 hover:text-white"
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
      </section>
    </main>
  );
}
