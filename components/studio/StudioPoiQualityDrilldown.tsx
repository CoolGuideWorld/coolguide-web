"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/app/studio/studio.module.css";

type PoiQualityMetricCityPoi = {
  id: string;
  name: string;
};

type PoiQualityMetricCity = {
  cityId: string;
  cityName: string;
  missingCount: number;
  pois: PoiQualityMetricCityPoi[];
};

type PoiQualityMetric = {
  key: "text_fr" | "images" | "audio_pieton";
  label: "Texte FR" | "Images" | "Audio piéton";
  covered: number | null;
  total: number | null;
  percent: number | null;
  missing: number | null;
  error: string | null;
  cities: PoiQualityMetricCity[];
  citiesCount: number | null;
  cityMissingTotal: number | null;
};

type StudioPoiQualityDrilldownProps = {
  population: number | null;
  populationError: string | null;
  metrics: PoiQualityMetric[];
};

const numberFormatter = new Intl.NumberFormat("fr-FR");

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function StudioPoiQualityDrilldown({
  population,
  populationError,
  metrics,
}: StudioPoiQualityDrilldownProps) {
  const [selectedMetricKey, setSelectedMetricKey] = useState<PoiQualityMetric["key"] | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const selectedMetric =
    selectedMetricKey === null
      ? null
      : metrics.find((metric) => metric.key === selectedMetricKey) ?? null;

  const selectedCity =
    selectedMetric && selectedCityId
      ? selectedMetric.cities.find((city) => city.cityId === selectedCityId) ?? null
      : null;

  const filteredCities = useMemo(() => {
    if (!selectedMetric) {
      return [];
    }

    const normalizedQuery = normalizeForSearch(query.trim());

    if (!normalizedQuery) {
      return selectedMetric.cities;
    }

    return selectedMetric.cities.filter((city) =>
      normalizeForSearch(city.cityName).includes(normalizedQuery)
    );
  }, [query, selectedMetric]);

  useEffect(() => {
    if (!selectedMetric) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedMetricKey(null);
        setSelectedCityId(null);
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedMetric]);

  const openMetric = (metricKey: PoiQualityMetric["key"]) => {
    setSelectedMetricKey(metricKey);
    setSelectedCityId(null);
    setQuery("");
  };

  const closeDrawer = () => {
    setSelectedMetricKey(null);
    setSelectedCityId(null);
    setQuery("");
  };

  const openCity = (cityId: string) => {
    setSelectedCityId(cityId);
  };

  const backToCities = () => {
    setSelectedCityId(null);
  };

  return (
    <>
      <header className={styles.poiQualityHeader}>
        <h2 className={styles.panelTitle}>Qualité POI</h2>
        <p className={styles.poiQualityPopulation}>
          {typeof population === "number"
            ? `${numberFormatter.format(population)} POI suivis`
            : populationError
              ? "Population indisponible"
              : "Population indisponible"}
        </p>
      </header>

      <ul className={styles.poiQualityList}>
        {metrics.map((metric) => {
          const percentLabel =
            typeof metric.percent === "number"
              ? `${numberFormatter.format(metric.percent)} %`
              : "Indisponible";
          const missingLabel =
            typeof metric.missing === "number"
              ? `${numberFormatter.format(metric.missing)} manquants`
              : "Détail indisponible";
          const fillPercent = typeof metric.percent === "number" ? metric.percent : 0;

          return (
            <li key={metric.key} className={styles.poiQualityItem}>
              <button
                type="button"
                className={styles.poiQualityRowButton}
                onClick={() => openMetric(metric.key)}
                aria-label={`Ouvrir le détail ${metric.label}`}
              >
                <div className={styles.poiQualityTopRow}>
                  <p className={styles.poiQualityMetricLabel}>{metric.label}</p>
                  <div className={styles.poiQualityRightInline}>
                    <p className={styles.poiQualityMetricValue}>{percentLabel}</p>
                    <span className={styles.poiQualityChevron} aria-hidden="true">
                      ›
                    </span>
                  </div>
                </div>
                <div
                  className={styles.poiQualityBar}
                  role="img"
                  aria-label={`${metric.label}: ${percentLabel}`}
                >
                  <div
                    className={styles.poiQualityBarFill}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
                <p className={styles.poiQualityMissing}>{missingLabel}</p>
              </button>
            </li>
          );
        })}
      </ul>

      {selectedMetric ? (
        <>
          <button
            type="button"
            className={styles.poiDrawerBackdrop}
            aria-label="Fermer le détail Qualité POI"
            onClick={closeDrawer}
          />
          <aside className={styles.poiDrawer} aria-label="Détail Qualité POI">
            <header className={styles.poiDrawerHeader}>
              <h3 className={styles.poiDrawerTitle}>
                {selectedCity
                  ? selectedCity.cityName
                  : `${selectedMetric.label} — ${numberFormatter.format(
                      selectedMetric.missing ?? 0
                    )} POI à compléter`}
              </h3>
              <button
                type="button"
                className={styles.poiDrawerCloseButton}
                onClick={closeDrawer}
                aria-label="Fermer"
              >
                Fermer
              </button>
            </header>

            {selectedCity ? (
              <>
                <button
                  type="button"
                  className={styles.poiDrawerBackButton}
                  onClick={backToCities}
                >
                  ← {selectedMetric.label}
                </button>
                <p className={styles.poiDrawerMeta}>
                  {numberFormatter.format(selectedCity.missingCount)} POI à compléter
                </p>
                <ul className={styles.poiDrawerPoiList}>
                  {selectedCity.pois.map((poi) => (
                    <li key={poi.id} className={styles.poiDrawerPoiItem}>
                      {poi.name}
                    </li>
                  ))}
                </ul>
              </>
            ) : selectedMetric.error ? (
              <p className={styles.poiDrawerUnavailable}>Détail indisponible</p>
            ) : (selectedMetric.missing ?? 0) === 0 ? (
              <p className={styles.poiDrawerSuccess}>
                Tous les POI sont conformes pour cette métrique.
              </p>
            ) : (
              <>
                <p className={styles.poiDrawerMeta}>
                  {numberFormatter.format(selectedMetric.missing ?? 0)} POI à compléter ·{" "}
                  {numberFormatter.format(selectedMetric.citiesCount ?? 0)} villes concernées
                </p>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher une ville..."
                  className={styles.poiDrawerSearchInput}
                  aria-label="Rechercher une ville"
                />

                {filteredCities.length === 0 ? (
                  <p className={styles.poiDrawerEmpty}>Aucune ville ne correspond à la recherche.</p>
                ) : (
                  <ul className={styles.poiDrawerCityList}>
                    {filteredCities.map((city) => (
                      <li key={city.cityId}>
                        <button
                          type="button"
                          className={styles.poiDrawerCityButton}
                          onClick={() => openCity(city.cityId)}
                        >
                          <span className={styles.poiDrawerCityName}>{city.cityName}</span>
                          <span className={styles.poiDrawerCityCount}>
                            {numberFormatter.format(city.missingCount)}
                            <span aria-hidden="true"> ›</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </aside>
        </>
      ) : null}
    </>
  );
}
