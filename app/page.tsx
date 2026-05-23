import Link from "next/link";
import { ArrowRight, CalendarClock, ShieldCheck, TicketCheck } from "lucide-react";
import { LandingSearch } from "@/components/landing-search";

export default function HomePage() {
  return (
    <main>
      <section
        className="relative overflow-hidden bg-[#051f3b] text-white"
        style={{
          backgroundImage: "linear-gradient(90deg, rgba(5,31,59,0.98), rgba(5,31,59,0.88)), url('/images/flight-hero.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-sky-200">AeroDesk</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Millions of flight options. One simple booking desk.
              </h1>
            </div>
            <Link className="inline-flex items-center gap-2 rounded-full border border-white/35 px-4 py-2 font-bold text-white hover:bg-white/10" href="/bookings">
              My trips
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="mt-10">
            <LandingSearch />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Seat locking",
            text: "Bookings use a Supabase RPC that locks seats before confirmation.",
          },
          {
            icon: CalendarClock,
            title: "Flexible rescheduling",
            text: "Pick a same-route flight by date, review the fare difference, then confirm.",
          },
          {
            icon: TicketCheck,
            title: "Trip management",
            text: "Confirmed, rescheduled, and cancelled trips stay available in My Bookings.",
          },
        ].map((item) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={item.title}>
            <item.icon className="text-[var(--primary)]" size={28} />
            <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-2 leading-6 text-slate-600">{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
