import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DestinationCircuitContext } from "@/types/circuit";

function normalizeSlug(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export async function getDestinationCircuits(
  slug: string,
  languageIso = "fr"
): Promise<DestinationCircuitContext[] | null> {
  const normalizedSlug = normalizeSlug(slug);

  if (!normalizedSlug) {
    console.warn("getDestinationCircuits called with an empty slug.");
    return null;
  }

  const normalizedLanguageIso = normalizeSlug(languageIso) ?? "fr";

  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("get_destination_circuits", {
      p_destination_slug: normalizedSlug,
      p_language_iso: normalizedLanguageIso,
    });

    if (error) {
      console.error(
        `Supabase getDestinationCircuits RPC failed for slug "${normalizedSlug}": ${error.message}`
      );
      return null;
    }

    if (data === null) {
      console.warn(
        `No destination circuits found in Supabase for slug "${normalizedSlug}".`
      );
      return null;
    }

    if (Array.isArray(data) && data.length === 0) {
      return [];
    }

    return data as DestinationCircuitContext[];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error(
      `Supabase getDestinationCircuits setup failed for slug "${normalizedSlug}": ${message}`
    );

    return null;
  }
}
