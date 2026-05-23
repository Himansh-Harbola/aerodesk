import { SearchPanel } from "@/components/search-panel";
import { FlightResults } from "@/components/flight-results";
import { getFlights } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const origin = typeof params.origin === "string" ? params.origin : "";
  const destination = typeof params.destination === "string" ? params.destination : "";
  const date = typeof params.date === "string" ? params.date : "";
  const passengers = typeof params.passengers === "string" ? Number(params.passengers) : 1;
  const flights = await getFlights({ origin, destination, date });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Flight desk</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Search, select seats, and manage trips in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Built for the assignment requirements: live availability, persisted booking progress, Supabase-backed booking RPCs,
            and mobile-first trip management.
          </p>
          <SearchPanel initial={{ origin, destination, date, passengers: String(passengers || 1) }} />
        </div>
        <FlightResults flights={flights} passengers={passengers || 1} />
      </section>
    </main>
  );
}
