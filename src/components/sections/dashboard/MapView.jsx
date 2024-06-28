import React, { useEffect, useState } from "react";
import useMapStore from "../../../hooks/useMapStore";
import {
  GoogleMap,
  Marker,
  OverlayView,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import FlightDetailModal from "./FlightDetailModal";
import Airplane from "../../common/icons/Airplane";
import SingleFlightMaps from "./SingleFlightMaps";
import useDebounce from "../../../hooks/useDebounce";
import { findIntersectionPoints } from "../../../utils";

function MapView() {
  const { isLoaded } = useJsApiLoader({
    libraries: ["places"],
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
  });

  const flights = useMapStore((state) => state.flights);
  const positions = useMapStore((state) => state.positions);
  const setPositions = useMapStore((state) => state.setPositions);
  const mapMode = useMapStore((state) => state.mapMode);
  const setSelectedFlight = useMapStore((state) => state.setSelectedFlight);
  const selectedFlight = useMapStore((state) => state.selectedFlight);
  const isSelectingPoint = useMapStore((state) => state.isSelectingPoint);
  const setSelectedPoint = useMapStore((state) => state.setSelectedPoint);

  const [center, setCenter] = useState({ lat: 28.125, lng: -82.5 });
  const [zoom, setZoom] = useState(11);
  const [isFlightDetailModalOpen, setIsFlightDetailModalOpen] = useState(false);

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

  const debouncedPositionsTerm = useDebounce(positions, 500); // 500ms debounce delay

  useEffect(() => {
    if (
      debouncedPositionsTerm &&
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
  }, [debouncedPositionsTerm]);

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

  const handleMapViewClick = (e) => {
    if (mapMode === "all") {
      if (isSelectingPoint) {
        setSelectedPoint({
          lat: e.latLng.lat(),
          lon: e.latLng.lng(),
        });
      }
    }
  };

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
                      mapTypeId: "hybrid",
                    }}
                    onClick={(e) => {
                      handleMapViewClick(e);
                    }}
                  >
                    {positions.lat1 && positions.lon1 && (
                      <Marker
                        position={{
                          lat: positions.lat1,
                          lng: positions.lon1,
                        }}
                        icon={{
                          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        }}
                        draggable={true}
                        onDrag={(e) => {
                          console.log(e);
                          setPositions({
                            lat1: e.latLng.lat(),
                            lon1: e.latLng.lng(),
                            lat2: positions.lat2,
                            lon2: positions.lon2,
                          });
                        }}
                      />
                    )}
                    {positions.lat2 && positions.lon2 && (
                      <Marker
                        position={{
                          lat: positions.lat2,
                          lng: positions.lon2,
                        }}
                        icon={{
                          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                        }}
                        draggable={true}
                        onDrag={(e) => {
                          setPositions({
                            lat1: positions.lat1,
                            lon1: positions.lon1,
                            lat2: e.latLng.lat(),
                            lon2: e.latLng.lng(),
                          });
                        }}
                      />
                    )}

                    {flights?.map((flight, index) => {
                      const intersectionPoints = findIntersectionPoints(
                        positions,
                        flight.positions
                      );

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
                                  ? "yellow"
                                  : intersectionPoints[0]?.nearestPoint
                                      ?.altitude_change === "D"
                                  ? "#FF00CC"
                                  : "#00FFFF",
                              strokeWeight:
                                selectedFlight &&
                                selectedFlight.ident === flight.ident
                                  ? 3
                                  : 1,
                              strokeOpacity: !selectedFlight
                                ? 1
                                : selectedFlight &&
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
                        strokeWeight: 4,
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
