import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CountryCircuitSummary } from "@/types/circuit";

export async function getCountryCircuits(
  countrySlug: string
): Promise<CountryCircuitSummary[] | null> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("get_country_circuits", {
      p_country_slug: countrySlug,
    });

    if (error) {
      console.error(
        `Supabase getCountryCircuits RPC failed for country slug "${countrySlug}": ${error.message}`
      );
      return null;
    }

    if (data === null) {
      console.warn(
        `No circuits found in Supabase for country slug "${countrySlug}".`
      );
      return null;
    }

    return data as CountryCircuitSummary[];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error(
      `Supabase getCountryCircuits setup failed for country slug "${countrySlug}": ${message}`
    );

    return null;
  }
}
