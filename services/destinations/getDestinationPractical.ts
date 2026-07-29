import type { CityPracticalItem } from "@/types/city";
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DestinationContext } from "@/services/destinations/getDestinationContext";

type DestinationPracticalItemSupabaseRow = {
  id: string;
  position: number;
};

type DestinationPracticalItemContentSupabaseRow = {
  destination_practical_item_id: string;
  title: string | null;
  answer: string | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getDestinationPractical(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  context: DestinationContext | null
): Promise<CityPracticalItem[]> {
  if (!context) {
    return [];
  }

  const { destinationId, languageId } = context;

  if (!isNonEmptyString(destinationId) || !isNonEmptyString(languageId)) {
    return [];
  }

  try {
    const { data: practicalItemsRows, error: practicalItemsError } = await supabase
      .from("destination_practical_items")
      .select("id,position")
      .eq("destination_id", destinationId)
      .order("position", { ascending: true });

    if (practicalItemsError) {
      console.error(
        `Supabase destination_practical_items query failed for destination_id "${destinationId}": ${practicalItemsError.message}`
      );
      return [];
    }

    const practicalItems = (practicalItemsRows ?? []) as DestinationPracticalItemSupabaseRow[];

    if (practicalItems.length === 0) {
      return [];
    }

    const itemIds = practicalItems
      .map((item) => item.id)
      .filter((id): id is string => isNonEmptyString(id));

    if (itemIds.length === 0) {
      return [];
    }

    const { data: contentRows, error: contentError } = await supabase
      .from("destination_practical_item_contents")
      .select("destination_practical_item_id,title,answer")
      .eq("language_id", languageId)
      .in("destination_practical_item_id", itemIds);

    if (contentError) {
      console.error(
        `Supabase destination_practical_item_contents query failed for destination_id "${destinationId}" and language_id "${languageId}": ${contentError.message}`
      );
      return [];
    }

    const contentByItemId = new Map<string, DestinationPracticalItemContentSupabaseRow>();

    for (const row of (contentRows ?? []) as DestinationPracticalItemContentSupabaseRow[]) {
      if (!contentByItemId.has(row.destination_practical_item_id)) {
        contentByItemId.set(row.destination_practical_item_id, row);
      }
    }

    const practical: CityPracticalItem[] = [];

    for (const item of practicalItems) {
      const content = contentByItemId.get(item.id);

      if (!content) {
        continue;
      }

      if (!isNonEmptyString(content.title) || !isNonEmptyString(content.answer)) {
        continue;
      }

      practical.push({
        title: content.title.trim(),
        answer: content.answer.trim(),
      });
    }

    return practical;
  } catch {
    return [];
  }
}
