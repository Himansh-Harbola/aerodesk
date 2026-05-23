import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="mx-auto grid min-h-[80vh] max-w-2xl place-items-center px-4 text-center">
      <section>
        <WifiOff className="mx-auto mb-4 text-[var(--primary)]" size={44} />
        <h1 className="text-3xl font-semibold text-slate-950">You are offline</h1>
        <p className="mt-3 text-slate-600">
          Flight search needs a connection, but your last cached bookings can still be opened from My Bookings.
        </p>
        <Link className="mt-6 inline-flex rounded-md bg-[var(--primary)] px-4 py-2 font-semibold text-white" href="/bookings">
          View cached bookings
        </Link>
      </section>
    </main>
  );
}
