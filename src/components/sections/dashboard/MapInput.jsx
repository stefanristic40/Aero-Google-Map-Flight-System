import React, { useEffect, useState } from "react";
import { Field, Button, Checkbox } from "@headlessui/react";
import useMapStore from "../../../hooks/useMapStore";
import PositionInput from "./PositionInput";
import { findIntersectionPointsWithCircle, formatDateHM } from "../../../utils";
import {
  AirplaneInFlight,
  Clock,
  MagnifyingGlass,
  MapPin,
} from "@phosphor-icons/react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import PointSelector from "../../common/icons/PointSelector";
import axios from "axios";

function MapInput() {
  const setFlights = useMapStore((state) => state.setFlights);
  const positions = useMapStore((state) => state.positions);
  const setPositions = useMapStore((state) => state.setPositions);
  const setSearchStatus = useMapStore((state) => state.setSearchStatus);
  const searchStatus = useMapStore((state) => state.searchStatus);
  const searchMode = useMapStore((state) => state.searchMode);
  const setSearchMode = useMapStore((state) => state.setSearchMode);
  const centerPosition = useMapStore((state) => state.centerPosition);
  const setCenterPosition = useMapStore((state) => state.setCenterPosition);
  const setRadius = useMapStore((state) => state.setRadius);
  const radius = useMapStore((state) => state.radius);

  const [isShow, setIsShow] = useState(true);

  const [isHeightFilter, setIsHeightFilter] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);

  const [isDurationFilter, setIsDurationFilter] = useState(false);
  const timezoneOffset = new Date().getTimezoneOffset() * 60000;
  const [endDuration, setEndDuration] = useState(
    new Date(new Date() - timezoneOffset).toISOString().slice(0, 16)
  );

  const [startDuration, setStartDuration] = useState(
    new Date(new Date(Date.now() - 86400000 - timezoneOffset))
      .toISOString()
      .slice(0, 16)
  );

  const [isFetching, setIsFetching] = useState(false);
  // const [flightsData, setFlightsData] = useState("");

  // useEffect(() => {
  //   console.log("positions", positions);
  //   setLat1(positions.lat1);
  //   setLon1(positions.lon1);
  //   setLat2(positions.lat2);
  //   setLon2(positions.lon2);
  // }, [positions]);

  // const handleSearchFlights = async () => {
  //   setPositions({
  //     lat1,
  //     lon1,
  //     lat2,
  //     lon2,
  //   });

  //   setIsFetching(true);

  //   setFlights([]);

  //   try {
  //     const heightQuery = isHeightFilter ? `&maxHeight=${maxHeight}` : "";
  //     const startDurationQuery = isDurationFilter
  //       ? `&start=${startDuration}`
  //       : "";
  //     const endDurationQuery = isDurationFilter ? `&end=${endDuration}` : "";

  //     const response = await fetch(
  //       `${process.env.REACT_APP_BACKEND_URL}/v1/aero/flights/search/positions?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}${heightQuery}${startDurationQuery}${endDurationQuery}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           Accept: "application/json, text/plain, */*",
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (!response.ok || !response.body) {
  //       throw response.statusText;
  //     }

  //     // Here we start prepping for the streaming response
  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder();
  //     let buffer = ""; // Buffer to accumulate chunks
  //     const loopRunner = true;
  //     while (loopRunner) {
  //       // Here we start reading the stream, until its done.
  //       const { value, done } = await reader.read();

  //       if (done) {
  //         setIsFetching(false);
  //         break;
  //       }
  //       const decodedChunk = decoder.decode(value, { stream: true });
  //       // console.log("decodedChunk", decodedChunk);
  //       buffer += decodedChunk;
  //       setFlightsData(buffer);
  //     }
  //   } catch (error) {
  //     console.error("Error searching flights", error);
  //     setIsFetching(false);
  //   }
  // };

  const handleSearchFlights = async () => {
    setIsFetching(true);

    setFlights([]);

    try {
      var tempFlights = [];

      const heightQuery = isHeightFilter ? `&maxHeight=${maxHeight}` : "";

      const startDate = isDurationFilter
        ? new Date(startDuration)
        : new Date(new Date(Date.now() - 86400000));

      const endDate = isDurationFilter
        ? new Date(endDuration)
        : new Date(new Date());

      const timesteampGapMinutes = 15;
      const searchCount =
        (endDate.getTime() - startDate.getTime()) /
        (timesteampGapMinutes * 60 * 1000);

      for (let i = 0; i < searchCount; i++) {
        const start = new Date(
          startDate.getTime() + i * timesteampGapMinutes * 60 * 1000
        );
        const end = new Date(
          startDate.getTime() + (i + 1) * timesteampGapMinutes * 60 * 1000
        );

        setSearchStatus({
          total: searchCount,
          index: i + 1,
          start_date: start,
          end_date: end,
        });

        const res = await axios(
          `${
            process.env.REACT_APP_BACKEND_URL
          }/v1/aero/flights/search/positions_by_timestamps?lat1=${
            positions.lat1
          }&lon1=${positions.lon1}&lat2=${positions.lat2}&lon2=${
            positions.lon2
          }${heightQuery}&start=${start.toISOString()}&end=${end.toISOString()}`,
          {
            method: "GET",
          }
        );

        if (res.data.flights && res.data.flights.length > 0) {
          // eslint-disable-next-line no-loop-func
          res.data.flights.forEach((flight) => {
            // if (searchMode === "circle") {
            //   const intersection = findIntersectionPointsWithCircle(
            //     centerPosition,
            //     radius,
            //     flight.positions
            //   );

            //   console.log("intersection", intersection);

            //   if (!intersection || intersection.length === 0) {
            //     // return;
            //   }
            // }

            tempFlights = [...tempFlights, flight];
          });

          setFlights(tempFlights);
        }
      }

      setIsFetching(false);
    } catch (error) {
      console.error("Error searching flights", error);
      setIsFetching(false);
    }
  };

  // useEffect(() => {
  //   if (flightsData) {
  //     const items = flightsData.split("hhh");
  //     const data = [];

  //     for (let i = 0; i < items.length; i++) {
  //       try {
  //         const flight = JSON.parse(items[i]);
  //         setSearchStatus(flight.status);

  //         if (flight?.flightData) {
  //           data.push(flight.flightData);
  //         }
  //       } catch (error) {}
  //     }

  //     setFlights(data);
  //   }
  // }, [flightsData, setFlights]);

  const setPoint1 = (point1) => {
    setPositions({
      ...positions,
      lat1: point1.lat,
      lon1: point1.lon,
    });
  };

  const setPoint2 = (point2) => {
    setPositions({
      ...positions,
      lat2: point2.lat,
      lon2: point2.lon,
    });
  };

  const setCenterPoint = (point) => {
    setCenterPosition({
      lat: point.lat,
      lon: point.lon,
    });
  };

  useEffect(() => {
    if (searchMode === "circle") {
      console.log("center", centerPosition);

      setPositions({
        lat1: centerPosition.lat + radius / 110.574,
        lon1:
          centerPosition.lon +
          radius / (111.32 * Math.cos(centerPosition.lat * (Math.PI / 180))),
        lat2: centerPosition.lat - radius / 110.574,
        lon2:
          centerPosition.lon -
          radius / (111.32 * Math.cos(centerPosition.lat * (Math.PI / 180))),
      });
    }
  }, [searchMode, centerPosition, radius, setPositions]);

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
            <div className="flex justify-around items-center gap-4">
              {/* Square and Circle */}
              <div className="flex justify-around items-center gap-6">
                <div
                  className="flex items-center gap-2"
                  onClick={() => setSearchMode("square")}
                >
                  <input
                    type="radio"
                    id="square"
                    name="mode"
                    value="square"
                    checked={searchMode === "square"}
                  />
                  <label htmlFor="square" className="cursor-pointer">
                    Square
                  </label>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={() => setSearchMode("circle")}
                >
                  <input
                    type="radio"
                    id="circle"
                    name="mode"
                    value="circle"
                    checked={searchMode === "circle"}
                  />
                  <label htmlFor="circle" className="cursor-pointer">
                    Circle
                  </label>
                </div>
              </div>
            </div>
          </div>
          {searchMode === "square" && (
            <>
              <div className="mt-2">
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
                  <PositionInput
                    label="Lat:"
                    value={positions.lat1}
                    setValue={(e) => {
                      setPositions({
                        ...positions,
                        lat1: e.target.value,
                      });
                    }}
                  />
                  <PositionInput
                    label="Lon:"
                    value={positions.lon1}
                    setValue={(e) => {
                      setPositions({
                        ...positions,
                        lon1: e.target.value,
                      });
                    }}
                  />
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
                  <PositionInput
                    label="Lat:"
                    value={positions.lat2}
                    setValue={(e) => {
                      setPositions({
                        ...positions,
                        lat2: e.target.value,
                      });
                    }}
                  />
                  <PositionInput
                    label="Lon:"
                    value={positions.lon2}
                    setValue={(e) => {
                      setPositions({
                        ...positions,
                        lon2: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {searchMode === "circle" && (
            <>
              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <div className="flex justify-start items-center gap-2 ">
                    <MapPin className="h-5 w-4 text-[#6991FD] " weight="fill" />
                    <p className="text font-[600]">
                      Center Position
                      <span className="text-xs text-white font-normal">
                        {" "}
                        (Optional)
                      </span>
                    </p>
                  </div>
                  <PointSelector
                    setPoint={setCenterPoint}
                    pointLabel="center_point"
                  />
                </div>
                <div className="pl-3 flex flex-col gap-1 mt-2">
                  <PositionInput
                    label="Lat:"
                    value={centerPosition.lat}
                    setValue={(e) => {
                      setCenterPosition({
                        ...centerPosition,
                        lat: e.target.value,
                      });
                    }}
                  />
                  <PositionInput
                    label="Lon:"
                    value={centerPosition.lon}
                    setValue={(e) => {
                      setCenterPosition({
                        ...centerPosition,
                        lon: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-start items-center gap-2 ">
                  <AirplaneInFlight
                    className="h-5 w-4 text-custom4 "
                    weight="fill"
                  />
                  <p className="text font-[600]">Radius</p>
                </div>
                <div className="pl-3 flex flex-col gap-1 mt-2">
                  <PositionInput
                    label="Radius:"
                    value={radius}
                    setValue={(e) => {
                      setRadius(e.target.value);
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div className="mt-2">
            <div className="flex justify-between items-center">
              <div className="flex justify-start items-center gap-2 ">
                <AirplaneInFlight
                  className="h-5 w-4 text-custom4 "
                  weight="fill"
                />
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
                <Clock className="h-5 w-4 text-custom4 " weight="fill" />
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
                  min={new Date(new Date() - 86400000)
                    .toISOString()
                    .slice(0, 16)}
                  max={endDuration}
                />
                <PositionInput
                  label="End:"
                  type="datetime-local"
                  value={endDuration}
                  setValue={setEndDuration}
                  max={new Date()}
                  min={startDuration}
                />
              </div>
            )}
          </div>
        </Field>

        {isFetching &&
          (searchStatus && searchStatus.total && searchStatus.index ? (
            <div>
              <p className="text-sm text-center">
                Scanning for flights: Time-span # {searchStatus.index || 1} of{" "}
                {searchStatus.total}
                <br />
                {searchStatus.start_date && searchStatus.end_date && (
                  <p>
                    (from {formatDateHM(searchStatus.start_date)} to{" "}
                    {formatDateHM(searchStatus.end_date)})
                  </p>
                )}
              </p>

              {/* Progress bar */}
              <div className="overflow-hidden h-[2px] text-xs flex rounded bg-custom1">
                <div
                  style={{
                    width: `${
                      (searchStatus.index / searchStatus.total) * 100
                    }%`,
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-custom2 animate-pulse to-custom4"
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-center">Scanning for flights...</p>
          ))}

        <Button
          className={` ${
            isFetching ? "cursor-not-allowed" : "cursor-pointer"
          } w-full rounded text-sm flex justify-center items-center gap-2 bg-sky-600 py-2 px-4 font-medium text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700`}
          onClick={handleSearchFlights}
          disabled={isFetching}
        >
          <MagnifyingGlass className="h-4 w-4" weight="bold" />
          {isFetching ? "Searching Flights..." : "Search Flights"}
        </Button>
      </div>
    </div>
  );
}

export default MapInput;
