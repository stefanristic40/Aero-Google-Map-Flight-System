import React, { useEffect, useState } from "react";
import { Field, Button, Checkbox } from "@headlessui/react";
import useMapStore from "../../../hooks/useMapStore";
import PositionInput from "./PositionInput";
import { formatDateHM } from "../../../utils";
import {
  AirplaneInFlight,
  Clock,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import PointSelector from "../../common/icons/PointSelector";

function MapInput() {
  const setFlights = useMapStore((state) => state.setFlights);
  const positions = useMapStore((state) => state.positions);
  const setPositions = useMapStore((state) => state.setPositions);
  const setSearchStatus = useMapStore((state) => state.setSearchStatus);
  const searchStatus = useMapStore((state) => state.searchStatus);

  const [isShow, setIsShow] = useState(true);

  const [lat1, setLat1] = useState(positions.lat1);
  const [lon1, setLon1] = useState(positions.lon1);
  const [lat2, setLat2] = useState(positions.lat2);
  const [lon2, setLon2] = useState(positions.lon2);

  const [isHeightFilter, setIsHeightFilter] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);

  const timezoneOffset = new Date().getTimezoneOffset() * 60000;
  const [isDurationFilter, setIsDurationFilter] = useState(true);
  // Adjust endDuration to local time
  const [endDuration, setEndDuration] = useState(
    new Date(new Date() - timezoneOffset).toISOString().slice(0, 16)
  );

  // Adjust startDuration to 1 day before current local time, considering local timezone
  const [startDuration, setStartDuration] = useState(
    new Date(new Date(Date.now() - 86400000 - timezoneOffset))
      .toISOString()
      .slice(0, 16)
  );

  const [isFetching, setIsFetching] = useState(false);
  const [flightsData, setFlightsData] = useState("");

  // useEffect(() => {
  //   setPositions({
  //     lat1,
  //     lon1,
  //     lat2,
  //     lon2,
  //   });
  // }, [lat1, lon1, lat2, lon2, setPositions]);

  useEffect(() => {
    console.log("positions", positions);
    setLat1(positions.lat1);
    setLon1(positions.lon1);
    setLat2(positions.lat2);
    setLon2(positions.lon2);
  }, [positions]);

  const handleSearchFlights = async () => {
    setPositions({
      lat1,
      lon1,
      lat2,
      lon2,
    });

    setIsFetching(true);

    setFlights([]);

    try {
      const heightQuery = isHeightFilter ? `&maxHeight=${maxHeight}` : "";
      const startDurationQuery = isDurationFilter
        ? `&start=${startDuration}`
        : "";
      const endDurationQuery = isDurationFilter ? `&end=${endDuration}` : "";

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/v1/aero/flights/search/positions?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}${heightQuery}${startDurationQuery}${endDurationQuery}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok || !response.body) {
        throw response.statusText;
      }

      // Here we start prepping for the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; // Buffer to accumulate chunks
      const loopRunner = true;
      while (loopRunner) {
        // Here we start reading the stream, until its done.
        const { value, done } = await reader.read();
        if (done) {
          setIsFetching(false);
          break;
        }
        const decodedChunk = decoder.decode(value, { stream: true });
        // console.log("decodedChunk", decodedChunk);
        buffer += decodedChunk;
        setFlightsData(buffer);
      }
    } catch (error) {
      console.error("Error searching flights", error);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (flightsData) {
      const items = flightsData.split("hhh");
      const data = [];

      for (let i = 0; i < items.length; i++) {
        try {
          const flight = JSON.parse(items[i]);
          setSearchStatus(flight.status);

          if (flight?.flightData) {
            data.push(flight.flightData);
          }
        } catch (error) {}
      }

      setFlights(data);
    }
  }, [flightsData, setFlights]);

  const setPoint1 = (point1) => {
    setPositions({
      lat1: point1.lat,
      lon1: point1.lon,
      lat2,
      lon2,
    });
  };

  const setPoint2 = (point2) => {
    setPositions({
      lat1,
      lon1,
      lat2: point2.lat,
      lon2: point2.lon,
    });
  };

  return (
    <div className="w-full text-sm h-max bg-custom1 text-white rounded-lg overflow-hidden shadow-lg">
      <div className="bg-custom2 p-2 flex justify-between items-center ">
        <p className="font-bold">Search Flights</p>
        <button className="p-0 m-0" onClick={() => setIsShow(!isShow)}>
          {isShow ? (
            <CaretDown size={16} weight="thin" />
          ) : (
            <CaretUp size={16} weight="thin" />
          )}
        </button>
      </div>
      <div className={` ${isShow ? "block" : "hidden"} `}>
        <Field className={"py-2 px-2"}>
          <div>
            <div className="flex justify-between items-center">
              <div className="flex justify-start items-center ">
                <img
                  src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  alt="green-dot"
                  className="h-5 w-5"
                />
                <p className="text font-[600]">Position 1</p>
              </div>
              <PointSelector setPoint={setPoint1} pointLabel="point1" />
            </div>
            <div className="pl-3 flex flex-col gap-1 mt-2">
              <PositionInput label="Lat:" value={lat1} setValue={setLat1} />
              <PositionInput label="Lon:" value={lon1} setValue={setLon1} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <div className="flex justify-start items-center ">
                <img
                  src="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  alt="green-dot"
                  className="h-5 w-5"
                />
                <p className="text font-[600]">Position 2</p>
              </div>
              <PointSelector setPoint={setPoint2} pointLabel="point2" />
            </div>
            <div className="pl-3 flex flex-col gap-1 mt-2">
              <PositionInput label="Lat:" value={lat2} setValue={setLat2} />
              <PositionInput label="Lon:" value={lon2} setValue={setLon2} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <div className="flex justify-start items-center gap-2 ">
                <AirplaneInFlight className="h-5 w-4 text-custom4 " />
                <p className="text font-[600]">
                  Max Height
                  <span className="text-xs text-white font-normal">
                    {" "}
                    (Optional)
                  </span>
                </p>
              </div>
              <Checkbox
                checked={isHeightFilter}
                onChange={setIsHeightFilter}
                className="group block size-4 rounded border bg-custom1  cursor-pointer "
              >
                <svg
                  className="stroke-white opacity-0 group-data-[checked]:opacity-100"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Checkbox>
            </div>
            {isHeightFilter && (
              <div className="pl-3 flex flex-col gap-1 mt-2">
                <PositionInput
                  label="Height:"
                  value={maxHeight}
                  setValue={setMaxHeight}
                />
              </div>
            )}
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <div className="flex justify-start items-center gap-2 ">
                <Clock className="h-5 w-4 text-custom4 " />
                <p className="text font-[600]">
                  Duration
                  <span className="text-xs text-white font-normal">
                    {" "}
                    (Optional)
                  </span>
                </p>
              </div>
              <Checkbox
                checked={isDurationFilter}
                onChange={setIsDurationFilter}
                className="group block size-4 rounded border bg-custom1  cursor-pointer "
              >
                <svg
                  className="stroke-white opacity-0 group-data-[checked]:opacity-100"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Checkbox>
            </div>
            {isDurationFilter && (
              <div className="pl-3 flex flex-col gap-1 mt-2">
                <PositionInput
                  label="Start:"
                  type="datetime-local"
                  value={startDuration}
                  setValue={setStartDuration}
                />
                <PositionInput
                  label="End:"
                  type="datetime-local"
                  value={endDuration}
                  setValue={setEndDuration}
                />
              </div>
            )}
          </div>
        </Field>

        {isFetching && (
          <div>
            <p className="text-sm text-center">
              Scanning for flights: Time-span # {searchStatus.index || 1} of 96
              <br />
              {searchStatus.start_date && searchStatus.end_date && (
                <p>
                  (from {formatDateHM(searchStatus.start_date)} to{" "}
                  {formatDateHM(searchStatus.end_date)})
                </p>
              )}
            </p>
          </div>
        )}

        <Button
          className="w-full rounded text-sm flex justify-center items-center gap-2 bg-sky-600 py-2 px-4 font-medium text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
          onClick={handleSearchFlights}
        >
          <MagnifyingGlass className="h-4 w-4" weight="bold" />
          {isFetching ? "Fetching Flights..." : "Show Flights"}
        </Button>
      </div>
    </div>
  );
}

export default MapInput;
