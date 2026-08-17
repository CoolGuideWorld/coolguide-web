"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/app/studio/studio.module.css";
import type {
  PoiQualityCitySummary,
  PoiQualityRow,
} from "@/lib/studio/poiQuality";

type PoiCoverageQuickFilter =
  | "all"
  | "complete"
  | "incomplete"
  | "missing-text"
  | "missing-image"
  | "missing-audio";

type PoiCoverageSummary = {
  tracked: number | null;
  complete: number | null;
  incomplete: number | null;
  missingText: number | null;
  missingImage: number | null;
  missingAudio: number | null;
};

type StudioPoiCoveragePageProps = {
  rows: PoiQualityRow[];
  citySummaries: PoiQualityCitySummary[];
  summary: PoiCoverageSummary;
  error: string | null;
  initialFilterQuery?: string | null;
};

const numberFormatter = new Intl.NumberFormat("fr-FR");

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatMetric(value: number | null): string {
  if (typeof value !== "number") {
    return "Indisponible";
  }

  return numberFormatter.format(value);
}

function formatCoordinate(value: number | null): string {
  if (typeof value !== "number") {
    return "-";
  }

  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
  });
}

function mapFilterFromQuery(value: string | null | undefined): PoiCoverageQuickFilter {
  if (value === "missing-text") {
    return "missing-text";
  }

  if (value === "missing-image") {
    return "missing-image";
  }

  if (value === "missing-audio") {
    return "missing-audio";
  }

  if (value === "complete") {
    return "complete";
  }

  if (value === "incomplete") {
    return "incomplete";
  }

  return "all";
}

function matchesQuickFilter(row: PoiQualityRow, filter: PoiCoverageQuickFilter): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "complete") {
    return row.complete;
  }

  if (filter === "incomplete") {
    return !row.complete;
  }

  if (filter === "missing-text") {
    return !row.textFrOk;
  }

  if (filter === "missing-image") {
    return !row.imageOk;
  }

  return !row.audioPedestrianFrOk;
}

function statusText(value: boolean, presentLabel: string, missingLabel: string): string {
  return value ? presentLabel : missingLabel;
}

type KpiCardConfig = {
  key: PoiCoverageQuickFilter;
  label: string;
  value: number | null;
  toneClassName: string;
};

export default function StudioPoiCoveragePage({
  rows,
  citySummaries,
  summary,
  error,
  initialFilterQuery,
}: StudioPoiCoveragePageProps) {
  const [query, setQuery] = useState("");
  const [cityId, setCityId] = useState("all");
  const [quickFilter, setQuickFilter] = useState<PoiCoverageQuickFilter>(
    mapFilterFromQuery(initialFilterQuery)
  );
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);

  const counters = useMemo(
    () => ({
      all: rows.length,
      complete: rows.filter((row) => row.complete).length,
      incomplete: rows.filter((row) => !row.complete).length,
      missingText: rows.filter((row) => !row.textFrOk).length,
      missingImage: rows.filter((row) => !row.imageOk).length,
      missingAudio: rows.filter((row) => !row.audioPedestrianFrOk).length,
    }),
    [rows]
  );

  const rowsById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalizeForSearch(query.trim());
    const cityFilterActive = cityId !== "all";

    const visibleRows = rows.filter((row) => {
      if (!matchesQuickFilter(row, quickFilter)) {
        return false;
      }

      if (cityFilterActive && row.cityId !== cityId) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${row.name} ${row.slug} ${row.cityName} ${row.citySlug}`;
      return normalizeForSearch(haystack).includes(normalizedQuery);
    });

    visibleRows.sort((left, right) => {
      const leftIncompleteRank = left.complete ? 1 : 0;
      const rightIncompleteRank = right.complete ? 1 : 0;

      if (leftIncompleteRank !== rightIncompleteRank) {
        return leftIncompleteRank - rightIncompleteRank;
      }

      if (left.qualityScore !== right.qualityScore) {
        return left.qualityScore - right.qualityScore;
      }

      const byCity = left.cityName.localeCompare(right.cityName, "fr", {
        sensitivity: "base",
      });

      if (byCity !== 0) {
        return byCity;
      }

      return left.name.localeCompare(right.name, "fr", { sensitivity: "base" });
    });

    return visibleRows;
  }, [rows, quickFilter, cityId, query]);

  const selectedPoi = selectedPoiId ? rowsById.get(selectedPoiId) ?? null : null;

  useEffect(() => {
    if (!selectedPoi) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPoiId(null);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedPoi]);

  const kpiCards: KpiCardConfig[] = [
    {
      key: "all",
      label: "POI suivis",
      value: summary.tracked,
      toneClassName: styles.poiV1KpiInfo,
    },
    {
      key: "complete",
      label: "Complets",
      value: summary.complete,
      toneClassName: styles.poiV1KpiComplete,
    },
    {
      key: "incomplete",
      label: "Incomplets",
      value: summary.incomplete,
      toneClassName: styles.poiV1KpiWarning,
    },
    {
      key: "missing-text",
      label: "Sans texte FR",
      value: summary.missingText,
      toneClassName: styles.poiV1KpiWarning,
    },
    {
      key: "missing-image",
      label: "Sans image",
      value: summary.missingImage,
      toneClassName: styles.poiV1KpiWarning,
    },
    {
      key: "missing-audio",
      label: "Sans audio",
      value: summary.missingAudio,
      toneClassName: styles.poiV1KpiWarning,
    },
  ];

  return (
    <div className={styles.dashboardStack}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Points d&apos;intérêt</h1>
        <p className={styles.pageDescription}>
          Quels POI sont prêts, lesquels sont incomplets, et qu&apos;est-ce qui leur manque ?
        </p>
      </header>

      <section className={`${styles.panel} ${styles.dashboardPanel}`} aria-label="Synthèse points d'intérêt">
        <header className={styles.dashboardSectionHeader}>
          <h2 className={`${styles.panelTitle} ${styles.dashboardSectionTitle}`.trim()}>
            Synthèse qualité POI
          </h2>
        </header>

        <div className={styles.poiV1KpiGrid}>
          {kpiCards.map((card) => {
            const isActive = quickFilter === card.key;

            return (
              <button
                key={card.key}
                type="button"
                className={[
                  styles.poiV1KpiCard,
                  styles.poiV1KpiButton,
                  card.toneClassName,
                  isActive ? styles.poiV1KpiCardActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setQuickFilter(card.key)}
                aria-pressed={isActive}
              >
                <p className={styles.poiV1KpiLabel}>{card.label}</p>
                <p className={styles.poiV1KpiValue}>{formatMetric(card.value)}</p>
              </button>
            );
          })}
        </div>

        {error ? <p className={styles.networkUnavailable}>Indisponible</p> : null}
      </section>

      <section className={`${styles.panel} ${styles.dashboardPanel}`} aria-label="Table des points d'intérêt">
        <header className={styles.dashboardSectionHeader}>
          <h2 className={`${styles.panelTitle} ${styles.dashboardSectionTitle}`.trim()}>POI à piloter</h2>
          <p className={styles.dashboardSectionMeta}>{numberFormatter.format(filteredRows.length)} visibles</p>
        </header>

        <div className={styles.poiV1Toolbar}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.poiV1SearchInput}
            placeholder="Rechercher un POI"
            aria-label="Rechercher un POI"
          />

          <select
            value={cityId}
            onChange={(event) => setCityId(event.target.value)}
            className={styles.poiV1CitySelect}
            aria-label="Filtrer par ville"
          >
            <option value="all">Toutes les villes</option>
            {citySummaries.map((city) => (
              <option key={city.cityId} value={city.cityId}>
                {city.cityName} ({numberFormatter.format(city.total)})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.poiV1Filters} role="tablist" aria-label="Filtres qualité POI">
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${quickFilter === "all" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setQuickFilter("all")}
          >
            Tous {numberFormatter.format(counters.all)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${quickFilter === "complete" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setQuickFilter("complete")}
          >
            Complets {numberFormatter.format(counters.complete)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${quickFilter === "incomplete" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setQuickFilter("incomplete")}
          >
            Incomplets {numberFormatter.format(counters.incomplete)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${quickFilter === "missing-text" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setQuickFilter("missing-text")}
          >
            Sans texte {numberFormatter.format(counters.missingText)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${quickFilter === "missing-image" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setQuickFilter("missing-image")}
          >
            Sans image {numberFormatter.format(counters.missingImage)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${quickFilter === "missing-audio" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setQuickFilter("missing-audio")}
          >
            Sans audio {numberFormatter.format(counters.missingAudio)}
          </button>
        </div>

        <div className={styles.poiV1TableWrap}>
          <table className={styles.poiV1Table}>
            <thead>
              <tr>
                <th>POI</th>
                <th>Ville</th>
                <th>Texte FR</th>
                <th>Image</th>
                <th>Audio piéton</th>
                <th>Qualité</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.poiV1EmptyCell}>
                    Aucun POI ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const qualityToneClass =
                    row.qualityScore === 3
                      ? styles.poiV1QualityGood
                      : row.qualityScore === 2
                        ? styles.poiV1QualityWarnLight
                        : row.qualityScore === 1
                          ? styles.poiV1QualityWarn
                          : styles.poiV1QualityCritical;

                  return (
                    <tr
                      key={row.id}
                      className={styles.poiV1Row}
                      tabIndex={0}
                      role="button"
                      onClick={() => setSelectedPoiId(row.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedPoiId(row.id);
                        }
                      }}
                    >
                      <td data-label="POI">
                        <div className={styles.poiV1PoiCell}>
                          <span className={styles.poiV1PoiName}>{row.name}</span>
                          <span className={styles.poiV1PoiSlug}>{row.slug || "-"}</span>
                        </div>
                      </td>
                      <td data-label="Ville">{row.cityName}</td>
                      <td data-label="Texte FR">
                        <span className={`${styles.poiV1CoveragePill} ${row.textFrOk ? styles.poiV1CoverageOk : styles.poiV1CoverageMissing}`.trim()}>
                          {statusText(row.textFrOk, "Présent", "Manquant")}
                        </span>
                      </td>
                      <td data-label="Image">
                        <span className={`${styles.poiV1CoveragePill} ${row.imageOk ? styles.poiV1CoverageOk : styles.poiV1CoverageMissing}`.trim()}>
                          {statusText(row.imageOk, "Présente", "Manquante")}
                        </span>
                      </td>
                      <td data-label="Audio piéton">
                        <span
                          className={`${styles.poiV1CoveragePill} ${row.audioPedestrianFrOk ? styles.poiV1CoverageOk : styles.poiV1CoverageMissing}`.trim()}
                        >
                          {statusText(row.audioPedestrianFrOk, "Présent", "Manquant")}
                        </span>
                      </td>
                      <td data-label="Qualité">
                        <span className={`${styles.poiV1QualityValue} ${qualityToneClass}`.trim()}>
                          {row.qualityScore}/3
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedPoi ? (
        <>
          <button
            type="button"
            className={styles.poiDrawerBackdrop}
            aria-label="Fermer le détail POI"
            onClick={() => setSelectedPoiId(null)}
          />
          <aside className={styles.poiDrawer} aria-label="Détail point d'intérêt">
            <header className={styles.poiDrawerHeader}>
              <h3 className={styles.poiDrawerTitle}>{selectedPoi.name}</h3>
              <button
                type="button"
                className={styles.poiDrawerCloseButton}
                onClick={() => setSelectedPoiId(null)}
              >
                Fermer
              </button>
            </header>

            <p className={styles.poiDrawerMeta}>Ville: {selectedPoi.cityName}</p>
            <p className={styles.poiDrawerMeta}>Slug: {selectedPoi.slug || "-"}</p>

            <dl className={styles.poiV1DrawerGrid}>
              <div>
                <dt>status</dt>
                <dd>{selectedPoi.status || "-"}</dd>
              </div>
              <div>
                <dt>is_active</dt>
                <dd>{selectedPoi.isActive ? "true" : "false"}</dd>
              </div>
              <div>
                <dt>latitude</dt>
                <dd>{formatCoordinate(selectedPoi.latitude)}</dd>
              </div>
              <div>
                <dt>longitude</dt>
                <dd>{formatCoordinate(selectedPoi.longitude)}</dd>
              </div>
            </dl>

            <ul className={styles.poiV1DrawerChecklist}>
              <li>
                <span>Texte FR</span>
                <span className={selectedPoi.textFrOk ? styles.poiV1CoverageOkText : styles.poiV1CoverageMissingText}>
                  {statusText(selectedPoi.textFrOk, "Présent", "Manquant")}
                </span>
              </li>
              <li>
                <span>Image</span>
                <span className={selectedPoi.imageOk ? styles.poiV1CoverageOkText : styles.poiV1CoverageMissingText}>
                  {statusText(selectedPoi.imageOk, "Présente", "Manquante")}
                </span>
              </li>
              <li>
                <span>Audio piéton FR</span>
                <span className={selectedPoi.audioPedestrianFrOk ? styles.poiV1CoverageOkText : styles.poiV1CoverageMissingText}>
                  {statusText(selectedPoi.audioPedestrianFrOk, "Présent", "Manquant")}
                </span>
              </li>
              <li>
                <span>Qualité</span>
                <span className={styles.poiV1QualityDrawer}>{selectedPoi.qualityScore}/3</span>
              </li>
            </ul>
          </aside>
        </>
      ) : null}
    </div>
  );
}