import { findCitiesNearRoute, type RouteNearbyCityCandidate, type RouteNearbyCityRelation, type RoutePolylineCoordinate } from "./findCitiesNearRoute";

export type OsrmRouteSummary = {
  routeId: string;
  geometry: RoutePolylineCoordinate[];
  distanceKm: number | null;
  durationMinutes: number | null;
};

export type RouteNearbyCityHit = {
  routeId: string;
  distanceToRouteKm: number;
  routeRelation: RouteNearbyCityRelation;
};

export type RouteMergedCityResult = {
  cityId: string;
  name: string;
  slug: string;
  minDistanceToRouteKm: number;
  routeCount: number;
  routes: RouteNearbyCityHit[];
};

export type OsrmRouteAlternativeResponse = {
  routes?: Array<{
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
    distance?: number;
    duration?: number;
  }>;
  code?: string;
};

function normalizeRouteCoordinates(
  coordinates: Array<[number, number]> | undefined
): RoutePolylineCoordinate[] {
  if (!coordinates) {
    return [];
  }

  return coordinates.filter((coordinate): coordinate is [number, number] => {
    return (
      Array.isArray(coordinate) &&
      coordinate.length === 2 &&
      typeof coordinate[0] === "number" &&
      typeof coordinate[1] === "number"
    );
  }) as RoutePolylineCoordinate[];
}

export async function fetchOsrmAlternativeRoutes(
  originLongitude: number,
  originLatitude: number,
  destinationLongitude: number,
  destinationLatitude: number,
  abortSignal?: AbortSignal
): Promise<OsrmRouteSummary[]> {
  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${originLongitude},${originLatitude};${destinationLongitude},${destinationLatitude}`
  );
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "false");
  url.searchParams.set("alternatives", "true");

  const response = await fetch(url.toString(), { signal: abortSignal });

  if (!response.ok) {
    throw new Error("Le service de routage est indisponible.");
  }

  const payload = (await response.json()) as OsrmRouteAlternativeResponse;

  if (payload.code !== "Ok" || !payload.routes || payload.routes.length === 0) {
    throw new Error("Aucun itinéraire routier n’a été trouvé.");
  }

  return payload.routes
    .map((route, index) => ({
      routeId: `route_${index + 1}`,
      geometry: normalizeRouteCoordinates(route.geometry?.coordinates),
      distanceKm: typeof route.distance === "number" ? route.distance / 1000 : null,
      durationMinutes: typeof route.duration === "number" ? route.duration / 60 : null,
    }))
    .filter((route) => route.geometry.length > 0);
}

export function findCitiesAcrossRoutes(
  routes: readonly OsrmRouteSummary[],
  cities: readonly RouteNearbyCityCandidate[]
): RouteMergedCityResult[] {
  const mergedByCityId = new Map<
    string,
    {
      cityId: string;
      name: string;
      slug: string;
      minDistanceToRouteKm: number;
      routeHits: RouteNearbyCityHit[];
    }
  >();

  for (const route of routes) {
    const nearbyCities = findCitiesNearRoute(route.geometry, cities);

    for (const city of nearbyCities) {
      const existing = mergedByCityId.get(city.cityId);
      const nextHit: RouteNearbyCityHit = {
        routeId: route.routeId,
        distanceToRouteKm: city.distanceToRouteKm,
        routeRelation: city.routeRelation,
      };

      if (!existing) {
        mergedByCityId.set(city.cityId, {
          cityId: city.cityId,
          name: city.name,
          slug: city.slug,
          minDistanceToRouteKm: city.distanceToRouteKm,
          routeHits: [nextHit],
        });
        continue;
      }

      existing.minDistanceToRouteKm = Math.min(existing.minDistanceToRouteKm, city.distanceToRouteKm);
      existing.routeHits.push(nextHit);
    }
  }

  const mergedResults: RouteMergedCityResult[] = Array.from(mergedByCityId.values()).map((city) => {
    city.routeHits.sort((left, right) => {
      if (left.distanceToRouteKm !== right.distanceToRouteKm) {
        return left.distanceToRouteKm - right.distanceToRouteKm;
      }

      return left.routeId.localeCompare(right.routeId, "fr", { sensitivity: "base" });
    });

    return {
      cityId: city.cityId,
      name: city.name,
      slug: city.slug,
      minDistanceToRouteKm: city.minDistanceToRouteKm,
      routeCount: city.routeHits.length,
      routes: city.routeHits,
    };
  });

  mergedResults.sort((left, right) => {
    if (left.routeCount !== right.routeCount) {
      return right.routeCount - left.routeCount;
    }

    if (left.minDistanceToRouteKm !== right.minDistanceToRouteKm) {
      return left.minDistanceToRouteKm - right.minDistanceToRouteKm;
    }

    return left.name.localeCompare(right.name, "fr", { sensitivity: "base" });
  });

  return mergedResults;
}

export async function fetchCitiesAcrossOsrmRoutes(
  originLongitude: number,
  originLatitude: number,
  destinationLongitude: number,
  destinationLatitude: number,
  cities: readonly RouteNearbyCityCandidate[],
  abortSignal?: AbortSignal
): Promise<{
  routes: OsrmRouteSummary[];
  cities: RouteMergedCityResult[];
}> {
  const routes = await fetchOsrmAlternativeRoutes(
    originLongitude,
    originLatitude,
    destinationLongitude,
    destinationLatitude,
    abortSignal
  );

  return {
    routes,
    cities: findCitiesAcrossRoutes(routes, cities),
  };
}
