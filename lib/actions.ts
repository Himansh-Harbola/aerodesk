"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PassengerDraft } from "@/lib/types";

type BookPayload = {
  flightId: string;
  seatId: string;
  passenger: PassengerDraft;
  totalPrice: number;
};

export async function createBooking(payload: BookPayload) {
  const supabase = await createClient();

  if (!supabase) {
    return {
      ok: true,
      pnr: `DEMO${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      message: "Demo booking created locally. Add Supabase env vars to persist bookings.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Please sign in before confirming a booking." };
  }

  const pnr = `AD${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const { data, error } = await supabase.rpc("reserve_seat", {
    p_flight_id: payload.flightId,
    p_seat_id: payload.seatId,
    p_user_id: user.id,
    p_total_price: payload.totalPrice,
    p_pnr_code: pnr,
    p_passenger: payload.passenger,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/bookings");
  return { ok: true, pnr, bookingId: data, message: "Booking confirmed." };
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { ok: true, message: "Demo booking cancelled in the UI." };
  }

  const { error } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/bookings");
  return { ok: true, message: "Booking cancelled." };
}

export async function rescheduleBooking(bookingId: string, newFlightId: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { ok: true, message: "Demo booking rescheduled in the UI." };
  }

  const { error } = await supabase.rpc("reschedule_booking", {
    p_booking_id: bookingId,
    p_new_flight_id: newFlightId,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/bookings");
  return { ok: true, message: "Booking rescheduled." };
}
