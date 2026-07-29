import type { CityHighlightItem } from "@/types/city";
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DestinationContext } from "@/services/destinations/getDestinationContext";

type DestinationHighlightSupabaseRow = {
  id: string;
  poi_id: string | null;
  position: number;
  duration_minutes: number | null;
};

type DestinationHighlightContentSupabaseRow = {
  destination_highlight_id: string;
  category_label: string | null;
  image_alt: string | null;
};

type PoiCategorySupabaseRow = {
  name: string;
};

type PoiSupabaseRow = {
  id: string;
  name: string | null;
  category: PoiCategorySupabaseRow | PoiCategorySupabaseRow[] | null;
};

type PoiImageSupabaseRow = {
  poi_id: string;
  image_url: string | null;
};

type AudioSupabaseRow = {
  poi_id: string | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function firstNonEmptyString(
  ...values: Array<string | null | undefined>
): string | null {
  for (const value of values) {
    if (isNonEmptyString(value)) {
      return value.trim();
    }
  }

  return null;
}

function readSingleRelation<T>(
  relation: T | T[] | null
): T | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function formatVisitDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  if (minutes % 60 === 0) {
    return `${minutes / 60} h`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const paddedRemaining = String(remainingMinutes).padStart(2, "0");

  return `${hours} h ${paddedRemaining}`;
}

function mapFirstImageByPoiId(
  rows: PoiImageSupabaseRow[]
): Map<string, string> {
  const firstImageByPoiId = new Map<string, string>();

  for (const row of rows) {
    if (!isNonEmptyString(row.poi_id) || !isNonEmptyString(row.image_url)) {
      continue;
    }

    if (!firstImageByPoiId.has(row.poi_id)) {
      firstImageByPoiId.set(row.poi_id, row.image_url);
    }
  }

  return firstImageByPoiId;
}

export async function getDestinationHighlights(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  context: DestinationContext | null
): Promise<CityHighlightItem[]> {
  if (!context) {
    return [];
  }

  const { destinationId, languageId } = context;

  try {
    const { data: destinationHighlightRows, error: destinationHighlightsError } = await supabase
      .from("destination_highlights")
      .select("id,poi_id,position,duration_minutes")
      .eq("destination_id", destinationId)
      .order("position", { ascending: true });

    if (destinationHighlightsError) {
      console.error(
        `Supabase destination highlights query failed for destination_id "${destinationId}": ${destinationHighlightsError.message}`
      );
      return [];
    }

    const highlights = (destinationHighlightRows ?? []) as DestinationHighlightSupabaseRow[];

    if (highlights.length === 0) {
      return [];
    }

    const destinationHighlightIds = highlights
      .map((row) => row.id)
      .filter((id): id is string => isNonEmptyString(id));

    const poiIds = highlights
      .map((row) => row.poi_id)
      .filter((poiId): poiId is string => isNonEmptyString(poiId));

    const uniquePoiIds = Array.from(new Set(poiIds));

    if (destinationHighlightIds.length === 0 || uniquePoiIds.length === 0) {
      return [];
    }

    const { data: contentRows, error: destinationHighlightContentsError } = await supabase
      .from("destination_highlight_contents")
      .select("destination_highlight_id,category_label,image_alt")
      .in("destination_highlight_id", destinationHighlightIds)
      .eq("language_id", languageId);

    if (destinationHighlightContentsError) {
      console.error(
        `Supabase destination highlight contents query failed for destination_id "${destinationId}" and language_id "${languageId}": ${destinationHighlightContentsError.message}`
      );
      return [];
    }

    const contentByHighlightId = new Map<string, DestinationHighlightContentSupabaseRow>();

    for (const row of (contentRows ?? []) as DestinationHighlightContentSupabaseRow[]) {
      if (!contentByHighlightId.has(row.destination_highlight_id)) {
        contentByHighlightId.set(row.destination_highlight_id, row);
      }
    }

    const { data: poiRows, error: poiError } = await supabase
      .from("poi")
      .select(
        `
          id,
          name,
          category:categories!poi_category_id_fkey(name)
        `
      )
      .in("id", uniquePoiIds);

    if (poiError) {
      console.error(
        `Supabase poi query failed for destination_id "${destinationId}": ${poiError.message}`
      );
      return [];
    }

    const poiById = new Map<string, PoiSupabaseRow>();

    for (const poi of (poiRows ?? []) as PoiSupabaseRow[]) {
      if (isNonEmptyString(poi.id)) {
        poiById.set(poi.id, poi);
      }
    }

    const { data: poiImageRows, error: poiImagesError } = await supabase
      .from("poi_images")
      .select("poi_id,image_url")
      .in("poi_id", uniquePoiIds)
      .order("display_order", { ascending: true });

    if (poiImagesError) {
      console.error(
        `Supabase poi images query failed for destination_id "${destinationId}": ${poiImagesError.message}`
      );
      return [];
    }

    const firstImageByPoiId = mapFirstImageByPoiId(
      (poiImageRows ?? []) as PoiImageSupabaseRow[]
    );

    const { data: audioRows, error: audioError } = await supabase
      .from("audios")
      .select("poi_id")
      .in("poi_id", uniquePoiIds)
      .eq("status", "active")
      .not("audio_url", "is", null);

    if (audioError) {
      console.error(
        `Supabase audios query failed for destination_id "${destinationId}": ${audioError.message}`
      );
      return [];
    }

    const poiIdsWithAudio = new Set(
      ((audioRows ?? []) as AudioSupabaseRow[])
        .map((audio) => audio.poi_id)
        .filter((poiId): poiId is string => isNonEmptyString(poiId))
    );

    const mappedHighlights: CityHighlightItem[] = [];

    for (const highlight of highlights) {
      if (!isNonEmptyString(highlight.poi_id)) {
        continue;
      }

      const poi = poiById.get(highlight.poi_id);

      if (!poi || !isNonEmptyString(poi.name)) {
        continue;
      }

      const content = contentByHighlightId.get(highlight.id) ?? null;
      const poiCategoryRelation = readSingleRelation(poi.category);
      const categoryFromPoi = isNonEmptyString(poiCategoryRelation?.name)
        ? poiCategoryRelation.name
        : null;
      const category = firstNonEmptyString(content?.category_label, categoryFromPoi);
      const imageSrc = firstImageByPoiId.get(highlight.poi_id) ?? "";

      if (!isNonEmptyString(category) || !isNonEmptyString(imageSrc)) {
        continue;
      }

      mappedHighlights.push({
        name: poi.name,
        category,
        duration: formatVisitDuration(highlight.duration_minutes ?? 0),
        imageSrc,
        imageAlt: firstNonEmptyString(content?.image_alt) ?? `Vue de ${poi.name}`,
        hasAudioguide: poiIdsWithAudio.has(highlight.poi_id),
      });
    }

    return mappedHighlights;
  } catch {
    return [];
  }
}
