import type { CityFaqItem } from "@/types/city";
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DestinationContext } from "@/services/destinations/getDestinationContext";

type DestinationFaqItemSupabaseRow = {
  id: string;
  position: number;
};

type DestinationFaqItemContentSupabaseRow = {
  destination_faq_item_id: string;
  question: string | null;
  answer: string | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getDestinationFaq(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  context: DestinationContext | null
): Promise<CityFaqItem[]> {
  if (!context) {
    return [];
  }

  const { destinationId, languageId } = context;

  if (!isNonEmptyString(destinationId) || !isNonEmptyString(languageId)) {
    return [];
  }

  try {
    const { data: faqItemRows, error: faqItemsError } = await supabase
      .from("destination_faq_items")
      .select("id,position")
      .eq("destination_id", destinationId)
      .order("position", { ascending: true });

    if (faqItemsError) {
      console.error(
        `Supabase destination_faq_items query failed for destination_id "${destinationId}": ${faqItemsError.message}`
      );
      return [];
    }

    const faqItems = (faqItemRows ?? []) as DestinationFaqItemSupabaseRow[];

    if (faqItems.length === 0) {
      return [];
    }

    const faqItemIds = faqItems
      .map((item) => item.id)
      .filter((id): id is string => isNonEmptyString(id));

    if (faqItemIds.length === 0) {
      return [];
    }

    const { data: contentRows, error: contentError } = await supabase
      .from("destination_faq_item_contents")
      .select("destination_faq_item_id,question,answer")
      .eq("language_id", languageId)
      .in("destination_faq_item_id", faqItemIds);

    if (contentError) {
      console.error(
        `Supabase destination_faq_item_contents query failed for destination_id "${destinationId}" and language_id "${languageId}": ${contentError.message}`
      );
      return [];
    }

    const contentByFaqItemId = new Map<string, DestinationFaqItemContentSupabaseRow>();

    for (const row of (contentRows ?? []) as DestinationFaqItemContentSupabaseRow[]) {
      if (!contentByFaqItemId.has(row.destination_faq_item_id)) {
        contentByFaqItemId.set(row.destination_faq_item_id, row);
      }
    }

    const mappedFaq: CityFaqItem[] = [];

    for (const item of faqItems) {
      const content = contentByFaqItemId.get(item.id);

      if (!content) {
        continue;
      }

      if (!isNonEmptyString(content.question) || !isNonEmptyString(content.answer)) {
        continue;
      }

      mappedFaq.push({
        question: content.question.trim(),
        answer: content.answer.trim(),
      });
    }

    return mappedFaq;
  } catch {
    return [];
  }
}
