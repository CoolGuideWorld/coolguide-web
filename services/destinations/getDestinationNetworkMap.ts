import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getCountriesWithPublishableDestinations,
  getDestinationPublicationDiagnosticsForCountrySlug,
} from "./catalog";

type CountryRelationRow = {
  name: string;
};

type CityRow = {
  id: string;
  slug: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  country_id: string;
  countries: CountryRelationRow | CountryRelationRow[] | null;
};

type PoiRow = {
  city_id: string;
  latitude: number | null;
  longitude: number | null;
};

export type StudioDestinationNetworkMarker = {
  cityId: string;
  citySlug: string;
  cityName: string;
  displayLatitude: number;
  displayLongitude: number;
  poiCount: number;
  countryName: string;
  countrySlug: string;
};

export type StudioRouteCandidateCity = {
  cityId: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
};

export type StudioDestinationNetworkData = {
  markers: StudioDestinationNetworkMarker[];
  routeCandidateCities: StudioRouteCandidateCity[];
  representedCountries: Array<{
    name: string;
    slug: string;
  }>;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function readSingleRelation<T>(relation: T | T[] | null): T | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
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

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle] ?? null;
  }

  const leftValue = sorted[middle - 1];
  const rightValue = sorted[middle];

  if (typeof leftValue !== "number" || typeof rightValue !== "number") {
    return null;
  }

  return (leftValue + rightValue) / 2;
}

export async function readStudioDestinationNetworkData(): Promise<StudioDestinationNetworkData> {
  const countries = await getCountriesWithPublishableDestinations();

  if (countries.length === 0) {
    return {
      markers: [],
      routeCandidateCities: [],
      representedCountries: [],
    };
  }

  const diagnosticsByCountry = await Promise.all(
    countries.map((country) => getDestinationPublicationDiagnosticsForCountrySlug(country.slug))
  );

  const cityIdsByCountrySlug = new Map<string, string[]>();

  for (let index = 0; index < countries.length; index += 1) {
    const country = countries[index];
    const diagnostics = diagnosticsByCountry[index] ?? [];
    const cityIds = diagnostics
      .filter((diagnostic) => diagnostic.publishable)
      .map((diagnostic) => diagnostic.cityId)
      .filter((cityId): cityId is string => isNonEmptyString(cityId));

    cityIdsByCountrySlug.set(country.slug, cityIds);
  }

  const cityIds = Array.from(new Set(Array.from(cityIdsByCountrySlug.values()).flat()));

  if (cityIds.length === 0) {
    return {
      markers: [],
      routeCandidateCities: [],
      representedCountries: countries.map((country) => ({
        name: country.name,
        slug: country.slug,
      })),
    };
  }

  const supabase = createServerSupabaseClient();
  const cityRows: CityRow[] = [];

  for (const cityIdChunk of splitIntoChunks(cityIds)) {
    const { data, error } = await supabase
      .from("cities")
      .select(
        `
          id,
          slug,
          name,
          latitude,
          longitude,
          country_id,
          countries!cities_country_id_fkey(name)
        `
      )
      .in("id", cityIdChunk)
      .eq("status", "active");

    if (error) {
      console.error(`Studio network map cities query failed: ${error.message}`);
      return {
        markers: [],
        routeCandidateCities: [],
        representedCountries: countries.map((country) => ({
          name: country.name,
          slug: country.slug,
        })),
      };
    }

    cityRows.push(...((data ?? []) as CityRow[]));
  }

  const cityById = new Map<string, CityRow>();

  for (const row of cityRows) {
    if (isNonEmptyString(row.id)) {
      cityById.set(row.id, row);
    }
  }

  const poiCountByCityId = new Map<string, number>();
  const poiLatitudesByCityId = new Map<string, number[]>();
  const poiLongitudesByCityId = new Map<string, number[]>();

  for (const cityIdChunk of splitIntoChunks(cityIds)) {
    const { data, error } = await supabase
      .from("poi")
      .select("city_id,latitude,longitude")
      .in("city_id", cityIdChunk)
      .eq("status", "active");

    if (error) {
      console.error(`Studio network map poi query failed: ${error.message}`);
      return {
        markers: [],
        routeCandidateCities: [],
        representedCountries: countries.map((country) => ({
          name: country.name,
          slug: country.slug,
        })),
      };
    }

    for (const row of (data ?? []) as PoiRow[]) {
      if (!isNonEmptyString(row.city_id)) {
        continue;
      }

      poiCountByCityId.set(row.city_id, (poiCountByCityId.get(row.city_id) ?? 0) + 1);

      if (typeof row.latitude === "number" && typeof row.longitude === "number") {
        const latitudeValues = poiLatitudesByCityId.get(row.city_id) ?? [];
        latitudeValues.push(row.latitude);
        poiLatitudesByCityId.set(row.city_id, latitudeValues);

        const longitudeValues = poiLongitudesByCityId.get(row.city_id) ?? [];
        longitudeValues.push(row.longitude);
        poiLongitudesByCityId.set(row.city_id, longitudeValues);
      }
    }
  }

  const markers: StudioDestinationNetworkMarker[] = [];

  for (const country of countries) {
    const cityIdsForCountry = cityIdsByCountrySlug.get(country.slug) ?? [];

    for (const cityId of cityIdsForCountry) {
      const city = cityById.get(cityId);

      if (!city || typeof city.latitude !== "number" || typeof city.longitude !== "number") {
        continue;
      }

      const countryRelation = readSingleRelation(city.countries);
      const countryName = countryRelation?.name?.trim() || country.name;
      const poiLatitudes = poiLatitudesByCityId.get(city.id) ?? [];
      const poiLongitudes = poiLongitudesByCityId.get(city.id) ?? [];
      const displayLatitude = median(poiLatitudes) ?? city.latitude;
      const displayLongitude = median(poiLongitudes) ?? city.longitude;

      markers.push({
        cityId: city.id,
        citySlug: city.slug,
        cityName: city.name,
        displayLatitude,
        displayLongitude,
        poiCount: poiCountByCityId.get(city.id) ?? 0,
        countryName,
        countrySlug: country.slug,
      });
    }
  }

  markers.sort((left, right) => {
    const countryComparison = left.countryName.localeCompare(right.countryName, "fr", {
      sensitivity: "base",
    });

    if (countryComparison !== 0) {
      return countryComparison;
    }

    return left.cityName.localeCompare(right.cityName, "fr", { sensitivity: "base" });
  });

  const routeCandidateCities: StudioRouteCandidateCity[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("cities")
      .select("id,name,slug,latitude,longitude")
      .eq("status", "active")
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      console.error(`Studio network map route-candidates query failed: ${error.message}`);
      return {
        markers,
        routeCandidateCities: [],
        representedCountries: countries.map((country) => ({
          name: country.name,
          slug: country.slug,
        })),
      };
    }

    const pageRows = (data ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
      latitude: number | null;
      longitude: number | null;
    }>;

    routeCandidateCities.push(
      ...pageRows
        .filter(
          (row) => isNonEmptyString(row.id) && isNonEmptyString(row.name) && isNonEmptyString(row.slug)
        )
        .map((row) => ({
          cityId: row.id,
          name: row.name,
          slug: row.slug,
          latitude: typeof row.latitude === "number" ? row.latitude : null,
          longitude: typeof row.longitude === "number" ? row.longitude : null,
        }))
    );

    if (pageRows.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return {
    markers,
    routeCandidateCities,
    representedCountries: countries.map((country) => ({
      name: country.name,
      slug: country.slug,
    })),
  };
}