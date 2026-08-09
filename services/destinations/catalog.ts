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

type PoiCategoryRow = {
  name: string;
};

type PoiRow = {
  id: string;
  name: string | null;
  category: PoiCategoryRow | PoiCategoryRow[] | null;
};

type ImageRow = {
  image_url: string | null;
  alt_text: string | null;
  image_type: string | null;
  is_active: boolean | null;
  position?: number | null;
};

type ActiveCityRow = {
  id: string;
  slug: string;
};

type DestinationRow = {
  id: string;
  city_id: string;
};

type DestinationContentRow = {
  destination_id: string;
};

type DestinationPracticalItemRow = {
  id: string;
  destination_id: string;
};

type DestinationPracticalItemContentRow = {
  destination_practical_item_id: string;
  title: string | null;
  answer: string | null;
};

type DestinationItineraryRow = {
  id: string;
  destination_id: string;
};

type DestinationItineraryContentRow = {
  destination_itinerary_id: string;
  title: string | null;
  duration_label: string | null;
  summary: string | null;
};

type DestinationHighlightRow = {
  id: string;
  destination_id: string;
  poi_id: string | null;
  position?: number | null;
};

type DestinationHighlightContentRow = {
  destination_highlight_id: string;
  category_label: string | null;
};

type PoiImageRow = {
  poi_id: string;
  image_url: string | null;
  display_order?: number | null;
};

type CatalogCityRow = {
  id: string;
  slug: string;
  name: string;
  administrative_areas: RelationRow | RelationRow[] | null;
  city_images: ImageRow | ImageRow[] | null;
};

type AdministrativeAreaCityRow = {
  administrative_areas: RelationRow | RelationRow[] | null;
};

type SearchableCityCountryRow = {
  country_id: string;
  slug: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  countries: CountryRow | CountryRow[] | null;
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

function readCountryRelation(relation: CountryRow | CountryRow[] | null): CountryRow | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function firstNonEmptyString(
  ...values: Array<string | null | undefined>
): string | null {
  for (const value of values) {
    if (isNonEmptyString(value)) {
      return value.trim();
    }
  }

  return null;
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

  return (query as any).eq(field("status"), "active");
}

function readCatalogHeroImage(relation: ImageRow | ImageRow[] | null): ImageRow | null {
  if (!relation) {
    return null;
  }

  const images = Array.isArray(relation) ? relation : [relation];
  const compatibleImages = images.filter(
    (image) =>
      image !== null &&
      image !== undefined &&
      image.image_type === "hero" &&
      image.is_active === true &&
      typeof image.image_url === "string" &&
      image.image_url.trim().length > 0
  );

  if (compatibleImages.length === 0) {
    return null;
  }

  const sorted = [...compatibleImages].sort((a, b) => {
    const aPosition = typeof a.position === "number" ? a.position : Number.MAX_SAFE_INTEGER;
    const bPosition = typeof b.position === "number" ? b.position : Number.MAX_SAFE_INTEGER;
    return aPosition - bPosition;
  });

  return sorted[0] ?? null;
}

function getFirstImageByPoiId(rows: PoiImageRow[]): Map<string, PoiImageRow> {
  const firstImageByPoiId = new Map<string, PoiImageRow>();

  for (const row of rows) {
    if (!isNonEmptyString(row.poi_id) || !isNonEmptyString(row.image_url)) {
      continue;
    }

    if (!firstImageByPoiId.has(row.poi_id)) {
      firstImageByPoiId.set(row.poi_id, row);
    }
  }

  return firstImageByPoiId;
}

function getLanguageIdByIsoCodeRows(rows: Array<{ id: string }>): string | null {
  const languageId = rows[0]?.id;
  return isNonEmptyString(languageId) ? languageId : null;
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

export async function getCatalogFallbackImagesByCityId(
  supabase = createServerSupabaseClient(),
  cityIds: string[]
): Promise<
  Map<
    string,
    {
      imageSrc: string | null;
      imageAlt: string | null;
    }
  >
> {
  const fallbackByCityId = new Map<
    string,
    {
      imageSrc: string | null;
      imageAlt: string | null;
    }
  >();

  const validCityIds = cityIds.filter((cityId): cityId is string => isNonEmptyString(cityId));

  if (validCityIds.length === 0) {
    return fallbackByCityId;
  }

  const destinations: DestinationRow[] = [];

  for (const cityIdChunk of splitIntoChunks(validCityIds)) {
    const { data, error } = await supabase
      .from("destinations")
      .select("id,city_id")
      .in("city_id", cityIdChunk);

    if (error) {
      console.error(
        `Supabase destinations query failed for catalog fallback: ${error.message}`
      );
      return fallbackByCityId;
    }

    destinations.push(...((data ?? []) as DestinationRow[]));
  }

  const destinationIdByCityId = new Map<string, string>();

  for (const destination of destinations) {
    if (isNonEmptyString(destination.id) && isNonEmptyString(destination.city_id)) {
      destinationIdByCityId.set(destination.city_id, destination.id);
    }
  }

  const destinationIds = Array.from(destinationIdByCityId.values());

  if (destinationIds.length === 0) {
    return fallbackByCityId;
  }

  const highlights: DestinationHighlightRow[] = [];

  for (const destinationIdChunk of splitIntoChunks(destinationIds)) {
    const { data, error } = await supabase
      .from("destination_highlights")
      .select("id,destination_id,poi_id,position")
      .in("destination_id", destinationIdChunk)
      .order("position", { ascending: true });

    if (error) {
      console.error(
        `Supabase destination highlights fallback query failed: ${error.message}`
      );
      return fallbackByCityId;
    }

    highlights.push(...((data ?? []) as DestinationHighlightRow[]));
  }

  const highlightByDestinationId = new Map<string, DestinationHighlightRow[]>();
  const highlightPoiIds: string[] = [];

  for (const highlight of highlights) {
    if (!isNonEmptyString(highlight.destination_id) || !isNonEmptyString(highlight.poi_id)) {
      continue;
    }

    const existing = highlightByDestinationId.get(highlight.destination_id) ?? [];
    existing.push(highlight);
    highlightByDestinationId.set(highlight.destination_id, existing);
    highlightPoiIds.push(highlight.poi_id);
  }

  const uniqueHighlightPoiIds = Array.from(new Set(highlightPoiIds));

  if (uniqueHighlightPoiIds.length === 0) {
    return fallbackByCityId;
  }

  const poiImages: PoiImageRow[] = [];

  for (const poiIdChunk of splitIntoChunks(uniqueHighlightPoiIds)) {
    const { data, error } = await supabase
      .from("poi_images")
      .select("poi_id,image_url,display_order")
      .in("poi_id", poiIdChunk)
      .order("display_order", { ascending: true });

    if (error) {
      console.error(
        `Supabase poi images fallback query failed: ${error.message}`
      );
      return fallbackByCityId;
    }

    poiImages.push(...((data ?? []) as PoiImageRow[]));
  }

  const firstImageByPoiId = getFirstImageByPoiId(poiImages);

  for (const [cityId, destinationId] of destinationIdByCityId) {
    const destinationHighlights = highlightByDestinationId.get(destinationId) ?? [];

    for (const highlight of destinationHighlights) {
      if (!highlight.poi_id) {
        continue;
      }

      const image = firstImageByPoiId.get(highlight.poi_id) ?? null;

      if (!image?.image_url || !isNonEmptyString(image.image_url)) {
        continue;
      }

      fallbackByCityId.set(cityId, {
        imageSrc: image.image_url.trim(),
        imageAlt: null,
      });
      break;
    }
  }

  return fallbackByCityId;
}

async function getPublishableCityIdsForCountry(
  countryId: string
): Promise<Set<string>> {
  const supabase = createServerSupabaseClient();

  const { data: activeCityRows, error: activeCitiesError } = await supabase
    .from("cities")
    .select("id,slug")
    .eq("country_id", countryId)
    .eq("status", "active");

  if (activeCitiesError) {
    console.error(
      `Supabase active cities query failed for country_id "${countryId}": ${activeCitiesError.message}`
    );
    return new Set();
  }

  const activeCities = (activeCityRows ?? []) as ActiveCityRow[];
  const cityIds = activeCities
    .map((city) => city.id)
    .filter((cityId): cityId is string => isNonEmptyString(cityId));

  if (cityIds.length === 0) {
    return new Set();
  }

  const { data: destinationRows, error: destinationsError } = await supabase
    .from("destinations")
    .select(
      `
        id,
        city_id,
        cities!inner(country_id,status)
      `
    )
    .eq("cities.country_id", countryId)
    .eq("cities.status", "active");

  if (destinationsError) {
    console.error(
      `Supabase destinations query failed for country_id "${countryId}": ${destinationsError.message}`
    );
    return new Set();
  }

  const destinations = (destinationRows ?? []) as DestinationRow[];

  if (destinations.length === 0) {
    return new Set();
  }

  const destinationIds = destinations
    .map((destination) => destination.id)
    .filter((destinationId): destinationId is string => isNonEmptyString(destinationId));

  if (destinationIds.length === 0) {
    return new Set();
  }

  const cityIdByDestinationId = new Map<string, string>();

  for (const destination of destinations) {
    if (isNonEmptyString(destination.id) && isNonEmptyString(destination.city_id)) {
      cityIdByDestinationId.set(destination.id, destination.city_id);
    }
  }

  const { data: languageRows, error: languageError } = await supabase
    .from("languages")
    .select("id")
    .eq("iso_code", "fr")
    .limit(1);

  if (languageError) {
    console.error(
      `Supabase language lookup failed for country_id "${countryId}": ${languageError.message}`
    );
    return new Set();
  }

  const languageId = getLanguageIdByIsoCodeRows((languageRows ?? []) as Array<{ id: string }>);

  if (!languageId) {
    return new Set();
  }

  const destinationContentRows: DestinationContentRow[] = [];

  for (const destinationIdChunk of splitIntoChunks(destinationIds)) {
    const { data, error } = await supabase
      .from("destination_contents")
      .select("destination_id")
      .eq("language_id", languageId)
      .in("destination_id", destinationIdChunk);

    if (error) {
      console.error(
        `Supabase destination contents query failed for country_id "${countryId}": ${error.message}`
      );
      return new Set();
    }

    destinationContentRows.push(...((data ?? []) as DestinationContentRow[]));
  }

  const destinationsWithContent = new Set(
    destinationContentRows
      .map((row) => row.destination_id)
      .filter((destinationId): destinationId is string => isNonEmptyString(destinationId))
  );

  const practicalItems: DestinationPracticalItemRow[] = [];

  for (const destinationIdChunk of splitIntoChunks(destinationIds)) {
    const { data, error } = await supabase
      .from("destination_practical_items")
      .select("id,destination_id")
      .in("destination_id", destinationIdChunk);

    if (error) {
      console.error(
        `Supabase destination practical items query failed for country_id "${countryId}": ${error.message}`
      );
      return new Set();
    }

    practicalItems.push(...((data ?? []) as DestinationPracticalItemRow[]));
  }
  const practicalItemIds = practicalItems
    .map((row) => row.id)
    .filter((itemId): itemId is string => isNonEmptyString(itemId));
  const destinationIdByPracticalItemId = new Map<string, string>();

  for (const item of practicalItems) {
    if (isNonEmptyString(item.id) && isNonEmptyString(item.destination_id)) {
      destinationIdByPracticalItemId.set(item.id, item.destination_id);
    }
  }

  let destinationsWithPractical = new Set<string>();

  if (practicalItemIds.length > 0) {
    const practicalContentRows: DestinationPracticalItemContentRow[] = [];

    for (const practicalItemIdChunk of splitIntoChunks(practicalItemIds)) {
      const { data, error } = await supabase
        .from("destination_practical_item_contents")
        .select("destination_practical_item_id,title,answer")
        .eq("language_id", languageId)
        .in("destination_practical_item_id", practicalItemIdChunk);

      if (error) {
        console.error(
          `Supabase destination practical contents query failed for country_id "${countryId}": ${error.message}`
        );
        return new Set();
      }

      practicalContentRows.push(...((data ?? []) as DestinationPracticalItemContentRow[]));
    }

    destinationsWithPractical = new Set(
      practicalContentRows
        .filter(
          (row) =>
            isNonEmptyString(row.title) &&
            isNonEmptyString(row.answer) &&
            isNonEmptyString(destinationIdByPracticalItemId.get(row.destination_practical_item_id))
        )
        .map((row) => destinationIdByPracticalItemId.get(row.destination_practical_item_id) as string)
    );
  }

  const itineraries: DestinationItineraryRow[] = [];

  for (const destinationIdChunk of splitIntoChunks(destinationIds)) {
    const { data, error } = await supabase
      .from("destination_itineraries")
      .select("id,destination_id")
      .in("destination_id", destinationIdChunk);

    if (error) {
      console.error(
        `Supabase destination itineraries query failed for country_id "${countryId}": ${error.message}`
      );
      return new Set();
    }

    itineraries.push(...((data ?? []) as DestinationItineraryRow[]));
  }
  const itineraryIds = itineraries
    .map((row) => row.id)
    .filter((itineraryId): itineraryId is string => isNonEmptyString(itineraryId));
  const destinationIdByItineraryId = new Map<string, string>();

  for (const itinerary of itineraries) {
    if (isNonEmptyString(itinerary.id) && isNonEmptyString(itinerary.destination_id)) {
      destinationIdByItineraryId.set(itinerary.id, itinerary.destination_id);
    }
  }

  let destinationsWithItineraries = new Set<string>();

  if (itineraryIds.length > 0) {
    const itineraryContentRows: DestinationItineraryContentRow[] = [];

    for (const itineraryIdChunk of splitIntoChunks(itineraryIds)) {
      const { data, error } = await supabase
        .from("destination_itinerary_contents")
        .select("destination_itinerary_id,title,duration_label,summary")
        .eq("language_id", languageId)
        .in("destination_itinerary_id", itineraryIdChunk);

      if (error) {
        console.error(
          `Supabase destination itinerary contents query failed for country_id "${countryId}": ${error.message}`
        );
        return new Set();
      }

      itineraryContentRows.push(...((data ?? []) as DestinationItineraryContentRow[]));
    }

    destinationsWithItineraries = new Set(
      itineraryContentRows
        .filter(
          (row) =>
            isNonEmptyString(row.title) &&
            isNonEmptyString(row.duration_label) &&
            isNonEmptyString(row.summary) &&
            isNonEmptyString(destinationIdByItineraryId.get(row.destination_itinerary_id))
        )
        .map((row) => destinationIdByItineraryId.get(row.destination_itinerary_id) as string)
    );
  }

  const highlights: DestinationHighlightRow[] = [];

  for (const destinationIdChunk of splitIntoChunks(destinationIds)) {
    const { data, error } = await supabase
      .from("destination_highlights")
      .select("id,destination_id,poi_id")
      .in("destination_id", destinationIdChunk)
      .order("position", { ascending: true });

    if (error) {
      console.error(
        `Supabase destination highlights query failed for country_id "${countryId}": ${error.message}`
      );
      return new Set();
    }

    highlights.push(...((data ?? []) as DestinationHighlightRow[]));
  }
  const highlightsByDestinationId = new Map<string, DestinationHighlightRow[]>();

  for (const highlight of highlights) {
    if (!isNonEmptyString(highlight.destination_id)) {
      continue;
    }

    const bucket = highlightsByDestinationId.get(highlight.destination_id) ?? [];
    bucket.push(highlight);
    highlightsByDestinationId.set(highlight.destination_id, bucket);
  }

  const highlightIds = highlights
    .map((row) => row.id)
    .filter((highlightId): highlightId is string => isNonEmptyString(highlightId));
  const poiIds = Array.from(
    new Set(
      highlights
        .map((row) => row.poi_id)
        .filter((poiId): poiId is string => isNonEmptyString(poiId))
    )
  );

  const contentByHighlightId = new Map<string, DestinationHighlightContentRow>();

  if (highlightIds.length > 0) {
    for (const highlightIdChunk of splitIntoChunks(highlightIds)) {
      const { data, error } = await supabase
        .from("destination_highlight_contents")
        .select("destination_highlight_id,category_label")
        .eq("language_id", languageId)
        .in("destination_highlight_id", highlightIdChunk);

      if (error) {
        console.error(
          `Supabase destination highlight contents query failed for country_id "${countryId}": ${error.message}`
        );
        return new Set();
      }

      for (const row of (data ?? []) as DestinationHighlightContentRow[]) {
        if (!contentByHighlightId.has(row.destination_highlight_id)) {
          contentByHighlightId.set(row.destination_highlight_id, row);
        }
      }
    }
  }

  const poiById = new Map<string, PoiRow>();

  if (poiIds.length > 0) {
    for (const poiIdChunk of splitIntoChunks(poiIds)) {
      const { data, error } = await supabase
        .from("poi")
        .select(
          `
            id,
            name,
            category:categories!poi_category_id_fkey(name)
          `
        )
        .in("id", poiIdChunk);

      if (error) {
        console.error(`Supabase poi query failed for country_id "${countryId}": ${error.message}`);
        return new Set();
      }

      for (const poi of (data ?? []) as PoiRow[]) {
        if (isNonEmptyString(poi.id)) {
          poiById.set(poi.id, poi);
        }
      }
    }
  }

  const firstImageByPoiId = new Map<string, string>();

  if (poiIds.length > 0) {
    for (const poiIdChunk of splitIntoChunks(poiIds)) {
      const { data, error } = await supabase
        .from("poi_images")
        .select("poi_id,image_url")
        .in("poi_id", poiIdChunk)
        .order("display_order", { ascending: true });

      if (error) {
        console.error(
          `Supabase poi images query failed for country_id "${countryId}": ${error.message}`
        );
        return new Set();
      }

      for (const row of (data ?? []) as PoiImageRow[]) {
        if (!isNonEmptyString(row.poi_id) || !isNonEmptyString(row.image_url)) {
          continue;
        }

        if (!firstImageByPoiId.has(row.poi_id)) {
          firstImageByPoiId.set(row.poi_id, row.image_url.trim());
        }
      }
    }
  }

  const destinationsWithCompleteHighlights = new Set<string>();

  for (const destinationId of destinationIds) {
    const destinationHighlights = highlightsByDestinationId.get(destinationId) ?? [];

    if (destinationHighlights.length === 0) {
      continue;
    }

    const allHighlightsComplete = destinationHighlights.every((highlight) => {
      if (!isNonEmptyString(highlight.poi_id)) {
        return false;
      }

      const poi = poiById.get(highlight.poi_id);

      if (!poi || !isNonEmptyString(poi.name)) {
        return false;
      }

      const content = contentByHighlightId.get(highlight.id) ?? null;
      const poiCategoryRelation = readSingleRelation(poi.category);
      const categoryFromPoi = isNonEmptyString(poiCategoryRelation?.name)
        ? poiCategoryRelation.name
        : null;
      const category = isNonEmptyString(content?.category_label)
        ? content.category_label.trim()
        : categoryFromPoi;
      const imageUrl = firstImageByPoiId.get(highlight.poi_id) ?? null;

      return isNonEmptyString(category) && isNonEmptyString(imageUrl);
    });

    if (allHighlightsComplete) {
      destinationsWithCompleteHighlights.add(destinationId);
    }
  }

  const publishedCityIds = new Set<string>();

  for (const destinationId of destinationIds) {
    if (!destinationsWithContent.has(destinationId)) {
      continue;
    }

    if (!destinationsWithPractical.has(destinationId)) {
      continue;
    }

    if (!destinationsWithItineraries.has(destinationId)) {
      continue;
    }

    if (!destinationsWithCompleteHighlights.has(destinationId)) {
      continue;
    }

    const cityId = cityIdByDestinationId.get(destinationId);

    if (isNonEmptyString(cityId)) {
      publishedCityIds.add(cityId);
    }
  }

  return publishedCityIds;
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
          countries!cities_country_id_fkey(id, name)
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

export async function getPublishedAdministrativeAreas(
  countryId: string,
  publishedCityIds?: Set<string>
): Promise<string[]> {
  const supabase = createServerSupabaseClient();

  if (publishedCityIds && publishedCityIds.size === 0) {
    return [];
  }

  let query = supabase
    .from("cities")
    .select(
      `
        id,
        status,
        administrative_areas!cities_administrative_area_id_fkey(name)
      `
    )
    .eq("country_id", countryId)
    .order("slug", { ascending: true });

  query = applyCatalogPublicationFilters(query);

  if (publishedCityIds && publishedCityIds.size > 0) {
    query = query.in("id", Array.from(publishedCityIds));
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Supabase administrative areas query failed: ${error.message}`);
    return [];
  }

  const values = new Set<string>();

  for (const row of (data ?? []) as AdministrativeAreaCityRow[]) {
    const name = readRelationName(row.administrative_areas)?.trim() ?? "";

    if (name.length > 0) {
      values.add(name);
    }
  }

  return Array.from(values).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
}

export async function getCountryDestinations(
  countryId: string,
  queryParams: CountryDestinationsQuery,
  publishedCityIds?: Set<string>
): Promise<CountryDestinationsResult> {
  try {
    const supabase = createServerSupabaseClient();

    if (publishedCityIds && publishedCityIds.size === 0) {
      return {
        cards: [],
        total: 0,
        totalPages: 1,
        page: 1,
      };
    }

    const isAscending = queryParams.sort === "az";

    const buildCityQuery = () => {
      let cityQuery = supabase
      .from("cities")
      .select(
        `
          id,
          slug,
          name,
          administrative_areas!cities_administrative_area_id_fkey(name),
          city_images(image_url, alt_text, image_type, is_active, position)
        `,
        { count: "exact" }
      )
      .eq("country_id", countryId)
      .order("name", { ascending: isAscending })
      .order("slug", { ascending: isAscending });

      cityQuery = applyCatalogPublicationFilters(cityQuery);

      if (publishedCityIds && publishedCityIds.size > 0) {
        cityQuery = cityQuery.in("id", Array.from(publishedCityIds));
      }

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

    const typedCityRows = (cityRows ?? []) as CatalogCityRow[];
    const cityIdsWithoutHero = typedCityRows
      .filter((row) => !readCatalogHeroImage(row.city_images))
      .map((row) => row.id)
      .filter((cityId): cityId is string => isNonEmptyString(cityId));

    const fallbackImagesByCityId = await getCatalogFallbackImagesByCityId(
      supabase,
      cityIdsWithoutHero
    );

    const cards = typedCityRows.map((row) => {
      const administrativeArea = readRelationName(row.administrative_areas);
      const image = readCatalogHeroImage(row.city_images);
      const fallbackImage = fallbackImagesByCityId.get(row.id) ?? null;
      const imageSrc = image?.image_url ?? fallbackImage?.imageSrc ?? null;
      const imageAlt = firstNonEmptyString(image?.alt_text) ?? fallbackImage?.imageAlt ?? `Vue de ${row.name}`;

      return {
        slug: row.slug,
        href: `/${row.slug}`,
        name: row.name,
        imageSrc,
        imageAlt,
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

  const publishedCityIds = await getPublishableCityIdsForCountry(country.id);

  const administrativeAreas = await getPublishedAdministrativeAreas(country.id, publishedCityIds);
  const selectedAdministrativeArea = administrativeAreas.includes(input.administrativeArea)
    ? input.administrativeArea
    : "";

  const destinations = await getCountryDestinations(country.id, {
    page: input.page,
    q: input.q,
    administrativeArea: selectedAdministrativeArea,
    sort: input.sort,
  }, publishedCityIds);

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
