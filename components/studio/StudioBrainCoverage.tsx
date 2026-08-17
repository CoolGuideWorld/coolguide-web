"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/app/studio/studio.module.css";

type BrainCoverageRow = {
  id: string;
  name: string;
  slug: string;
  entityType: "city" | "destination";
  coverageCount: number;
  coveragePercent: number;
  lastKnowledgeAt: string | null;
  presentDefinitionSlugs: string[];
};

type BrainDefinitionSpec = {
  slug: string;
  label: string;
};

type BrainCoverageKpis = {
  known: number;
  complete: number;
  partial: number;
  empty: number;
};

type StudioBrainCoverageProps = {
  rows: BrainCoverageRow[];
  definitions: BrainDefinitionSpec[];
  kpis: BrainCoverageKpis;
};

type BrainFilter = "all" | "complete" | "partial" | "empty";
type BrainSort = "coverage" | "name" | "recent";

const numberFormatter = new Intl.NumberFormat("fr-FR");
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatLastDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return dateFormatter.format(date);
}

function getStatusLabel(row: BrainCoverageRow, totalDefinitions: number): string {
  if (row.coverageCount === totalDefinitions) {
    return "Complete";
  }

  if (row.coverageCount === 0) {
    return "Vide";
  }

  return "Partielle";
}

function filterMatches(row: BrainCoverageRow, filter: BrainFilter, totalDefinitions: number): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "complete") {
    return row.coverageCount === totalDefinitions;
  }

  if (filter === "partial") {
    return row.coverageCount > 0 && row.coverageCount < totalDefinitions;
  }

  return row.coverageCount === 0;
}

export default function StudioBrainCoverage({ rows, definitions, kpis }: StudioBrainCoverageProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BrainFilter>("all");
  const [sortBy, setSortBy] = useState<BrainSort>("coverage");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const totalDefinitions = definitions.length;

  const counters = {
    all: kpis.known,
    complete: kpis.complete,
    partial: kpis.partial,
    empty: kpis.empty,
  };

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalizeForSearch(query.trim());

    const visible = rows.filter((row) => {
      if (!filterMatches(row, filter, totalDefinitions)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${row.name} ${row.slug}`;
      return normalizeForSearch(haystack).includes(normalizedQuery);
    });

    const sorted = [...visible];

    sorted.sort((left, right) => {
      if (sortBy === "name") {
        return left.name.localeCompare(right.name, "fr", { sensitivity: "base" });
      }

      if (sortBy === "recent") {
        const leftTime = left.lastKnowledgeAt ? Date.parse(left.lastKnowledgeAt) : Number.NEGATIVE_INFINITY;
        const rightTime = right.lastKnowledgeAt ? Date.parse(right.lastKnowledgeAt) : Number.NEGATIVE_INFINITY;

        if (rightTime !== leftTime) {
          return rightTime - leftTime;
        }

        if (right.coverageCount !== left.coverageCount) {
          return right.coverageCount - left.coverageCount;
        }

        return left.name.localeCompare(right.name, "fr", { sensitivity: "base" });
      }

      if (right.coverageCount !== left.coverageCount) {
        return right.coverageCount - left.coverageCount;
      }

      return left.name.localeCompare(right.name, "fr", { sensitivity: "base" });
    });

    return sorted;
  }, [filter, query, rows, sortBy, totalDefinitions]);

  const selectedRow =
    selectedRowId === null ? null : rows.find((row) => row.id === selectedRowId) ?? null;

  useEffect(() => {
    if (!selectedRow) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedRowId(null);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedRow]);

  return (
    <div className={styles.brainCoverageStack}>
      <div className={styles.brainToolbar}>
        <input
          type="search"
          className={styles.brainSearchInput}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une ville"
          aria-label="Rechercher une ville"
        />

        <div className={styles.brainSortWrap}>
          <label htmlFor="brain-sort" className={styles.brainSortLabel}>
            Trier
          </label>
          <select
            id="brain-sort"
            className={styles.brainSortSelect}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as BrainSort)}
          >
            <option value="coverage">Couverture</option>
            <option value="name">Ville A-Z</option>
            <option value="recent">Activite recente</option>
          </select>
        </div>
      </div>

      <div className={styles.brainFilters} role="tablist" aria-label="Filtres de couverture Brain">
        <button
          type="button"
          className={`${styles.brainFilterButton} ${filter === "all" ? styles.brainFilterButtonActive : ""}`.trim()}
          onClick={() => setFilter("all")}
        >
          Toutes {numberFormatter.format(counters.all)}
        </button>
        <button
          type="button"
          className={`${styles.brainFilterButton} ${filter === "complete" ? styles.brainFilterButtonActive : ""}`.trim()}
          onClick={() => setFilter("complete")}
        >
          Completes {numberFormatter.format(counters.complete)}
        </button>
        <button
          type="button"
          className={`${styles.brainFilterButton} ${filter === "partial" ? styles.brainFilterButtonActive : ""}`.trim()}
          onClick={() => setFilter("partial")}
        >
          Partielles {numberFormatter.format(counters.partial)}
        </button>
        <button
          type="button"
          className={`${styles.brainFilterButton} ${filter === "empty" ? styles.brainFilterButtonActive : ""}`.trim()}
          onClick={() => setFilter("empty")}
        >
          Vides {numberFormatter.format(counters.empty)}
        </button>
      </div>

      <div className={styles.brainTableWrap}>
        <table className={styles.brainTable}>
          <thead>
            <tr>
              <th>Ville</th>
              <th>Couverture</th>
              <th>Statut</th>
              <th>Dernier apprentissage</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.brainEmptyCell}>
                  Aucun resultat.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const statusLabel = getStatusLabel(row, totalDefinitions);
                const isComplete = statusLabel === "Complete";
                const isPartial = statusLabel === "Partielle";
                const statusClass = isComplete
                  ? styles.brainStatusComplete
                  : isPartial
                    ? styles.brainStatusPartial
                    : styles.brainStatusEmpty;

                return (
                  <tr key={row.id}>
                    <td>
                      <button
                        type="button"
                        className={styles.brainRowButton}
                        onClick={() => setSelectedRowId(row.id)}
                      >
                        <span className={styles.brainRowName}>{row.name}</span>
                        <span className={styles.brainRowSlug}>{row.slug || "-"}</span>
                      </button>
                    </td>
                    <td>
                      <div className={styles.brainCoverageCell}>
                        <span className={styles.brainCoverageRatio}>
                          {numberFormatter.format(row.coverageCount)} / {numberFormatter.format(totalDefinitions)}
                        </span>
                        <span className={styles.brainCoverageTrack} aria-hidden="true">
                          <span
                            className={styles.brainCoverageFill}
                            style={{ width: `${row.coveragePercent}%` }}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass}`.trim()}>{statusLabel}</span>
                    </td>
                    <td>{formatLastDate(row.lastKnowledgeAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedRow ? (
        <>
          <button
            type="button"
            className={styles.poiDrawerBackdrop}
            aria-label="Fermer le detail Brain"
            onClick={() => setSelectedRowId(null)}
          />
          <aside className={styles.poiDrawer} aria-label="Detail couverture Brain">
            <header className={styles.poiDrawerHeader}>
              <h3 className={styles.poiDrawerTitle}>{selectedRow.name}</h3>
              <button
                type="button"
                className={styles.poiDrawerCloseButton}
                onClick={() => setSelectedRowId(null)}
              >
                Fermer
              </button>
            </header>

            <p className={styles.poiDrawerMeta}>slug: {selectedRow.slug || "-"}</p>
            <p className={styles.poiDrawerMeta}>
              Couverture {numberFormatter.format(selectedRow.coverageCount)} / {numberFormatter.format(totalDefinitions)}
            </p>
            <p className={styles.poiDrawerMeta}>
              Dernier apprentissage: {formatLastDate(selectedRow.lastKnowledgeAt)}
            </p>

            <ul className={styles.brainDefinitionList}>
              {definitions.map((definition) => {
                const present = selectedRow.presentDefinitionSlugs.includes(definition.slug);

                return (
                  <li key={definition.slug} className={styles.brainDefinitionItem}>
                    <span
                      className={`${styles.brainDefinitionDot} ${present ? styles.brainDefinitionDotPresent : styles.brainDefinitionDotMissing}`.trim()}
                      aria-hidden="true"
                    />
                    <div className={styles.brainDefinitionTextWrap}>
                      <p className={styles.brainDefinitionLabel}>{definition.label}</p>
                      <p className={styles.brainDefinitionSlug}>{definition.slug}</p>
                    </div>
                    <span className={present ? styles.brainDefinitionStatePresent : styles.brainDefinitionStateMissing}>
                      {present ? "Presente" : "Manquante"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>
        </>
      ) : null}
    </div>
  );
}
