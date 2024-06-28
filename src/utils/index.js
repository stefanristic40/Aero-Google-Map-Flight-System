export const formatDateHM = (date) => {
  const newDate = new Date(date);
  const options = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return newDate.toLocaleTimeString("en-US", options);
};

export const formatDateHMS = (date) => {
  const newDate = new Date(date);
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return newDate.toLocaleTimeString("en-US", options);
};

export const formatDate = (date) => {
  const newDate = new Date(date);
  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return newDate.toLocaleDateString("en-US", options);
};

export function findIntersectionPoints(rect, flightPath) {
  const { lat1, lon1, lat2, lon2 } = rect;
  const rectLines = [
    { start: { lat: lat1, lon: lon1 }, end: { lat: lat1, lon: lon2 } }, // Top edge
    { start: { lat: lat1, lon: lon2 }, end: { lat: lat2, lon: lon2 } }, // Right edge
    { start: { lat: lat2, lon: lon2 }, end: { lat: lat2, lon: lon1 } }, // Bottom edge
    { start: { lat: lat2, lon: lon1 }, end: { lat: lat1, lon: lon1 } }, // Left edge
  ];

  function lineIntersect(line1, line2) {
    const { start: p1, end: p2 } = line1;
    const { start: p3, end: p4 } = line2;

    const det =
      (p2.lon - p1.lon) * (p4.lat - p3.lat) -
      (p2.lat - p1.lat) * (p4.lon - p3.lon);
    if (det === 0) return null; // Lines are parallel

    const t =
      ((p3.lon - p1.lon) * (p4.lat - p3.lat) -
        (p3.lat - p1.lat) * (p4.lon - p3.lon)) /
      det;
    const u =
      ((p3.lon - p1.lon) * (p2.lat - p1.lat) -
        (p3.lat - p1.lat) * (p2.lon - p1.lon)) /
      det;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        lat: p1.lat + t * (p2.lat - p1.lat),
        lon: p1.lon + t * (p2.lon - p1.lon),
        t,
      };
    }

    return null;
  }

  function interpolate(value1, value2, t) {
    return value1 + t * (value2 - value1);
  }

  function interpolateTimestamp(timestamp1, timestamp2, t) {
    const time1 = new Date(timestamp1).getTime();
    const time2 = new Date(timestamp2).getTime();
    return new Date(interpolate(time1, time2, t)).toISOString();
  }

  const results = [];

  for (let i = 0; i < flightPath.length - 1; i++) {
    const flightSegment = {
      start: flightPath[i],
      end: flightPath[i + 1],
    };

    rectLines.forEach((rectLine) => {
      const intersection = lineIntersect(rectLine, {
        start: {
          lat: flightSegment.start.latitude,
          lon: flightSegment.start.longitude,
        },
        end: {
          lat: flightSegment.end.latitude,
          lon: flightSegment.end.longitude,
        },
      });
      if (intersection) {
        const nearestPoint =
          distance(intersection, {
            lat: flightSegment.start.latitude,
            lon: flightSegment.start.longitude,
          }) <
          distance(intersection, {
            lat: flightSegment.end.latitude,
            lon: flightSegment.end.longitude,
          })
            ? flightSegment.start
            : flightSegment.end;

        const interpolatedPoint = {
          latitude: intersection.lat,
          longitude: intersection.lon,
          altitude: interpolate(
            flightSegment.start.altitude,
            flightSegment.end.altitude,
            intersection.t
          ),
          altitude_change: flightSegment.start.altitude_change, // Assuming constant
          fa_flight_id: flightSegment.start.fa_flight_id, // Assuming constant
          groundspeed: interpolate(
            flightSegment.start.groundspeed,
            flightSegment.end.groundspeed,
            intersection.t
          ),
          heading: interpolate(
            flightSegment.start.heading,
            flightSegment.end.heading,
            intersection.t
          ),
          timestamp: interpolateTimestamp(
            flightSegment.start.timestamp,
            flightSegment.end.timestamp,
            intersection.t
          ),
          update_type: flightSegment.start.update_type, // Assuming constant
        };

        results.push({
          intersection: interpolatedPoint,
          segment: [flightSegment.start, flightSegment.end],
          nearestPoint,
          index: i,
        });
      }
    });
  }

  return results;
}

export function distance(point1, point2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lon - point1.lon) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
