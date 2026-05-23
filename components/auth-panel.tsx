"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/user-store";

export function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const setSessionToken = useUserStore((state) => state.setSessionToken);

  function submit() {
    startTransition(async () => {
      const supabase = createClient();
      if (!supabase) {
        setMessage("Add Supabase env vars before using real authentication.");
        return;
      }

      const { data, error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo:
                  typeof window === "undefined"
                    ? undefined
                    : `${window.location.origin}${searchParams.get("next") ?? "/search"}`,
              },
            });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (mode === "signup" && !data.session) {
        setMessage("Account created. Check your email to confirm it, then sign in.");
        setMode("signin");
        return;
      }

      setSessionToken(data.session?.access_token ?? null);
      setMessage(mode === "signin" ? "Signed in successfully." : "Account created successfully.");
      router.push(searchParams.get("next") ?? "/search");
      router.refresh();
    });
  }

  return (
    <section className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-950">{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {mode === "signin"
          ? "Use your Supabase Auth account to book and manage flights."
          : "Create a Supabase Auth account before confirming your booking."}
      </p>
      <div className="mt-5 grid grid-cols-2 rounded-md border border-slate-200 bg-slate-50 p-1">
        <button
          className={`rounded px-3 py-2 text-sm font-semibold ${mode === "signin" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}
          onClick={() => {
            setMode("signin");
            setMessage(null);
          }}
          type="button"
        >
          Sign in
        </button>
        <button
          className={`rounded px-3 py-2 text-sm font-semibold ${mode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}
          onClick={() => {
            setMode("signup");
            setMessage(null);
          }}
          type="button"
        >
          Sign up
        </button>
      </div>
      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email
          <input className="focus-ring rounded-md border border-slate-300 px-3 py-2" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Password
          <input className="focus-ring rounded-md border border-slate-300 px-3 py-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
      </div>
      <button disabled={isPending} onClick={submit} className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-3 font-semibold text-white">
        {mode === "signin" ? <LogIn size={18} /> : <UserPlus size={18} />}
        {isPending ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
      </button>
      {message ? <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}
