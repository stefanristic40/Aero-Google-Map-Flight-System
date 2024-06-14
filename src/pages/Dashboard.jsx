import React from "react";
import MapView from "../components/map/MapView";
import MapInput from "../components/sections/dashboard/MapInput";

function Dashboard() {
  return (
    <div className="flex">
      <MapInput />
      <MapView />
    </div>
  );
}

export default Dashboard;
