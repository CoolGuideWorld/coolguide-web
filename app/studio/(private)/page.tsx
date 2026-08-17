import MetricCard from "@/components/studio/MetricCard";
import StudioPoiQualityDrilldown from "@/components/studio/StudioPoiQualityDrilldown";
import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";
import { readBrainCoverageKpis } from "@/lib/studio/brainCoverage";
import { readPoiQualityData, type PoiQualityData } from "@/lib/studio/poiQuality";
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
  countries: PublicationCountryDiagnostics[] | null;
  error: string | null;
};

type PublicationCountryDiagnostics = {
  countryName: string;
  countrySlug: string;
  diagnostics: DestinationPublicationDiagnostic[];
};

type GeographicCoverageRow = {
  countryName: string;
  countrySlug: string;
  total: number;
  ready: number;
  toProcess: number;
  readinessPercent: number;
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
        countries: [],
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

    const countryDiagnostics = countries.map((country, index) => {
      const currentDiagnostics = diagnosticsByCountry[index] ?? [];

      return {
        countryName: country.name,
        countrySlug: country.slug,
        diagnostics: currentDiagnostics,
      } satisfies PublicationCountryDiagnostics;
    });

    return {
      diagnostics,
      countries: countryDiagnostics,
      error: null,
    };
  } catch (error) {
    return {
      diagnostics: null,
      countries: null,
      error: error instanceof Error ? error.message : "unexpected_ready_destinations_error",
    };
  }
}

function buildGeographicCoverageRows(
  countryDiagnostics: PublicationCountryDiagnostics[] | null,
  error: string | null
): GeographicCoverageRow[] | null {
  if (error || !countryDiagnostics) {
    return null;
  }

  return countryDiagnostics
    .map((country) => {
      const total = country.diagnostics.length;
      const ready = country.diagnostics.filter((item) => item.publishable).length;
      const toProcess = Math.max(0, total - ready);
      const readinessPercent = total > 0 ? Math.round((ready / total) * 100) : 0;

      return {
        countryName: country.countryName,
        countrySlug: country.countrySlug,
        total,
        ready,
        toProcess,
        readinessPercent,
      } satisfies GeographicCoverageRow;
    })
    .sort((left, right) => {
      if (right.toProcess !== left.toProcess) {
        return right.toProcess - left.toProcess;
      }

      if (left.readinessPercent !== right.readinessPercent) {
        return left.readinessPercent - right.readinessPercent;
      }

      return left.countryName.localeCompare(right.countryName, "fr", {
        sensitivity: "base",
      });
    });
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
  brain: Awaited<ReturnType<typeof readBrainCoverageKpis>>;
}> {
  const [destinations, publicationDiagnostics, poi, audios, poiQuality, circuits, brain] = await Promise.all([
    readTableCount("destinations"),
    readPublicationDiagnostics(),
    readTableCount("poi"),
    readTableCount("audios"),
    readPoiQualityData(),
    readCircuitsDashboardData(),
    readBrainCoverageKpis(),
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
      brain,
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
      brain,
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
    brain,
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
  const { kpis, diagnostics, poiQuality, circuits, brain } = await loadStudioDashboardData();
  const geographicCoverage = buildGeographicCoverageRows(
    diagnostics.countries,
    diagnostics.error
  );
  const brainKpis = brain.kpis;
  const brainCompletePercent =
    brainKpis && brainKpis.known > 0
      ? Math.round((brainKpis.complete / brainKpis.known) * 100)
      : brainKpis && brainKpis.known === 0
        ? 0
        : null;
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
          <header className={styles.dashboardSectionHeader}>
            <h2 className={`${styles.panelTitle} ${styles.dashboardSectionTitle}`.trim()}>
              État du réseau
            </h2>
          </header>

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
          <header className={`${styles.dashboardSectionHeader} ${styles.toProcessHeader}`.trim()}>
            <h2 className={`${styles.panelTitle} ${styles.dashboardSectionTitle}`.trim()}>À traiter</h2>
            <p className={`${styles.toProcessCount} ${styles.dashboardSectionMeta}`.trim()}>{toProcessLabel}</p>
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

      <section className={styles.dashboardTertiaryGrid} aria-label="Couverture, circuits et Brain">
        <article
          className={`${styles.panel} ${styles.dashboardPanel} ${styles.geoCoveragePanel}`}
          aria-label="Couverture géographique"
        >
          <header className={`${styles.dashboardSectionHeader} ${styles.geoCoverageHeader}`.trim()}>
            <h2 className={`${styles.panelTitle} ${styles.dashboardSectionTitle}`.trim()}>
              Couverture géographique
            </h2>
          </header>

          {geographicCoverage === null ? (
            <p className={styles.geoCoverageUnavailable}>Indisponible</p>
          ) : geographicCoverage.length === 0 ? (
            <p className={styles.geoCoverageUnavailable}>Indisponible</p>
          ) : (
            <ul className={styles.geoCoverageList}>
              {geographicCoverage.map((country) => {
                const todoPercent = Math.max(0, 100 - country.readinessPercent);

                return (
                  <li key={country.countrySlug} className={styles.geoCoverageItem}>
                    <div className={styles.geoCoverageTopRow}>
                      <p className={styles.geoCoverageCountryName}>{country.countryName}</p>
                      <div className={styles.geoCoverageStatsWrap}>
                        <p className={styles.geoCoverageRatio}>
                          {numberFormatter.format(country.ready)} / {numberFormatter.format(country.total)}
                        </p>
                        <p className={styles.geoCoveragePercent}>{country.readinessPercent} %</p>
                      </div>
                    </div>

                    <div
                      className={styles.geoCoverageBar}
                      role="img"
                      aria-label={`Couverture ${country.countryName}: ${country.readinessPercent}% prêtes, ${todoPercent}% à traiter`}
                    >
                      <span
                        className={styles.geoCoverageBarReady}
                        style={{ width: `${country.readinessPercent}%` }}
                      />
                      {todoPercent > 0 ? (
                        <span
                          className={styles.geoCoverageBarTodo}
                          style={{ width: `${todoPercent}%` }}
                        />
                      ) : null}
                    </div>

                    {country.toProcess > 0 ? (
                      <p className={styles.geoCoverageTodoLabel}>
                        {numberFormatter.format(country.toProcess)} à traiter
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className={`${styles.panel} ${styles.dashboardPanel} ${styles.circuitsSummaryPanel}`} aria-label="Circuits">
          <header className={`${styles.dashboardSectionHeader} ${styles.circuitsSummaryHeader}`.trim()}>
            <h2 className={`${styles.panelTitle} ${styles.dashboardSectionTitle}`.trim()}>
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

        <article className={`${styles.panel} ${styles.dashboardPanel} ${styles.brainSummaryPanel}`} aria-label="Brain">
          <header className={`${styles.dashboardSectionHeader} ${styles.brainSummaryHeader}`.trim()}>
            <h2 className={`${styles.panelTitle} ${styles.dashboardSectionTitle}`.trim()}>
              <Link href="/studio/brain" className={styles.brainSummaryTitleLink}>
                Brain
              </Link>
            </h2>
          </header>

          {brainKpis ? (
            <>
              <ul className={styles.brainSummaryList}>
                <li className={styles.brainSummaryItem}>
                  <span className={styles.brainSummaryLabel}>Connues</span>
                  <span className={`${styles.brainSummaryValue} ${styles.brainSummaryValueKnown}`.trim()}>
                    {formatKpiValue(brainKpis.known)}
                  </span>
                </li>
                <li className={styles.brainSummaryItem}>
                  <span className={styles.brainSummaryLabel}>Complètes</span>
                  <span className={`${styles.brainSummaryValue} ${styles.brainSummaryValueComplete}`.trim()}>
                    {formatKpiValue(brainKpis.complete)}
                  </span>
                </li>
                <li className={styles.brainSummaryItem}>
                  <span className={styles.brainSummaryLabel}>Partielles</span>
                  <span className={`${styles.brainSummaryValue} ${styles.brainSummaryValuePartial}`.trim()}>
                    {formatKpiValue(brainKpis.partial)}
                  </span>
                </li>
                <li className={styles.brainSummaryItem}>
                  <span className={styles.brainSummaryLabel}>Vides</span>
                  <span className={`${styles.brainSummaryValue} ${styles.brainSummaryValueEmpty}`.trim()}>
                    {formatKpiValue(brainKpis.empty)}
                  </span>
                </li>
              </ul>

              <div className={styles.brainSummaryProgressBlock}>
                <div
                  className={styles.brainSummaryProgressTrack}
                  role="img"
                  aria-label={`Brain: ${brainCompletePercent ?? 0}% complètes`}
                >
                  <span
                    className={styles.brainSummaryProgressFill}
                    style={{ width: `${brainCompletePercent ?? 0}%` }}
                  />
                </div>
                <p className={styles.brainSummaryProgressLabel}>
                  {formatKpiValue(brainCompletePercent, " %")} complètes
                </p>
              </div>
            </>
          ) : (
            <p className={styles.brainSummaryUnavailable}>Indisponible</p>
          )}
        </article>
      </section>
    </div>
  );
}
