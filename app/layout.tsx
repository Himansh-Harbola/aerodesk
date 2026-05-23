import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Plane } from "lucide-react";
import "./globals.css";
import { InstallPrompt } from "@/components/install-prompt";
import { AuthNav } from "@/components/auth-nav";

export const metadata: Metadata = {
  title: "AeroDesk Flight Management",
  description: "Search, book, reschedule, and manage flights with live seat selection.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f6b63",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/92 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-950">
              <span className="grid size-9 place-items-center rounded-md bg-[var(--primary)] text-white">
                <Plane size={20} />
              </span>
              AeroDesk
            </Link>
            <nav className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/search">
                Search
              </Link>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/bookings">
                My Bookings
              </Link>
              <AuthNav />
            </nav>
          </div>
        </header>
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
