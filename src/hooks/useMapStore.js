import { create } from "zustand";

const useMapStore = create((set) => ({
  flights: [],
  selectedFlight: null,
  positions: {
    lat1: 28.17210970976778,
    lon1: -82.50865363659598,
    lat2: 28.113446816195648,
    lon2: -82.44046183086733,
  },
  searchStatus: {},
  mapMode: "all",
  selectedPoint: null, // Use for selecting point by clicking point on map
  isSelectingPoint: false, // Use for selecting point by clicking point on map
  selectingPointLabel: null, // Use for selecting point by clicking point on map
  setFlights: (flights) => set({ flights }),
  setPositions: (positions) => set({ positions }),
  setSelectedFlight: (selectedFlight) => set({ selectedFlight }),
  setSearchStatus: (searchStatus) => set({ searchStatus }),
  setMapMode: (mapMode) => set({ mapMode }),
  setIsSelectingPoint: (isSelectingPoint) => set({ isSelectingPoint }),
  setSelectedPoint: (selectedPoint) => set({ selectedPoint }),
  setSelectingPointLabel: (selectingPointLabel) => set({ selectingPointLabel }),
}));

export default useMapStore;
