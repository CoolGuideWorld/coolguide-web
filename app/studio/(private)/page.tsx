import MetricCard from "@/components/studio/MetricCard";
import StudioPoiQualityDrilldown from "@/components/studio/StudioPoiQualityDrilldown";
import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";
import Link from "next/link";
import {
  getDestinationPublicationDiagnosticsForCountrySlug,
  type CatalogPublicationReasonCode,
  type DestinationPublicationDiagnostic,
  getPublishedDestinationCountries,
} from "@/services/destinations";
import styles from "../studio.module.css";

type CounterResult = {
  value: number | null;
  error: string | null;
};

type StudioDashboardKpis = {
  destinations: CounterResult;
  readyDestinations: CounterResult;
  readinessPercent: CounterResult;
  poi: CounterResult;
  audios: CounterResult;
};

type DiagnosticsResult = {
  diagnostics: DestinationPublicationDiagnostic[] | null;
  error: string | null;
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

type PoiQualityData = {
  population: CounterResult;
  metrics: PoiQualityMetric[];
};

type CircuitProposalStatusRow = {
  id: string;
  status: string;
};

type CircuitsDashboardData = {
  published: CounterResult;
  toReview: CounterResult;
  readyToPublish: CounterResult;
  rejected: CounterResult;
  unknownStatuses: string[];
};

type CanonicalPoiRow = {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
};

const REASON_LABELS: Record<CatalogPublicationReasonCode, string> = {
  destination_content_missing: "Contenu FR",
  practical_missing: "Practical",
  itinerary_missing: "Itinéraire",
  highlights_missing: "Highlights",
  highlight_poi_missing: "POI du highlight",
  highlight_poi_invalid: "POI invalide",
  highlight_category_missing: "Catégorie",
  highlight_image_missing: "Image POI",
};

const numberFormatter = new Intl.NumberFormat("fr-FR");

const PAGE_SIZE = 1000;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function buildPoiQualityMetric(
  key: PoiQualityMetric["key"],
  label: PoiQualityMetric["label"],
  total: number | null,
  covered: number | null,
  error: string | null,
  cities: PoiQualityMetricCity[] = []
): PoiQualityMetric {
  if (typeof total !== "number" || typeof covered !== "number" || error) {
    return {
      key,
      label,
      covered: null,
      total,
      percent: null,
      missing: null,
      error: error ?? "metric_unavailable",
      cities,
      citiesCount: null,
      cityMissingTotal: null,
    };
  }

  const normalizedCovered = Math.max(0, Math.min(covered, total));
  const missing = Math.max(0, total - normalizedCovered);
  const percent = total > 0 ? Math.round((normalizedCovered / total) * 100) : 0;

  return {
    key,
    label,
    covered: normalizedCovered,
    total,
    percent,
    missing,
    error: null,
    cities,
    citiesCount: cities.length,
    cityMissingTotal: cities.reduce((sum, city) => sum + city.missingCount, 0),
  };
}

function readSingleRelation<T>(relation: T | T[] | null): T | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function buildMissingCities(
  canonicalPoiRows: CanonicalPoiRow[],
  coveredPoiIds: Set<string>
): PoiQualityMetricCity[] {
  const cityBuckets = new Map<
    string,
    {
      cityName: string;
      pois: PoiQualityMetricCityPoi[];
    }
  >();

  for (const poi of canonicalPoiRows) {
    if (coveredPoiIds.has(poi.id)) {
      continue;
    }

    const existing = cityBuckets.get(poi.cityId);

    if (existing) {
      existing.pois.push({
        id: poi.id,
        name: poi.name,
      });
      continue;
    }

    cityBuckets.set(poi.cityId, {
      cityName: poi.cityName,
      pois: [
        {
          id: poi.id,
          name: poi.name,
        },
      ],
    });
  }

  const cities = Array.from(cityBuckets.entries())
    .map(([cityId, bucket]) => {
      const pois = [...bucket.pois].sort((left, right) =>
        left.name.localeCompare(right.name, "fr", { sensitivity: "base" })
      );

      return {
        cityId,
        cityName: bucket.cityName,
        missingCount: pois.length,
        pois,
      } satisfies PoiQualityMetricCity;
    })
    .sort((left, right) => {
      if (right.missingCount !== left.missingCount) {
        return right.missingCount - left.missingCount;
      }

      return left.cityName.localeCompare(right.cityName, "fr", {
        sensitivity: "base",
      });
    });

  return cities;
}

function normalizeStatus(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

async function readTableCount(
  table: "destinations" | "poi" | "audios"
): Promise<CounterResult> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true });

    if (error) {
      return {
        value: null,
        error: error.message,
      };
    }

    return {
      value: typeof count === "number" ? count : null,
      error: typeof count === "number" ? null : "count_unavailable",
    };
  } catch (error) {
    return {
      value: null,
      error: error instanceof Error ? error.message : "unexpected_count_error",
    };
  }
}

async function readPublicationDiagnostics(): Promise<DiagnosticsResult> {
  try {
    const countries = await getPublishedDestinationCountries();

    if (countries.length === 0) {
      return {
        diagnostics: [],
        error: null,
      };
    }

    const diagnosticsByCountry = await Promise.all(
      countries.map((country) =>
        getDestinationPublicationDiagnosticsForCountrySlug(country.slug)
      )
    );

    const diagnostics = diagnosticsByCountry
      .flat()
      .sort((left, right) => {
        const leftSlug = left.citySlug ?? "";
        const rightSlug = right.citySlug ?? "";
        return leftSlug.localeCompare(rightSlug, "fr", { sensitivity: "base" });
      });

    return {
      diagnostics,
      error: null,
    };
  } catch (error) {
    return {
      diagnostics: null,
      error: error instanceof Error ? error.message : "unexpected_ready_destinations_error",
    };
  }
}

async function readCanonicalPoiPopulation(): Promise<{
  rows: CanonicalPoiRow[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const poiRows: CanonicalPoiRow[] = [];
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("poi")
        .select("id,name,city_id,cities!inner(name,status)")
        .eq("status", "active")
        .eq("is_active", true)
        .not("city_id", "is", null)
        .eq("cities.status", "active")
        .range(from, to);

      if (error) {
        return {
          rows: null,
          error: error.message,
        };
      }

      const rows = (data ?? []) as Array<{
        id: string | null;
        name: string | null;
        city_id: string | null;
        cities:
          | {
              name: string | null;
              status: string | null;
            }
          | Array<{
              name: string | null;
              status: string | null;
            }>
          | null;
      }>;

      for (const row of rows) {
        const city = readSingleRelation(row.cities);

        if (
          isNonEmptyString(row.id) &&
          isNonEmptyString(row.city_id) &&
          isNonEmptyString(city?.name)
        ) {
          poiRows.push({
            id: row.id,
            name: isNonEmptyString(row.name) ? row.name.trim() : "POI sans nom",
            cityId: row.city_id,
            cityName: city.name.trim(),
          });
        }
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    const deduplicated = Array.from(
      new Map(poiRows.map((row) => [row.id, row])).values()
    );

    return {
      rows: deduplicated,
      error: null,
    };
  } catch (error) {
    return {
      rows: null,
      error: error instanceof Error ? error.message : "unexpected_poi_population_error",
    };
  }
}

async function readCoveredPoiIdsForTextFr(): Promise<{
  ids: Set<string> | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const coveredIds = new Set<string>();
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("poi_texts")
        .select("poi_id,short_description,content")
        .eq("status", "active")
        .eq("is_current", true)
        .eq("language_code", "fr")
        .range(from, to);

      if (error) {
        return {
          ids: null,
          error: error.message,
        };
      }

      const rows = (data ?? []) as Array<{
        poi_id: string | null;
        short_description: string | null;
        content: string | null;
      }>;

      for (const row of rows) {
        if (
          isNonEmptyString(row.poi_id) &&
          isNonEmptyString(row.short_description) &&
          isNonEmptyString(row.content)
        ) {
          coveredIds.add(row.poi_id);
        }
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    return {
      ids: coveredIds,
      error: null,
    };
  } catch (error) {
    return {
      ids: null,
      error: error instanceof Error ? error.message : "unexpected_poi_text_quality_error",
    };
  }
}

async function readCoveredPoiIdsForImages(): Promise<{
  ids: Set<string> | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const coveredIds = new Set<string>();
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("poi_images")
        .select("poi_id,image_url,storage_path")
        .eq("status", "active")
        .range(from, to);

      if (error) {
        return {
          ids: null,
          error: error.message,
        };
      }

      const rows = (data ?? []) as Array<{
        poi_id: string | null;
        image_url: string | null;
        storage_path: string | null;
      }>;

      for (const row of rows) {
        if (
          isNonEmptyString(row.poi_id) &&
          (isNonEmptyString(row.image_url) || isNonEmptyString(row.storage_path))
        ) {
          coveredIds.add(row.poi_id);
        }
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    return {
      ids: coveredIds,
      error: null,
    };
  } catch (error) {
    return {
      ids: null,
      error: error instanceof Error ? error.message : "unexpected_poi_image_quality_error",
    };
  }
}

async function readCoveredPoiIdsForPedestrianAudioFr(): Promise<{
  ids: Set<string> | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const coveredIds = new Set<string>();
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("audios")
        .select("poi_id,audio_url,storage_path")
        .eq("status", "active")
        .eq("mode", "pieton")
        .eq("language_id", "fr")
        .range(from, to);

      if (error) {
        return {
          ids: null,
          error: error.message,
        };
      }

      const rows = (data ?? []) as Array<{
        poi_id: string | null;
        audio_url: string | null;
        storage_path: string | null;
      }>;

      for (const row of rows) {
        if (
          isNonEmptyString(row.poi_id) &&
          (isNonEmptyString(row.audio_url) || isNonEmptyString(row.storage_path))
        ) {
          coveredIds.add(row.poi_id);
        }
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    return {
      ids: coveredIds,
      error: null,
    };
  } catch (error) {
    return {
      ids: null,
      error: error instanceof Error ? error.message : "unexpected_poi_audio_quality_error",
    };
  }
}

async function readPoiQualityData(): Promise<PoiQualityData> {
  const population = await readCanonicalPoiPopulation();

  if (!population.rows) {
    return {
      population: {
        value: null,
        error: population.error,
      },
      metrics: [
        buildPoiQualityMetric("text_fr", "Texte FR", null, null, population.error),
        buildPoiQualityMetric("images", "Images", null, null, population.error),
        buildPoiQualityMetric("audio_pieton", "Audio piéton", null, null, population.error),
      ],
    };
  }

  const total = population.rows.length;
  const canonicalPoiIds = new Set(population.rows.map((row) => row.id));

  const [textCoverage, imageCoverage, audioCoverage] = await Promise.all([
    readCoveredPoiIdsForTextFr(),
    readCoveredPoiIdsForImages(),
    readCoveredPoiIdsForPedestrianAudioFr(),
  ]);

  const textCovered = textCoverage.ids
    ? new Set(Array.from(textCoverage.ids).filter((id) => canonicalPoiIds.has(id)))
    : null;
  const imageCovered = imageCoverage.ids
    ? new Set(Array.from(imageCoverage.ids).filter((id) => canonicalPoiIds.has(id)))
    : null;
  const audioCovered = audioCoverage.ids
    ? new Set(Array.from(audioCoverage.ids).filter((id) => canonicalPoiIds.has(id)))
    : null;

  const textCities = textCovered ? buildMissingCities(population.rows, textCovered) : [];
  const imageCities = imageCovered ? buildMissingCities(population.rows, imageCovered) : [];
  const audioCities = audioCovered ? buildMissingCities(population.rows, audioCovered) : [];

  return {
    population: {
      value: total,
      error: population.error,
    },
    metrics: [
      buildPoiQualityMetric(
        "text_fr",
        "Texte FR",
        total,
        textCovered ? textCovered.size : null,
        textCoverage.error,
        textCities
      ),
      buildPoiQualityMetric(
        "images",
        "Images",
        total,
        imageCovered ? imageCovered.size : null,
        imageCoverage.error,
        imageCities
      ),
      buildPoiQualityMetric(
        "audio_pieton",
        "Audio piéton",
        total,
        audioCovered ? audioCovered.size : null,
        audioCoverage.error,
        audioCities
      ),
    ],
  };
}

async function readCircuitProposalStatuses(): Promise<{
  rows: CircuitProposalStatusRow[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const rows: CircuitProposalStatusRow[] = [];
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("circuit_proposals")
        .select("id,status")
        .range(from, to);

      if (error) {
        return {
          rows: null,
          error: error.message,
        };
      }

      const pageRows = (data ?? []) as Array<{
        id: string | null;
        status: string | null;
      }>;

      for (const row of pageRows) {
        if (isNonEmptyString(row.id)) {
          rows.push({
            id: row.id,
            status: normalizeStatus(row.status),
          });
        }
      }

      if (pageRows.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    return {
      rows,
      error: null,
    };
  } catch (error) {
    return {
      rows: null,
      error:
        error instanceof Error
          ? error.message
          : "unexpected_circuit_proposals_status_error",
    };
  }
}

async function readPublishedCircuitsCount(): Promise<CounterResult> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const { data, error } = await supabase.rpc("get_country_circuits", {
      p_country_slug: "france",
    });

    if (error) {
      return {
        value: null,
        error: error.message,
      };
    }

    if (!Array.isArray(data)) {
      return {
        value: null,
        error: "circuits_count_unavailable",
      };
    }

    return {
      value: data.length,
      error: null,
    };
  } catch (error) {
    return {
      value: null,
      error: error instanceof Error ? error.message : "unexpected_circuits_count_error",
    };
  }
}

async function readCircuitsDashboardData(): Promise<CircuitsDashboardData> {
  const [published, proposals] = await Promise.all([
    readPublishedCircuitsCount(),
    readCircuitProposalStatuses(),
  ]);

  if (!proposals.rows) {
    return {
      published,
      toReview: {
        value: null,
        error: proposals.error,
      },
      readyToPublish: {
        value: null,
        error: proposals.error,
      },
      rejected: {
        value: null,
        error: proposals.error,
      },
      unknownStatuses: [],
    };
  }

  let proposedCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  const unknownStatuses = new Set<string>();

  for (const proposal of proposals.rows) {
    if (proposal.status === "proposed") {
      proposedCount += 1;
      continue;
    }

    if (proposal.status === "approved") {
      approvedCount += 1;
      continue;
    }

    if (proposal.status === "rejected") {
      rejectedCount += 1;
      continue;
    }

    if (proposal.status !== "published" && proposal.status.length > 0) {
      unknownStatuses.add(proposal.status);
    }
  }

  return {
    published,
    toReview: {
      value: proposedCount,
      error: null,
    },
    readyToPublish: {
      value: approvedCount,
      error: null,
    },
    rejected: {
      value: rejectedCount,
      error: null,
    },
    unknownStatuses: Array.from(unknownStatuses).sort((left, right) =>
      left.localeCompare(right, "fr", { sensitivity: "base" })
    ),
  };
}

async function loadStudioDashboardData(): Promise<{
  kpis: StudioDashboardKpis;
  diagnostics: DiagnosticsResult;
  poiQuality: PoiQualityData;
  circuits: CircuitsDashboardData;
}> {
  const [destinations, publicationDiagnostics, poi, audios, poiQuality, circuits] = await Promise.all([
    readTableCount("destinations"),
    readPublicationDiagnostics(),
    readTableCount("poi"),
    readTableCount("audios"),
    readPoiQualityData(),
    readCircuitsDashboardData(),
  ]);

  const publishableCount = publicationDiagnostics.diagnostics
    ? publicationDiagnostics.diagnostics.filter((item) => item.publishable).length
    : null;

  const readyDestinations: CounterResult = {
    value: publishableCount,
    error: publicationDiagnostics.error,
  };

  if (
    typeof destinations.value === "number" &&
    typeof readyDestinations.value === "number" &&
    destinations.value > 0
  ) {
    const readinessPercent = Math.round(
      (readyDestinations.value / destinations.value) * 100
    );

    return {
      kpis: {
        destinations,
        readyDestinations,
        readinessPercent: {
          value: readinessPercent,
          error: null,
        },
        poi,
        audios,
      },
      diagnostics: publicationDiagnostics,
      poiQuality,
      circuits,
    };
  }

  if (
    typeof destinations.value === "number" &&
    destinations.value === 0 &&
    typeof readyDestinations.value === "number"
  ) {
    return {
      kpis: {
        destinations,
        readyDestinations,
        readinessPercent: {
          value: 0,
          error: null,
        },
        poi,
        audios,
      },
      diagnostics: publicationDiagnostics,
      poiQuality,
      circuits,
    };
  }

  return {
    kpis: {
      destinations,
      readyDestinations,
      readinessPercent: {
        value: null,
        error: "readiness_unavailable",
      },
      poi,
      audios,
    },
    diagnostics: publicationDiagnostics,
    poiQuality,
    circuits,
  };
}

function formatKpiValue(value: number | null, suffix = ""): string {
  if (typeof value !== "number") {
    return "Indisponible";
  }

  return `${numberFormatter.format(value)}${suffix}`;
}

function formatKpiNote(error: string | null): string | undefined {
  if (!error) {
    return undefined;
  }

  return "Lecture indisponible";
}

export default async function StudioHomePage() {
  const { kpis, diagnostics, poiQuality, circuits } = await loadStudioDashboardData();
  const hasNetworkData =
    typeof kpis.destinations.value === "number" &&
    typeof kpis.readyDestinations.value === "number" &&
    typeof kpis.readinessPercent.value === "number";

  const totalDestinations = hasNetworkData ? kpis.destinations.value : null;
  const readyDestinations = hasNetworkData ? kpis.readyDestinations.value : null;
  const readinessPercent = hasNetworkData ? kpis.readinessPercent.value : null;
  const toProcessDestinations =
    hasNetworkData && totalDestinations !== null && readyDestinations !== null
      ? Math.max(0, totalDestinations - readyDestinations)
      : null;
  const toProcessPercent =
    hasNetworkData && readinessPercent !== null ? Math.max(0, 100 - readinessPercent) : null;

  const nonPublishableDestinations = diagnostics.diagnostics
    ? diagnostics.diagnostics.filter((item) => !item.publishable)
    : null;

  const nonPublishableCount = nonPublishableDestinations?.length ?? null;

  const toProcessLabel =
    typeof nonPublishableCount === "number"
      ? `${numberFormatter.format(nonPublishableCount)} destination${
          nonPublishableCount > 1 ? "s" : ""
        }`
      : "Diagnostic indisponible";

  return (
    <div className={styles.dashboardStack}>
      <header className={`${styles.pageHeader} ${styles.dashboardHeader}`}>
        <h1 className={styles.pageTitle}>Tableau de bord</h1>
        <p className={`${styles.pageDescription} ${styles.dashboardDescription}`}>
          Vue d&apos;ensemble de l&apos;activité Studio et des modules à suivre.
        </p>
      </header>

      <section className={`${styles.panel} ${styles.dashboardPanel}`} aria-label="Vue d'ensemble">
        <h2 className={styles.panelTitle}>Vue d&apos;ensemble</h2>
        <div className={`${styles.metricGrid} ${styles.dashboardMetricGrid}`}>
          <MetricCard
            label="Destinations"
            value={formatKpiValue(kpis.destinations.value)}
            note={formatKpiNote(kpis.destinations.error)}
            compact
          />
          <MetricCard
            label="Prêtes"
            value={formatKpiValue(kpis.readyDestinations.value)}
            tone="positive"
            note={formatKpiNote(kpis.readyDestinations.error)}
            compact
          />
          <MetricCard
            label="Readiness"
            value={formatKpiValue(kpis.readinessPercent.value, " %")}
            tone="positive"
            note={formatKpiNote(kpis.readinessPercent.error)}
            compact
          />
          <MetricCard
            label="POI"
            value={formatKpiValue(kpis.poi.value)}
            note={formatKpiNote(kpis.poi.error)}
            compact
          />
          <MetricCard
            label="Audios"
            value={formatKpiValue(kpis.audios.value)}
            note={formatKpiNote(kpis.audios.error)}
            compact
          />
        </div>
      </section>

      <section className={styles.dashboardSecondaryGrid} aria-label="Suivi réseau">
        <article className={`${styles.panel} ${styles.dashboardPanel}`} aria-label="État du réseau">
          <h2 className={styles.panelTitle}>État du réseau</h2>

          {hasNetworkData &&
          readinessPercent !== null &&
          toProcessPercent !== null &&
          readyDestinations !== null &&
          toProcessDestinations !== null ? (
            <div className={styles.networkBlock}>
              <div className={styles.networkHeaderRow}>
                <p className={styles.networkShareLabelReady}>{readinessPercent} % prêts</p>
                <p className={styles.networkShareLabelTodo}>{toProcessPercent} % à traiter</p>
              </div>

              <div
                className={styles.networkBar}
                role="img"
                aria-label={`Répartition: ${readinessPercent}% prêtes, ${toProcessPercent}% à traiter`}
              >
                <div
                  className={styles.networkBarReady}
                  style={{ width: `${readinessPercent}%` }}
                />
                <div
                  className={styles.networkBarTodo}
                  style={{ width: `${toProcessPercent}%` }}
                />
              </div>

              <div className={styles.networkCounters}>
                <p className={styles.networkCountReady}>
                  {numberFormatter.format(readyDestinations)} Prêtes
                </p>
                <p className={styles.networkCountTodo}>
                  • {numberFormatter.format(toProcessDestinations)} À traiter
                </p>
              </div>
            </div>
          ) : (
            <p className={styles.networkUnavailable}>Indisponible</p>
          )}
        </article>

        <article className={`${styles.panel} ${styles.dashboardPanel} ${styles.toProcessPanel}`} aria-label="À traiter">
          <header className={styles.toProcessHeader}>
            <h2 className={styles.panelTitle}>À traiter</h2>
            <p className={styles.toProcessCount}>{toProcessLabel}</p>
          </header>

          {nonPublishableDestinations === null ? (
            <p className={styles.toProcessUnavailable}>Diagnostic indisponible</p>
          ) : nonPublishableDestinations.length === 0 ? (
            <p className={styles.toProcessEmpty}>Toutes les destinations sont publiables.</p>
          ) : (
            <ul className={styles.toProcessList}>
              {nonPublishableDestinations.map((item) => {
                const cityName = item.citySlug
                  ? item.citySlug
                      .split("-")
                      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
                      .join(" ")
                  : "Destination";

                return (
                  <li key={item.destinationId} className={styles.toProcessItem}>
                    <p className={styles.toProcessCityName}>{cityName}</p>
                    <div className={styles.toProcessBadges}>
                      {item.reasons.map((reason) => (
                        <span key={`${item.destinationId}-${reason}`} className={styles.toProcessBadge}>
                          {REASON_LABELS[reason]}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className={`${styles.panel} ${styles.dashboardPanel} ${styles.qualityPanel}`} aria-label="Qualité POI">
          <StudioPoiQualityDrilldown
            population={poiQuality.population.value}
            populationError={poiQuality.population.error}
            metrics={poiQuality.metrics}
          />
        </article>
      </section>

      <section className={styles.dashboardTertiaryGrid} aria-label="Suivi circuits">
        <article className={`${styles.panel} ${styles.dashboardPanel} ${styles.circuitsSummaryPanel}`} aria-label="Circuits">
          <header className={styles.circuitsSummaryHeader}>
            <h2 className={styles.panelTitle}>
              <Link href="/studio/circuits" className={styles.circuitsSummaryTitleLink}>
                Circuits
              </Link>
            </h2>
          </header>

          <ul className={styles.circuitsSummaryList}>
            <li className={styles.circuitsSummaryItem}>
              <span className={styles.circuitsSummaryLabelWrap}>
                <span className={`${styles.circuitsSummaryDot} ${styles.circuitsSummaryDotPublished}`} />
                Publiés
              </span>
              <span className={styles.circuitsSummaryValue}>
                {formatKpiValue(circuits.published.value)}
              </span>
            </li>

            <li className={styles.circuitsSummaryItem}>
              <span className={styles.circuitsSummaryLabelWrap}>
                <span className={`${styles.circuitsSummaryDot} ${styles.circuitsSummaryDotReview}`} />
                À examiner
              </span>
              <span className={styles.circuitsSummaryValue}>
                {formatKpiValue(circuits.toReview.value)}
              </span>
            </li>

            <li className={styles.circuitsSummaryItem}>
              <span className={styles.circuitsSummaryLabelWrap}>
                <span className={`${styles.circuitsSummaryDot} ${styles.circuitsSummaryDotReady}`} />
                Prêtes à publier
              </span>
              <span className={styles.circuitsSummaryValue}>
                {formatKpiValue(circuits.readyToPublish.value)}
              </span>
            </li>

            <li className={styles.circuitsSummaryItem}>
              <span className={styles.circuitsSummaryLabelWrap}>
                <span className={`${styles.circuitsSummaryDot} ${styles.circuitsSummaryDotRejected}`} />
                Rejetées
              </span>
              <span className={styles.circuitsSummaryValue}>
                {formatKpiValue(circuits.rejected.value)}
              </span>
            </li>
          </ul>

          {(circuits.toReview.error || circuits.readyToPublish.error || circuits.rejected.error) && (
            <p className={styles.circuitsSummaryNote}>Certaines métriques sont indisponibles.</p>
          )}
          {circuits.unknownStatuses.length > 0 ? (
            <p className={styles.circuitsSummaryNote}>
              Statuts non mappés: {circuits.unknownStatuses.join(", ")}
            </p>
          ) : null}
        </article>
      </section>
    </div>
  );
}
