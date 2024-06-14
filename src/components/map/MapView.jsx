import React from "react";
import useMapStore from "../../hooks/useMapStore";
import { Airplane } from "@phosphor-icons/react";

import GoogleMapReact from "google-map-react";

function MapView() {
  const flights = useMapStore((state) => state.flights);

  const defaultProps = {
    center: { lat: 41.7128, lng: -110.006 },
    zoom: 7,
  };

  return (
    // Important! Always set the container height explicitly
    <div className="w-full h-screen">
      <div style={{ height: "100vh", width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAP_API_KEY }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
        >
          {flights.map((flight, index) => {
            return (
              <div
                key={index}
                lat={flight.last_position.latitude}
                lng={flight.last_position.longitude}
                className="text-black"
              >
                <Airplane
                  className="h-6 w-6 text-gray-500 "
                  style={{
                    transform: `rotate(${flight.last_position.heading}deg)`,
                  }}
                />
              </div>
            );
          })}
        </GoogleMapReact>
      </div>
    </div>
  );
}

export default MapView;
