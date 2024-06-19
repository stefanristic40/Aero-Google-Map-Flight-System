import React, { useEffect, useState } from "react";
import useMapStore from "../../../hooks/useMapStore";
import {
  GoogleMap,
  OverlayView,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Airplane } from "@phosphor-icons/react";
import FlightDetailModal from "./FlightDetailModal";

function MapView() {
  const flights = useMapStore((state) => state.flights);
  const positions = useMapStore((state) => state.positions);

  const { isLoaded } = useJsApiLoader({
    libraries: ["places"],
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
  });

  const setSelectedFlight = useMapStore((state) => state.setSelectedFlight);
  const selectedFlight = useMapStore((state) => state.selectedFlight);

  const mapRef = React.useRef(null);

  const handleSelectFlight = async (flight) => {
    setSelectedFlight(flight);
    setIsFlightDetailModalOpen(true);
  };

  useEffect(() => {
    if (selectedFlight) {
      setIsFlightDetailModalOpen(true);
    }
  }, [selectedFlight]);

  const [isFlightDetailModalOpen, setIsFlightDetailModalOpen] = useState(false);

  function positionsToPolyline(positions) {
    return (
      positions &&
      positions.map((position) => ({
        lat: position.latitude,
        lng: position.longitude,
      }))
    );
  }

  const [center, setCenter] = useState({ lat: 28.125, lng: -82.5 });
  const [zoom, setZoom] = useState(11);

  useEffect(() => {
    if (positions.lat1 && positions.lon1 && positions.lat2 && positions.lon2) {
      setCenter({
        lat: (Number(positions.lat1) + Number(positions.lat2)) / 2,
        lng: (Number(positions.lon1) + Number(positions.lon2)) / 2,
      });

      const distance = calculateDistance(
        positions.lat1,
        positions.lon1,
        positions.lat2,
        positions.lon2
      );
      if (mapRef) {
        // how to get the width of ref element
        let width = mapRef.current.clientWidth;
        let height = mapRef.current.clientHeight;
        const zoomLevel = calculateZoomLevel(distance, Math.min(width, height));
        setZoom(zoomLevel);
      }
    }
  }, [positions, mapRef]);

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance;
  }

  function calculateZoomLevel(distance, screenPixelDistance) {
    const zoomLevel = Math.log2(
      (156543.03392 * screenPixelDistance) / (distance * 1.4)
    );
    return zoomLevel;
  }

  useEffect(() => {
    if (!isFlightDetailModalOpen) {
      setSelectedFlight(null);
    }
  }, [isFlightDetailModalOpen]);

  return (
    // Important! Always set the container height explicitly
    <div className="w-full h-screen ">
      <div style={{ height: "100vh", width: "100%" }} ref={mapRef}>
        {!isLoaded ? (
          <div>Loading...</div>
        ) : (
          <div className="flex flex-col w-full h-full ">
            <div className="h-full">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                zoom={zoom}
                center={center}
                options={{
                  fullscreenControl: false,
                  mapTypeControl: false,
                }}
              >
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

                {flights?.map((flight, index) => {
                  return (
                    <div key={index}>
                      <OverlayView
                        position={{
                          lat: flight?.last_position.latitude,
                          lng: flight?.last_position.longitude,
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
                      <Polyline
                        path={positionsToPolyline(flight.positions)}
                        options={{
                          strokeColor: "#FF0505",
                          strokeWeight: 1,
                          strokeOpacity: 1,
                        }}
                        onClick={() => {
                          handleSelectFlight(flight);
                        }}
                      />
                    </div>
                  );
                })}
              </GoogleMap>
            </div>

            {flights && flights.length > 0 && (
              <div className="h-[300px] max-w-[calc(100vw-300px)] border-t-4 custom-scrollbar  border-layoutBorder overflow-auto ">
                <div className="w-max h-full flex justify-between items-center ">
                  {flights.map((flight, index) => (
                    <div
                      className={`w-[300px]   h-full ${
                        selectedFlight?.ident === flight.ident
                          ? "border-2 border-[#F8C023]"
                          : "border border-black/20"
                      } `}
                      key={index}
                    >
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        zoom={zoom}
                        center={{
                          lat: flight?.last_position.latitude,
                          lng: flight?.last_position.longitude,
                        }}
                        options={{
                          fullscreenControl: false,
                          mapTypeControl: false,
                          streetViewControl: false,
                          zoomControl: false,
                        }}
                      >
                        <OverlayView
                          position={{
                            lat: flight?.last_position.latitude,
                            lng: flight?.last_position.longitude,
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
                        <Polyline
                          path={positionsToPolyline(flight.positions)}
                          options={{
                            strokeColor: "#FF0505",
                            strokeWeight: 1,
                            strokeOpacity: 1,
                          }}
                          onClick={() => {
                            handleSelectFlight(flight);
                          }}
                        />
                      </GoogleMap>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
