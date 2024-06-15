import React, { useState } from "react";
import useMapStore from "../../hooks/useMapStore";
import {
  GoogleMap,
  OverlayView,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Airplane } from "@phosphor-icons/react";
import FlightDetailModal from "./FlightDetailModal";
import useAero from "../../hooks/useAero";

function MapView() {
  const { getFlightTrack } = useAero();

  const flights = useMapStore((state) => state.flights);
  const positions = useMapStore((state) => state.positions);

  const { isLoaded } = useJsApiLoader({
    libraries: ["places"],
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
  });

  // function waypointsToPolyline(waypoints) {
  //   const d = [];

  //   for (let i = 0; i < waypoints.length; i += 2) {
  //     d.push({
  //       lat: waypoints[i],
  //       lng: waypoints[i + 1],
  //     });
  //   }

  //   return d;
  // }

  const [selectedFlight, setSelectedFlight] = useState(null);

  const handleSelectFlight = async (flight) => {
    const positions = await getFlightTrack(flight.fa_flight_id);
    const temp = {
      ...flight,
      positions,
    };
    setSelectedFlight(temp);

    setIsFlightDetailModalOpen(true);
  };

  const [isFlightDetailModalOpen, setIsFlightDetailModalOpen] = useState(false);

  function positionsToPolyline(positions) {
    return positions.map((position) => ({
      lat: position.latitude,
      lng: position.longitude,
    }));
  }

  // Calculate the scale of the map based on the positions

  return (
    // Important! Always set the container height explicitly
    <div className="w-full h-screen">
      <div style={{ height: "100vh", width: "100%" }}>
        {!isLoaded ? (
          <div>Loading...</div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            zoom={11}
            center={{ lat: 28.125, lng: -82.5 }} // Replace with your desired coordinates
          >
            {/* Draw Rectangle */}
            <Polyline
              path={[
                { lat: positions.lat1, lng: positions.lon1 },
                { lat: positions.lat1, lng: positions.lon2 },
                { lat: positions.lat2, lng: positions.lon2 },
                { lat: positions.lat2, lng: positions.lon1 },
                { lat: positions.lat1, lng: positions.lon1 },
              ]}
              options={{
                strokeColor: "#0E3AFD",
                strokeWeight: 2,
                strokeOpacity: 0.8,
              }}
            />

            {flights.map((flight, index) => {
              return (
                <div key={index}>
                  <OverlayView
                    position={{
                      lat: flight.last_position.latitude,
                      lng: flight.last_position.longitude,
                    }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <Airplane
                      onClick={(event) => {
                        event.stopPropagation(); // Stop event from propagating to the map
                        handleSelectFlight(flight);
                      }}
                      style={{
                        rotate: flight.last_position.heading + "deg",
                      }}
                      className="h-6 w-6 text-[#F8C023] cursor-pointer"
                      weight="fill"
                    />
                  </OverlayView>
                </div>
              );
            })}

            {selectedFlight && selectedFlight?.positions && (
              <Polyline
                path={positionsToPolyline(selectedFlight.positions)}
                options={{
                  strokeColor: "#F33A3A",
                  strokeWeight: 2,
                  strokeOpacity: 0.8,
                }}
              />
            )}
          </GoogleMap>
        )}
      </div>

      {selectedFlight && (
        <FlightDetailModal
          isOpen={isFlightDetailModalOpen}
          setIsOpen={setIsFlightDetailModalOpen}
          flight={selectedFlight}
        />
      )}
    </div>
  );
}

export default MapView;
