import React, { useEffect, useState } from "react";
import useMapStore from "../../../hooks/useMapStore";
import {
  Airplane,
  AirplaneInFlight,
  CaretDown,
  CaretUp,
  Speedometer,
} from "@phosphor-icons/react";
import CountUp from "react-countup";
import { ftToMeterRatio } from "../../../constants";

function FlightList() {
  const [isShow, setIsShow] = useState(true);

  const flights = useMapStore((state) => state.flights);
  const setSelectedFlight = useMapStore((state) => state.setSelectedFlight);
  const selectedFlight = useMapStore((state) => state.selectedFlight);

  const [oldFlightsCount, setOldFlightsCount] = useState(0);
  const [newFlightsCount, setNewFlightsCount] = useState(0);

  useEffect(() => {
    setOldFlightsCount(newFlightsCount);
    setNewFlightsCount(flights.length);
  }, [flights]);

  return (
    <div className="w-full text-sm bg-custom1 rounded-lg overflow-hidden shadow-lg">
      <div className="flex bg-custom2 text-white justify-between items-center p-2">
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
            <CaretDown size={16} weight="thin" />
          ) : (
            <CaretUp size={16} weight="thin" />
          )}
        </button>
      </div>
      <div className={` ${isShow ? "block pb-2 " : "hidden"}`}>
        <div
          className={`pl-2 pr-1 py-2  max-h-[370px] overflow-auto custom-scrollbar flex flex-col gap-1.5 `}
        >
          {flights.map((flight, index) => (
            <div
              key={index}
              className={`w-full flex justify-between items-center pl-1 pr-2 py-1 cursor-pointer transition-all ease-in-out
              ${
                selectedFlight?.ident === flight.ident
                  ? "bg-custom3 text-custom4"
                  : "bg-[#414141] text-white hover:bg-custom3"
              }
            `}
              onClick={() => setSelectedFlight(flight)}
            >
              <div className="flex justify-start items-center w-full gap-3">
                <Airplane
                  className={`h-6 w-6 ml-2 ${
                    selectedFlight?.ident === flight.ident
                      ? "text-custom4"
                      : "text-white"
                  } `}
                />
                <div className="w-full">
                  <div className="flex justify-start items-end  gap-2">
                    <p className="font-medium text-sm p-0 m-0">
                      {flight?.ident}
                    </p>
                    <p className="text-xs text-nowrap p-0 m-0">
                      {flight?.aircraft_type}
                    </p>
                  </div>
                  <div className="">
                    <span className="text-sm  p-0 m-0">
                      {flight?.origin?.city} - {flight?.destination?.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1  text-xs font-[400] ">
                    <p className="flex items-center gap-1">
                      <Speedometer className="h-4 w-4" />
                      <span className="text-xs font-[600]">
                        {flight?.last_position?.groundspeed} mph
                      </span>
                    </p>
                    <p className="flex items-center gap-1">
                      <AirplaneInFlight className="h-4 w-4 " />
                      <span className="text-xs font-[600]">
                        {flight?.last_position?.altitude > 0
                          ? (
                              flight?.last_position?.altitude *
                              ftToMeterRatio *
                              100
                            ).toFixed(0)
                          : 0}{" "}
                        m
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {flights.length === 0 && (
            <div className="text-center text-sm text-white w-full">
              No flights available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlightList;
