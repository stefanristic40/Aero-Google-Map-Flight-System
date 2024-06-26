import React, { useEffect, useState } from "react";
import useMapStore from "../../../hooks/useMapStore";
import {
  GoogleMap,
  OverlayView,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import FlightDetailModal from "./FlightDetailModal";
import Airplane from "../../common/icons/Airplane";
import SingleFlightMaps from "./SingleFlightMaps";

function MapView() {
  const flights = useMapStore((state) => state.flights);
  const positions = useMapStore((state) => state.positions);

  const mapMode = useMapStore((state) => state.mapMode);

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

  function positionsToPolyline(positions, last_position = null) {
    let polyline = [];
    if (positions) {
      positions.forEach((position) => {
        polyline.push({
          lat: position.latitude,
          lng: position.longitude,
        });
      });
    }
    if (last_position) {
      polyline.push({
        lat: last_position.latitude,
        lng: last_position.longitude,
      });
    }
    return polyline;
  }

  const [center, setCenter] = useState({ lat: 28.125, lng: -82.5 });
  const [zoom, setZoom] = useState(11);

  useEffect(() => {
    if (
      mapMode === "all" &&
      positions.lat1 &&
      positions.lon1 &&
      positions.lat2 &&
      positions.lon2
    ) {
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
  }, [positions, mapRef, mapMode]);

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
    <div className="w-full h-screen relative bg-custom1 ">
      {mapMode === "all" && (
        <>
          <div style={{ height: "100vh", width: "100%" }} ref={mapRef}>
            {!isLoaded ? (
              <div>Loading...</div>
            ) : (
              <div className="flex flex-col w-full h-full ">
                <div className="h-full">
                  <GoogleMap
                    mapContainerStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                    zoom={zoom}
                    center={center}
                    options={{
                      fullscreenControl: false,
                      mapTypeControl: false,
                      streetViewControl: false,
                      zoomControl: false,

                      mapTypeId: "satellite",
                    }}
                  >
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
                                opacity: selectedFlight
                                  ? selectedFlight.ident === flight.ident
                                    ? 1
                                    : 0.5
                                  : 1,
                              }}
                              className="h-6 w-6 cursor-pointer"
                            />
                          </OverlayView>
                          <Polyline
                            path={positionsToPolyline(
                              flight.positions,
                              flight.last_position
                            )}
                            options={{
                              strokeColor:
                                selectedFlight &&
                                selectedFlight.ident === flight.ident
                                  ? "red"
                                  : "#00FFFF",
                              strokeWeight:
                                selectedFlight &&
                                selectedFlight.ident === flight.ident
                                  ? 3
                                  : 1,
                              strokeOpacity:
                                selectedFlight &&
                                selectedFlight.ident === flight.ident
                                  ? 1
                                  : 0.7,
                              zIndex:
                                selectedFlight &&
                                selectedFlight.ident === flight.ident
                                  ? 1000
                                  : 1,
                            }}
                            onClick={() => {
                              handleSelectFlight(flight);
                            }}
                          />
                        </div>
                      );
                    })}

                    <Polyline
                      path={[
                        { lat: positions.lat1, lng: positions.lon1 },
                        { lat: positions.lat1, lng: positions.lon2 },
                        { lat: positions.lat2, lng: positions.lon2 },
                        { lat: positions.lat2, lng: positions.lon1 },
                        { lat: positions.lat1, lng: positions.lon1 },
                      ]}
                      options={{
                        strokeColor: "#04FD04",
                        strokeWeight: 5,
                        strokeOpacity: 1,
                      }}
                    />
                  </GoogleMap>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {mapMode === "single" && <SingleFlightMaps center={center} zoom={zoom} />}

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
