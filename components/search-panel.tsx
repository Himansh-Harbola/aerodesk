"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useFlightStore } from "@/stores/flight-store";
import type { SearchQuery } from "@/lib/types";
import { airports } from "@/lib/airports";

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
    <form action={submit} className="mt-8 grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_1fr_0.9fr_0.8fr_auto]">
      <label className="grid min-h-24 gap-1 border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-600 lg:border-b-0 lg:border-r">
        Origin
        <input className="focus-ring min-w-0 text-lg font-medium text-slate-950 outline-none" list="search-airports" name="origin" defaultValue={initial.origin} placeholder="Delhi" />
      </label>
      <label className="grid min-h-24 gap-1 border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-600 lg:border-b-0 lg:border-r">
        Destination
        <input className="focus-ring min-w-0 text-lg font-medium text-slate-950 outline-none" list="search-airports" name="destination" defaultValue={initial.destination} placeholder="Mumbai" />
      </label>
      <datalist id="search-airports">
        {airports.map((airport) => (
          <option key={airport} value={airport} />
        ))}
      </datalist>
      <label className="grid min-h-24 gap-1 border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-600 lg:border-b-0 lg:border-r">
        Date
        <input className="focus-ring min-w-0 text-lg font-medium text-slate-950 outline-none" name="date" type="date" defaultValue={initial.date} />
      </label>
      <label className="grid min-h-24 gap-1 border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-600 lg:border-b-0 lg:border-r">
        Passengers
        <input className="focus-ring min-w-0 text-lg font-medium text-slate-950 outline-none" min="1" max="6" name="passengers" type="number" defaultValue={initial.passengers} />
      </label>
      <button className="focus-ring inline-flex min-h-20 items-center justify-center gap-2 bg-[#0870f8] px-8 text-lg font-bold text-white hover:bg-[#075bd0]">
        <Search size={18} />
        Search
      </button>
    </form>
  );
}
