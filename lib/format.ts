import type { Flight } from "@/lib/types";

export function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function duration(flight: Flight) {
  const diff = new Date(flight.arrives_at).getTime() - new Date(flight.departs_at).getTime();
  const minutes = Math.max(0, Math.round(diff / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${rest}m`;
}
