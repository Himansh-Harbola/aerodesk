import { Suspense } from "react";
import { AuthPanel } from "@/components/auth-panel";

export default function AuthPage() {
  return (
    <main className="mx-auto grid min-h-[80vh] max-w-lg place-items-center px-4">
      <Suspense fallback={<div className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm">Loading auth...</div>}>
        <AuthPanel />
      </Suspense>
    </main>
  );
}
