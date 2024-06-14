import axios from "axios";

export default function useAero() {
  const base_url = `https://${process.env.REACT_APP_AERO_API_KEY}.flightaware.com/aeroapi`;

  async function getAeroData(lat, lon) {
    const response = await fetch(
      `${base_url}/observations/closest?p=${lat},${lon}&format=json&radius=350mi`
    );
    const data = await response.json();
    return data;
  }

  async function searchFiightPositions(lat, lon) {
    const response = await fetch(
      `${base_url}/flights/search/positions?query=%7B%3C+alt+500%7D+%7Brange+gs+10+100%7D&unique_flights=true`
    );
    const data = await response.json();

    console.log("data", data);
    return data;
  }

  async function searchFlights(lat1, lon1, lat2, lon2) {
    const response = await axios.get(
      `https://aeroapi.flightaware.com/aeroapi/flights/search?query=-latlong+%2244.953469+-111.045360+40.962321+-104.046577%22&max_pages=100`,
      {
        headers: {
          Accept: "application/json; charset=UTF-8",
          "x-apikey": process.env.REACT_APP_AERO_API_KEY,
        },
      }
    );
    console.log("data", response.data);
    return response.data;
  }

  return { getAeroData, searchFiightPositions, searchFlights };
}
