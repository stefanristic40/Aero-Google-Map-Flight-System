import React from "react";
import useMapStore from "../../../hooks/useMapStore";

function MapViewToogleTabs(props) {
  const tabs = [
    { name: "All Flights Map", value: "all" },
    { name: "Single Flight Maps", value: "single" },
  ];

  const mapMode = useMapStore((state) => state.mapMode);
  const setMapMode = useMapStore((state) => state.setMapMode);

  return (
    <div>
      <div className="w-full flex justify-between gap-3">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`w-full py-2 shadow-lg rounded-md  ${
              mapMode === tab.value
                ? "bg-blue-500 text-white"
                : "bg-custom2 text-white"
            }`}
            onClick={() => setMapMode(tab.value)}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MapViewToogleTabs;
