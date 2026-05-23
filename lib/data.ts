import { unstable_noStore as noStore } from "next/cache";
import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { demoBookings, demoFlights, makeDemoSeats } from "@/lib/demo-data";
import type { BookingWithRelations, Flight, Seat } from "@/lib/types";

type FlightFilter = {
  origin?: string;
  destination?: string;
  date?: string;
};

type FlightQueryOptions = {
  limit?: number;
};

export async function getFlights(filter: FlightFilter, options: FlightQueryOptions = {}): Promise<Flight[]> {
  noStore();
  const supabase = await createClient();

  if (!supabase || !hasSupabaseServerEnv) {
    return filterDemoFlights(filter).slice(0, options.limit ?? 120);
  }

  let query = supabase.from("flights").select("*").order("departs_at", { ascending: true });

  if (filter.origin) query = query.ilike("origin", `%${filter.origin}%`);
  if (filter.destination) query = query.ilike("destination", `%${filter.destination}%`);
  if (filter.date) {
    query = query.gte("departs_at", `${filter.date}T00:00:00`).lt("departs_at", `${filter.date}T23:59:59`);
  }

  query = query.limit(options.limit ?? 120);

  const { data, error } = await query;
  if (error) {
    console.error(error.message);
    return filterDemoFlights(filter);
  }

  return data ?? [];
}

export async function getFlightById(id: string): Promise<Flight | null> {
  noStore();
  const supabase = await createClient();

  if (!supabase || !hasSupabaseServerEnv) {
    return demoFlights.find((flight) => flight.id === id) ?? null;
  }

  const { data, error } = await supabase.from("flights").select("*").eq("id", id).single();
  if (error) {
    console.error(error.message);
    return demoFlights.find((flight) => flight.id === id) ?? null;
  }

  return data;
}

export async function getSeatsForFlight(flightId: string): Promise<Seat[]> {
  noStore();
  const supabase = await createClient();

  if (!supabase || !hasSupabaseServerEnv) {
    return makeDemoSeats(flightId);
  }

  const { data, error } = await supabase.from("seats").select("*").eq("flight_id", flightId).order("seat_number");
  if (error) {
    console.error(error.message);
    return makeDemoSeats(flightId);
  }

  return data ?? [];
}

export async function getSeatById(id: string): Promise<Seat | null> {
  noStore();
  const supabase = await createClient();

  if (!supabase || !hasSupabaseServerEnv) {
    for (const flight of demoFlights) {
      const seat = makeDemoSeats(flight.id).find((item) => item.id === id);
      if (seat) return seat;
    }
    return null;
  }

  const { data, error } = await supabase.from("seats").select("*").eq("id", id).single();
  if (error) {
    console.error(error.message);
    return null;
  }

  return data;
}

export async function getBookingsForCurrentUser(): Promise<BookingWithRelations[]> {
  noStore();
  const supabase = await createClient();

  if (!supabase || !hasSupabaseServerEnv) {
    return demoBookings;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*, flights(*), seats(*), passengers(full_name, passport_no, nationality, dob)")
    .eq("user_id", user.id)
    .order("booked_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (data ?? []) as BookingWithRelations[];
}

function filterDemoFlights(filter: FlightFilter): Flight[] {
  return demoFlights.filter((flight) => {
    const sameOrigin = filter.origin ? flight.origin.toLowerCase().includes(filter.origin.toLowerCase()) : true;
    const sameDestination = filter.destination
      ? flight.destination.toLowerCase().includes(filter.destination.toLowerCase())
      : true;
    const sameDate = filter.date ? flight.departs_at.startsWith(filter.date) : true;
    return sameOrigin && sameDestination && sameDate;
  });
}
