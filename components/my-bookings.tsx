"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CalendarClock, Check, RotateCcw, X, XCircle } from "lucide-react";
import { cancelBooking, rescheduleBooking } from "@/lib/actions";
import type { BookingWithRelations, Flight } from "@/lib/types";
import { dateTime, money } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { useFlightStore } from "@/stores/flight-store";
import { useUserStore } from "@/stores/user-store";

export function MyBookings({
  initialBookings,
  flights,
}: {
  initialBookings: BookingWithRelations[];
  flights: Flight[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [message, setMessage] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<BookingWithRelations | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [pendingRescheduleFlight, setPendingRescheduleFlight] = useState<Flight | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingWithRelations | null>(null);
  const [currentTime] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
  const cachedBookings = useUserStore((state) => state.cachedBookings);
  const setCachedBookings = useUserStore((state) => state.setCachedBookings);
  const resetBooking = useFlightStore((state) => state.resetBooking);
  const visibleBookings = bookings.length > 0 ? bookings : cachedBookings;
  const sameRouteFlights = useMemo(
    () =>
      rescheduleTarget
        ? flights.filter(
            (flight) =>
              flight.id !== rescheduleTarget.flight_id &&
              flight.origin === rescheduleTarget.flights.origin &&
              flight.destination === rescheduleTarget.flights.destination &&
              flight.status !== "cancelled",
          )
        : [],
    [flights, rescheduleTarget],
  );
  const alternatives = useMemo(
    () =>
      sameRouteFlights.filter(
        (flight) =>
          (!rescheduleDate || flight.departs_at.startsWith(rescheduleDate)) &&
          new Date(flight.departs_at).getTime() > currentTime,
      ),
    [currentTime, rescheduleDate, sameRouteFlights],
  );

  useEffect(() => {
    if (initialBookings.length > 0) {
      setCachedBookings(initialBookings);
    }
  }, [initialBookings, setCachedBookings]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const browserClient = supabase;

    let cancelled = false;

    async function loadBookings() {
      const { data, error } = await browserClient
        .from("bookings")
        .select("*, flights(*), seats(*), passengers(full_name, passport_no, nationality, dob)")
        .order("booked_at", { ascending: false });

      if (cancelled || error || !data) return;

      const nextBookings = data as BookingWithRelations[];
      setBookings(nextBookings);
      if (nextBookings.length > 0) {
        setCachedBookings(nextBookings);
      }
    }

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [setCachedBookings]);

  function cancel(id: string) {
    startTransition(async () => {
      const supabase = createClient();
      const response = supabase
        ? await cancelBookingFromBrowser(supabase, id)
        : await cancelBooking(id);

      setMessage(response.message);
      if (response.ok) {
        resetBooking();
        setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status: "cancelled" } : booking)));
        setCancelTarget(null);
      }
    });
  }

  function reschedule(booking: BookingWithRelations, newFlight: Flight) {
    startTransition(async () => {
      const supabase = createClient();
      const response = supabase
        ? await rescheduleBookingFromBrowser(supabase, booking.id, newFlight.id)
        : await rescheduleBooking(booking.id, newFlight.id);

      setMessage(response.message);
      if (response.ok) {
        const fee = Math.max(0, newFlight.base_price - booking.flights.base_price);
        setBookings((current) =>
          current.map((item) =>
            item.id === booking.id
              ? {
                  ...item,
                  status: "rescheduled",
                  flight_id: newFlight.id,
                  flights: newFlight,
                  total_price: item.total_price + fee,
                }
              : item,
          ),
        );
        setPendingRescheduleFlight(null);
        setRescheduleTarget(null);
      }
    });
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Trip management</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">My Bookings</h1>
          <p className="mt-2 text-slate-600">Confirmed, rescheduled, and cancelled trips with offline cached visibility.</p>
        </div>
        <CalendarClock className="text-[var(--primary)]" size={36} />
      </div>
      {message ? <p className="mt-4 rounded-md bg-slate-950 px-4 py-3 text-sm text-white">{message}</p> : null}
      <div className="mt-6 grid gap-4">
        {visibleBookings.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600">No bookings yet. Sign in and book a flight to see it here.</p>
        ) : (
          visibleBookings.map((booking) => (
            <article key={booking.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-950">{booking.flights.flight_no} · PNR {booking.pnr_code}</h2>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(booking.status)}`}>{booking.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {booking.flights.origin} to {booking.flights.destination} · {dateTime(booking.flights.departs_at)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Seat {booking.seats.seat_number} · {booking.seats.class} · {money(booking.total_price)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={isPending || booking.status === "cancelled"}
                    onClick={() => {
                      setRescheduleTarget(booking);
                      setRescheduleDate("");
                      setPendingRescheduleFlight(null);
                      setMessage(null);
                    }}
                    className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                    Reschedule
                  </button>
                  <button
                    disabled={isPending || booking.status === "cancelled"}
                    onClick={() => setCancelTarget(booking)}
                    className="focus-ring inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      {rescheduleTarget ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4">
          <section className="max-h-[86vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Choose a new flight</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Same route: {rescheduleTarget.flights.origin} to {rescheduleTarget.flights.destination}. Fee is only charged when the new base fare is higher.
                </p>
              </div>
              <button
                className="focus-ring rounded-md p-2 hover:bg-slate-100"
                onClick={() => {
                  setPendingRescheduleFlight(null);
                  setRescheduleTarget(null);
                }}
                type="button"
                aria-label="Close reschedule dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Preferred travel date
                <input
                  className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2"
                  min={new Date(currentTime).toISOString().slice(0, 10)}
                  onChange={(event) => setRescheduleDate(event.target.value)}
                  type="date"
                  value={rescheduleDate}
                />
              </label>
              <button
                className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                onClick={() => setRescheduleDate("")}
                type="button"
              >
                Show all dates
              </button>
              <p className="text-sm text-slate-500 sm:col-span-2">
                Showing {alternatives.length} available future flight{alternatives.length === 1 ? "" : "s"} from {sameRouteFlights.length} same-route option{sameRouteFlights.length === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="mt-5 grid gap-3">
              {alternatives.length === 0 ? (
                <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                  <p>No available future flights match this route and date.</p>
                  {sameRouteFlights.length > 0 ? (
                    <p className="mt-1">Try clearing the date filter, or seed more future flights for this route.</p>
                  ) : (
                    <p className="mt-1">No same-route alternatives exist in the flights table yet.</p>
                  )}
                </div>
              ) : (
                alternatives.map((flight) => {
                  const fee = Math.max(0, flight.base_price - rescheduleTarget.flights.base_price);
                  const departureDate = new Date(flight.departs_at);
                  return (
                    <article key={flight.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-950">{flight.flight_no}</h3>
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{flight.aircraft_type}</span>
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{flight.status}</span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-800">
                            {departureDate.toLocaleDateString("en-IN", { dateStyle: "full" })}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{dateTime(flight.departs_at)} to {dateTime(flight.arrives_at)}</p>
                          <p className="mt-1 text-sm text-slate-500">Base fare {money(flight.base_price)} · Reschedule fee {money(fee)}</p>
                        </div>
                        <button
                          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          disabled={isPending}
                          onClick={() => setPendingRescheduleFlight(flight)}
                          type="button"
                        >
                          <Check size={16} />
                          Review change
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
            {pendingRescheduleFlight ? (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-slate-950">Confirm reschedule</h3>
                <p className="mt-2 text-sm text-slate-700">
                  Move PNR {rescheduleTarget.pnr_code} from {rescheduleTarget.flights.flight_no} on {dateTime(rescheduleTarget.flights.departs_at)} to {pendingRescheduleFlight.flight_no} on {dateTime(pendingRescheduleFlight.departs_at)}.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Reschedule fee: {money(Math.max(0, pendingRescheduleFlight.base_price - rescheduleTarget.flights.base_price))}
                </p>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    className="focus-ring rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                    onClick={() => setPendingRescheduleFlight(null)}
                    type="button"
                  >
                    Choose another
                  </button>
                  <button
                    className="focus-ring rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    disabled={isPending}
                    onClick={() => reschedule(rescheduleTarget, pendingRescheduleFlight)}
                    type="button"
                  >
                    Confirm reschedule
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
      {cancelTarget ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4">
          <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-950">Cancel booking?</h2>
            <p className="mt-2 text-sm text-slate-600">
              PNR {cancelTarget.pnr_code} will be cancelled and the seat will be released. The database blocks cancellations within 2 hours of departure.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button className="focus-ring rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" onClick={() => setCancelTarget(null)} type="button">
                Keep booking
              </button>
              <button
                className="focus-ring rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={isPending}
                onClick={() => cancel(cancelTarget.id)}
                type="button"
              >
                Cancel booking
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function badgeClass(status: BookingWithRelations["status"]) {
  if (status === "confirmed") return "bg-emerald-50 text-emerald-700";
  if (status === "rescheduled") return "bg-amber-50 text-amber-700";
  return "bg-slate-200 text-slate-700";
}

type BrowserSupabase = NonNullable<ReturnType<typeof createClient>>;

async function cancelBookingFromBrowser(supabase: BrowserSupabase, bookingId: string) {
  const { error } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Booking cancelled." };
}

async function rescheduleBookingFromBrowser(supabase: BrowserSupabase, bookingId: string, newFlightId: string) {
  const { error } = await supabase.rpc("reschedule_booking", {
    p_booking_id: bookingId,
    p_new_flight_id: newFlightId,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Booking rescheduled." };
}
