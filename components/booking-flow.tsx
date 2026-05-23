"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, UserRound } from "lucide-react";
import { createBooking } from "@/lib/actions";
import type { Flight, PassengerDraft, Seat } from "@/lib/types";
import { dateTime, money } from "@/lib/format";
import { useFlightStore } from "@/stores/flight-store";
import { SeatMap } from "@/components/seat-map";

export function BookingFlow({ flight, seats }: { flight: Flight; seats: Seat[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string; pnr?: string } | null>(null);
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const passenger = useFlightStore((state) => state.passengerForm);
  const selectSeat = useFlightStore((state) => state.selectSeatOptimistically);
  const updatePassenger = useFlightStore((state) => state.updatePassengerForm);
  const resetBooking = useFlightStore((state) => state.resetBooking);
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);

  const activeSeat = selectedSeat?.flight_id === flight.id ? selectedSeat : null;
  const total = useMemo(() => flight.base_price + (activeSeat?.extra_fee ?? 0), [activeSeat, flight.base_price]);

  function submit() {
    if (!activeSeat) {
      setResult({ ok: false, message: "Choose an available seat first." });
      return;
    }
    if (!passenger.full_name || !passenger.passport_no || !passenger.nationality) {
      setResult({ ok: false, message: "Passenger name, passport number, and nationality are required." });
      return;
    }

    const payload: PassengerDraft = { ...passenger };
    startTransition(async () => {
      const response = await createBooking({
        flightId: flight.id,
        seatId: activeSeat.id,
        passenger: payload,
        totalPrice: total,
      });
      setResult(response);
      if (response.ok) {
        resetBooking();
        const params = new URLSearchParams({
          pnr: response.pnr ?? "",
          flightId: flight.id,
          seatId: activeSeat.id,
          total: String(total),
        });
        router.push(`/confirmation?${params.toString()}`);
      }
    });
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Seat selection</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{flight.flight_no}: {flight.origin} to {flight.destination}</h1>
        <p className="mt-2 text-slate-600">{dateTime(flight.departs_at)} · {flight.aircraft_type}</p>
        <div className="mt-5">
          <SeatMap
            flightId={flight.id}
            initialSeats={seats}
            selectedSeatId={activeSeat?.id}
            onSelect={(seat) => {
              setSelectedFlight(flight);
              selectSeat(seat);
              setResult(null);
            }}
          />
        </div>
      </div>
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <UserRound className="text-[var(--primary)]" />
          <h2 className="text-xl font-semibold text-slate-950">Passenger details</h2>
        </div>
        <div className="mt-5 grid gap-4">
          <Field label="Full name" value={passenger.full_name} onChange={(full_name) => updatePassenger({ full_name })} />
          <Field label="Passport number" value={passenger.passport_no} onChange={(passport_no) => updatePassenger({ passport_no })} />
          <Field label="Nationality" value={passenger.nationality} onChange={(nationality) => updatePassenger({ nationality })} />
          <Field label="Date of birth" type="date" value={passenger.dob} onChange={(dob) => updatePassenger({ dob })} />
        </div>
        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <div className="flex justify-between text-sm text-slate-600"><span>Base fare</span><span>{money(flight.base_price)}</span></div>
          <div className="mt-2 flex justify-between text-sm text-slate-600"><span>Seat fee</span><span>{money(activeSeat?.extra_fee ?? 0)}</span></div>
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-lg font-semibold text-slate-950"><span>Total</span><span>{money(total)}</span></div>
        </div>
        <button
          onClick={submit}
          disabled={isPending}
          className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {result?.ok ? <CheckCircle2 size={18} /> : <CreditCard size={18} />}
          {isPending ? "Confirming..." : "Confirm booking"}
        </button>
        {result ? (
          <div className={`mt-4 rounded-md p-3 text-sm ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
            <strong>{result.ok && result.pnr ? `PNR ${result.pnr}` : result.ok ? "Done" : "Action needed"}</strong>
            <p className="mt-1">{result.message}</p>
            {!result.ok && result.message.toLowerCase().includes("sign in") ? (
              <Link
                className="mt-3 inline-flex rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
                href={`/auth?next=/book/${flight.id}`}
              >
                Sign in to continue
              </Link>
            ) : null}
          </div>
        ) : null}
      </aside>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        className="focus-ring rounded-md border border-slate-300 px-3 py-2"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
