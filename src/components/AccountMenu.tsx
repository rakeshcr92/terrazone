import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Home, LogOut, Shield, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function AccountMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const email = user?.email ?? "Pilot user";
  const initials = email.slice(0, 1).toUpperCase();

  return (
  <div className="relative z-50">
    <button
      type="button"
      onClick={() => setIsOpen((current) => !current)}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/80 text-sm text-white shadow-xl backdrop-blur transition hover:border-orange-400/50 hover:bg-black"
      aria-label="Open account menu"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-black">
        {initials}
      </span>
    </button>

    {isOpen && (
      <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/10 bg-[#070707]/95 p-3 text-white shadow-2xl backdrop-blur">
        <div className="border-b border-white/10 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-orange-400">
            Account
          </p>
          <p className="mt-2 truncate text-sm text-white/80">{email}</p>
        </div>

        <button
          type="button"
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/60"
          disabled
        >
          <UserCircle className="h-4 w-4" />
          Profile coming next
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/60"
          disabled
        >
          <Shield className="h-4 w-4" />
          Security / MFA coming next
        </button>

        {/* Explicit route back to the public site. Signing out is not the only
            reason to leave the product. */}
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="mt-2 flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-left text-sm text-white/80 transition hover:bg-white/5"
        >
          <Home className="h-4 w-4" />
          Back to Geozane home
        </Link>

        <button
          type="button"
          onClick={() => void supabase.auth.signOut()}
          className="mt-2 flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-left text-sm text-red-200 transition hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    )}
  </div>
);
}