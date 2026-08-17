import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";

export type BrainDefinitionSpec = {
  slug: string;
  label: string;
};

type BrainEntityRow = {
  id: string;
  name: string | null;
  slug: string | null;
  entity_type: string | null;
};

type BrainDefinitionRow = {
  id: string;
  slug: string;
};

type BrainItemRow = {
  entity_id: string | null;
  definition_id: string | null;
  updated_at: string | null;
};

export type BrainCoverageRow = {
  id: string;
  name: string;
  slug: string;
  entityType: "city" | "destination";
  coverageCount: number;
  coveragePercent: number;
  lastKnowledgeAt: string | null;
  presentDefinitionSlugs: string[];
};

export type BrainCoverageKpis = {
  known: number;
  complete: number;
  partial: number;
  empty: number;
};

export type BrainCoverageData = {
  rows: BrainCoverageRow[];
  definitions: BrainDefinitionSpec[];
  kpis: BrainCoverageKpis;
};

const PAGE_SIZE = 1000;

export const TARGET_DEFINITIONS: BrainDefinitionSpec[] = [
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
        .select("id,name,slug,entity_type")
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
        .select("id,slug")
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

export async function readBrainCoverageData(options?: {
  includeRows?: boolean;
}): Promise<{
  data: BrainCoverageData | null;
  error: string | null;
}> {
  const includeRows = options?.includeRows ?? true;
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

  const definitionById = new Map(definitionsResult.rows.map((row) => [row.id, row.slug]));
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

  const rows: BrainCoverageRow[] = [];
  let complete = 0;
  let partial = 0;
  let empty = 0;

  for (const entity of entitiesResult.rows) {
    const bucket = buckets.get(entity.id);
    const presentDefinitionSlugs = Array.from(bucket?.present ?? []).sort((left, right) =>
      left.localeCompare(right, "fr", { sensitivity: "base" })
    );
    const coverageCount = presentDefinitionSlugs.length;

    if (coverageCount === TARGET_DEFINITIONS.length) {
      complete += 1;
    } else if (coverageCount === 0) {
      empty += 1;
    } else {
      partial += 1;
    }

    if (!includeRows) {
      continue;
    }

    rows.push({
      id: entity.id,
      name: entity.name?.trim() || entity.slug?.trim() || "Entité sans nom",
      slug: entity.slug?.trim() || "",
      entityType: entity.entity_type === "destination" ? "destination" : "city",
      coverageCount,
      coveragePercent: Math.round((coverageCount / TARGET_DEFINITIONS.length) * 100),
      lastKnowledgeAt: bucket?.lastKnowledgeAt ?? null,
      presentDefinitionSlugs,
    });
  }

  if (includeRows) {
    rows.sort((left, right) => {
      if (right.coverageCount !== left.coverageCount) {
        return right.coverageCount - left.coverageCount;
      }

      return left.name.localeCompare(right.name, "fr", {
        sensitivity: "base",
      });
    });
  }

  return {
    data: {
      rows,
      definitions: TARGET_DEFINITIONS,
      kpis: {
        known: entitiesResult.rows.length,
        complete,
        partial,
        empty,
      },
    },
    error: null,
  };
}

export async function readBrainCoverageKpis(): Promise<{
  kpis: BrainCoverageKpis | null;
  definitions: BrainDefinitionSpec[];
  error: string | null;
}> {
  const { data, error } = await readBrainCoverageData({ includeRows: false });

  return {
    kpis: data?.kpis ?? null,
    definitions: TARGET_DEFINITIONS,
    error,
  };
}