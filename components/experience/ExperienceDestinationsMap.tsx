"use client";

import Link from "next/link";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { ExperienceDestinationMapPoint } from "@/services/destinations/getExperienceDestinationsMap";
import styles from "./ExperienceDestinationsMap.module.css";

type ExperienceDestinationsMapProps = {
  destinations: ExperienceDestinationMapPoint[];
};

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="width:14px;height:14px;border-radius:999px;background:#0f766e;border:3px solid #ffffff;box-shadow:0 7px 16px rgba(15,118,110,0.32);"></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

function FitBounds({ destinations }: ExperienceDestinationsMapProps) {
  const map = useMap();

  useEffect(() => {
    if (destinations.length === 0) {
      return;
    }

    if (destinations.length === 1) {
      map.setView([destinations[0].latitude, destinations[0].longitude], 10, {
        animate: false,
      });
      return;
    }

    map.fitBounds(
      destinations.map((destination) => [destination.latitude, destination.longitude]),
      {
        padding: [36, 36],
        maxZoom: 8,
        animate: false,
      }
    );
  }, [destinations, map]);

  return null;
}

export default function ExperienceDestinationsMap({ destinations }: ExperienceDestinationsMapProps) {
  return (
    <section className="howItWorksSection" aria-labelledby="experience-destinations-map-title">
      <div className="howItWorksInner">
        <div className="howItWorksHeader" style={{ marginBottom: "1rem" }}>
          <h2 id="experience-destinations-map-title">Explorez les destinations déjà disponibles</h2>
          <p>
            Zoomez sur la carte et découvrez où CoolGuide vous accompagne déjà à pied et sur la route.
          </p>
        </div>

        {destinations.length === 0 ? (
          <div
            style={{
              minHeight: "clamp(260px, 32vh, 360px)",
              borderRadius: 16,
              border: "1px dashed #d4c4aa",
              background: "#fffdfa",
              color: "#6b5d4a",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: "1rem",
            }}
          >
            Aucune destination disponible pour le moment.
          </div>
        ) : (
          <div className={styles.mapFrame}>
            <MapContainer
              center={[46.5, 2.5]}
              zoom={5}
              style={{ width: "100%", height: "100%" }}
              scrollWheelZoom
              zoomControl
              attributionControl
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitBounds destinations={destinations} />

              {destinations.map((destination) => (
                <Marker
                  key={destination.citySlug}
                  position={[destination.latitude, destination.longitude]}
                  icon={markerIcon}
                >
                  <Popup>
                    <div style={{ minWidth: 170, display: "grid", gap: "0.35rem" }}>
                      <strong style={{ color: "#1f1a17" }}>{destination.cityName}</strong>
                      <span style={{ color: "#685a46", fontSize: "0.9rem" }}>CoolGuide disponible</span>
                      <Link href={destination.href} style={{ color: "#0f766e", fontWeight: 700 }}>
                        Découvrir
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </section>
  );
}
