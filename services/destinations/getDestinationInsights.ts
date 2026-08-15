import type { CityInsightItem } from "@/types/city";
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DestinationContext } from "@/services/destinations/getDestinationContext";

type DestinationInsightSupabaseRow = {
  id: string;
  position: number;
};

type DestinationInsightContentSupabaseRow = {
  destination_insight_id: string;
  title: string | null;
  content: string | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getDestinationInsights(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  context: DestinationContext | null
): Promise<CityInsightItem[]> {
  if (!context) {
    return [];
  }

  const { destinationId, languageId } = context;

  if (!isNonEmptyString(destinationId) || !isNonEmptyString(languageId)) {
    return [];
  }

  try {
    const { data: insightRows, error: insightsError } = await supabase
      .from("destination_insights")
      .select("id,position")
      .eq("destination_id", destinationId)
      .order("position", { ascending: true });

    if (insightsError) {
      console.error(
        `Supabase destination_insights query failed for destination_id "${destinationId}": ${insightsError.message}`
      );
      return [];
    }

    const insights = (insightRows ?? []) as DestinationInsightSupabaseRow[];

    if (insights.length === 0) {
      return [];
    }

    const insightIds = insights
      .map((insight) => insight.id)
      .filter((id): id is string => isNonEmptyString(id));

    if (insightIds.length === 0) {
      return [];
    }

    const { data: contentRows, error: contentError } = await supabase
      .from("destination_insight_contents")
      .select("destination_insight_id,title,content")
      .eq("language_id", languageId)
      .in("destination_insight_id", insightIds);

    if (contentError) {
      console.error(
        `Supabase destination_insight_contents query failed for destination_id "${destinationId}" and language_id "${languageId}": ${contentError.message}`
      );
      return [];
    }

    const contentByInsightId = new Map<string, DestinationInsightContentSupabaseRow>();

    for (const row of (contentRows ?? []) as DestinationInsightContentSupabaseRow[]) {
      if (!contentByInsightId.has(row.destination_insight_id)) {
        contentByInsightId.set(row.destination_insight_id, row);
      }
    }

    const mappedInsights: CityInsightItem[] = [];

    for (const insight of insights) {
      const content = contentByInsightId.get(insight.id);

      if (!content) {
        continue;
      }

      if (!isNonEmptyString(content.title) || !isNonEmptyString(content.content)) {
        continue;
      }

      mappedInsights.push({
        title: content.title.trim(),
        content: content.content.trim(),
      });
    }

    return mappedInsights;
  } catch {
    return [];
  }
}
