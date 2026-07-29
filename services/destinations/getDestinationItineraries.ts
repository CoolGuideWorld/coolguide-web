import type { CityItineraryItem } from "@/types/city";
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DestinationContext } from "@/services/destinations/getDestinationContext";

type DestinationItinerarySupabaseRow = {
  id: string;
  position: number;
};

type DestinationItineraryContentSupabaseRow = {
  destination_itinerary_id: string;
  title: string | null;
  duration_label: string | null;
  summary: string | null;
  content: string | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getDestinationItineraries(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  context: DestinationContext | null
): Promise<CityItineraryItem[]> {
  if (!context) {
    return [];
  }

  const { destinationId, languageId } = context;

  if (!isNonEmptyString(destinationId) || !isNonEmptyString(languageId)) {
    return [];
  }

  try {
    const { data: itineraryRows, error: itineraryError } = await supabase
      .from("destination_itineraries")
      .select("id,position")
      .eq("destination_id", destinationId)
      .order("position", { ascending: true });

    if (itineraryError) {
      console.error(
        `Supabase destination_itineraries query failed for destination_id "${destinationId}": ${itineraryError.message}`
      );
      return [];
    }

    const itineraries = (itineraryRows ?? []) as DestinationItinerarySupabaseRow[];

    if (itineraries.length === 0) {
      return [];
    }

    const itineraryIds = itineraries
      .map((itinerary) => itinerary.id)
      .filter((id): id is string => isNonEmptyString(id));

    if (itineraryIds.length === 0) {
      return [];
    }

    const { data: contentRows, error: contentError } = await supabase
      .from("destination_itinerary_contents")
      .select("destination_itinerary_id,title,duration_label,summary,content")
      .eq("language_id", languageId)
      .in("destination_itinerary_id", itineraryIds);

    if (contentError) {
      console.error(
        `Supabase destination_itinerary_contents query failed for destination_id "${destinationId}" and language_id "${languageId}": ${contentError.message}`
      );
      return [];
    }

    const contentByItineraryId = new Map<string, DestinationItineraryContentSupabaseRow>();

    for (const row of (contentRows ?? []) as DestinationItineraryContentSupabaseRow[]) {
      if (!contentByItineraryId.has(row.destination_itinerary_id)) {
        contentByItineraryId.set(row.destination_itinerary_id, row);
      }
    }

    const mappedItineraries: CityItineraryItem[] = [];

    for (const itinerary of itineraries) {
      const content = contentByItineraryId.get(itinerary.id);

      if (!content) {
        continue;
      }

      if (
        !isNonEmptyString(content.title) ||
        !isNonEmptyString(content.duration_label) ||
        !isNonEmptyString(content.summary)
      ) {
        continue;
      }

      const resolvedContent = isNonEmptyString(content.content)
        ? content.content.trim()
        : content.summary.trim();

      mappedItineraries.push({
        title: content.title.trim(),
        duration: content.duration_label.trim(),
        summary: content.summary.trim(),
        content: resolvedContent,
      });
    }

    return mappedItineraries;
  } catch {
    return [];
  }
}
