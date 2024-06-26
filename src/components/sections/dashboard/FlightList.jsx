import React, { useEffect, useState } from "react";
import useMapStore from "../../../hooks/useMapStore";
import { Airplane, CaretDown, CaretUp } from "@phosphor-icons/react";
import CountUp from "react-countup";

function FlightList() {
  const [isShow, setIsShow] = useState(false);

  const flights = useMapStore((state) => state.flights);
  const setSelectedFlight = useMapStore((state) => state.setSelectedFlight);
  const selectedFlight = useMapStore((state) => state.selectedFlight);

  const [oldFlightsCount, setOldFlightsCount] = useState(0);
  const [newFlightsCount, setNewFlightsCount] = useState(0);

  useEffect(() => {
    setOldFlightsCount(newFlightsCount);
    setNewFlightsCount(flights.length);
  }, [flights]);

  if (!flights || (flights && flights.length === 0)) {
    return null;
  }

  return (
    <div className="w-full bg-custom1 rounded-lg overflow-hidden shadow-lg">
      <div className="flex bg-custom2 text-white justify-between items-center p-3">
        <p className="font-bold p-0 m-0">
          Flights{" "}
          <span className="text-xs font-normal ">
            (
            <CountUp
              end={flights.length}
              start={oldFlightsCount}
              duration={3}
            />
            )
          </span>
        </p>
        <button className="p-0 m-0" onClick={() => setIsShow(!isShow)}>
          {isShow ? (
            <CaretDown size={22} weight="thin" />
          ) : (
            <CaretUp size={22} weight="thin" />
          )}
        </button>
      </div>
      <div className={` ${isShow ? "block pb-2 " : "hidden"}`}>
        <div
          className={`pl-3 pr-2 py-2 h-full max-h-[400px] overflow-auto custom-scrollbar flex flex-col gap-2 `}
        >
          {flights.map((flight, index) => (
            <div
              key={index}
              className={`px-2 py-2 flex justify-start items-center gap-4 cursor-pointer transition-all ease-in-out
              ${
                selectedFlight?.ident === flight.ident
                  ? "bg-custom3 text-custom4"
                  : "bg-[#414141] text-white hover:bg-custom3"
              }
            `}
              onClick={() => setSelectedFlight(flight)}
            >
              <Airplane
                className={`h-6 w-6  ${
                  selectedFlight?.ident === flight.ident
                    ? "text-custom4"
                    : "text-white"
                } `}
              />
              <div>
                <p className="font-medium text-sm ">{flight?.ident}</p>
                <p className="text-xs">{flight?.aircraft_type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FlightList;
