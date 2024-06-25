import React from "react";
import MapView from "../components/sections/dashboard/MapView";
import LeftBar from "../components/sections/dashboard/LeftBar";

function Dashboard() {
  return (
    <div className="relative">
      <LeftBar />
      <MapView />
    </div>
  );
}

export default Dashboard;
