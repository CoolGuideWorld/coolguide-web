import styles from "@/app/studio/studio.module.css";
import StudioCircuitsWorkbench, {
  type CircuitEditorialDraft,
  type CircuitEditorialDraftStop,
  type StudioCircuitItem,
  type StudioCircuitsMetrics,
} from "@/components/studio/StudioCircuitsWorkbench";
import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";

type JsonRecord = Record<string, unknown>;

type SupabaseLikeResponse = {
  data: JsonRecord[] | null;
  error: { message: string } | null;
};

type CountryCircuitFallbackRow = {
  id: string;
  slug: string;
  title: string | undefined;
};

type ExistingCircuitResolution = {
  existingCircuitId: string | null;
  existingCircuitSlug: string | null;
  ambiguous: boolean;
};

const STATUS_CANDIDATE_KEYS = ["status", "proposal_status", "state", "decision", "decision_status"];
const CREATED_AT_CANDIDATE_KEYS = ["created_at", "generated_at", "inserted_at", "updated_at"];

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as JsonRecord;
}

function readString(record: JsonRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function readNumber(record: JsonRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function readStringArray(record: JsonRecord, keys: string[]): string[] {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      const parsed = value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      if (parsed.length > 0) {
        return parsed;
      }
    }
  }

  return [];
}

function toStatus(value: string | null): string {
  if (!value) {
    return "pending";
  }

  return value.toLowerCase();
}

function toHumanLabel(raw: string | null): string {
  if (!raw) {
    return "-";
  }

  const normalized = raw.trim();

  if (!normalized) {
    return "-";
  }

  return normalized
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
}

function parseEditorialDraftStop(value: unknown): CircuitEditorialDraftStop | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as JsonRecord;
  const position = record.position;
  const slug = record.slug;
  const name = record.name;
  const editorialSummary = record.editorial_summary;

  if (
    typeof position !== "number" ||
    !Number.isFinite(position) ||
    typeof slug !== "string" ||
    typeof name !== "string" ||
    typeof editorialSummary !== "string"
  ) {
    return null;
  }

  return {
    position,
    slug: slug.trim(),
    name: name.trim(),
    editorial_summary: editorialSummary.trim(),
  };
}

function parseEditorialDraft(value: unknown): CircuitEditorialDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as JsonRecord;
  const stopsValue = record.stops;

  if (!Array.isArray(stopsValue)) {
    return null;
  }

  const stops = stopsValue
    .map((stop) => parseEditorialDraftStop(stop))
    .filter((stop): stop is CircuitEditorialDraftStop => stop !== null);

  const version = typeof record.version === "string" ? record.version.trim() : "";
  const language = typeof record.language === "string" ? record.language.trim() : "";
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const subtitle = typeof record.subtitle === "string" ? record.subtitle.trim() : "";
  const shortDescription =
    typeof record.short_description === "string" ? record.short_description.trim() : "";
  const introduction = typeof record.introduction === "string" ? record.introduction.trim() : "";
  const estimatedDuration =
    typeof record.estimated_duration === "string" ? record.estimated_duration.trim() : "";
  const seoTitle = typeof record.seo_title === "string" ? record.seo_title.trim() : "";
  const seoDescription =
    typeof record.seo_description === "string" ? record.seo_description.trim() : "";

  if (
    !version ||
    !language ||
    !title ||
    !subtitle ||
    !shortDescription ||
    !introduction ||
    !estimatedDuration ||
    !seoTitle ||
    !seoDescription
  ) {
    return null;
  }

  return {
    version,
    language,
    title,
    subtitle,
    short_description: shortDescription,
    introduction,
    estimated_duration: estimatedDuration,
    seo_title: seoTitle,
    seo_description: seoDescription,
    stops,
  };
}

function toProposalItem(
  rawItem: unknown,
  index: number,
  sourceCircuitLabelsById: Map<string, string>,
  existingCircuitResolutionByProposalId: Map<string, ExistingCircuitResolution>
): StudioCircuitItem {
  const record = asRecord(rawItem);
  const id = readString(record, ["id"]) ?? `proposal-${index}`;
  const anchorDestination = readString(record, ["anchor_destination", "destination", "target_destination"]);
  const pivot = readString(record, ["pivot"]);
  const stops = readStringArray(record, ["stops"]);
  const sourceCircuitId = readString(record, ["source_circuit_id", "origin_circuit_id"]);
  const sourceCircuitLabel = sourceCircuitId ? sourceCircuitLabelsById.get(sourceCircuitId) ?? null : null;
  const status = toStatus(readString(record, STATUS_CANDIDATE_KEYS));
  const createdAt = readString(record, CREATED_AT_CANDIDATE_KEYS);
  const stopCount = readNumber(record, ["stop_count"]);
  const score = readNumber(record, ["score"]);
  const confidenceLevel = readString(record, ["confidence", "confidence_level"]);
  const findings = readStringArray(record, ["findings"]);
  const editorialDraft = parseEditorialDraft(record.editorial_draft);
  const existingCircuitResolution = existingCircuitResolutionByProposalId.get(id) ?? {
    existingCircuitId: null,
    existingCircuitSlug: null,
    ambiguous: false,
  };

  const canPublish =
    status === "approved" &&
    editorialDraft !== null &&
    existingCircuitResolution.existingCircuitId !== null &&
    !existingCircuitResolution.ambiguous;

  return {
    id,
    destinationStrategique: toHumanLabel(anchorDestination) === "-" ? `Proposition ${index + 1}` : toHumanLabel(anchorDestination),
    pivot: toHumanLabel(pivot) === "-" ? null : toHumanLabel(pivot),
    stops: stops.map((stop) => toHumanLabel(stop)),
    stopCount,
    score,
    confidenceLevel,
    sourceCircuitLabel,
    status,
    createdAt,
    sourceCircuitId,
    linkedCircuitId: readString(record, ["circuit_id", "target_circuit_id", "generated_circuit_id"]),
    missionId: readString(record, ["mission_id"]),
    decisionId: readString(record, ["decision_id", "ai_decision_id"]),
    findings,
    editorialDraft,
    existingCircuitId: existingCircuitResolution.existingCircuitId,
    existingCircuitSlug: existingCircuitResolution.existingCircuitSlug,
    canPublish,
  };
}

function buildMetrics(proposals: StudioCircuitItem[], totalCircuits: number): StudioCircuitsMetrics {
  const pendingProposals = proposals.filter((item) => {
    const status = item.status;
    return (
      status.includes("proposed") ||
      status.includes("pending") ||
      status.includes("review") ||
      status.includes("attente") ||
      status.includes("progress")
    );
  }).length;

  const approvedProposals = proposals.filter((item) => {
    const status = item.status;
    return status.includes("approved") || status.includes("valid");
  }).length;

  const rejectedProposals = proposals.filter((item) => {
    const status = item.status;
    return status.includes("rejected") || status.includes("refus");
  }).length;

  return {
    totalProposals: proposals.length,
    pendingProposals,
    approvedProposals,
    rejectedProposals,
    totalCircuits,
  };
}

async function readTable(
  table: "circuit_proposals" | "circuits",
  limit: number
): Promise<SupabaseLikeResponse> {
  const supabase = await createServerAuthSupabaseClient();
  const response = await supabase.from(table).select("*").limit(limit);

  return {
    data: (response.data as JsonRecord[] | null) ?? null,
    error: response.error ? { message: response.error.message } : null,
  };
}

async function readCountryCircuitsFallback(
  countrySlug: string
): Promise<CountryCircuitFallbackRow[] | null> {
  const supabase = await createServerAuthSupabaseClient();
  const response = await supabase.rpc("get_country_circuits", {
    p_country_slug: countrySlug,
  });

  if (response.error) {
    return null;
  }

  if (!Array.isArray(response.data)) {
    return [];
  }

  const mappedRows = response.data.map((item): CountryCircuitFallbackRow | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id : null;
      const slug = typeof record.slug === "string" ? record.slug : null;
      const title = typeof record.title === "string" ? record.title : undefined;

      if (!id || !slug) {
        return null;
      }

      return { id, slug, title };
    });

  return mappedRows.filter((item): item is CountryCircuitFallbackRow => item !== null);
}

function parseExistingCircuitResolutionFromRpc(value: unknown): ExistingCircuitResolution {
  const record = asRecord(value);
  const matchCount = record.match_count;
  const ambiguous = record.ambiguous === true;
  const circuitId = typeof record.circuit_id === "string" ? record.circuit_id.trim() : "";
  const circuitSlug = typeof record.circuit_slug === "string" ? record.circuit_slug.trim() : "";

  if (matchCount === 1 && !ambiguous && circuitId && circuitSlug) {
    return {
      existingCircuitId: circuitId,
      existingCircuitSlug: circuitSlug,
      ambiguous: false,
    };
  }

  return {
    existingCircuitId: null,
    existingCircuitSlug: null,
    ambiguous,
  };
}

export default async function StudioCircuitsPage() {
  const warnings: string[] = [];

  const proposalsResult = await readTable("circuit_proposals", 200);

  if (proposalsResult.error) {
    warnings.push(`Lecture de circuit_proposals impossible: ${proposalsResult.error.message}`);
  }

  const circuitsResult = await readTable("circuits", 200);

  if (circuitsResult.error) {
    warnings.push(`Lecture de circuits impossible: ${circuitsResult.error.message}`);
  }

  const proposalsRaw = proposalsResult.data ?? [];
  const proposalSourceCircuitIds = new Set<string>();

  for (const row of proposalsRaw) {
    const sourceId = readString(asRecord(row), ["source_circuit_id", "origin_circuit_id"]);

    if (sourceId) {
      proposalSourceCircuitIds.add(sourceId);
    }
  }

  const sourceCircuitLabelsById = new Map<string, string>();

  for (const circuitRow of circuitsResult.data ?? []) {
    const circuitId = readString(circuitRow, ["id"]);

    if (!circuitId) {
      continue;
    }

    const slug = readString(circuitRow, ["slug"]);
    const preferredTitle = readString(circuitRow, ["title", "name"]);
    const resolvedLabel = slug ? toHumanLabel(slug) : preferredTitle ?? "-";

    sourceCircuitLabelsById.set(circuitId, resolvedLabel);
  }

  let totalCircuits = circuitsResult.data?.length ?? 0;
  const missingSourceLabels = [...proposalSourceCircuitIds].some(
    (sourceId) => !sourceCircuitLabelsById.has(sourceId)
  );

  if (totalCircuits === 0 || missingSourceLabels) {
    const fallbackRows = await readCountryCircuitsFallback("france");

    if (Array.isArray(fallbackRows)) {
      if (totalCircuits === 0) {
        totalCircuits = fallbackRows.length;
      }

      for (const row of fallbackRows) {
        if (sourceCircuitLabelsById.has(row.id)) {
          continue;
        }

        const resolvedLabel = row.slug ? toHumanLabel(row.slug) : row.title?.trim() ?? "-";
        sourceCircuitLabelsById.set(row.id, resolvedLabel);
      }

      if (circuitsResult.data?.length === 0) {
        warnings.push(
          "Accès direct à la table circuits vide/non visible pour ce compte. Compte de secours via RPC public appliqué."
        );
      } else if (missingSourceLabels) {
        warnings.push(
          "Certains circuits sources ne sont pas visibles en accès direct. Résolution complétée via RPC public."
        );
      }
    }
  }

  const existingCircuitResolutionByProposalId = new Map<string, ExistingCircuitResolution>();
  const supabase = await createServerAuthSupabaseClient();

  for (const [index, row] of proposalsRaw.entries()) {
    const proposalRecord = asRecord(row);
    const proposalId = readString(proposalRecord, ["id"]) ?? `proposal-${index}`;
    const proposalStatus = toStatus(readString(proposalRecord, STATUS_CANDIDATE_KEYS));
    const editorialDraft = parseEditorialDraft(proposalRecord.editorial_draft);

    if (proposalStatus !== "approved" || editorialDraft === null) {
      existingCircuitResolutionByProposalId.set(proposalId, {
        existingCircuitId: null,
        existingCircuitSlug: null,
        ambiguous: false,
      });
      continue;
    }

    const { data, error } = await supabase.rpc("resolve_existing_circuit_for_proposal", {
      p_proposal_id: proposalId,
    });

    if (error) {
      console.error(
        `[studio] resolve_existing_circuit_for_proposal failed for proposal ${proposalId}: ${error.message}`
      );
      existingCircuitResolutionByProposalId.set(proposalId, {
        existingCircuitId: null,
        existingCircuitSlug: null,
        ambiguous: false,
      });
      continue;
    }

    const resolution = parseExistingCircuitResolutionFromRpc(data);
    const payload = asRecord(data);
    const matchCount = typeof payload.match_count === "number" ? payload.match_count : null;

    console.log("[Studio Publish Resolver RPC]", {
      proposalId,
      matchCount,
      ambiguous: resolution.ambiguous,
      circuitId: resolution.existingCircuitId,
      circuitSlug: resolution.existingCircuitSlug,
      canPublish:
        proposalStatus === "approved" &&
        editorialDraft !== null &&
        resolution.existingCircuitId !== null &&
        !resolution.ambiguous,
    });

    existingCircuitResolutionByProposalId.set(proposalId, resolution);
  }

  const proposals = proposalsRaw.map((row, index) =>
    toProposalItem(row, index, sourceCircuitLabelsById, existingCircuitResolutionByProposalId)
  );

  const metrics = buildMetrics(proposals, totalCircuits);

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Circuits</h1>
        <p className={styles.pageDescription}>
          Supervision des propositions et suivi du catalogue existant, en lecture seule.
        </p>
      </header>

      <StudioCircuitsWorkbench proposals={proposals} metrics={metrics} dataWarnings={warnings} />
    </>
  );
}
