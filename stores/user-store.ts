"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookingWithRelations } from "@/lib/types";

type UserStore = {
  sessionToken: string | null;
  cachedBookings: BookingWithRelations[];
  setSessionToken: (token: string | null) => void;
  setCachedBookings: (bookings: BookingWithRelations[]) => void;
  resetUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      sessionToken: null,
      cachedBookings: [],
      setSessionToken: (token) => set({ sessionToken: token }),
      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),
      resetUser: () => set({ sessionToken: null, cachedBookings: [] }),
    }),
    {
      name: "aerodesk-user-store",
      partialize: (state) => ({ sessionToken: state.sessionToken }),
    },
  ),
);
