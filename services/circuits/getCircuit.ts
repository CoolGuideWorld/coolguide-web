import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Circuit } from "@/types/circuit";

function normalizeSlug(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export async function getCircuit(
  slug: string,
  languageCode = "fr"
): Promise<Circuit | null> {
  const normalizedSlug = normalizeSlug(slug);

  if (!normalizedSlug) {
    console.warn("getCircuit called with an empty slug.");
    return null;
  }

  const normalizedLanguageCode = normalizeSlug(languageCode) ?? "fr";

  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("get_circuit", {
      p_slug: normalizedSlug,
      p_language_iso: normalizedLanguageCode,
    });

    if (error) {
      console.error(
        `Supabase getCircuit RPC failed for slug "${normalizedSlug}": ${error.message}`
      );
      return null;
    }

    if (!data) {
      console.warn(`No circuit found in Supabase for slug "${normalizedSlug}".`);
      return null;
    }

    return data as Circuit;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error(
      `Supabase getCircuit setup failed for slug "${normalizedSlug}": ${message}`
    );

    return null;
  }
}
