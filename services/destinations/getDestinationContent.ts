import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DestinationContext } from "@/services/destinations/getDestinationContext";

export type DestinationContentSupabaseRow = {
  title: string | null;
  subtitle: string | null;
  short_description: string | null;
  introduction: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export async function getDestinationContentForCity(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  context: DestinationContext | null
): Promise<DestinationContentSupabaseRow | null> {
  if (!context) {
    return null;
  }

  try {
    const { data: destinationContent, error: destinationContentError } = await supabase
      .from("destination_contents")
      .select(
        `
          title,
          subtitle,
          short_description,
          introduction,
          seo_title,
          seo_description
        `
      )
      .eq("destination_id", context.destinationId)
      .eq("language_id", context.languageId)
      .maybeSingle<DestinationContentSupabaseRow>();

    if (destinationContentError) {
      console.error(
        `Supabase destination content query failed for city_id "${context.cityId}": ${destinationContentError.message}`
      );
      return null;
    }

    return destinationContent ?? null;
  } catch {
    return null;
  }
}
