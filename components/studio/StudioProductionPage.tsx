"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/app/studio/studio.module.css";
import MetricCard from "@/components/studio/MetricCard";
import type { StudioProductionRow, StudioProductionSnapshot } from "@/lib/studio/production";

type ProductionFilter =
  | "all"
  | "ready"
  | "to_complete"
  | "poi_to_generate"
  | "to_produce"
  | "to_create"
  | "anomalies";

type StudioProductionPageProps = {
  snapshot: StudioProductionSnapshot;
};

const numberFormatter = new Intl.NumberFormat("fr-FR");

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatCount(value: number): string {
  return numberFormatter.format(value);
}

function statusLabel(row: StudioProductionRow): string {
  if (row.duplicateSlug) {
    return "Anomalie - doublon ville";
  }

  if (row.baseStatus === "ready") {
    return "Prete";
  }

  if (row.baseStatus === "to_complete") {
    return "A completer";
  }

  if (row.baseStatus === "poi_to_generate") {
    return "POI a generer";
  }

  if (row.baseStatus === "to_produce") {
    return "A produire";
  }

  return "A creer";
}

function statusClass(row: StudioProductionRow): string {
  if (row.duplicateSlug) {
    return styles.statusError;
  }

  if (row.baseStatus === "ready") {
    return styles.statusOk;
  }

  if (row.baseStatus === "to_complete") {
    return styles.productionStatusWarn;
  }

  if (row.baseStatus === "poi_to_generate" || row.baseStatus === "to_produce") {
    return styles.statusNeutral;
  }

  return styles.productionStatusMuted;
}

function brainLabel(row: StudioProductionRow): string {
  if (!row.brainKnown) {
    return "Non";
  }

  return `Oui (${row.brainKnowledgeCount}/${row.brainKnowledgeTotal})`;
}

function matchesFilter(row: StudioProductionRow, filter: ProductionFilter): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "anomalies") {
    return row.duplicateSlug;
  }

  return row.baseStatus === filter;
}

function byPriorityThenName(left: StudioProductionRow, right: StudioProductionRow): number {
  if (left.baseStatus !== right.baseStatus) {
    const order: Record<StudioProductionRow["baseStatus"], number> = {
      to_complete: 0,
      poi_to_generate: 1,
      to_produce: 2,
      to_create: 3,
      ready: 4,
    };

    return order[left.baseStatus] - order[right.baseStatus];
  }

  if (left.brainKnowledgeCount !== right.brainKnowledgeCount) {
    return right.brainKnowledgeCount - left.brainKnowledgeCount;
  }

  return left.cityName.localeCompare(right.cityName, "fr", { sensitivity: "base" });
}

function renderRatio(covered: number, total: number): string {
  return `${formatCount(covered)} / ${formatCount(total)}`;
}

export default function StudioProductionPage({ snapshot }: StudioProductionPageProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductionFilter>("all");
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalizeForSearch(query.trim());

    const visible = snapshot.rows.filter((row) => {
      if (!matchesFilter(row, filter)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return normalizeForSearch(`${row.cityName} ${row.citySlug}`).includes(normalizedQuery);
    });

    return [...visible].sort(byPriorityThenName);
  }, [filter, query, snapshot.rows]);

  const selectedRow = useMemo(
    () => snapshot.rows.find((row) => row.key === selectedRowKey) ?? null,
    [selectedRowKey, snapshot.rows]
  );

  useEffect(() => {
    if (!selectedRow) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedRowKey(null);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedRow]);

  return (
    <div className={styles.dashboardStack}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Production</h1>
        <p className={styles.pageDescription}>
          Pilotage de la readiness des villes, des POI et des assets de production.
        </p>
      </header>

      <section className={`${styles.panel} ${styles.dashboardPanel}`} aria-label="KPI production">
        <header className={styles.dashboardSectionHeader}>
          <h2 className={`${styles.panelTitle} ${styles.dashboardSectionTitle}`.trim()}>Synthese</h2>
        </header>

        <div className={`${styles.metricGrid} ${styles.dashboardMetricGrid}`}>
          <MetricCard label="Pretes" value={formatCount(snapshot.kpis.ready)} tone="positive" compact />
          <MetricCard label="A completer" value={formatCount(snapshot.kpis.toComplete)} compact />
          <MetricCard label="POI a generer" value={formatCount(snapshot.kpis.poiToGenerate)} compact />
          <MetricCard label="A produire" value={formatCount(snapshot.kpis.toProduce)} compact />
          <MetricCard label="A creer" value={formatCount(snapshot.kpis.toCreate)} compact />
        </div>

        {snapshot.errors.length > 0 ? (
          <p className={styles.networkUnavailable}>Lecture partielle indisponible.</p>
        ) : null}
      </section>

      <section className={`${styles.panel} ${styles.dashboardPanel}`} aria-label="Table production">
        <header className={styles.dashboardSectionHeader}>
          <h2 className={`${styles.panelTitle} ${styles.dashboardSectionTitle}`.trim()}>Villes a piloter</h2>
          <p className={styles.dashboardSectionMeta}>{formatCount(filteredRows.length)} visibles</p>
        </header>

        <div className={styles.poiV1Toolbar}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.poiV1SearchInput}
            placeholder="Rechercher une ville"
            aria-label="Rechercher une ville"
          />
        </div>

        <div className={styles.poiV1Filters} role="tablist" aria-label="Filtres production">
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${filter === "all" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setFilter("all")}
          >
            Tous {formatCount(snapshot.rows.length)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${filter === "ready" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setFilter("ready")}
          >
            Pretes {formatCount(snapshot.kpis.ready)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${filter === "to_complete" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setFilter("to_complete")}
          >
            A completer {formatCount(snapshot.kpis.toComplete)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${filter === "poi_to_generate" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setFilter("poi_to_generate")}
          >
            POI a generer {formatCount(snapshot.kpis.poiToGenerate)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${filter === "to_produce" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setFilter("to_produce")}
          >
            A produire {formatCount(snapshot.kpis.toProduce)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${filter === "to_create" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setFilter("to_create")}
          >
            A creer {formatCount(snapshot.kpis.toCreate)}
          </button>
          <button
            type="button"
            className={`${styles.poiV1FilterButton} ${filter === "anomalies" ? styles.poiV1FilterButtonActive : ""}`.trim()}
            onClick={() => setFilter("anomalies")}
          >
            Anomalies {formatCount(snapshot.kpis.anomalies)}
          </button>
        </div>

        <div className={styles.poiV1TableWrap}>
          <table className={styles.poiV1Table}>
            <thead>
              <tr>
                <th>Ville</th>
                <th>Brain</th>
                <th>POI</th>
                <th>Textes FR</th>
                <th>Images</th>
                <th>Audios</th>
                <th>Premium</th>
                <th>Etat</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.poiV1EmptyCell}>
                    Aucune ville ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.key}
                    className={styles.poiV1Row}
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelectedRowKey(row.key)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedRowKey(row.key);
                      }
                    }}
                  >
                    <td>
                      <div className={styles.poiV1PoiCell}>
                        <span className={styles.poiV1PoiName}>{row.cityName}</span>
                        <span className={styles.poiV1PoiSlug}>{row.citySlug || "-"}</span>
                      </div>
                    </td>
                    <td>{brainLabel(row)}</td>
                    <td>{formatCount(row.activePoiCount)}</td>
                    <td>{renderRatio(row.textFrCoveredCount, row.activePoiCount)}</td>
                    <td>{renderRatio(row.imageCoveredCount, row.activePoiCount)}</td>
                    <td>{renderRatio(row.audioCoveredCount, row.activePoiCount)}</td>
                    <td>
                      <div className={styles.productionPremiumCell}>
                        <span>{renderRatio(row.premiumPoiCount, row.activePoiCount)}</span>
                        <span className={styles.poiV1PoiSlug}>{formatCount(row.premiumAudioCount)} audios</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(row)}`.trim()}>{statusLabel(row)}</span>
                    </td>
                    <td>{row.duplicateSlug ? "Verifier le doublon" : row.actionLabel}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRow ? (
        <>
          <button
            type="button"
            className={styles.poiDrawerBackdrop}
            aria-label="Fermer le detail Production"
            onClick={() => setSelectedRowKey(null)}
          />
          <aside className={styles.poiDrawer} aria-label="Detail production ville">
            <header className={styles.poiDrawerHeader}>
              <h3 className={styles.poiDrawerTitle}>{selectedRow.cityName}</h3>
              <button
                type="button"
                className={styles.poiDrawerCloseButton}
                onClick={() => setSelectedRowKey(null)}
              >
                Fermer
              </button>
            </header>

            <p className={styles.poiDrawerMeta}>Slug: {selectedRow.citySlug || "-"}</p>
            <p className={styles.poiDrawerMeta}>city_id: {selectedRow.cityId ?? "-"}</p>
            <p className={styles.poiDrawerMeta}>
              destination_id: {selectedRow.destinationIds.length > 0 ? selectedRow.destinationIds.join(", ") : "-"}
            </p>
            <p className={styles.poiDrawerMeta}>
              Connaissances Brain: {selectedRow.brainKnown ? "Oui" : "Non"} ({selectedRow.brainKnowledgeCount}/
              {selectedRow.brainKnowledgeTotal})
            </p>
            {selectedRow.brainEntityIds.length > 0 ? (
              <p className={styles.poiDrawerMeta}>knowledge_entities: {selectedRow.brainEntityIds.join(", ")}</p>
            ) : null}

            {selectedRow.duplicateSlug ? (
              <div className={styles.productionAnomalyBlock}>
                <p className={styles.productionAnomalyTitle}>Anomalie - doublon ville</p>
                <p className={styles.productionAnomalyText}>
                  city_id partages sur ce slug: {selectedRow.duplicateCityIds.join(", ")}
                </p>
              </div>
            ) : null}

            <dl className={styles.poiV1DrawerGrid}>
              <div>
                <dt>POI actifs</dt>
                <dd>{formatCount(selectedRow.activePoiCount)}</dd>
              </div>
              <div>
                <dt>Textes FR</dt>
                <dd>{renderRatio(selectedRow.textFrCoveredCount, selectedRow.activePoiCount)}</dd>
              </div>
              <div>
                <dt>Images</dt>
                <dd>{renderRatio(selectedRow.imageCoveredCount, selectedRow.activePoiCount)}</dd>
              </div>
              <div>
                <dt>Audios pieton complets</dt>
                <dd>{renderRatio(selectedRow.audioCoveredCount, selectedRow.activePoiCount)}</dd>
              </div>
              <div>
                <dt>Premium (POI)</dt>
                <dd>{renderRatio(selectedRow.premiumPoiCount, selectedRow.activePoiCount)}</dd>
              </div>
              <div>
                <dt>Premium (audios)</dt>
                <dd>{formatCount(selectedRow.premiumAudioCount)}</dd>
              </div>
            </dl>

            <ul className={styles.poiV1DrawerChecklist}>
              <li>
                <span>Textes manquants</span>
                <span className={selectedRow.missingTextCount > 0 ? styles.poiV1CoverageMissingText : styles.poiV1CoverageOkText}>
                  {formatCount(selectedRow.missingTextCount)}
                </span>
              </li>
              <li>
                <span>Images manquantes</span>
                <span className={selectedRow.missingImageCount > 0 ? styles.poiV1CoverageMissingText : styles.poiV1CoverageOkText}>
                  {formatCount(selectedRow.missingImageCount)}
                </span>
              </li>
              <li>
                <span>Audio manquants</span>
                <span className={selectedRow.missingAudioCount > 0 ? styles.poiV1CoverageMissingText : styles.poiV1CoverageOkText}>
                  {formatCount(selectedRow.missingAudioCount)}
                </span>
              </li>
              <li>
                <span>Etat</span>
                <span className={`${styles.statusBadge} ${statusClass(selectedRow)}`.trim()}>{statusLabel(selectedRow)}</span>
              </li>
              <li>
                <span>Action</span>
                <span>{selectedRow.duplicateSlug ? "Verifier le doublon" : selectedRow.actionLabel}</span>
              </li>
            </ul>
          </aside>
        </>
      ) : null}
    </div>
  );
}
