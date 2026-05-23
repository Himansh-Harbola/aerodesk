"use client";

import { useEffect, useMemo, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Seat } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { money } from "@/lib/format";

const classLabels: Record<Seat["class"], string> = {
  first: "First",
  business: "Business",
  economy: "Economy",
};

export function SeatMap({
  flightId,
  initialSeats,
  selectedSeatId,
  onSelect,
}: {
  flightId: string;
  initialSeats: Seat[];
  selectedSeatId?: string;
  onSelect: (seat: Seat) => void;
}) {
  const [seats, setSeats] = useState(initialSeats);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`seats:${flightId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seats", filter: `flight_id=eq.${flightId}` },
        (payload: RealtimePostgresChangesPayload<Seat>) => {
          const changed = payload.new;
          if (!changed || !("id" in changed)) return;
          setSeats((current) => current.map((seat) => (seat.id === changed.id ? { ...seat, ...changed } : seat)));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [flightId]);

  const rows = useMemo(() => {
    const grouped = new Map<string, Seat[]>();
    seats.forEach((seat) => {
      const row = seat.seat_number.replace(/[A-Z]/g, "");
      grouped.set(row, [...(grouped.get(row) ?? []), seat]);
    });
    return Array.from(grouped.entries()).sort(([a], [b]) => Number(a) - Number(b));
  }, [seats]);

  return (
    <div className="scrollbar-thin max-h-[620px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="min-w-[420px]">
        <div className="sticky top-0 z-10 mb-3 grid grid-cols-[2rem_repeat(3,2.75rem)_1.5rem_repeat(3,2.75rem)] gap-2 bg-slate-50 pb-2 text-center text-xs font-semibold text-slate-500">
          <span />
          {["A", "B", "C", "", "D", "E", "F"].map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
        </div>
        <div className="grid gap-2">
          {rows.map(([row, rowSeats]) => {
            const zone = rowSeats[0]?.class ?? "economy";
            return (
              <div key={row} className="grid grid-cols-[2rem_repeat(3,2.75rem)_1.5rem_repeat(3,2.75rem)] items-center gap-2">
                <span className="text-center text-xs font-semibold text-slate-500">{row}</span>
                {rowSeats.slice(0, 3).map((seat) => (
                  <SeatButton key={seat.id} seat={seat} selected={seat.id === selectedSeatId} onSelect={onSelect} />
                ))}
                <span className="text-center text-[10px] font-semibold uppercase text-slate-400">{zone === "economy" ? "" : zone[0]}</span>
                {rowSeats.slice(3).map((seat) => (
                  <SeatButton key={seat.id} seat={seat} selected={seat.id === selectedSeatId} onSelect={onSelect} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        {(["first", "business", "economy"] as const).map((seatClass) => (
          <span key={seatClass} className="rounded-full border border-slate-200 bg-white px-3 py-1">{classLabels[seatClass]}</span>
        ))}
        <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-white">Selected</span>
        <span className="rounded-full bg-slate-300 px-3 py-1 text-slate-700">Occupied</span>
      </div>
    </div>
  );
}

function SeatButton({ seat, selected, onSelect }: { seat: Seat; selected: boolean; onSelect: (seat: Seat) => void }) {
  const available = seat.is_available;
  const classColor = seat.class === "first" ? "border-amber-300 bg-amber-50" : seat.class === "business" ? "border-sky-300 bg-sky-50" : "border-emerald-300 bg-emerald-50";

  return (
    <button
      type="button"
      disabled={!available}
      title={`${seat.seat_number} ${classLabels[seat.class]} ${seat.extra_fee ? `+ ${money(seat.extra_fee)}` : "no extra fee"}`}
      onClick={() => onSelect(seat)}
      className={[
        "focus-ring h-11 rounded-md border text-xs font-semibold transition",
        selected ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm" : classColor,
        !available ? "cursor-not-allowed border-slate-300 bg-slate-300 text-slate-500" : "hover:-translate-y-0.5",
      ].join(" ")}
    >
      {seat.seat_number}
    </button>
  );
}
