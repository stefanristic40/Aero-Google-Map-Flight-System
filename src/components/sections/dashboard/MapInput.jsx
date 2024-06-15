import React, { useState } from "react";
import { Field, Button } from "@headlessui/react";
import useAero from "../../../hooks/useAero";
import useMapStore from "../../../hooks/useMapStore";
import PositionInput from "./PositionInput";
import { toast } from "react-toastify";

function MapInput() {
  const [lat1, setLat1] = useState(28.152890667136678);
  const [lon1, setLon1] = useState(-82.55100763322196);
  const [lat2, setLat2] = useState(28.105578910933378);
  const [lon2, setLon2] = useState(-82.47799101938415);

  const { searchFlightsPositions } = useAero();
  const setFlights = useMapStore((state) => state.setFlights);
  const setPositions = useMapStore((state) => state.setPositions);

  const handleSearchFlights = async () => {
    setPositions({
      lat1,
      lon1,
      lat2,
      lon2,
    });

    const flights = await searchFlightsPositions({
      lat1,
      lon1,
      lat2,
      lon2,
    });
    console.log("flights", flights);
    setFlights(flights);
    toast.success(`${flights.length} Flights loaded successfully`);
  };

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
          Show Flights
        </Button>
      </div>
    </div>
  );
}

export default MapInput;
