import React from "react";
import MapInput from "./MapInput";
import FlightList from "./FlightList";
import MapViewToogleTabs from "./MapViewToogleTabs";

function LeftBar() {
  return (
    <div className="absolute w-[320px] h-screen z-20 top-0 left-0 p-3 flex flex-col gap-3 ">
      <MapViewToogleTabs />
      <MapInput />
      <FlightList />
    </div>
  );
}

export default LeftBar;
