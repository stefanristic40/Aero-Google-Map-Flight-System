import React from "react";
import useMapStore from "../../../hooks/useMapStore";
import SingleFlightMapView from "./SingleFlightMapView";

function SingleFlightMaps({ zoom, center }) {
  const flights = useMapStore((state) => state.flights);

  return (
    <div className="h-screen w-full overflow-auto">
      {flights && flights.length > 0 && (
        <div className=" custom-scrollbar  border-layoutBorder overflow-x-hidden overflow-y-auto w-full ">
          <div className="grid grid-cols-5 ">
            {flights.map((flight, index) => (
              <SingleFlightMapView
                key={index}
                flight={flight}
                zoom={zoom}
                center={center}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleFlightMaps;
