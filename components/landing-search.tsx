"use client";

import { useRouter } from "next/navigation";
import { BedDouble, Car, Check, Globe2, Plane, Search, Sparkles, UsersRound } from "lucide-react";
import { useFlightStore } from "@/stores/flight-store";
import type { SearchQuery } from "@/lib/types";

export function LandingSearch() {
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
    router.push(`/search?${new URLSearchParams(query).toString()}`);
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2">
        <button className="inline-flex items-center gap-2 rounded-full bg-[#0870f8] px-5 py-3 text-sm font-bold text-white" type="button">
          <Plane size={18} />
          Flights
        </button>
        <button className="inline-flex items-center gap-2 rounded-full border border-white/45 px-5 py-3 text-sm font-bold text-white hover:bg-white/10" type="button">
          <BedDouble size={18} />
          Hotels
        </button>
        <button className="inline-flex items-center gap-2 rounded-full border border-white/45 px-5 py-3 text-sm font-bold text-white hover:bg-white/10" type="button">
          <Car size={18} />
          Cars
        </button>
      </div>

      <form action={submit} className="mt-8 grid gap-1 lg:grid-cols-[1fr_1fr_0.95fr_0.95fr_1fr_auto]">
        <label className="grid min-h-24 gap-1 rounded-t-lg bg-white px-5 py-4 text-sm font-bold text-slate-600 lg:rounded-l-lg lg:rounded-tr-none">
          From
          <input className="focus-ring min-w-0 text-lg font-medium text-slate-950 outline-none" name="origin" placeholder="Delhi" defaultValue="Delhi" />
        </label>
        <label className="grid min-h-24 gap-1 bg-white px-5 py-4 text-sm font-bold text-slate-600">
          To
          <input className="focus-ring min-w-0 text-lg font-medium text-slate-950 outline-none" name="destination" placeholder="Mumbai" defaultValue="Mumbai" />
        </label>
        <label className="grid min-h-24 gap-1 bg-white px-5 py-4 text-sm font-bold text-slate-600">
          Depart
          <input className="focus-ring min-w-0 text-lg font-medium text-slate-950 outline-none" name="date" type="date" />
        </label>
        <label className="grid min-h-24 gap-1 bg-white px-5 py-4 text-sm font-bold text-slate-600">
          Trip
          <select className="focus-ring text-lg font-medium text-slate-950 outline-none" defaultValue="one-way">
            <option value="one-way">One way</option>
            <option value="return">Return</option>
          </select>
        </label>
        <label className="grid min-h-24 gap-1 bg-white px-5 py-4 text-sm font-bold text-slate-600">
          Travellers and cabin class
          <span className="flex items-center gap-2">
            <UsersRound size={18} className="text-slate-500" />
            <input className="focus-ring w-16 text-lg font-medium text-slate-950 outline-none" min="1" max="6" name="passengers" type="number" defaultValue="1" />
            <span className="text-lg font-medium text-slate-950">Adult, Economy</span>
          </span>
        </label>
        <button className="focus-ring min-h-24 rounded-b-lg bg-[#0870f8] px-8 text-lg font-bold text-white hover:bg-[#075bd0] lg:rounded-r-lg lg:rounded-bl-none">
          <Search className="mx-auto mb-1" size={22} />
          Search
        </button>
      </form>

      <div className="mt-3 grid gap-3 text-sm font-semibold text-white sm:grid-cols-3">
        <label className="inline-flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded border border-white/70 bg-white/10">
            <Check size={14} />
          </span>
          Add nearby airports
        </label>
        <label className="inline-flex items-center gap-2">
          <span className="size-5 rounded border border-white/70 bg-white/10" />
          Direct flights
        </label>
        <label className="inline-flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded border border-[#0870f8] bg-[#0870f8]">
            <Check size={14} />
          </span>
          Add a hotel
        </label>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {[
          { icon: Sparkles, label: "New AI search" },
          { icon: BedDouble, label: "Hotels" },
          { icon: Car, label: "Cars" },
          { icon: Globe2, label: "Explore everywhere" },
        ].map((item) => (
          <button
            className="flex min-h-24 items-center gap-4 rounded-lg bg-[#062849] px-6 text-left text-lg font-bold text-white shadow-lg ring-1 ring-white/10 hover:bg-[#0b335d]"
            key={item.label}
            type="button"
          >
            <item.icon size={24} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
