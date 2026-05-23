"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, TicketCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useFlightStore } from "@/stores/flight-store";
import { useUserStore } from "@/stores/user-store";

export function AuthNav() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const setSessionToken = useUserStore((state) => state.setSessionToken);
  const resetUser = useUserStore((state) => state.resetUser);
  const resetBooking = useFlightStore((state) => state.resetBooking);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(Boolean(data.session));
      setSessionToken(data.session?.access_token ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
      setSessionToken(session?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setSessionToken]);

  function logout() {
    startTransition(async () => {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      resetUser();
      resetBooking();
      setIsLoggedIn(false);
      router.push("/search");
      router.refresh();
    });
  }

  if (isLoggedIn) {
    return (
      <>
        <Link className="hidden rounded-md bg-slate-950 px-3 py-2 text-white sm:inline-flex" href="/bookings">
          <TicketCheck size={16} />
          <span className="ml-2">Manage</span>
        </Link>
        <button
          className="focus-ring inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          disabled={isPending}
          onClick={logout}
          type="button"
        >
          <LogOut size={16} />
          <span className="ml-2">{isPending ? "Logging out..." : "Logout"}</span>
        </button>
      </>
    );
  }

  return (
    <Link className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100" href="/auth">
      <LogIn size={16} />
      <span className="ml-2">Login</span>
    </Link>
  );
}
