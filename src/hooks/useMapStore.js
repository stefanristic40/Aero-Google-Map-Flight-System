import { create } from "zustand";

const useMapStore = create((set) => ({
  isShowPointNumbers: false,
  isShowLines: false,
  setIsShowPointNumbers: (isShowPointNumbers) => set({ isShowPointNumbers }),
  setIsShowLines: (isShowLines) => set({ isShowLines }),
}));

export default useMapStore;
