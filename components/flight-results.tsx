"use client";

import Link from "next/link";
import { ArrowRight, Clock, Plane } from "lucide-react";
import type { Flight } from "@/lib/types";
import { dateTime, duration, money } from "@/lib/format";
import { useFlightStore } from "@/stores/flight-store";

export function FlightResults({ flights, passengers }: { flights: Flight[]; passengers: number }) {
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Matching flights</h2>
          <p className="text-sm text-slate-500">{flights.length} options for {passengers} passenger{passengers === 1 ? "" : "s"}</p>
        </div>
        <Plane className="text-[var(--primary)]" />
      </div>
      <div className="mt-4 grid gap-3">
        {flights.length === 0 ? (
          <p className="rounded-md bg-slate-50 p-4 text-slate-600">No flights found. Try Delhi to Mumbai or Mumbai to Bengaluru in demo mode.</p>
        ) : (
          flights.map((flight) => (
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
    </section>
  );
}
