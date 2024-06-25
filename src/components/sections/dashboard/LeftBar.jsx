import React from "react";
import MapInput from "./MapInput";
import FlightList from "./FlightList";
import MapViewToogleTabs from "./MapViewToogleTabs";

function LeftBar() {
  return (
    <div className="absolute w-[350px] z-10 top-0 left-0 p-3 flex flex-col gap-4 ">
      <MapViewToogleTabs />
      <MapInput />
      <FlightList />
    </div>
  );
}

export default LeftBar;
