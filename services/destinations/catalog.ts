import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AVAILABLE_DESTINATION_COUNTRIES } from "@/components/destinations/availableCountries";

export const COUNTRY_DESTINATIONS_PAGE_SIZE = 24;

export const CATALOG_SORT_VALUES = ["az", "za"] as const;
export type CatalogSortValue = (typeof CATALOG_SORT_VALUES)[number];

export type CountryRow = {
  id: string;
  name: string;
};

type RelationRow = {
  name: string;
};

type ImageRow = {
  image_url: string | null;
  alt_text: string | null;
};

type CatalogCityRow = {
  slug: string;
  name: string;
  administrative_areas: RelationRow | RelationRow[] | null;
  city_images: ImageRow | ImageRow[] | null;
};

type SearchableCityCountryRow = {
  country_id: string;
  slug: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  countries: CountryRow | CountryRow[] | null;
  city_images: ImageRow | ImageRow[] | null;
};

export type CountryDestinationCard = {
  slug: string;
  href: string;
  name: string;
  imageSrc: string | null;
  imageAlt: string;
  administrativeArea: string | null;
};

export type CountryDestinationsQuery = {
  page: number;
  q: string;
  administrativeArea: string;
  sort: CatalogSortValue;
};

export type CountryDestinationsResult = {
  cards: CountryDestinationCard[];
  total: number;
  totalPages: number;
  page: number;
};

export type CountryCatalogData = {
  country: {
    id: string;
    name: string;
    slug: string;
  };
  administrativeAreas: string[];
  selectedAdministrativeArea: string;
  cards: CountryDestinationCard[];
  total: number;
  totalPages: number;
  page: number;
};

export type SearchableDestinationCountry = {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  searchTerms: string[];
};

function readRelationName(relation: RelationRow | RelationRow[] | null): string | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0]?.name ?? null;
  }

  return relation.name;
}

function readFirstImage(relation: ImageRow | ImageRow[] | null): ImageRow | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function readCountryRelation(relation: CountryRow | CountryRow[] | null): CountryRow | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function normalizeSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function countryNameToSlug(name: string): string {
  return normalizeSlug(name)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeIlike(value: string): string {
  return value.replace(/[%,_]/g, "");
}

function applyCatalogPublicationFilters<T>(query: T, relationPrefix = ""): T {
  // Shared publication source for catalog list + administrative filters.
  const field = (column: string) => (relationPrefix ? `${relationPrefix}.${column}` : column);

  return (query as any)
    .eq(field("status"), "active")
    .eq(field("city_images.image_type"), "hero")
    .eq(field("city_images.is_active"), true)
    .not(field("city_images.image_url"), "is", null);
}

function collectUniqueTerms(...groups: Array<Array<string | null | undefined>>): string[] {
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const group of groups) {
    for (const value of group) {
      if (typeof value !== "string") {
        continue;
      }

      const trimmed = value.trim();

      if (!trimmed) {
        continue;
      }

      if (seen.has(trimmed)) {
        continue;
      }

      seen.add(trimmed);
      terms.push(trimmed);
    }
  }

  return terms;
}

export async function getPublishedDestinationCountries(): Promise<SearchableDestinationCountry[]> {
  try {
    const supabase = createServerSupabaseClient();

    let query = supabase
      .from("cities")
      .select(
        `
          country_id,
          slug,
          name,
          latitude,
          longitude,
          countries!cities_country_id_fkey(id, name),
          city_images!inner(image_url, image_type, is_active)
        `
      )
      .order("name", { ascending: true })
      .order("slug", { ascending: true });

    query = applyCatalogPublicationFilters(query);

    const { data, error } = await query;

    if (error) {
      console.error(`Supabase published destination countries query failed: ${error.message}`);
      return [];
    }

    const rows = (data ?? []) as SearchableCityCountryRow[];
    const countryLookup = new Map(
      AVAILABLE_DESTINATION_COUNTRIES.map((country) => [country.slug, country])
    );
    const grouped = new Map<
      string,
      {
        name: string;
        slug: string;
        latitude: number | null;
        longitude: number | null;
        cityNames: string[];
        citySlugs: string[];
      }
    >();

    for (const row of rows) {
      const country = readCountryRelation(row.countries);
      const countryName = country?.name?.trim() ?? "";

      if (!countryName) {
        continue;
      }

      const countrySlug = countryNameToSlug(countryName);
      const staticCountry = countryLookup.get(countrySlug);
      const existing = grouped.get(countrySlug);

      if (existing) {
        existing.cityNames.push(row.name);
        existing.citySlugs.push(row.slug);

        if (existing.latitude === null && typeof row.latitude === "number") {
          existing.latitude = row.latitude;
        }

        if (existing.longitude === null && typeof row.longitude === "number") {
          existing.longitude = row.longitude;
        }

        continue;
      }

      grouped.set(countrySlug, {
        name: countryName,
        slug: countrySlug,
        latitude: staticCountry?.latitude ?? row.latitude,
        longitude: staticCountry?.longitude ?? row.longitude,
        cityNames: [row.name],
        citySlugs: [row.slug],
      });
    }

    return Array.from(grouped.values())
      .filter(
        (country): country is typeof country & { latitude: number; longitude: number } =>
          typeof country.latitude === "number" && typeof country.longitude === "number"
      )
      .map((country) => ({
        name: country.name,
        slug: country.slug,
        latitude: country.latitude,
        longitude: country.longitude,
        searchTerms: collectUniqueTerms(
          [country.name, country.slug],
          country.cityNames,
          country.citySlugs
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Published destination countries setup failed: ${message}`);
    return [];
  }
}

export function parseCatalogSort(value: string): CatalogSortValue {
  if (CATALOG_SORT_VALUES.includes(value as CatalogSortValue)) {
    return value as CatalogSortValue;
  }

  return "az";
}

export function parseCatalogPage(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function getCountryBySlug(countrySlug: string): Promise<{
  id: string;
  name: string;
  slug: string;
} | null> {
  const normalizedSlug = normalizeSlug(countrySlug);

  if (!normalizedSlug) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("countries")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error(`Supabase countries query failed: ${error.message}`);
    return null;
  }

  const countries = (data ?? []) as CountryRow[];

  const match = countries.find((row) => countryNameToSlug(row.name) === normalizedSlug);

  if (!match) {
    return null;
  }

  return {
    id: match.id,
    name: match.name,
    slug: countryNameToSlug(match.name),
  };
}

export async function getPublishedAdministrativeAreas(countryId: string): Promise<string[]> {
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("administrative_areas")
    .select(
      `
        name,
        cities!inner(
          id,
          status,
          country_id,
          city_images!inner(image_url, image_type, is_active)
        )
      `
    )
    .eq("cities.country_id", countryId)
    .not("name", "is", null)
    .neq("name", "")
    .order("name", { ascending: true });

  query = applyCatalogPublicationFilters(query, "cities");

  const { data, error } = await query;

  if (error) {
    console.error(`Supabase administrative areas query failed: ${error.message}`);
    return [];
  }

  const values = new Set<string>();

  for (const row of (data ?? []) as Array<{ name: string | null }>) {
    const name = row.name?.trim() ?? "";

    if (name.length > 0) {
      values.add(name);
    }
  }

  return Array.from(values).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
}

export async function getCountryDestinations(
  countryId: string,
  queryParams: CountryDestinationsQuery
): Promise<CountryDestinationsResult> {
  try {
    const supabase = createServerSupabaseClient();

    const isAscending = queryParams.sort === "az";

    const buildCityQuery = () => {
      let cityQuery = supabase
      .from("cities")
      .select(
        `
          slug,
          name,
          administrative_areas!cities_administrative_area_id_fkey(name),
          city_images!inner(image_url, alt_text, image_type, is_active)
        `,
        { count: "exact" }
      )
      .eq("country_id", countryId)
      .order("name", { ascending: isAscending })
      .order("slug", { ascending: isAscending });

      cityQuery = applyCatalogPublicationFilters(cityQuery);

      if (queryParams.administrativeArea) {
        cityQuery = cityQuery.eq("administrative_areas.name", queryParams.administrativeArea);
      }

      if (queryParams.q) {
        const safeLike = escapeIlike(queryParams.q);
        cityQuery = cityQuery.or(`name.ilike.%${safeLike}%,slug.ilike.%${safeLike}%`);
      }

      return cityQuery;
    };

    const getRange = (page: number) => {
      const from = (page - 1) * COUNTRY_DESTINATIONS_PAGE_SIZE;
      const to = from + COUNTRY_DESTINATIONS_PAGE_SIZE - 1;
      return { from, to };
    };

    const initialRange = getRange(queryParams.page);
    let { data: cityRows, error: cityRowsError, count } = await buildCityQuery().range(
      initialRange.from,
      initialRange.to
    );

    // PostgREST can return a range error when requested page exceeds available rows.
    if (cityRowsError && cityRowsError.message.includes("Requested range not satisfiable")) {
      const countResult = await buildCityQuery().range(0, COUNTRY_DESTINATIONS_PAGE_SIZE - 1);

      if (!countResult.error) {
        count = countResult.count;
      }

      cityRowsError = null;
      cityRows = [];
    }

    if (cityRowsError) {
      console.error(`Supabase country destinations query failed: ${cityRowsError.message}`);
      return {
        cards: [],
        total: 0,
        totalPages: 1,
        page: 1,
      };
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / COUNTRY_DESTINATIONS_PAGE_SIZE));
    const safePage = Math.min(queryParams.page, totalPages);

    if (safePage !== queryParams.page && total > 0) {
      const safeRange = getRange(safePage);
      const safePageResult = await buildCityQuery().range(safeRange.from, safeRange.to);

      if (safePageResult.error) {
        console.error(
          `Supabase country destinations safe-page query failed: ${safePageResult.error.message}`
        );
      } else {
        cityRows = safePageResult.data;
      }
    }

    const cards = ((cityRows ?? []) as CatalogCityRow[]).map((row) => {
      const administrativeArea = readRelationName(row.administrative_areas);
      const image = readFirstImage(row.city_images);
      const imageSrc = image?.image_url ?? null;

      return {
        slug: row.slug,
        href: `/${row.slug}`,
        name: row.name,
        imageSrc,
        imageAlt: image?.alt_text ?? `Vue de ${row.name}`,
        administrativeArea,
      } satisfies CountryDestinationCard;
    });

    return {
      cards,
      total,
      totalPages,
      page: safePage,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Country destinations setup failed: ${message}`);

    return {
      cards: [],
      total: 0,
      totalPages: 1,
      page: 1,
    };
  }
}

export async function getCountryCatalogData(input: {
  countrySlug: string;
  page: number;
  q: string;
  administrativeArea: string;
  sort: CatalogSortValue;
}): Promise<CountryCatalogData | null> {
  const country = await getCountryBySlug(input.countrySlug);

  if (!country) {
    return null;
  }

  const administrativeAreas = await getPublishedAdministrativeAreas(country.id);
  const selectedAdministrativeArea = administrativeAreas.includes(input.administrativeArea)
    ? input.administrativeArea
    : "";

  const destinations = await getCountryDestinations(country.id, {
    page: input.page,
    q: input.q,
    administrativeArea: selectedAdministrativeArea,
    sort: input.sort,
  });

  return {
    country,
    administrativeAreas,
    selectedAdministrativeArea,
    cards: destinations.cards,
    total: destinations.total,
    totalPages: destinations.totalPages,
    page: destinations.page,
  };
}
