import { create } from "zustand";

const useMapStore = create((set) => ({
  flights: [],
  selectedFlight: null,
  positions: {
    lat1: 0,
    lon1: 0,
    lat2: 0,
    lon2: 0,
  },
  searchStatus: {},
  setFlights: (flights) => set({ flights }),
  setPositions: (positions) => set({ positions }),
  setSelectedFlight: (selectedFlight) => set({ selectedFlight }),
  setSearchStatus: (searchStatus) => set({ searchStatus }),
}));

export default useMapStore;
