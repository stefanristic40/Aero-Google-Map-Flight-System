import React from "react";
import { GoogleMap, OverlayView, Polyline } from "@react-google-maps/api";
import useMapStore from "../../../hooks/useMapStore";
import Airplane from "../../common/icons/Airplane";

function SingleFlightMapView({ flight, zoom, center }) {
  const selectedFlight = useMapStore((state) => state.selectedFlight);
  const positions = useMapStore((state) => state.positions);
  const setSelectedFlight = useMapStore((state) => state.setSelectedFlight);

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

  const handleSelectFlight = async (flight) => {
    setSelectedFlight(flight);
  };

  return (
    <div
      className={`w-full h-[300px] ${
        selectedFlight?.ident === flight.ident
          ? "border-2 border-[#F8C023]"
          : "border border-black/20"
      } `}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        zoom={zoom * 0.9}
        center={center}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false,
          mapTypeId: "satellite",
        }}
        onClick={() => {
          handleSelectFlight(flight);
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
            strokeColor: "#04FD04",
            strokeWeight: 5,
            strokeOpacity: 0.8,
          }}
        />
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
            className="h-6 w-6 cursor-pointer"
          />
        </OverlayView>
        <Polyline
          path={positionsToPolyline(flight.positions, flight.last_position)}
          options={{
            strokeColor: "#00FFFF",
            strokeWeight: 2,
            strokeOpacity: 1,
          }}
          onClick={() => {
            handleSelectFlight(flight);
          }}
        />
      </GoogleMap>
    </div>
  );
}

export default SingleFlightMapView;
