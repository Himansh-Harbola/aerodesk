import { MyBookings } from "@/components/my-bookings";
import { getBookingsForCurrentUser, getFlights } from "@/lib/data";

export default async function BookingsPage() {
  const [bookings, flights] = await Promise.all([getBookingsForCurrentUser(), getFlights({})]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <MyBookings initialBookings={bookings} flights={flights} />
    </main>
  );
}
