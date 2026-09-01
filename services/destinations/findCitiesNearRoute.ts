import { toRadians } from "@/services/geo/distance";

export type RoutePolylineCoordinate = readonly [longitude: number, latitude: number];

export type RouteNearbyCityRelation = "traversed_proxy" | "nearby_proxy";

export type RouteNearbyCityCandidate = {
  cityId: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
};

export type RouteNearbyCityResult = {
  cityId: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  distanceToRouteKm: number;
  routeRelation: RouteNearbyCityRelation;
};

type LocalPoint = {
  x: number;
  y: number;
};

const EARTH_RADIUS_KM = 6371;
const KM_PER_RADIAN = EARTH_RADIUS_KM;

function projectPointToLocalPlane(
  latitude: number,
  longitude: number,
  referenceLatitudeRadians: number,
  originLatitude: number,
  originLongitude: number
): LocalPoint {
  const latitudeDeltaRadians = toRadians(latitude - originLatitude);
  const longitudeDeltaRadians = toRadians(longitude - originLongitude);

  return {
    x: longitudeDeltaRadians * Math.cos(referenceLatitudeRadians) * KM_PER_RADIAN,
    y: latitudeDeltaRadians * KM_PER_RADIAN,
  };
}

function distanceFromPointToSegmentKm(
  pointLatitude: number,
  pointLongitude: number,
  segmentStart: RoutePolylineCoordinate,
  segmentEnd: RoutePolylineCoordinate
): number {
  const referenceLatitudeRadians = toRadians(pointLatitude);
  const point = { x: 0, y: 0 };
  const start = projectPointToLocalPlane(
    segmentStart[1],
    segmentStart[0],
    referenceLatitudeRadians,
    pointLatitude,
    pointLongitude
  );
  const end = projectPointToLocalPlane(
    segmentEnd[1],
    segmentEnd[0],
    referenceLatitudeRadians,
    pointLatitude,
    pointLongitude
  );

  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (segmentLengthSquared === 0) {
    return Math.hypot(start.x - point.x, start.y - point.y);
  }

  const projectionRatio =
    ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) /
    segmentLengthSquared;
  const clampedRatio = Math.min(1, Math.max(0, projectionRatio));
  const closestPointX = start.x + clampedRatio * segmentX;
  const closestPointY = start.y + clampedRatio * segmentY;

  return Math.hypot(closestPointX - point.x, closestPointY - point.y);
}

function normalizePolyline(polyline: readonly RoutePolylineCoordinate[]): RoutePolylineCoordinate[] {
  return polyline.filter((coordinate): coordinate is RoutePolylineCoordinate => {
    return (
      Array.isArray(coordinate) &&
      coordinate.length === 2 &&
      typeof coordinate[0] === "number" &&
      typeof coordinate[1] === "number"
    );
  });
}

/**
 * Approximates point-to-route distance on a local tangent plane.
 * The route is provided as OSRM GeoJSON coordinates [longitude, latitude].
 * For each city, we project the route segments around the city's latitude
 * and compute the minimum Euclidean distance to the nearest segment.
 * This is stable enough for small CoolGuide corridor thresholds.
 */
export function findCitiesNearRoute(
  polyline: readonly RoutePolylineCoordinate[],
  cities: readonly RouteNearbyCityCandidate[]
): RouteNearbyCityResult[] {
  const normalizedPolyline = normalizePolyline(polyline);

  if (normalizedPolyline.length < 2) {
    return [];
  }

  const results: RouteNearbyCityResult[] = [];

  for (const city of cities) {
    if (
      typeof city.latitude !== "number" ||
      typeof city.longitude !== "number" ||
      !city.cityId ||
      !city.name ||
      !city.slug
    ) {
      continue;
    }

    let minDistanceKm = Number.POSITIVE_INFINITY;

    for (let index = 0; index < normalizedPolyline.length - 1; index += 1) {
      const segmentStart = normalizedPolyline[index];
      const segmentEnd = normalizedPolyline[index + 1];
      const distanceKm = distanceFromPointToSegmentKm(
        city.latitude,
        city.longitude,
        segmentStart,
        segmentEnd
      );

      if (distanceKm < minDistanceKm) {
        minDistanceKm = distanceKm;
      }
    }

    if (!Number.isFinite(minDistanceKm) || minDistanceKm > 5) {
      continue;
    }

    results.push({
      cityId: city.cityId,
      name: city.name,
      slug: city.slug,
      latitude: city.latitude,
      longitude: city.longitude,
      distanceToRouteKm: minDistanceKm,
      routeRelation: minDistanceKm <= 1 ? "traversed_proxy" : "nearby_proxy",
    });
  }

  results.sort((left, right) => {
    if (left.distanceToRouteKm !== right.distanceToRouteKm) {
      return left.distanceToRouteKm - right.distanceToRouteKm;
    }

    return left.name.localeCompare(right.name, "fr", { sensitivity: "base" });
  });

  return results;
}
