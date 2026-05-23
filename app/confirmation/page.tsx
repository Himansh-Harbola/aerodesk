import Link from "next/link";
import { CheckCircle2, Plane, TicketCheck } from "lucide-react";
import { getFlightById, getSeatById } from "@/lib/data";
import { dateTime, money } from "@/lib/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ConfirmationPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const pnr = typeof params.pnr === "string" ? params.pnr : "";
  const flightId = typeof params.flightId === "string" ? params.flightId : "";
  const seatId = typeof params.seatId === "string" ? params.seatId : "";
  const total = typeof params.total === "string" ? Number(params.total) : 0;
  const [flight, seat] = await Promise.all([flightId ? getFlightById(flightId) : null, seatId ? getSeatById(seatId) : null]);

  return (
    <main className="mx-auto grid min-h-[80vh] max-w-3xl place-items-center px-4 py-8">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 text-emerald-600" size={34} />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Booking confirmed</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">PNR {pnr || "Confirmed"}</h1>
            <p className="mt-2 text-slate-600">Your seat assignment and flight details are ready.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Flight</p>
            <p className="mt-1 font-semibold text-slate-950">{flight ? `${flight.flight_no} · ${flight.aircraft_type}` : "Flight details unavailable"}</p>
            {flight ? (
              <p className="mt-1 text-sm text-slate-600">
                {flight.origin} to {flight.destination}
              </p>
            ) : null}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seat</p>
            <p className="mt-1 font-semibold text-slate-950">{seat ? `${seat.seat_number} · ${seat.class}` : "Seat assigned"}</p>
            <p className="mt-1 text-sm text-slate-600">Total {money(total || flight?.base_price || 0)}</p>
          </div>
          {flight ? (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule</p>
              <p className="mt-1 text-sm text-slate-700">{dateTime(flight.departs_at)} to {dateTime(flight.arrives_at)}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 font-semibold text-white" href="/bookings">
            <TicketCheck size={18} />
            My Bookings
          </Link>
          <Link className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700" href="/search">
            <Plane size={18} />
            Search another flight
          </Link>
        </div>
      </section>
    </main>
  );
}
