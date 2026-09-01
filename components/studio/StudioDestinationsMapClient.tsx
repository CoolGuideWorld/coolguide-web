"use client";

import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import {
  findCitiesNearRoute,
  type RouteNearbyCityResult,
} from "@/services/destinations/findCitiesNearRoute";
import type {
  StudioDestinationNetworkMarker,
  StudioRouteCandidateCity,
} from "@/services/destinations/getDestinationNetworkMap";

type StudioDestinationsMapClientProps = {
  markers: StudioDestinationNetworkMarker[];
  routeCandidateCities: StudioRouteCandidateCity[];
};

type RouteState = {
  mapGeometry: Array<[number, number]>;
  osrmGeometry: Array<[number, number]>;
  distanceKm: number | null;
  durationMinutes: number | null;
};

type RouteStatus = "idle" | "loading" | "ready" | "error";

const numberFormatter = new Intl.NumberFormat("fr-FR");
const distanceFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});
const routeDistanceFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const durationFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});
const STUDIO_NEARBY_ROUTE_THRESHOLD_KM = 3;

const coolguideMarkerIcon = L.divIcon({
  className: "",
  html: `
    <div style="width:16px;height:16px;border-radius:999px;background:#0f766e;border:3px solid #ffffff;box-shadow:0 8px 18px rgba(15,118,110,0.38);"></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});

function FitBounds({ markers }: { markers: StudioDestinationNetworkMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) {
      return;
    }

    if (markers.length === 1) {
      map.setView([markers[0].displayLatitude, markers[0].displayLongitude], 7, {
        animate: false,
      });
      return;
    }

    const bounds = L.latLngBounds(
      markers.map((marker) => [marker.displayLatitude, marker.displayLongitude])
    );
    map.fitBounds(bounds, {
      padding: [36, 36],
      maxZoom: 8,
      animate: false,
    });
  }, [map, markers]);

  return null;
}

function RouteFitBounds({ geometry }: { geometry: Array<[number, number]> | null }) {
  const map = useMap();

  useEffect(() => {
    if (!geometry || geometry.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(geometry);
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 10,
      animate: false,
    });
  }, [geometry, map]);

  return null;
}

function buildFallbackMessage(markers: StudioDestinationNetworkMarker[]): string {
  if (markers.length === 0) {
    return "Aucune ville publiable trouvée pour le moment.";
  }

  return `${numberFormatter.format(markers.length)} ville${markers.length > 1 ? "s" : ""} publiable${markers.length > 1 ? "s" : ""}`;
}

function formatRouteSummary(route: RouteState | null): string | null {
  if (!route) {
    return null;
  }

  const pieces: string[] = [];

  if (typeof route.distanceKm === "number") {
    pieces.push(`${distanceFormatter.format(route.distanceKm)} km`);
  }

  if (typeof route.durationMinutes === "number") {
    pieces.push(`${durationFormatter.format(route.durationMinutes)} min`);
  }

  return pieces.length > 0 ? pieces.join(" • ") : null;
}

async function fetchOsrmRoute(
  origin: StudioDestinationNetworkMarker,
  destination: StudioDestinationNetworkMarker,
  abortSignal?: AbortSignal
): Promise<RouteState> {
  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${origin.displayLongitude},${origin.displayLatitude};${destination.displayLongitude},${destination.displayLatitude}`
  );
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "false");
  url.searchParams.set("alternatives", "false");

  const response = await fetch(url.toString(), { signal: abortSignal });

  if (!response.ok) {
    throw new Error("Le service de routage est indisponible.");
  }

  const payload = (await response.json()) as {
    code?: string;
    routes?: Array<{
      geometry?: {
        coordinates?: Array<[number, number]>;
      };
      distance?: number;
      duration?: number;
    }>;
  };

  if (payload.code !== "Ok" || !payload.routes || payload.routes.length === 0) {
    throw new Error("Aucun itinéraire routier n’a été trouvé.");
  }

  const route = payload.routes[0];
  const coordinates = route?.geometry?.coordinates ?? [];

  if (coordinates.length === 0) {
    throw new Error("Aucun itinéraire routier n’a été trouvé.");
  }

  return {
    mapGeometry: coordinates.map(([longitude, latitude]) => [latitude, longitude]),
    osrmGeometry: coordinates,
    distanceKm: typeof route?.distance === "number" ? route.distance / 1000 : null,
    durationMinutes: typeof route?.duration === "number" ? route.duration / 60 : null,
  };
}

export default function StudioDestinationsMapClient({
  markers,
  routeCandidateCities,
}: StudioDestinationsMapClientProps) {
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [routeStatus, setRouteStatus] = useState<RouteStatus>("idle");
  const [routeError, setRouteError] = useState<string | null>(null);
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteState | null>(null);
  const [nearbyRouteCities, setNearbyRouteCities] = useState<RouteNearbyCityResult[]>([]);

  const markerById = useMemo(() => {
    const lookup = new Map<string, StudioDestinationNetworkMarker>();

    for (const marker of markers) {
      lookup.set(marker.cityId, marker);
    }

    return lookup;
  }, [markers]);

  const sortedMarkers = useMemo(
    () =>
      [...markers].sort((left, right) =>
        left.cityName.localeCompare(right.cityName, "fr", { sensitivity: "base" })
      ),
    [markers]
  );

  const originMarker = originId ? markerById.get(originId) ?? null : null;
  const destinationMarker = destinationId ? markerById.get(destinationId) ?? null : null;
  const routeSummary = formatRouteSummary(route);
  const destinationCityIds = useMemo(() => {
    return new Set(markers.map((marker) => marker.cityId));
  }, [markers]);

  const canRequestRoute =
    Boolean(originMarker) &&
    Boolean(destinationMarker) &&
    originMarker?.cityId !== destinationMarker?.cityId &&
    routeStatus !== "loading";

  async function handleDisplayRoute() {
    setSelectionMessage(null);

    if (!originMarker || !destinationMarker) {
      setRouteError("Sélectionne une ville de départ et une ville d’arrivée.");
      return;
    }

    if (originMarker.cityId === destinationMarker.cityId) {
      setRouteError("Le départ et l’arrivée doivent être deux villes différentes.");
      setRoute(null);
      setRouteStatus("error");
      return;
    }

    setRouteError(null);
    setRouteStatus("loading");
    setNearbyRouteCities([]);

    try {
      const nextRoute = await fetchOsrmRoute(originMarker, destinationMarker);
      setRoute(nextRoute);
      const nearbyCities = findCitiesNearRoute(
        nextRoute.osrmGeometry,
        routeCandidateCities.filter((city) => city.cityId !== originMarker.cityId && city.cityId !== destinationMarker.cityId)
      );
      setNearbyRouteCities(
        nearbyCities.filter((city) => city.distanceToRouteKm <= STUDIO_NEARBY_ROUTE_THRESHOLD_KM)
      );
      setRouteStatus("ready");
    } catch (error) {
      setRoute(null);
      setNearbyRouteCities([]);
      setRouteStatus("error");
      setRouteError(error instanceof Error ? error.message : "Le routage a échoué.");
    }
  }

  function handleResetRoute() {
    setOriginId("");
    setDestinationId("");
    setRouteStatus("idle");
    setRouteError(null);
    setSelectionMessage(null);
    setRoute(null);
    setNearbyRouteCities([]);
  }

  function handleMarkerSelect(selectedDestinationId: string) {
    const selectedMarker = markerById.get(selectedDestinationId) ?? null;

    if (!selectedMarker) {
      return;
    }

    setRouteError(null);

    if (!originId) {
      setOriginId(selectedDestinationId);
      setSelectionMessage(null);
      return;
    }

    if (!destinationId && originId === selectedMarker.cityId) {
      setSelectionMessage("Choisissez une autre destination.");
      return;
    }

    if (!destinationId) {
      setSelectionMessage(null);
      setDestinationId(selectedMarker.cityId);
      return;
    }

    setOriginId(selectedMarker.cityId);
    setDestinationId("");
    setSelectionMessage(null);
  }

  if (markers.length === 0) {
    return (
      <div
        style={{
          minHeight: "clamp(420px, 62vh, 640px)",
          borderRadius: 16,
          border: "1px dashed #cbd5e1",
          background: "#f8fafc",
          display: "grid",
          placeItems: "center",
          color: "#64748b",
          fontSize: "0.95rem",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        {buildFallbackMessage(markers)}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          alignItems: "end",
        }}
      >
        <label style={{ display: "grid", gap: "0.35rem", color: "#0f172a", fontSize: "0.9rem" }}>
          <span style={{ fontWeight: 600 }}>Départ</span>
          <select
            value={originId}
            onChange={(event) => {
              setOriginId(event.target.value);
              setSelectionMessage(null);
            }}
            style={{
              minHeight: 42,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              padding: "0.55rem 0.7rem",
              background: "#fff",
            }}
          >
            <option value="">Sélectionner</option>
            {sortedMarkers.map((marker) => (
              <option key={marker.cityId} value={marker.cityId}>
                {marker.cityName}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.35rem", color: "#0f172a", fontSize: "0.9rem" }}>
          <span style={{ fontWeight: 600 }}>Arrivée</span>
          <select
            value={destinationId}
            onChange={(event) => {
              setDestinationId(event.target.value);
              setSelectionMessage(null);
            }}
            style={{
              minHeight: 42,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              padding: "0.55rem 0.7rem",
              background: "#fff",
            }}
          >
            <option value="">Sélectionner</option>
            {sortedMarkers.map((marker) => (
              <option key={marker.cityId} value={marker.cityId}>
                {marker.cityName}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleDisplayRoute}
          disabled={!canRequestRoute}
          style={{
            minHeight: 42,
            borderRadius: 12,
            border: "1px solid #0f766e",
            background: canRequestRoute ? "#0f766e" : "#94a3b8",
            color: "#fff",
            fontWeight: 700,
            cursor: canRequestRoute ? "pointer" : "not-allowed",
            padding: "0.55rem 0.9rem",
          }}
        >
          {routeStatus === "loading" ? "Chargement..." : "Afficher l’itinéraire"}
        </button>

        <button
          type="button"
          onClick={handleResetRoute}
          style={{
            minHeight: 42,
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#0f172a",
            fontWeight: 700,
            cursor: "pointer",
            padding: "0.55rem 0.9rem",
          }}
        >
          Réinitialiser
        </button>
      </div>

      {routeError ? (
        <p style={{ margin: 0, color: "#b91c1c", fontSize: "0.92rem" }}>{routeError}</p>
      ) : null}

      {selectionMessage ? (
        <p style={{ margin: 0, color: "#475569", fontSize: "0.92rem" }}>{selectionMessage}</p>
      ) : null}

      {routeSummary ? (
        <p style={{ margin: 0, color: "#475569", fontSize: "0.92rem" }}>{routeSummary}</p>
      ) : null}

      <div
        style={{
          minHeight: "clamp(420px, 62vh, 640px)",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #dbe2ea",
        }}
      >
        <MapContainer
          style={{ width: "100%", height: "100%", minHeight: "clamp(420px, 62vh, 640px)" }}
          center={[46.5, 2.5]}
          zoom={5}
          scrollWheelZoom
          zoomControl
          attributionControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds markers={route ? [] : markers} />
          <RouteFitBounds geometry={route ? route.mapGeometry : null} />

          {route ? (
            <Polyline positions={route.mapGeometry} pathOptions={{ color: "#0f766e", weight: 5, opacity: 0.85 }} />
          ) : null}

          {markers.map((marker) => (
            <Marker
              key={marker.cityId}
              position={[marker.displayLatitude, marker.displayLongitude]}
              icon={coolguideMarkerIcon}
              eventHandlers={{
                click: () => handleMarkerSelect(marker.cityId),
              }}
            >
              <Popup>
                <div style={{ display: "grid", gap: "0.25rem", minWidth: 160 }}>
                  <strong style={{ color: "#0f172a", fontSize: "0.96rem" }}>{marker.cityName}</strong>
                  <span style={{ color: "#475569", fontSize: "0.9rem" }}>
                    {numberFormatter.format(marker.poiCount)} POI
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {route ? (
        <section
          aria-label="Villes a proximite du parcours"
          style={{
            border: "1px solid #dbe2ea",
            borderRadius: 14,
            padding: "0.9rem",
            background: "#ffffff",
            display: "grid",
            gap: "0.6rem",
          }}
        >
          <div style={{ display: "grid", gap: "0.2rem" }}>
            <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1rem" }}>Villes a proximite du parcours</h3>
            <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem" }}>
              Villes situees a moins de 3 km de l&apos;itineraire.
            </p>
            {originMarker && destinationMarker ? (
              <p style={{ margin: 0, color: "#0f172a", fontSize: "0.9rem", fontWeight: 600 }}>
                {originMarker.cityName} → {destinationMarker.cityName}
              </p>
            ) : null}
            <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem" }}>
              {numberFormatter.format(nearbyRouteCities.length)} ville
              {nearbyRouteCities.length > 1 ? "s" : ""} trouvee
              {nearbyRouteCities.length > 1 ? "s" : ""}
            </p>
          </div>

          {nearbyRouteCities.length === 0 ? (
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
              Aucune ville trouvee a moins de 3 km de cet itineraire.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.45rem", borderBottom: "1px solid #e2e8f0", color: "#334155" }}>
                    Ville
                  </th>
                  <th style={{ textAlign: "left", padding: "0.45rem", borderBottom: "1px solid #e2e8f0", color: "#334155" }}>
                    Distance a la route
                  </th>
                  <th style={{ textAlign: "left", padding: "0.45rem", borderBottom: "1px solid #e2e8f0", color: "#334155" }}>
                    Destination CoolGuide
                  </th>
                </tr>
              </thead>
              <tbody>
                {nearbyRouteCities.map((city) => {
                  const isCoolguideDestination = destinationCityIds.has(city.cityId);

                  return (
                  <tr key={city.cityId}>
                    <td style={{ padding: "0.45rem", borderBottom: "1px solid #f1f5f9", color: "#0f172a" }}>{city.name}</td>
                    <td style={{ padding: "0.45rem", borderBottom: "1px solid #f1f5f9", color: "#0f172a" }}>
                      {routeDistanceFormatter.format(city.distanceToRouteKm)} km
                    </td>
                    <td style={{ padding: "0.45rem", borderBottom: "1px solid #f1f5f9", color: "#475569" }}>
                      <span
                        style={{
                          display: "inline-block",
                          borderRadius: 999,
                          padding: "0.1rem 0.45rem",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          background: isCoolguideDestination ? "#dcfce7" : "#e2e8f0",
                          color: isCoolguideDestination ? "#166534" : "#334155",
                        }}
                      >
                        {isCoolguideDestination ? "Oui" : "Non"}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      ) : null}
    </div>
  );
}