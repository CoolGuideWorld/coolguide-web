import type { createServerSupabaseClient } from "@/lib/supabase/server";

type DestinationSupabaseRow = {
  id: string;
};

type LanguageSupabaseRow = {
  id: string;
};

export type DestinationContext = {
  destinationId: string;
  languageId: string;
  cityId: string;
};

export async function getDestinationContext(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  cityId: string,
  isoCode = "fr"
): Promise<DestinationContext | null> {
  try {
    const { data: destination, error: destinationError } = await supabase
      .from("destinations")
      .select("id")
      .eq("city_id", cityId)
      .maybeSingle<DestinationSupabaseRow>();

    if (destinationError) {
      console.error(
        `Supabase destination lookup failed for city_id "${cityId}": ${destinationError.message}`
      );
      return null;
    }

    if (!destination?.id) {
      return null;
    }

    const { data: language, error: languageError } = await supabase
      .from("languages")
      .select("id")
      .eq("iso_code", isoCode)
      .maybeSingle<LanguageSupabaseRow>();

    if (languageError) {
      console.error(
        `Supabase language lookup failed for iso_code "${isoCode}" and city_id "${cityId}": ${languageError.message}`
      );
      return null;
    }

    if (!language?.id) {
      return null;
    }

    return {
      destinationId: destination.id,
      languageId: language.id,
      cityId,
    };
  } catch {
    return null;
  }
}
