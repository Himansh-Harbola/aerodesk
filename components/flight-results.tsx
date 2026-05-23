"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Plane } from "lucide-react";
import type { Flight } from "@/lib/types";
import { dateTime, duration, money } from "@/lib/format";
import { useFlightStore } from "@/stores/flight-store";

export function FlightResults({ flights, passengers }: { flights: Flight[]; passengers: number }) {
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);
  const [sort, setSort] = useState<"departure" | "price" | "duration">("departure");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const sortedFlights = useMemo(() => {
    return [...flights].sort((a, b) => {
      if (sort === "price") return a.base_price - b.base_price;
      if (sort === "duration") {
        const aDuration = new Date(a.arrives_at).getTime() - new Date(a.departs_at).getTime();
        const bDuration = new Date(b.arrives_at).getTime() - new Date(b.departs_at).getTime();
        return aDuration - bDuration;
      }
      return new Date(a.departs_at).getTime() - new Date(b.departs_at).getTime();
    });
  }, [flights, sort]);
  const totalPages = Math.max(1, Math.ceil(sortedFlights.length / pageSize));
  const visibleFlights = sortedFlights.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Matching flights</h2>
          <p className="text-sm text-slate-500">{flights.length} options for {passengers} passenger{passengers === 1 ? "" : "s"}</p>
        </div>
        <Plane className="text-[var(--primary)]" />
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Sort by
          <select
            className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2"
            onChange={(event) => {
              setSort(event.target.value as "departure" | "price" | "duration");
              setPage(1);
            }}
            value={sort}
          >
            <option value="departure">Departure time</option>
            <option value="price">Lowest price</option>
            <option value="duration">Shortest duration</option>
          </select>
        </label>
        <p className="text-sm text-slate-500">
          Showing {visibleFlights.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, sortedFlights.length)} of {sortedFlights.length}
        </p>
      </div>
      <div className="mt-4 grid gap-3">
        {flights.length === 0 ? (
          <p className="rounded-md bg-slate-50 p-4 text-slate-600">No flights found. Try Delhi to Mumbai or Mumbai to Bengaluru in demo mode.</p>
        ) : (
          visibleFlights.map((flight) => (
            <article key={flight.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-950">{flight.flight_no}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{flight.status}</span>
                    <span className="text-sm text-slate-500">{flight.aircraft_type}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-700">
                    <strong>{flight.origin}</strong>
                    <ArrowRight size={16} />
                    <strong>{flight.destination}</strong>
                    <span className="inline-flex items-center gap-1 text-slate-500"><Clock size={15} /> {duration(flight)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{dateTime(flight.departs_at)} to {dateTime(flight.arrives_at)}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">
                      Economy {money(flight.base_price)}
                    </span>
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 font-semibold text-sky-800">
                      Business from {money(flight.base_price + 4500)}
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">
                      First from {money(flight.base_price + 9000)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500">from</p>
                    <p className="text-xl font-semibold text-slate-950">{money(flight.base_price)}</p>
                  </div>
                  <Link
                    href={`/book/${flight.id}`}
                    onClick={() => setSelectedFlight(flight)}
                    className="focus-ring rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Select
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      {sortedFlights.length > pageSize ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            className="focus-ring rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
          >
            Previous
          </button>
          <span className="text-sm font-semibold text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            className="focus-ring rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
