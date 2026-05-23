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
    <main>
      <section className="bg-[#051f3b] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">Flight search</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            Compare fares, choose seats, and book in minutes.
          </h1>
          <SearchPanel initial={{ origin, destination, date, passengers: String(passengers || 1) }} />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <FlightResults flights={flights} passengers={passengers || 1} />
      </section>
    </main>
  );
}
