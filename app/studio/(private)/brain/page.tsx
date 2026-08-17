import MetricCard from "@/components/studio/MetricCard";
import StudioBrainCoverage from "@/components/studio/StudioBrainCoverage";
import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";
import styles from "../../studio.module.css";

type BrainDefinitionSpec = {
  slug: string;
  label: string;
};

type BrainEntityRow = {
  id: string;
  name: string | null;
  slug: string | null;
  entity_type: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type BrainDefinitionRow = {
  id: string;
  slug: string;
  name: string | null;
};

type BrainItemRow = {
  entity_id: string | null;
  definition_id: string | null;
  updated_at: string | null;
};

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

type BrainCoverageKpis = {
  known: number;
  complete: number;
  partial: number;
  empty: number;
};

type BrainCoverageData = {
  rows: BrainCoverageRow[];
  definitions: BrainDefinitionSpec[];
  kpis: BrainCoverageKpis;
};

const PAGE_SIZE = 1000;

const TARGET_DEFINITIONS: BrainDefinitionSpec[] = [
  { slug: "destination_identity", label: "Identité de destination" },
  { slug: "tourism_strength", label: "Force touristique" },
  { slug: "main_tourism_assets", label: "Attracteurs touristiques" },
  { slug: "exceptional_heritage", label: "Patrimoine exceptionnel" },
  { slug: "main_natural_sites", label: "Sites naturels principaux" },
  { slug: "nature_activities", label: "Activités nature" },
  { slug: "main_traveller_profile", label: "Profil voyageur principal" },
  { slug: "road_connections", label: "Connexions routières" },
  { slug: "network_fit", label: "Intégration réseau" },
  { slug: "production_coverage", label: "Couverture de production" },
];

const numberFormatter = new Intl.NumberFormat("fr-FR");

function formatMetric(value: number | null): string {
  if (typeof value !== "number") {
    return "Indisponible";
  }

  return numberFormatter.format(value);
}

function toIsoMax(current: string | null, candidate: string | null): string | null {
  if (!candidate) {
    return current;
  }

  if (!current) {
    return candidate;
  }

  const currentTime = Date.parse(current);
  const candidateTime = Date.parse(candidate);

  if (Number.isNaN(currentTime) || Number.isNaN(candidateTime)) {
    return current;
  }

  return candidateTime > currentTime ? candidate : current;
}

async function readAllKnowledgeEntities(): Promise<{
  rows: BrainEntityRow[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const rows: BrainEntityRow[] = [];
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("knowledge_entities")
        .select("id,name,slug,entity_type,created_at,updated_at")
        .in("entity_type", ["city", "destination"])
        .order("name", { ascending: true })
        .order("slug", { ascending: true })
        .range(from, to);

      if (error) {
        return {
          rows: null,
          error: error.message,
        };
      }

      const pageRows = (data ?? []) as BrainEntityRow[];
      rows.push(...pageRows);

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
      error: error instanceof Error ? error.message : "knowledge_entities_unavailable",
    };
  }
}

async function readTargetDefinitions(): Promise<{
  rows: BrainDefinitionRow[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const targetSlugs = TARGET_DEFINITIONS.map((item) => item.slug);
    const rows: BrainDefinitionRow[] = [];
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("knowledge_definitions")
        .select("id,slug,name")
        .in("slug", targetSlugs)
        .order("slug", { ascending: true })
        .range(from, to);

      if (error) {
        return {
          rows: null,
          error: error.message,
        };
      }

      const pageRows = (data ?? []) as BrainDefinitionRow[];
      rows.push(...pageRows);

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
      error: error instanceof Error ? error.message : "knowledge_definitions_unavailable",
    };
  }
}

async function readTargetItems(definitionIds: string[]): Promise<{
  rows: BrainItemRow[] | null;
  error: string | null;
}> {
  if (definitionIds.length === 0) {
    return {
      rows: [],
      error: null,
    };
  }

  try {
    const supabase = await createServerAuthSupabaseClient();
    const rows: BrainItemRow[] = [];
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("knowledge_items")
        .select("entity_id,definition_id,updated_at")
        .in("definition_id", definitionIds)
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (error) {
        return {
          rows: null,
          error: error.message,
        };
      }

      const pageRows = (data ?? []) as BrainItemRow[];
      rows.push(...pageRows);

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
      error: error instanceof Error ? error.message : "knowledge_items_unavailable",
    };
  }
}

async function readBrainCoverageData(): Promise<{
  data: BrainCoverageData | null;
  error: string | null;
}> {
  const entitiesResult = await readAllKnowledgeEntities();

  if (!entitiesResult.rows) {
    return {
      data: null,
      error: entitiesResult.error,
    };
  }

  const definitionsResult = await readTargetDefinitions();

  if (!definitionsResult.rows) {
    return {
      data: null,
      error: definitionsResult.error,
    };
  }

  const requiredSlugs = new Set(TARGET_DEFINITIONS.map((item) => item.slug));
  const visibleSlugs = new Set(definitionsResult.rows.map((row) => row.slug));
  const missingRequiredSlugs = Array.from(requiredSlugs).filter(
    (slug) => !visibleSlugs.has(slug)
  );

  if (missingRequiredSlugs.length > 0) {
    return {
      data: null,
      error: "brain_definitions_unavailable",
    };
  }

  const definitionById = new Map(
    definitionsResult.rows.map((row) => [row.id, row.slug])
  );
  const definitionIds = definitionsResult.rows.map((row) => row.id);
  const entityIds = new Set(entitiesResult.rows.map((row) => row.id));

  const itemsResult = await readTargetItems(definitionIds);

  if (!itemsResult.rows) {
    return {
      data: null,
      error: itemsResult.error,
    };
  }

  const buckets = new Map<
    string,
    {
      present: Set<string>;
      lastKnowledgeAt: string | null;
    }
  >();

  for (const item of itemsResult.rows) {
    if (!item.entity_id || !entityIds.has(item.entity_id) || !item.definition_id) {
      continue;
    }

    const definitionSlug = definitionById.get(item.definition_id);

    if (!definitionSlug) {
      continue;
    }

    const current = buckets.get(item.entity_id);

    if (current) {
      current.present.add(definitionSlug);
      current.lastKnowledgeAt = toIsoMax(current.lastKnowledgeAt, item.updated_at);
      continue;
    }

    buckets.set(item.entity_id, {
      present: new Set([definitionSlug]),
      lastKnowledgeAt: item.updated_at,
    });
  }

  const rows: BrainCoverageRow[] = entitiesResult.rows
    .map((entity) => {
      const bucket = buckets.get(entity.id);
      const presentDefinitionSlugs = Array.from(bucket?.present ?? []).sort((left, right) =>
        left.localeCompare(right, "fr", { sensitivity: "base" })
      );
      const coverageCount = presentDefinitionSlugs.length;
      const coveragePercent = Math.round((coverageCount / TARGET_DEFINITIONS.length) * 100);

      return {
        id: entity.id,
        name: entity.name?.trim() || entity.slug?.trim() || "Entité sans nom",
        slug: entity.slug?.trim() || "",
        entityType: entity.entity_type === "destination" ? "destination" : "city",
        coverageCount,
        coveragePercent,
        lastKnowledgeAt: bucket?.lastKnowledgeAt ?? null,
        presentDefinitionSlugs,
      } satisfies BrainCoverageRow;
    })
    .sort((left, right) => {
      if (right.coverageCount !== left.coverageCount) {
        return right.coverageCount - left.coverageCount;
      }

      return left.name.localeCompare(right.name, "fr", {
        sensitivity: "base",
      });
    });

  const known = rows.length;
  const complete = rows.filter((row) => row.coverageCount === TARGET_DEFINITIONS.length).length;
  const partial = rows.filter(
    (row) => row.coverageCount > 0 && row.coverageCount < TARGET_DEFINITIONS.length
  ).length;
  const empty = rows.filter((row) => row.coverageCount === 0).length;

  return {
    data: {
      rows,
      definitions: TARGET_DEFINITIONS,
      kpis: {
        known,
        complete,
        partial,
        empty,
      },
    },
    error: null,
  };
}

export default async function StudioBrainPage() {
  const { data, error } = await readBrainCoverageData();
  const kpiKnown = data?.kpis.known ?? null;
  const kpiComplete = data?.kpis.complete ?? null;
  const kpiPartial = data?.kpis.partial ?? null;
  const kpiEmpty = data?.kpis.empty ?? null;

  return (
    <div className={styles.dashboardStack}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Brain</h1>
        <p className={styles.pageDescription}>
          Couverture de connaissances des villes et destinations connues par le Brain.
        </p>
      </header>

      <section className={`${styles.panel} ${styles.dashboardPanel}`} aria-label="Synthèse Brain">
        <h2 className={styles.panelTitle}>Synthèse</h2>
        <div className={`${styles.metricGrid} ${styles.dashboardMetricGrid}`}>
          <MetricCard
            label="Connues"
            value={formatMetric(kpiKnown)}
            note={error ? "Lecture indisponible" : undefined}
            compact
          />
          <MetricCard
            label="Complètes"
            value={formatMetric(kpiComplete)}
            tone="positive"
            note={error ? "Lecture indisponible" : undefined}
            compact
          />
          <MetricCard
            label="Partielles"
            value={formatMetric(kpiPartial)}
            note={error ? "Lecture indisponible" : undefined}
            compact
          />
          <MetricCard
            label="Vides"
            value={formatMetric(kpiEmpty)}
            note={error ? "Lecture indisponible" : undefined}
            compact
          />
        </div>
      </section>

      <section className={`${styles.panel} ${styles.dashboardPanel}`} aria-label="Villes connues du Brain">
        {data ? (
          <StudioBrainCoverage
            rows={data.rows}
            definitions={data.definitions}
            kpis={data.kpis}
          />
        ) : (
          <p className={styles.networkUnavailable}>Données Brain indisponibles</p>
        )}
      </section>
    </div>
  );
}
