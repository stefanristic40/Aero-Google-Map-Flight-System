import React from "react";

import { AirplaneTakeoff, Gps } from "@phosphor-icons/react";
import useMapStore from "../../../hooks/useMapStore";
import { findIntersectionPoints } from "../../../utils";

function FlightDetailModal({ isOpen, setIsOpen, flight }) {
  const positions = useMapStore((state) => state.positions);

  const intersectionPoints = findIntersectionPoints(
    positions,
    flight.positions
  );

  const PointSection = ({
    title,
    latitude,
    longitude,
    altitude,
    groundspeed,
  }) => {
    return (
      <div className="">
        <div className="flex justify-start items-center gap-1 bg-custom2 py-2 px-3 text-white">
          <Gps size={20} />
          <p>{title}</p>
        </div>
        <div className="grid grid-cols-1 text-white bg-custom3 px-3 py-1 text-sm">
          <div className="flex justify-between gap-10">
            <p>Latitude</p>
            <p className="font-[500]">{latitude}</p>
          </div>
          <div className="flex justify-between gap-10">
            <p>Longitude</p>
            <p className="font-[500]">{longitude}</p>
          </div>
          <div className="flex justify-between gap-10">
            <p>Altitude</p>
            <p className="font-[500]">{altitude}</p>
          </div>
          <div className="flex justify-between gap-10">
            <p>Groundspeed</p>
            <p className="font-[500]">{groundspeed} mph</p>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div>
      <div className="fixed top-6 right-6 w-[360px] z-20 shadow-lg border border-custom3  bg-white">
        <div className="bg-custom1 flex justify-between items-center py-2 px-4">
          <div>
            <p className="text-[#F8C023] font-medium text-lg">
              {flight?.ident}{" "}
            </p>
            <p className="text-white text-sm">{flight?.aircraft_type}</p>
          </div>
          <button
            className="text-white font-bold "
            onClick={() => setIsOpen(false)}
          >
            &#10005;
          </button>
        </div>
        <div className="flex justify-between items-center bg-[#EDEDED]">
          <div className="w-full text-center py-4">
            <p className="text-2xl font-bold">{flight?.origin?.code}</p>
            <p className="text-base font-medium">{flight?.origin?.city}</p>
          </div>
          <div>
            <div className="w-14 h-14 flex justify-center items-center bg-white rounded-full overflow-hidden ">
              <AirplaneTakeoff
                size={32}
                weight="fill"
                className="text-[#F8C023]"
              />
            </div>
          </div>
          <div className="w-full text-center py-4">
            <p className="text-2xl font-bold">{flight?.destination?.code}</p>
            <p className="text-base font-medium">{flight?.destination?.city}</p>
          </div>
        </div>
        <div>
          <PointSection
            title="Current"
            latitude={flight.last_position.latitude}
            longitude={flight.last_position.longitude}
            altitude={flight.last_position.altitude}
            groundspeed={flight.last_position.groundspeed}
          />
          <PointSection
            title="Entrance Point"
            latitude={intersectionPoints[0].intersection.latitude}
            longitude={intersectionPoints[0].intersection.longitude}
            altitude={intersectionPoints[0].intersection.altitude}
            groundspeed={intersectionPoints[0].intersection.groundspeed}
          />
          <PointSection
            title="Exit Point"
            latitude={intersectionPoints[1].intersection.latitude}
            longitude={intersectionPoints[1].intersection.longitude}
            altitude={intersectionPoints[1].intersection.altitude}
            groundspeed={intersectionPoints[1].intersection.groundspeed}
          />
        </div>
      </div>
    </div>
  );
}

export default FlightDetailModal;
