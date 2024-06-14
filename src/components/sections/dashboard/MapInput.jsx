import React, { useState } from "react";
import { Textarea, Checkbox, Field, Label, Button } from "@headlessui/react";
import useAero from "../../../hooks/useAero";
import useMapStore from "../../../hooks/useMapStore";

function MapInput() {
  const [isShowPointNumbers, setIsShowPointNumbers] = useState(false);
  const [isShowLines, setIsShowLines] = useState(false);

  const { searchFlights } = useAero();
  const setFlights = useMapStore((state) => state.setFlights);

  const handleSearchFlights = async () => {
    const flights = await searchFlights(40.7128, -74.006, 44.7128, -74.006);
    console.log("flights", flights);
    setFlights(flights);
  };

  return (
    <div className="w-1/4 p-6">
      <h1 className="text-center font-bold text-xl">MI Map Tools GeoPlotter</h1>
      <div className="mt-10">
        <p>Past/Enter Geo Points Details</p>
        <Textarea
          name="description"
          className="text-black w-full border border-black/30 outline-none p-3 h-48"
        ></Textarea>

        <Field className="flex items-center gap-2 mt-5">
          <Checkbox
            checked={isShowPointNumbers}
            onChange={setIsShowPointNumbers}
            className="group block size-4 rounded border border-black/30 bg-white data-[checked]:bg-blue-500"
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
          <Label>Show Point Numbers</Label>
        </Field>
        <Field className="flex items-center gap-2">
          <Checkbox
            checked={isShowLines}
            onChange={setIsShowLines}
            className="group block size-4 rounded border border-black/30 bg-white data-[checked]:bg-blue-500"
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
          <Label>Show Lines</Label>
        </Field>
        <Button
          className="mt-5 rounded bg-sky-600 py-2 px-4 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
          onClick={handleSearchFlights}
        >
          Update Map
        </Button>
      </div>
    </div>
  );
}

export default MapInput;
