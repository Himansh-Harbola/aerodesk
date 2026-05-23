"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useFlightStore } from "@/stores/flight-store";
import type { SearchQuery } from "@/lib/types";

export function SearchPanel({ initial }: { initial: SearchQuery }) {
  const router = useRouter();
  const setSearchQuery = useFlightStore((state) => state.setSearchQuery);

  function submit(formData: FormData) {
    const query: SearchQuery = {
      origin: String(formData.get("origin") ?? ""),
      destination: String(formData.get("destination") ?? ""),
      date: String(formData.get("date") ?? ""),
      passengers: String(formData.get("passengers") ?? "1"),
    };

    setSearchQuery(query);
    const params = new URLSearchParams(query);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form action={submit} className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Origin
        <input className="focus-ring rounded-md border border-slate-300 px-3 py-2" name="origin" defaultValue={initial.origin} placeholder="Delhi" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Destination
        <input className="focus-ring rounded-md border border-slate-300 px-3 py-2" name="destination" defaultValue={initial.destination} placeholder="Mumbai" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Date
        <input className="focus-ring rounded-md border border-slate-300 px-3 py-2" name="date" type="date" defaultValue={initial.date} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Passengers
        <input className="focus-ring rounded-md border border-slate-300 px-3 py-2" min="1" max="6" name="passengers" type="number" defaultValue={initial.passengers} />
      </label>
      <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-3 font-semibold text-white hover:bg-[var(--primary-dark)] sm:col-span-2">
        <Search size={18} />
        Search flights
      </button>
    </form>
  );
}
