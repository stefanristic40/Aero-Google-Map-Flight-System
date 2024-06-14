import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

function MapView() {
  const { isLoaded } = useJsApiLoader({
    libraries: ["places"],
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
  });

  return (
    // Important! Always set the container height explicitly
    <div className="w-full h-screen">
      {!isLoaded ? (
        <div>Loading...</div>
      ) : (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          zoom={10}
          center={{ lat: 44.7128, lng: -74.006 }} // Replace with your desired coordinates
        >
          <Marker position={{ lat: 40.7128, lng: -74.006 }} />
        </GoogleMap>
      )}
    </div>
  );
}

export default MapView;
