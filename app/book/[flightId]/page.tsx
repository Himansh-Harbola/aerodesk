import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking-flow";
import { getFlightById, getSeatsForFlight } from "@/lib/data";

export default async function BookPage({ params }: { params: Promise<{ flightId: string }> }) {
  const { flightId } = await params;
  const [flight, seats] = await Promise.all([getFlightById(flightId), getSeatsForFlight(flightId)]);

  if (!flight) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <BookingFlow flight={flight} seats={seats} />
    </main>
  );
}
