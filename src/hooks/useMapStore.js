import { create } from "zustand";

const useMapStore = create((set) => ({
  flights: [],
  positions: {
    lat1: 0,
    lon1: 0,
    lat2: 0,
    lon2: 0,
  },
  setFlights: (flights) => set({ flights }),
  setPositions: (positions) => set({ positions }),
}));

export default useMapStore;
