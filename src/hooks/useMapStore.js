import { create } from "zustand";

const useMapStore = create((set) => ({
  flights: [],
  setFlights: (flights) => set({ flights }),
}));

export default useMapStore;
