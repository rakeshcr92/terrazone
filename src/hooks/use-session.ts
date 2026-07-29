import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Shared Supabase session subscription.
 *
 * The getSession() + onAuthStateChange() pair was duplicated in Login,
 * ProtectedRoute and AccountMenu. The public marketing pages need it too (so
 * the nav can offer "Open App" instead of "Login" to a signed-in visitor),
 * so it lives here once.
 *
 * `isLoading` is true only until the first resolution, which lets callers
 * avoid flashing the signed-out state to a user who is actually signed in.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, isLoading };
}
