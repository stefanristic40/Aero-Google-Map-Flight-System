import React, { useEffect, useState } from "react";
import { Field, Button } from "@headlessui/react";
import useMapStore from "../../../hooks/useMapStore";
import PositionInput from "./PositionInput";
import { toast } from "react-toastify";
import { formatDateHM } from "../../../utils";
import { MagnifyingGlass } from "@phosphor-icons/react";

function MapInput() {
  const [lat1, setLat1] = useState(28.17210970976778);
  const [lon1, setLon1] = useState(-82.50865363659598);
  const [lat2, setLat2] = useState(28.113446816195648);
  const [lon2, setLon2] = useState(-82.44046183086733);

  const [isFetching, setIsFetching] = useState(false);
  const [flightsData, setFlightsData] = useState("");
  const setFlights = useMapStore((state) => state.setFlights);
  const setPositions = useMapStore((state) => state.setPositions);
  const setSearchStatus = useMapStore((state) => state.setSearchStatus);
  const searchStatus = useMapStore((state) => state.searchStatus);

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
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/v1/aero/flights/search/positions?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`,
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

  return (
    <div className="w-full bg-custom1 text-white rounded-lg overflow-hidden shadow-lg">
      <div className="bg-custom2  p-3">
        <p className="font-bold">Search Flights</p>
      </div>
      <div className="">
        <Field className={"grid grid-cols-1 gap-2 py-2 px-3"}>
          <PositionInput label="Lat 1:" value={lat1} setValue={setLat1} />
          <PositionInput label="Lon 1:" value={lon1} setValue={setLon1} />
          <PositionInput label="Lat 2:" value={lat2} setValue={setLat2} />
          <PositionInput label="Lon 2:" value={lon2} setValue={setLon2} />
        </Field>

        {isFetching && (
          <div>
            <p className="text-sm text-center">
              Scanning for flights: Time-span #{searchStatus.index} of 96
              <br />
              (from {formatDateHM(searchStatus.start_date)} to{" "}
              {formatDateHM(searchStatus.end_date)})
            </p>
          </div>
        )}

        <Button
          className="w-full rounded flex justify-center items-center gap-2 bg-sky-600 py-3 px-4 text-sm font-medium text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
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
