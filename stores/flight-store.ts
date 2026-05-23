"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Flight, PassengerDraft, SearchQuery, Seat } from "@/lib/types";

type FlightStore = {
  searchQuery: SearchQuery;
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  currentBookingStep: "search" | "seat" | "passenger" | "confirm";
  passengerForm: PassengerDraft;
  setSearchQuery: (query: SearchQuery) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  selectSeatOptimistically: (seat: Seat | null) => void;
  setBookingStep: (step: FlightStore["currentBookingStep"]) => void;
  updatePassengerForm: (passenger: Partial<PassengerDraft>) => void;
  resetBooking: () => void;
};

const emptyPassenger: PassengerDraft = {
  full_name: "",
  passport_no: "",
  nationality: "",
  dob: "",
};

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      searchQuery: { origin: "", destination: "", date: "", passengers: "1" },
      selectedFlight: null,
      selectedSeat: null,
      currentBookingStep: "search",
      passengerForm: emptyPassenger,
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight, currentBookingStep: flight ? "seat" : "search" }),
      selectSeatOptimistically: (seat) => set({ selectedSeat: seat, currentBookingStep: seat ? "passenger" : "seat" }),
      setBookingStep: (step) => set({ currentBookingStep: step }),
      updatePassengerForm: (passenger) =>
        set((state) => ({ passengerForm: { ...state.passengerForm, ...passenger } })),
      resetBooking: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          currentBookingStep: "search",
          passengerForm: emptyPassenger,
        }),
    }),
    {
      name: "aerodesk-flight-store",
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        currentBookingStep: state.currentBookingStep,
        passengerForm: {
          full_name: state.passengerForm.full_name,
          passport_no: "",
          nationality: state.passengerForm.nationality,
          dob: state.passengerForm.dob,
        },
      }),
    },
  ),
);
