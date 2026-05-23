import type { BookingWithRelations, Flight, Seat } from "@/lib/types";

const today = new Date();
const day = 24 * 60 * 60 * 1000;

const isoAt = (offsetDays: number, hour: number, minute = 0) => {
  const date = new Date(today.getTime() + offsetDays * day);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const demoFlights: Flight[] = [
  { id: "f-del-bom-1", flight_no: "AD 214", origin: "Delhi", destination: "Mumbai", departs_at: isoAt(1, 8, 20), arrives_at: isoAt(1, 10, 30), aircraft_type: "Airbus A320", status: "scheduled", base_price: 6200 },
  { id: "f-del-bom-2", flight_no: "AD 318", origin: "Delhi", destination: "Mumbai", departs_at: isoAt(1, 18, 10), arrives_at: isoAt(1, 20, 25), aircraft_type: "Boeing 737", status: "scheduled", base_price: 7100 },
  { id: "f-bom-blr-1", flight_no: "AD 431", origin: "Mumbai", destination: "Bengaluru", departs_at: isoAt(1, 9, 45), arrives_at: isoAt(1, 11, 30), aircraft_type: "Airbus A321", status: "scheduled", base_price: 5400 },
  { id: "f-bom-blr-2", flight_no: "AD 519", origin: "Mumbai", destination: "Bengaluru", departs_at: isoAt(2, 14, 10), arrives_at: isoAt(2, 15, 55), aircraft_type: "Airbus A320", status: "delayed", base_price: 5100 },
  { id: "f-blr-hyd-1", flight_no: "AD 622", origin: "Bengaluru", destination: "Hyderabad", departs_at: isoAt(1, 7, 30), arrives_at: isoAt(1, 8, 45), aircraft_type: "ATR 72", status: "scheduled", base_price: 3900 },
  { id: "f-blr-hyd-2", flight_no: "AD 647", origin: "Bengaluru", destination: "Hyderabad", departs_at: isoAt(3, 19, 5), arrives_at: isoAt(3, 20, 25), aircraft_type: "Airbus A320", status: "scheduled", base_price: 4300 },
  { id: "f-del-ccu-1", flight_no: "AD 783", origin: "Delhi", destination: "Kolkata", departs_at: isoAt(2, 6, 55), arrives_at: isoAt(2, 9, 5), aircraft_type: "Boeing 737 MAX", status: "scheduled", base_price: 6800 },
  { id: "f-del-ccu-2", flight_no: "AD 812", origin: "Delhi", destination: "Kolkata", departs_at: isoAt(4, 16, 25), arrives_at: isoAt(4, 18, 35), aircraft_type: "Airbus A321neo", status: "scheduled", base_price: 7350 },
];

export const makeDemoSeats = (flightId: string): Seat[] => {
  const seats: Seat[] = [];
  const columns = ["A", "B", "C", "D", "E", "F"];

  for (let row = 1; row <= 18; row += 1) {
    for (const column of columns) {
      const seatClass = row <= 2 ? "first" : row <= 6 ? "business" : "economy";
      seats.push({
        id: `${flightId}-${row}${column}`,
        flight_id: flightId,
        seat_number: `${row}${column}`,
        class: seatClass,
        is_available: !["2B", "4D", "7A", "11C", "15F"].includes(`${row}${column}`),
        extra_fee: seatClass === "first" ? 9000 : seatClass === "business" ? 4500 : row <= 9 ? 750 : 0,
      });
    }
  }

  return seats;
};

export const demoBookings: BookingWithRelations[] = [
  {
    id: "demo-booking-1",
    user_id: "demo-user",
    flight_id: demoFlights[0].id,
    seat_id: `${demoFlights[0].id}-8C`,
    status: "confirmed",
    booked_at: new Date().toISOString(),
    total_price: 6950,
    pnr_code: "AD8C2K",
    flights: demoFlights[0],
    seats: makeDemoSeats(demoFlights[0].id).find((seat) => seat.seat_number === "8C")!,
    passengers: [{ full_name: "Demo Passenger", passport_no: "P0000000", nationality: "Indian", dob: "2000-01-01" }],
  },
];
