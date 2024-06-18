import React, { useEffect, useState } from "react";
import { Field, Button } from "@headlessui/react";
import useMapStore from "../../../hooks/useMapStore";
import PositionInput from "./PositionInput";
import CountUp from "react-countup";

function MapInput() {
  const [lat1, setLat1] = useState(28.37);
  const [lon1, setLon1] = useState(-82.41);
  const [lat2, setLat2] = useState(28.38);
  const [lon2, setLon2] = useState(-82.42);

  const [isFetching, setIsFetching] = useState(false);
  const [flightsData, setFlightsData] = useState("");
  const flights = useMapStore((state) => state.flights);
  const setFlights = useMapStore((state) => state.setFlights);
  const setPositions = useMapStore((state) => state.setPositions);

  const [oldFlightsCount, setOldFlightsCount] = useState(0);
  const [newFlightsCount, setNewFlightsCount] = useState(0);
  useEffect(() => {
    setOldFlightsCount(newFlightsCount);
    setNewFlightsCount(flights.length);
  }, [flights]);

  const handleSearchFlights = async () => {
    setPositions({
      lat1,
      lon1,
      lat2,
      lon2,
    });

    setIsFetching(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/aero/flights/search/positions?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`,
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
    }
  };

  useEffect(() => {
    if (flightsData) {
      const items = flightsData.split("hhh");
      const data = [];

      for (let i = 0; i < items.length; i++) {
        try {
          const flight = JSON.parse(items[i]);
          console.log("flight", flight);
          data.push(flight);
        } catch (error) {}
      }

      setFlights(data);
    }
  }, [flightsData, setFlights]);

  return (
    <div className="w-1/4 p-6">
      <h1 className="text-center font-bold text-xl">MI Map Tools GeoPlotter</h1>
      <div className="mt-10">
        <p>Past/Enter Geo Points Details</p>
        <Field className={"grid grid-cols-1 gap-2 mt-4"}>
          <PositionInput label="Lat 1:" value={lat1} setValue={setLat1} />
          <PositionInput label="Lon 1:" value={lon1} setValue={setLon1} />
          <PositionInput label="Lat 2:" value={lat2} setValue={setLat2} />
          <PositionInput label="Lon 2:" value={lon2} setValue={setLon2} />
        </Field>

        <Button
          className="mt-5 rounded bg-sky-600 py-2 px-4 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
          onClick={handleSearchFlights}
        >
          {isFetching ? "Fetching Flights..." : "Show Flights"}
        </Button>
        <p>
          Found{" "}
          <CountUp end={flights.length} start={oldFlightsCount} duration={3} />{" "}
          flights in the area.
        </p>
      </div>
    </div>
  );
}

export default MapInput;
