import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAllPublishableCityIds } from "./catalog";

type CityRow = {
  id: string;
  slug: string;
  name: string;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type ExperienceDestinationMapPoint = {
  citySlug: string;
  cityName: string;
  latitude: number;
  longitude: number;
  href: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function splitIntoChunks<T>(values: T[], size = 200): T[][] {
  if (values.length === 0) {
    return [];
  }

  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

export async function getExperienceDestinationsMapPoints(): Promise<ExperienceDestinationMapPoint[]> {
  try {
    const publishableCityIds = await getAllPublishableCityIds();

    if (publishableCityIds.length === 0) {
      return [];
    }

    const supabase = createServerSupabaseClient();
    const cityRows: CityRow[] = [];

    for (const cityIdChunk of splitIntoChunks(publishableCityIds)) {
      const { data, error } = await supabase
        .from("cities")
        .select("id,slug,name,status,latitude,longitude")
        .in("id", cityIdChunk)
        .eq("status", "active")
        .order("name", { ascending: true })
        .order("slug", { ascending: true });

      if (error) {
        console.error(`[experience-map] Cities query failed: ${error.message}`);
        return [];
      }

      cityRows.push(...((data ?? []) as CityRow[]));
    }

    return cityRows
      .filter(
        (row): row is CityRow & { latitude: number; longitude: number } =>
          isNonEmptyString(row.id) &&
          isNonEmptyString(row.slug) &&
          isNonEmptyString(row.name) &&
          row.status === "active" &&
          typeof row.latitude === "number" &&
          Number.isFinite(row.latitude) &&
          typeof row.longitude === "number" &&
          Number.isFinite(row.longitude)
      )
      .map((row) => ({
        citySlug: row.slug,
        cityName: row.name,
        latitude: row.latitude,
        longitude: row.longitude,
        href: `/${row.slug}`,
      }))
      .sort((left, right) => left.cityName.localeCompare(right.cityName, "fr", { sensitivity: "base" }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[experience-map] Unable to build public destinations map: ${message}`);
    return [];
  }
}
