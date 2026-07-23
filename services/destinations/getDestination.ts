import { createServerSupabaseClient } from "@/lib/supabase/server";

type RelationRow = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  iso_code?: string | null;
  is_default?: boolean | null;
};

type DestinationRow = Record<string, unknown>;
type DestinationContentRow = Record<string, unknown>;

type CityJoinedRow = {
  id: string;
  name: string | null;
  slug: string | null;
  administrative_area_id: string | null;
  country_id: string | null;
  administrative_areas: RelationRow | RelationRow[] | null;
  countries: RelationRow | RelationRow[] | null;
};

type PoiRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city_id: string | null;
};

type AdministrativeAreaRow = {
  id: string;
  name: string | null;
  country_id: string | null;
};

type CountryRow = {
  id: string;
  name: string | null;
  iso_code: string | null;
};

type DestinationHighlightRow = {
  id: string;
  destination_id: string;
  poi_id: string;
  position: number;
  duration_minutes: number | null;
};

type DestinationHighlightContentRow = {
  destination_highlight_id: string;
  language_id: string;
  category_label: string | null;
  image_alt: string | null;
};

type PoiNameRow = {
  id: string;
  name: string | null;
};

type PoiTextRow = {
  poi_id: string;
  title: string | null;
  is_current: boolean | null;
};

type PoiImageRow = {
  poi_id: string;
  image_url: string | null;
  storage_path: string | null;
  display_order: number | null;
  created_at: string | null;
};

type PoiAudioRow = {
  poi_id: string;
};

type DestinationPracticalItemContentRow = {
  title: string | null;
  answer: string | null;
};

type DestinationPracticalItemRow = {
  id: string;
  position: number;
  destination_practical_item_contents:
    | DestinationPracticalItemContentRow
    | DestinationPracticalItemContentRow[]
    | null;
};

type DestinationFaqItemContentRow = {
  question: string | null;
  answer: string | null;
};

type DestinationFaqItemRow = {
  id: string;
  position: number;
  destination_faq_item_contents:
    | DestinationFaqItemContentRow
    | DestinationFaqItemContentRow[]
    | null;
};

type DestinationItineraryRow = {
  id: string;
  position: number;
};

type DestinationItineraryContentRow = {
  destination_itinerary_id: string;
  title: string | null;
  duration_label: string | null;
  summary: string | null;
};

type DestinationItineraryStopRow = {
  id: string;
  destination_itinerary_id: string;
  position: number;
};

type DestinationItineraryStopContentRow = {
  destination_itinerary_stop_id: string;
  label: string | null;
};

export type GetDestinationInput = {
  id?: string;
  slug?: string;
  languageCode?: string;
};

export type DestinationPayload = {
  destination: {
    id: string;
    slug: string | null;
    countryId: string | null;
    administrativeAreaId: string | null;
    cityId: string | null;
    poiId: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
  content: {
    id: string | null;
    languageCode: string | null;
    title: string | null;
    subtitle: string | null;
    shortDescription: string | null;
    introduction: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  } | null;
  city: {
    id: string;
    name: string | null;
    slug: string | null;
  } | null;
  administrativeArea: {
    id: string | null;
    name: string | null;
  } | null;
  country: {
    id: string | null;
    name: string | null;
    isoCode: string | null;
  } | null;
  poi: {
    id: string;
    name: string | null;
    slug: string | null;
    cityId: string | null;
  } | null;
  highlights: Array<{
    id: string;
    poiId: string;
    name: string;
    category: string;
    durationMinutes: number | null;
    imageSrc: string | null;
    imageAlt: string;
    hasAudioguide: boolean;
    position: number;
  }>;
  practical: Array<{
    id: string;
    position: number;
    title: string;
    answer: string;
  }>;
  itineraries: Array<{
    title: string;
    duration: string;
    summary: string;
    stops: string[];
  }>;
  faq: Array<{
    id: string;
    position: number;
    question: string;
    answer: string;
  }>;
};

function readRelation<T>(relation: T | T[] | null): T | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function readString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function readId(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}

function normalizeLanguageCode(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function normalizeNullableText(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function selectBestContent(
  rows: DestinationContentRow[],
  requestedLanguageCode: string | null
): DestinationContentRow | null {
  if (rows.length === 0) {
    return null;
  }

  const withScore = rows.map((row) => {
    const languageRelation = readRelation((row.languages as RelationRow | RelationRow[] | null) ?? null);
    const isoCode =
      typeof languageRelation?.iso_code === "string" ? languageRelation.iso_code.toLowerCase() : null;
    const isDefault = languageRelation?.is_default === true;

    let score = 0;

    if (requestedLanguageCode && isoCode === requestedLanguageCode) {
      score = 3;
    } else if (isDefault) {
      score = 2;
    } else if (isoCode === "en") {
      score = 1;
    }

    return { row, score };
  });

  withScore.sort((a, b) => b.score - a.score);

  return withScore[0]?.row ?? null;
}

function isRlsError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("permission denied") || normalized.includes("rls");
}

async function assertAnonymousReadAllowed(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  tableName: string
) {
  const { error } = await supabase.from(tableName).select("id", { head: true, count: "exact" }).limit(1);

  if (error) {
    if (isRlsError(error.message)) {
      console.error(`RLS read denied on table "${tableName}" with anonymous key: ${error.message}`);
      throw new Error(`RLS denied read access on ${tableName}`);
    }

    console.error(`Supabase read check failed on table "${tableName}": ${error.message}`);
    throw new Error(`Read check failed on ${tableName}`);
  }
}

async function getCityWithRelations(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  cityId: string
): Promise<CityJoinedRow | null> {
  const { data: cityRow, error: cityError } = await supabase
    .from("cities")
    .select(
      `
        id,
        name,
        slug,
        administrative_area_id,
        country_id,
        administrative_areas!cities_administrative_area_id_fkey(id, name),
        countries!cities_country_id_fkey(id, name, iso_code)
      `
    )
    .eq("id", cityId)
    .maybeSingle<CityJoinedRow>();

  if (cityError) {
    console.error(`Supabase destination city query failed: ${cityError.message}`);
    throw new Error("Failed to fetch destination city");
  }

  return cityRow;
}

export async function getDestination(input: GetDestinationInput): Promise<DestinationPayload | null> {
  const id = input.id?.trim() ?? "";
  const slug = input.slug?.trim().toLowerCase() ?? "";

  if (!id && !slug) {
    console.warn("getDestination called without id or slug.");
    return null;
  }

  const supabase = createServerSupabaseClient();

  await assertAnonymousReadAllowed(supabase, "destinations");
  await assertAnonymousReadAllowed(supabase, "destination_contents");
  await assertAnonymousReadAllowed(supabase, "languages");
  await assertAnonymousReadAllowed(supabase, "cities");
  await assertAnonymousReadAllowed(supabase, "administrative_areas");
  await assertAnonymousReadAllowed(supabase, "countries");
  await assertAnonymousReadAllowed(supabase, "poi");
  await assertAnonymousReadAllowed(supabase, "destination_highlights");
  await assertAnonymousReadAllowed(supabase, "destination_highlight_contents");
  await assertAnonymousReadAllowed(supabase, "destination_practical_items");
  await assertAnonymousReadAllowed(supabase, "destination_practical_item_contents");
  await assertAnonymousReadAllowed(supabase, "destination_faq_items");
  await assertAnonymousReadAllowed(supabase, "destination_faq_item_contents");
  await assertAnonymousReadAllowed(supabase, "destination_itineraries");
  await assertAnonymousReadAllowed(supabase, "destination_itinerary_contents");
  await assertAnonymousReadAllowed(supabase, "destination_itinerary_stops");
  await assertAnonymousReadAllowed(supabase, "destination_itinerary_stop_contents");
  await assertAnonymousReadAllowed(supabase, "poi_images");
  await assertAnonymousReadAllowed(supabase, "poi_texts");
  await assertAnonymousReadAllowed(supabase, "audios");

  let destinationQuery = supabase.from("destinations").select("*");

  if (id) {
    destinationQuery = destinationQuery.eq("id", id);
  } else {
    destinationQuery = destinationQuery.eq("slug", slug);
  }

  const { data: destinationRow, error: destinationError } = await destinationQuery.maybeSingle<DestinationRow>();

  if (destinationError) {
    console.error(`Supabase destination query failed: ${destinationError.message}`);
    throw new Error("Failed to fetch destination");
  }

  if (!destinationRow) {
    return null;
  }

  const destinationId = readId(destinationRow, ["id"]);

  if (!destinationId) {
    console.error("Destination row is missing an id.");
    throw new Error("Destination row is invalid");
  }

  const normalizedLanguageCode = normalizeLanguageCode(input.languageCode);

  const { data: contentRows, error: contentError } = await supabase
    .from("destination_contents")
    .select(
      `
        id,
        destination_id,
        language_id,
        title,
        subtitle,
        short_description,
        introduction,
        seo_title,
        seo_description,
        created_at,
        updated_at,
        languages!destination_contents_language_id_fkey(
          id,
          iso_code,
          name,
          native_name,
          status,
          is_default,
          text_direction
        )
      `
    )
    .eq("destination_id", destinationId);

  if (contentError) {
    console.error(`Supabase destination content query failed: ${contentError.message}`);
    throw new Error("Failed to fetch destination content");
  }

  const bestContent = selectBestContent((contentRows ?? []) as DestinationContentRow[], normalizedLanguageCode);

  const destinationCountryId = readId(destinationRow, ["country_id"]);
  const destinationAdministrativeAreaId = readId(destinationRow, ["administrative_area_id"]);
  let resolvedCityId = readId(destinationRow, ["city_id"]);
  const destinationPoiId = readId(destinationRow, ["poi_id"]);

  let poiData: PoiRow | null = null;

  if (destinationPoiId) {
    const { data: poiRow, error: poiError } = await supabase
      .from("poi")
      .select("id, name, slug, city_id")
      .eq("id", destinationPoiId)
      .maybeSingle<PoiRow>();

    if (poiError) {
      console.error(`Supabase destination POI query failed: ${poiError.message}`);
      throw new Error("Failed to fetch destination POI");
    }

    poiData = poiRow;

    if (!resolvedCityId && poiRow?.city_id) {
      resolvedCityId = poiRow.city_id;
    }
  }

  let cityData: CityJoinedRow | null = null;

  if (resolvedCityId) {
    cityData = await getCityWithRelations(supabase, resolvedCityId);
  }

  let administrativeAreaData: AdministrativeAreaRow | null = null;

  const resolvedAdministrativeAreaId = cityData?.administrative_area_id ?? destinationAdministrativeAreaId;

  if (resolvedAdministrativeAreaId) {
    const { data: areaRow, error: areaError } = await supabase
      .from("administrative_areas")
      .select("id, name, country_id")
      .eq("id", resolvedAdministrativeAreaId)
      .maybeSingle<AdministrativeAreaRow>();

    if (areaError) {
      console.error(`Supabase destination administrative area query failed: ${areaError.message}`);
      throw new Error("Failed to fetch destination administrative area");
    }

    administrativeAreaData = areaRow;
  }

  const cityAreaRelation = readRelation(cityData?.administrative_areas ?? null);
  const cityCountryRelation = readRelation(cityData?.countries ?? null);

  let countryData: CountryRow | null = null;

  const resolvedCountryId = cityData?.country_id ?? administrativeAreaData?.country_id ?? destinationCountryId;

  if (resolvedCountryId) {
    const { data: countryRow, error: countryError } = await supabase
      .from("countries")
      .select("id, name, iso_code")
      .eq("id", resolvedCountryId)
      .maybeSingle<CountryRow>();

    if (countryError) {
      console.error(`Supabase destination country query failed: ${countryError.message}`);
      throw new Error("Failed to fetch destination country");
    }

    countryData = countryRow;
  }

  const contentLanguageRelation = bestContent
    ? readRelation((bestContent.languages as RelationRow | RelationRow[] | null) ?? null)
    : null;

  let resolvedLanguageId: string | null = null;

  if (normalizedLanguageCode) {
    const { data: languageRow, error: languageError } = await supabase
      .from("languages")
      .select("id")
      .eq("iso_code", normalizedLanguageCode)
      .maybeSingle<{ id: string }>();

    if (languageError) {
      console.error(`Supabase language query failed: ${languageError.message}`);
      throw new Error("Failed to resolve language");
    }

    resolvedLanguageId = languageRow?.id ?? null;
  }

  if (!resolvedLanguageId) {
    resolvedLanguageId =
      typeof contentLanguageRelation?.id === "string" && contentLanguageRelation.id.length > 0
        ? contentLanguageRelation.id
        : null;
  }

  const { data: destinationHighlightsRows, error: destinationHighlightsError } = await supabase
    .from("destination_highlights")
    .select("id, destination_id, poi_id, position, duration_minutes")
    .eq("destination_id", destinationId)
    .order("position", { ascending: true });

  if (destinationHighlightsError) {
    console.error(`Supabase destination highlights query failed: ${destinationHighlightsError.message}`);
    throw new Error("Failed to fetch destination highlights");
  }

  const destinationHighlights = (destinationHighlightsRows ?? []) as DestinationHighlightRow[];
  const highlightIds = destinationHighlights.map((row) => row.id);
  const poiIds = Array.from(new Set(destinationHighlights.map((row) => row.poi_id).filter(Boolean)));

  let highlights: DestinationPayload["highlights"] = [];

  if (destinationHighlights.length > 0 && resolvedLanguageId) {
    const { data: highlightContentsRows, error: highlightContentsError } = await supabase
      .from("destination_highlight_contents")
      .select("destination_highlight_id, language_id, category_label, image_alt")
      .in("destination_highlight_id", highlightIds)
      .eq("language_id", resolvedLanguageId);

    if (highlightContentsError) {
      console.error(`Supabase highlight contents query failed: ${highlightContentsError.message}`);
      throw new Error("Failed to fetch destination highlight contents");
    }

    const highlightContentByHighlightId = new Map<string, DestinationHighlightContentRow>();

    for (const row of (highlightContentsRows ?? []) as DestinationHighlightContentRow[]) {
      if (!highlightContentByHighlightId.has(row.destination_highlight_id)) {
        highlightContentByHighlightId.set(row.destination_highlight_id, row);
      }
    }

    const [poiRowsResult, poiTextsRowsResult, poiAudiosRowsResult] = await Promise.all([
      supabase.from("poi").select("id, name").in("id", poiIds),
      supabase
        .from("poi_texts")
        .select("poi_id, title, is_current")
        .in("poi_id", poiIds)
        .eq("language_id", resolvedLanguageId)
        .order("is_current", { ascending: false }),
      supabase
        .from("audios")
        .select("poi_id")
        .in("poi_id", poiIds)
        .eq("status", "active")
        .not("audio_url", "is", null),
    ]);

    let poiImagesRowsResult = await supabase
      .from("poi_images")
      .select("poi_id, image_url, storage_path, display_order, created_at")
      .in("poi_id", poiIds)
      .eq("is_active", true)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (poiImagesRowsResult.error?.message.includes("column poi_images.is_active does not exist")) {
      poiImagesRowsResult = await supabase
        .from("poi_images")
        .select("poi_id, image_url, storage_path, display_order, created_at")
        .in("poi_id", poiIds)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });
    }

    if (poiRowsResult.error) {
      console.error(`Supabase POI highlights query failed: ${poiRowsResult.error.message}`);
      throw new Error("Failed to fetch highlight POIs");
    }

    if (poiTextsRowsResult.error) {
      console.error(`Supabase POI text highlights query failed: ${poiTextsRowsResult.error.message}`);
      throw new Error("Failed to fetch highlight POI texts");
    }

    if (poiImagesRowsResult.error) {
      console.error(`Supabase POI image highlights query failed: ${poiImagesRowsResult.error.message}`);
      throw new Error("Failed to fetch highlight POI images");
    }

    if (poiAudiosRowsResult.error) {
      console.error(`Supabase POI audio highlights query failed: ${poiAudiosRowsResult.error.message}`);
      throw new Error("Failed to fetch highlight POI audios");
    }

    const poiById = new Map<string, PoiNameRow>();

    for (const row of (poiRowsResult.data ?? []) as PoiNameRow[]) {
      poiById.set(row.id, row);
    }

    const poiTitleByPoiId = new Map<string, string>();

    for (const row of (poiTextsRowsResult.data ?? []) as PoiTextRow[]) {
      const title = normalizeNullableText(row.title);

      if (title.length === 0) {
        continue;
      }

      if (!poiTitleByPoiId.has(row.poi_id) || row.is_current === true) {
        poiTitleByPoiId.set(row.poi_id, title);
      }
    }

    const firstImageByPoiId = new Map<string, PoiImageRow>();

    for (const row of (poiImagesRowsResult.data ?? []) as PoiImageRow[]) {
      if (!firstImageByPoiId.has(row.poi_id)) {
        firstImageByPoiId.set(row.poi_id, row);
      }
    }

    const poiWithAudios = new Set<string>();

    for (const row of (poiAudiosRowsResult.data ?? []) as PoiAudioRow[]) {
      poiWithAudios.add(row.poi_id);
    }

    highlights = destinationHighlights
      .map((row) => {
        const contentRow = highlightContentByHighlightId.get(row.id);

        if (!contentRow) {
          return null;
        }

        const poiRow = poiById.get(row.poi_id);
        const imageRow = firstImageByPoiId.get(row.poi_id);
        const imageSrc = normalizeNullableText(imageRow?.image_url) || normalizeNullableText(imageRow?.storage_path) || null;
        const name =
          poiTitleByPoiId.get(row.poi_id) || normalizeNullableText(poiRow?.name) || "";

        return {
          id: row.id,
          poiId: row.poi_id,
          name,
          category: normalizeNullableText(contentRow.category_label),
          durationMinutes: typeof row.duration_minutes === "number" ? row.duration_minutes : null,
          imageSrc,
          imageAlt: normalizeNullableText(contentRow.image_alt),
          hasAudioguide: poiWithAudios.has(row.poi_id),
          position: typeof row.position === "number" ? row.position : 0,
        };
      })
      .filter((value): value is DestinationPayload["highlights"][number] => Boolean(value));
  }

  let practical: DestinationPayload["practical"] = [];

  if (resolvedLanguageId) {
    const { data: destinationPracticalRows, error: destinationPracticalError } = await supabase
      .from("destination_practical_items")
      .select(
        `
          id,
          position,
          destination_practical_item_contents!inner(
            title,
            answer,
            language_id
          )
        `
      )
      .eq("destination_id", destinationId)
      .eq("destination_practical_item_contents.language_id", resolvedLanguageId)
      .order("position", { ascending: true });

    if (destinationPracticalError) {
      console.error(`Supabase destination practical query failed: ${destinationPracticalError.message}`);
      throw new Error("Failed to fetch destination practical items");
    }

    practical = ((destinationPracticalRows ?? []) as DestinationPracticalItemRow[])
      .sort((a, b) => a.position - b.position)
      .map((item) => {
        const content = readRelation(item.destination_practical_item_contents);

        return {
          id: item.id,
          position: item.position,
          title: normalizeNullableText(content?.title),
          answer: normalizeNullableText(content?.answer),
        };
      });
  }

  let faq: DestinationPayload["faq"] = [];

  if (resolvedLanguageId) {
    const { data: destinationFaqRows, error: destinationFaqError } = await supabase
      .from("destination_faq_items")
      .select(
        `
          id,
          position,
          destination_faq_item_contents!inner(
            question,
            answer,
            language_id
          )
        `
      )
      .eq("destination_id", destinationId)
      .eq("destination_faq_item_contents.language_id", resolvedLanguageId)
      .order("position", { ascending: true });

    if (destinationFaqError) {
      console.error(`Supabase destination FAQ query failed: ${destinationFaqError.message}`);
      throw new Error("Failed to fetch destination FAQ items");
    }

    const faqRows = (destinationFaqRows ?? []) as DestinationFaqItemRow[];

    faq = faqRows
      .sort((a, b) => a.position - b.position)
      .map((item) => {
        const content = readRelation(item.destination_faq_item_contents);

        return {
          id: item.id,
          position: item.position,
          question: normalizeNullableText(content?.question),
          answer: normalizeNullableText(content?.answer),
        };
      });
  }

  let itineraries: DestinationPayload["itineraries"] = [];

  if (resolvedLanguageId) {
    const { data: itineraryRows, error: itineraryError } = await supabase
      .from("destination_itineraries")
      .select("id, position")
      .eq("destination_id", destinationId)
      .order("position", { ascending: true });

    if (itineraryError) {
      console.error(`Supabase destination itineraries query failed: ${itineraryError.message}`);
      throw new Error("Failed to fetch destination itineraries");
    }

    const orderedItineraries = ((itineraryRows ?? []) as DestinationItineraryRow[]).sort(
      (a, b) => a.position - b.position
    );
    const itineraryIds = orderedItineraries.map((row) => row.id);

    if (itineraryIds.length > 0) {
      const { data: itineraryContentRows, error: itineraryContentError } = await supabase
        .from("destination_itinerary_contents")
        .select("destination_itinerary_id, title, duration_label, summary")
        .in("destination_itinerary_id", itineraryIds)
        .eq("language_id", resolvedLanguageId);

      if (itineraryContentError) {
        console.error(`Supabase destination itinerary contents query failed: ${itineraryContentError.message}`);
        throw new Error("Failed to fetch destination itinerary contents");
      }

      const { data: itineraryStopRows, error: itineraryStopsError } = await supabase
        .from("destination_itinerary_stops")
        .select("id, destination_itinerary_id, position")
        .in("destination_itinerary_id", itineraryIds)
        .order("position", { ascending: true });

      if (itineraryStopsError) {
        console.error(`Supabase destination itinerary stops query failed: ${itineraryStopsError.message}`);
        throw new Error("Failed to fetch destination itinerary stops");
      }

      const itineraryStops = (itineraryStopRows ?? []) as DestinationItineraryStopRow[];
      const itineraryStopIds = itineraryStops.map((row) => row.id);

      const itineraryStopContentByStopId = new Map<string, string>();

      if (itineraryStopIds.length > 0) {
        const { data: itineraryStopContentRows, error: itineraryStopContentError } = await supabase
          .from("destination_itinerary_stop_contents")
          .select("destination_itinerary_stop_id, label")
          .in("destination_itinerary_stop_id", itineraryStopIds)
          .eq("language_id", resolvedLanguageId);

        if (itineraryStopContentError) {
          console.error(
            `Supabase destination itinerary stop contents query failed: ${itineraryStopContentError.message}`
          );
          throw new Error("Failed to fetch destination itinerary stop contents");
        }

        for (const row of (itineraryStopContentRows ?? []) as DestinationItineraryStopContentRow[]) {
          if (!itineraryStopContentByStopId.has(row.destination_itinerary_stop_id)) {
            itineraryStopContentByStopId.set(
              row.destination_itinerary_stop_id,
              normalizeNullableText(row.label)
            );
          }
        }
      }

      const itineraryContentByItineraryId = new Map<string, DestinationItineraryContentRow>();

      for (const row of (itineraryContentRows ?? []) as DestinationItineraryContentRow[]) {
        if (!itineraryContentByItineraryId.has(row.destination_itinerary_id)) {
          itineraryContentByItineraryId.set(row.destination_itinerary_id, row);
        }
      }

      const stopsByItineraryId = new Map<string, DestinationItineraryStopRow[]>();

      for (const stop of itineraryStops) {
        const existing = stopsByItineraryId.get(stop.destination_itinerary_id) ?? [];
        existing.push(stop);
        stopsByItineraryId.set(stop.destination_itinerary_id, existing);
      }

      itineraries = orderedItineraries
        .map((itinerary) => {
          const content = itineraryContentByItineraryId.get(itinerary.id);

          if (!content) {
            return null;
          }

          const stops = (stopsByItineraryId.get(itinerary.id) ?? [])
            .sort((a, b) => a.position - b.position)
            .map((stop) => itineraryStopContentByStopId.get(stop.id) ?? "")
            .filter((label) => label.length > 0);

          return {
            title: normalizeNullableText(content.title),
            duration: normalizeNullableText(content.duration_label),
            summary: normalizeNullableText(content.summary),
            stops,
          };
        })
        .filter((item): item is DestinationPayload["itineraries"][number] => Boolean(item));
    }
  }

  return {
    destination: {
      id: destinationId,
      slug: readString(destinationRow, ["slug"]),
      countryId: destinationCountryId,
      administrativeAreaId: destinationAdministrativeAreaId,
      cityId: readId(destinationRow, ["city_id"]),
      poiId: destinationPoiId,
      createdAt: readString(destinationRow, ["created_at"]),
      updatedAt: readString(destinationRow, ["updated_at"]),
    },
    content: bestContent
      ? {
          id: readId(bestContent, ["id"]),
          languageCode:
            typeof contentLanguageRelation?.iso_code === "string" ? contentLanguageRelation.iso_code : null,
          title: readString(bestContent, ["title"]),
          subtitle: readString(bestContent, ["subtitle"]),
          shortDescription: readString(bestContent, ["short_description"]),
          introduction: readString(bestContent, ["introduction"]),
          seoTitle: readString(bestContent, ["seo_title"]),
          seoDescription: readString(bestContent, ["seo_description"]),
        }
      : null,
    city: cityData
      ? {
          id: cityData.id,
          name: cityData.name,
          slug: cityData.slug,
        }
      : null,
    administrativeArea: {
      id: cityAreaRelation?.id ?? administrativeAreaData?.id ?? null,
      name: cityAreaRelation?.name ?? administrativeAreaData?.name ?? null,
    },
    country: {
      id: cityCountryRelation?.id ?? countryData?.id ?? null,
      name: cityCountryRelation?.name ?? countryData?.name ?? null,
      isoCode: cityCountryRelation?.iso_code ?? countryData?.iso_code ?? null,
    },
    poi: poiData
      ? {
          id: poiData.id,
          name: poiData.name,
          slug: poiData.slug,
          cityId: poiData.city_id,
        }
      : null,
    highlights,
    practical,
    itineraries,
    faq,
  };
}
