import { Gps } from "@phosphor-icons/react";
import useMapStore from "../../../hooks/useMapStore";
import React, { useEffect } from "react";

function PointSelector({ setPoint, pointLabel }) {
  const isSelectingPoint = useMapStore((state) => state.isSelectingPoint);
  const setIsSelectingPoint = useMapStore((state) => state.setIsSelectingPoint);
  const selectedPoint = useMapStore((state) => state.selectedPoint);
  const setSelectedPoint = useMapStore((state) => state.setSelectedPoint);
  const selectingPointLabel = useMapStore((state) => state.selectingPointLabel);
  const setSelectingPointLabel = useMapStore(
    (state) => state.setSelectingPointLabel
  );

  const handlePointSelection = () => {
    setSelectedPoint(null);
    setSelectingPointLabel(pointLabel);
    setIsSelectingPoint(true);
  };

  useEffect(() => {
    if (
      isSelectingPoint &&
      selectedPoint &&
      selectingPointLabel === pointLabel
    ) {
      setPoint(selectedPoint);
      setIsSelectingPoint(false);
    }
  }, [selectedPoint]);

  return (
    <button className="" onClick={handlePointSelection}>
      <Gps
        size={18}
        weight="bold"
        className={`${
          isSelectingPoint && selectingPointLabel === pointLabel
            ? "text-custom4"
            : "text-white"
        }`}
      />
    </button>
  );
}

export default PointSelector;
