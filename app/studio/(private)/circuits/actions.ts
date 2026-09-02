"use server";

import { revalidatePath } from "next/cache";
import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";
import { requireStudioAdmin } from "@/lib/studio/requireStudioAdmin";

const ALLOWED_DECISIONS = new Set(["approved", "rejected"]);

export type CircuitDecisionState = {
  error: string;
  success: string;
};

type CircuitEditorialDraftStop = {
  position: number;
  slug: string;
  name: string;
  editorial_summary: string;
};

type CircuitEditorialDraft = {
  version: string;
  language: string;
  title: string;
  subtitle: string;
  short_description: string;
  introduction: string;
  estimated_duration: string;
  seo_title: string;
  seo_description: string;
  stops: CircuitEditorialDraftStop[];
};

export type CircuitEditorialDraftSaveState = {
  error: string;
  success: string;
};

export type CircuitPublishState = {
  error: string;
  success: string;
};

type PublishExistingCircuitProposalPayload = {
  success: true;
  proposal_id: string;
  circuit_id: string;
  circuit_slug: string;
  circuit_content_id: string;
  status: "published";
  published_at: string;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toSafeString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function parsePublishPayload(value: unknown): PublishExistingCircuitProposalPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const success = record.success;
  const status = record.status;
  const circuitId = record.circuit_id;

  if (success !== true || status !== "published" || typeof circuitId !== "string") {
    return null;
  }

  const normalizedCircuitId = circuitId.trim();

  if (!isUuid(normalizedCircuitId)) {
    return null;
  }

  return {
    success: true,
    proposal_id: typeof record.proposal_id === "string" ? record.proposal_id : "",
    circuit_id: normalizedCircuitId,
    circuit_slug: typeof record.circuit_slug === "string" ? record.circuit_slug : "",
    circuit_content_id:
      typeof record.circuit_content_id === "string" ? record.circuit_content_id : "",
    status: "published",
    published_at: typeof record.published_at === "string" ? record.published_at : "",
  };
}

function isAmbiguousExistingCircuitResolution(value: unknown): boolean {
  const record = asRecord(value);
  return record.ambiguous === true;
}

function readRequiredString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function parseDraftStop(value: unknown): CircuitEditorialDraftStop | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const positionValue = record.position;
  const slugValue = record.slug;
  const nameValue = record.name;
  const editorialSummaryValue = record.editorial_summary;

  if (
    typeof positionValue !== "number" ||
    !Number.isFinite(positionValue) ||
    !Number.isInteger(positionValue)
  ) {
    return null;
  }

  if (typeof slugValue !== "string" || typeof nameValue !== "string") {
    return null;
  }

  const slug = slugValue.trim();
  const name = nameValue.trim();

  if (!slug || !name) {
    return null;
  }

  if (typeof editorialSummaryValue !== "string") {
    return null;
  }

  const editorialSummary = editorialSummaryValue.trim();

  if (!editorialSummary) {
    return null;
  }

  return {
    position: positionValue,
    slug,
    name,
    editorial_summary: editorialSummary,
  };
}

function parseDraftPayload(value: unknown): CircuitEditorialDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const stopsValue = record.stops;

  if (!Array.isArray(stopsValue)) {
    return null;
  }

  const stops = stopsValue.map((stop) => parseDraftStop(stop));

  if (stops.some((stop) => stop === null)) {
    return null;
  }

  const title = readRequiredString(record, "title");
  const subtitle = readRequiredString(record, "subtitle");
  const shortDescription = readRequiredString(record, "short_description");
  const introduction = readRequiredString(record, "introduction");
  const estimatedDuration = readRequiredString(record, "estimated_duration");
  const seoTitle = readRequiredString(record, "seo_title");
  const seoDescription = readRequiredString(record, "seo_description");

  if (
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
    version: "",
    language: "",
    title,
    subtitle,
    short_description: shortDescription,
    introduction,
    estimated_duration: estimatedDuration,
    seo_title: seoTitle,
    seo_description: seoDescription,
    stops: stops as CircuitEditorialDraftStop[],
  };
}

function parseStoredDraft(value: unknown): CircuitEditorialDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const parsed = parseDraftPayload(value);
  const version = readRequiredString(record, "version");
  const language = readRequiredString(record, "language");

  if (!parsed || !version || !language) {
    return null;
  }

  return {
    ...parsed,
    version,
    language,
  };
}

function haveSameStopStructure(
  currentStops: CircuitEditorialDraftStop[],
  incomingStops: CircuitEditorialDraftStop[]
): boolean {
  if (currentStops.length !== incomingStops.length) {
    return false;
  }

  for (let index = 0; index < currentStops.length; index += 1) {
    const current = currentStops[index];
    const incoming = incomingStops[index];

    if (
      current.position !== incoming.position ||
      current.slug !== incoming.slug ||
      current.name !== incoming.name
    ) {
      return false;
    }
  }

  return true;
}

export async function decideCircuitProposalAction(
  _prevState: CircuitDecisionState,
  formData: FormData
): Promise<CircuitDecisionState> {
  await requireStudioAdmin();

  const proposalId = toSafeString(formData.get("proposalId"));
  const decision = toSafeString(formData.get("decision")).toLowerCase();

  if (!proposalId) {
    return {
      error: "Proposition introuvable.",
      success: "",
    };
  }

  if (!ALLOWED_DECISIONS.has(decision)) {
    return {
      error: "Décision invalide.",
      success: "",
    };
  }

  const supabase = await createServerAuthSupabaseClient();
  const now = new Date().toISOString();

  const updatePayload =
    decision === "approved"
      ? {
          status: "approved",
          approved_at: now,
          updated_at: now,
        }
      : {
          status: "rejected",
          rejected_at: now,
          updated_at: now,
        };

  const { data, error } = await supabase
    .from("circuit_proposals")
    .update(updatePayload)
    .eq("id", proposalId)
    .eq("status", "proposed")
    .select("id,status")
    .maybeSingle();

  if (error) {
    console.error(`[studio] circuit_proposals decision update failed: ${error.message}`);
    return {
      error: "Impossible d'enregistrer la décision pour le moment.",
      success: "",
    };
  }

  if (!data) {
    return {
      error: "Cette proposition a déjà été traitée ou n'est plus disponible.",
      success: "",
    };
  }

  revalidatePath("/studio/circuits");

  return {
    error: "",
    success: decision === "approved" ? "Proposition approuvée." : "Proposition rejetée.",
  };
}

export async function saveCircuitEditorialDraftAction(
  _prevState: CircuitEditorialDraftSaveState,
  formData: FormData
): Promise<CircuitEditorialDraftSaveState> {
  await requireStudioAdmin();

  const proposalId = toSafeString(formData.get("proposalId"));
  const draftPayloadRaw = toSafeString(formData.get("draftPayload"));

  if (!proposalId) {
    return {
      error: "Proposition introuvable.",
      success: "",
    };
  }

  if (!draftPayloadRaw) {
    return {
      error: "Brouillon invalide.",
      success: "",
    };
  }

  let parsedIncomingPayload: unknown;

  try {
    parsedIncomingPayload = JSON.parse(draftPayloadRaw);
  } catch {
    return {
      error: "Brouillon invalide.",
      success: "",
    };
  }

  const incomingDraft = parseDraftPayload(parsedIncomingPayload);

  if (!incomingDraft) {
    return {
      error: "Brouillon invalide.",
      success: "",
    };
  }

  const supabase = await createServerAuthSupabaseClient();
  const { data: currentProposal, error: currentProposalError } = await supabase
    .from("circuit_proposals")
    .select("id,status,editorial_draft")
    .eq("id", proposalId)
    .eq("status", "approved")
    .maybeSingle();

  if (currentProposalError) {
    console.error(
      `[studio] circuit_proposals editorial draft load failed: ${currentProposalError.message}`
    );
    return {
      error: "Impossible d'enregistrer le brouillon pour le moment.",
      success: "",
    };
  }

  if (!currentProposal) {
    return {
      error: "Cette proposition n'est plus approuvée ou n'est plus disponible.",
      success: "",
    };
  }

  const storedDraft = parseStoredDraft(asRecord(currentProposal).editorial_draft);

  if (!storedDraft) {
    return {
      error: "Brouillon éditorial non disponible.",
      success: "",
    };
  }

  if (!haveSameStopStructure(storedDraft.stops, incomingDraft.stops)) {
    return {
      error: "La structure des étapes ne correspond plus au brouillon actuel.",
      success: "",
    };
  }

  const draftToSave: CircuitEditorialDraft = {
    version: storedDraft.version,
    language: storedDraft.language,
    title: incomingDraft.title,
    subtitle: incomingDraft.subtitle,
    short_description: incomingDraft.short_description,
    introduction: incomingDraft.introduction,
    estimated_duration: incomingDraft.estimated_duration,
    seo_title: incomingDraft.seo_title,
    seo_description: incomingDraft.seo_description,
    stops: storedDraft.stops.map((storedStop, index) => ({
      position: storedStop.position,
      slug: storedStop.slug,
      name: storedStop.name,
      editorial_summary: incomingDraft.stops[index].editorial_summary,
    })),
  };

  const now = new Date().toISOString();
  const { data: updatedProposal, error: updateError } = await supabase
    .from("circuit_proposals")
    .update({
      editorial_draft: draftToSave,
      updated_at: now,
    })
    .eq("id", proposalId)
    .eq("status", "approved")
    .select("id,status,updated_at")
    .maybeSingle();

  if (updateError) {
    console.error(
      `[studio] circuit_proposals editorial draft update failed: ${updateError.message}`
    );
    return {
      error: "Impossible d'enregistrer le brouillon pour le moment.",
      success: "",
    };
  }

  if (!updatedProposal) {
    return {
      error: "Cette proposition n'est plus approuvée ou n'est plus disponible.",
      success: "",
    };
  }

  revalidatePath("/studio/circuits");

  return {
    error: "",
    success: "Brouillon enregistré.",
  };
}

export async function publishCircuitProposalAction(
  _prevState: CircuitPublishState,
  formData: FormData
): Promise<CircuitPublishState> {
  await requireStudioAdmin();

  const proposalId = toSafeString(formData.get("proposalId"));
  const existingCircuitIdRaw = toSafeString(formData.get("existingCircuitId"));

  console.error("CIRCUIT_PUBLISH_ACTION_ENTER", {
    proposalId,
    existingCircuitId: existingCircuitIdRaw || null,
  });

  if (!proposalId || !isUuid(proposalId)) {
    return {
      error: "Proposition introuvable.",
      success: "",
    };
  }

  if (existingCircuitIdRaw && !isUuid(existingCircuitIdRaw)) {
    return {
      error: "Circuit existant introuvable.",
      success: "",
    };
  }

  const supabase = await createServerAuthSupabaseClient();
  const { data: currentProposal, error: currentProposalError } = await supabase
    .from("circuit_proposals")
    .select("id,status,editorial_draft")
    .eq("id", proposalId)
    .eq("status", "approved")
    .maybeSingle();

  if (currentProposalError) {
    console.error(
      `[studio] circuit_proposals publication precheck failed: ${currentProposalError.message}`
    );
    return {
      error: "Impossible de préparer la publication pour le moment.",
      success: "",
    };
  }

  if (!currentProposal || !parseStoredDraft(asRecord(currentProposal).editorial_draft)) {
    return {
      error: "Cette proposition n'est plus approuvée ou son brouillon éditorial est manquant.",
      success: "",
    };
  }

  const { data: existingCircuitResolutionData, error: existingCircuitResolutionError } =
    await supabase.rpc("resolve_existing_circuit_for_proposal", {
      p_proposal_id: proposalId,
    });

  if (existingCircuitResolutionError) {
    console.error(
      `[studio] resolve_existing_circuit_for_proposal failed during publish precheck (proposal=${proposalId}): ${existingCircuitResolutionError.message}`
    );
  } else if (isAmbiguousExistingCircuitResolution(existingCircuitResolutionData)) {
    return {
      error: "Publication impossible. La résolution du circuit existant est ambiguë.",
      success: "",
    };
  }

  const existingCircuitId = existingCircuitIdRaw.length > 0 ? existingCircuitIdRaw : null;
  const publishRpcName = existingCircuitId
    ? "publish_existing_circuit_proposal"
    : "publish_new_circuit_proposal";

  const { data, error } = existingCircuitId
    ? await supabase.rpc("publish_existing_circuit_proposal", {
        p_proposal_id: proposalId,
        p_existing_circuit_id: existingCircuitId,
      })
    : await supabase.rpc("publish_new_circuit_proposal", {
        p_proposal_id: proposalId,
      });

  if (error) {
    console.error("CIRCUIT_PUBLISH_RPC_ERROR", {
      rpc: publishRpcName,
      proposalId,
      existingCircuitId: existingCircuitId ?? null,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    console.error(
      `[studio] publish_existing_circuit_proposal failed (proposal=${proposalId}, circuit=${existingCircuitId}): ${error.message}`
    );
    return {
      error: "Impossible de publier le circuit pour le moment.",
      success: "",
    };
  }

  if (data === null) {
    return {
      error: "Publication refusée. Vérifiez l'état de la proposition et du circuit.",
      success: "",
    };
  }

  const publishPayload = parsePublishPayload(data);

  if (!publishPayload) {
    return {
      error: "Réponse de publication invalide. Merci de réessayer.",
      success: "",
    };
  }

  let parentMissionId: string | null = null;

  const { data: proposalMissionData, error: proposalMissionError } = await supabase
    .from("circuit_proposals")
    .select("mission_id")
    .eq("id", proposalId)
    .maybeSingle();

  if (proposalMissionError) {
    console.error("[Studio Publish] Failed to load mission_id for brain restart webhook", {
      proposalId,
      message: proposalMissionError.message,
    });
  } else {
    parentMissionId = readRequiredString(asRecord(proposalMissionData), "mission_id");
  }

  const webhookUrl = process.env.N8N_CIRCUIT_HERO_WEBHOOK_URL?.trim() ?? "";

  if (!webhookUrl) {
    console.warn("[Studio Publish] Hero webhook URL is missing; skipping post-publication dispatch.");
  } else {
    const circuitId = publishPayload.circuit_id;

    try {
      if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            circuit_id: circuitId,
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          console.error("[Studio Publish] Hero webhook failed", {
            circuitId,
            status: response.status,
          });
        }
      } else {
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, 5000);

        try {
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              circuit_id: circuitId,
            }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            console.error("[Studio Publish] Hero webhook failed", {
              circuitId,
              status: response.status,
            });
          }
        } finally {
          clearTimeout(timeoutId);
        }
      }
    } catch (webhookError) {
      console.error("[Studio Publish] Hero webhook request failed", {
        circuitId,
        message: webhookError instanceof Error ? webhookError.message : "unknown",
      });
    }
  }

  const brainRestartWebhookUrl = process.env.N8N_BRAIN_RESTART_WEBHOOK_URL?.trim() ?? "";

  if (brainRestartWebhookUrl && parentMissionId) {
    try {
      if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
        const response = await fetch(brainRestartWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parent_mission_id: parentMissionId,
            circuit_id: publishPayload.circuit_id,
            circuit_slug: publishPayload.circuit_slug,
            proposal_id: publishPayload.proposal_id,
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          console.error("[Studio Publish] Brain restart webhook failed", {
            proposalId,
            missionId: parentMissionId,
            circuitId: publishPayload.circuit_id,
            status: response.status,
          });
        }
      } else {
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, 5000);

        try {
          const response = await fetch(brainRestartWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              parent_mission_id: parentMissionId,
              circuit_id: publishPayload.circuit_id,
              circuit_slug: publishPayload.circuit_slug,
              proposal_id: publishPayload.proposal_id,
            }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            console.error("[Studio Publish] Brain restart webhook failed", {
              proposalId,
              missionId: parentMissionId,
              circuitId: publishPayload.circuit_id,
              status: response.status,
            });
          }
        } finally {
          clearTimeout(timeoutId);
        }
      }
    } catch (webhookError) {
      console.error("[Studio Publish] Brain restart webhook request failed", {
        proposalId,
        missionId: parentMissionId,
        circuitId: publishPayload.circuit_id,
        message: webhookError instanceof Error ? webhookError.message : "unknown",
      });
    }
  }

  revalidatePath("/studio/circuits");

  return {
    error: "",
    success: "Circuit publié.",
  };
}
