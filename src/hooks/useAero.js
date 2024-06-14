import axios from "axios";

export default function useAero() {
  async function searchFlights(lat1, lon1, lat2, lon2) {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/v1/aero/flights/search?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`
      );
      return response.data.flights;
    } catch (error) {
      console.error("Error searching flights", error);
      return [];
    }
  }

  return { searchFlights };
}
