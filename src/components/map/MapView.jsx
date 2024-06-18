import React, { useEffect, useState } from "react";
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
  const mapRef = React.useRef(null);
  const handleSelectFlight = async (flight) => {
    // const positions = await getFlightTrack(flight.fa_flight_id);
    // const temp = {
    //   ...flight,
    //   positions,
    // };
    setSelectedFlight(flight);

    setIsFlightDetailModalOpen(true);
  };

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
      (156543.03392 * screenPixelDistance) / distance
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
    <div className="w-full h-screen">
      <div style={{ height: "100vh", width: "100%" }} ref={mapRef}>
        {!isLoaded ? (
          <div>Loading...</div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            zoom={zoom}
            center={center}
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
              if (
                selectedFlight &&
                flight?.fa_flight_id !== selectedFlight?.fa_flight_id
              ) {
                return null;
              }

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
                      strokeColor: "#F33A3A",
                      strokeWeight: 2,
                      strokeOpacity: 0.8,
                    }}
                    onClick={() => {
                      handleSelectFlight(flight);
                    }}
                  />
                </div>
              );
            })}
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
