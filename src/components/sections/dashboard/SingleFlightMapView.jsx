import React from "react";
import {
  GoogleMap,
  Marker,
  OverlayView,
  Polyline,
} from "@react-google-maps/api";
import useMapStore from "../../../hooks/useMapStore";
import Airplane from "../../common/icons/Airplane";
import { findIntersectionPoints } from "../../../utils";

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

  const intersectionPoints = findIntersectionPoints(
    positions,
    flight.positions
  );

  return (
    <div
      className={`relative w-full h-[300px] ${
        selectedFlight?.ident === flight.ident
          ? "border-2 border-[#F8C023]"
          : "border border-black/20"
      } `}
    >
      <div className="absolute bottom-1 left-1 w-full flex justify-center rounded-lg text-white text-sm z-10">
        <div className="bg-black/50 p-2">
          <p>Altitude: {flight.last_position.altitude} ft</p>
          <p>Speed: {flight.last_position.groundspeed} mph</p>
        </div>
      </div>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        zoom={zoom * 0.9}
        center={center}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false,
          mapTypeId: "hybrid",
        }}
        onClick={() => {
          handleSelectFlight(flight);
        }}
      >
        <Marker
          position={{
            lat: intersectionPoints[0].intersection.latitude,
            lng: intersectionPoints[0].intersection.longitude,
          }}
        />
        <Marker
          position={{
            lat: intersectionPoints[1].intersection.latitude,
            lng: intersectionPoints[1].intersection.longitude,
          }}
        />
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
            strokeColor:
              intersectionPoints[0].nearestPoint.altitude_change === "D"
                ? "#FF00CC"
                : "#00FFFF",
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
