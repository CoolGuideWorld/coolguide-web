import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";

const PAGE_SIZE = 1000;
const EXPECTED_AUDIO_LANGUAGES = ["fr", "en", "es", "de", "it", "ja", "zh"] as const;

type ProductionStatus = "ready" | "to_complete" | "poi_to_generate" | "to_produce" | "to_create";

type KnowledgeEntityRow = {
  id: string | null;
  name: string | null;
  slug: string | null;
  entity_type: string | null;
};

type KnowledgeItemRow = {
  entity_id: string | null;
  definition_id: string | null;
};

type CityRow = {
  id: string | null;
  name: string | null;
  slug: string | null;
  status: string | null;
};

type DestinationRow = {
  id: string | null;
  city_id: string | null;
};

type PoiRow = {
  id: string | null;
  city_id: string | null;
  status: string | null;
  is_active: boolean | null;
};

type PoiTextRow = {
  poi_id: string | null;
  language_code: string | null;
  status: string | null;
};

type PoiImageRow = {
  poi_id: string | null;
  status: string | null;
};

type AudioRow = {
  poi_id: string | null;
  status: string | null;
  mode: string | null;
  language_id: string | null;
};

type AudioPremiumRow = {
  poi_id: string | null;
  language: string | null;
  status?: string | null;
};

type BrainSlugBucket = {
  slug: string;
  displayName: string;
  entityIds: string[];
  entityTypes: string[];
  knowledgeCount: number;
};

export type StudioProductionRow = {
  key: string;
  cityName: string;
  citySlug: string;
  cityId: string | null;
  duplicateSlug: boolean;
  duplicateCityIds: string[];
  brainKnown: boolean;
  brainEntityIds: string[];
  brainKnowledgeCount: number;
  brainKnowledgeTotal: number;
  destinationIds: string[];
  activePoiCount: number;
  textFrCoveredCount: number;
  imageCoveredCount: number;
  audioCoveredCount: number;
  premiumPoiCount: number;
  premiumAudioCount: number;
  missingTextCount: number;
  missingImageCount: number;
  missingAudioCount: number;
  baseStatus: ProductionStatus;
  actionLabel: string;
};

export type StudioProductionSnapshot = {
  rows: StudioProductionRow[];
  kpis: {
    ready: number;
    toComplete: number;
    poiToGenerate: number;
    toProduce: number;
    toCreate: number;
    anomalies: number;
  };
  errors: string[];
  queryPlan: string[];
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function titleCaseSlug(slug: string): string {
  if (!slug.trim()) {
    return "Ville inconnue";
  }

  return slug
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function statusRank(status: ProductionStatus): number {
  if (status === "to_complete") {
    return 0;
  }

  if (status === "poi_to_generate") {
    return 1;
  }

  if (status === "to_produce") {
    return 2;
  }

  if (status === "to_create") {
    return 3;
  }

  return 4;
}

const CITY_LIKE_ENTITY_TYPE_MARKERS = ["city", "commune", "town", "village", "municipality"];
const STRUCTURAL_ENTITY_TYPE_MARKERS = [
  "country",
  "region",
  "state",
  "province",
  "department",
  "departement",
  "district",
  "continent",
  "world",
  "network",
  "reseau",
  "circuit",
  "itinerary",
  "itineraire",
  "route",
  "area",
  "zone",
  "territory",
];
const STRUCTURAL_SLUG_KEYWORDS = [
  "world",
  "france",
  "country",
  "pays",
  "region",
  "province",
  "department",
  "departement",
  "district",
  "network",
  "reseau",
  "circuit",
  "itinerary",
  "itineraire",
  "route",
  "golfe",
  "gulf",
  "mer",
  "ocean",
  "continent",
  "territory",
];

function normalizeEntityType(value: string): string {
  return value.trim().toLowerCase();
}

function hasMarker(value: string, markers: string[]): boolean {
  return markers.some((marker) => value.includes(marker));
}

function isEligibleBrainOnlyBucket(bucket: BrainSlugBucket): boolean {
  const normalizedTypes = bucket.entityTypes.map(normalizeEntityType).filter(Boolean);

  if (normalizedTypes.some((type) => hasMarker(type, CITY_LIKE_ENTITY_TYPE_MARKERS))) {
    return true;
  }

  if (normalizedTypes.some((type) => hasMarker(type, STRUCTURAL_ENTITY_TYPE_MARKERS))) {
    return false;
  }

  const normalizedName = normalizeSlug(bucket.displayName);
  const text = `${bucket.slug} ${normalizedName}`;

  if (STRUCTURAL_SLUG_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return false;
  }

  return true;
}

function actionLabelFromRow(input: {
  status: ProductionStatus;
  missingTextCount: number;
  missingImageCount: number;
  missingAudioCount: number;
}): string {
  const { status, missingTextCount, missingImageCount, missingAudioCount } = input;

  if (status === "to_create") {
    return "Creer la ville";
  }

  if (status === "to_produce") {
    return "Lancer la production";
  }

  if (status === "poi_to_generate") {
    return "Generer les POI";
  }

  if (status === "ready") {
    return "Aucune - prete";
  }

  if (missingImageCount > 0) {
    return `${missingImageCount} image${missingImageCount > 1 ? "s" : ""} manquante${
      missingImageCount > 1 ? "s" : ""
    }`;
  }

  if (missingAudioCount > 0) {
    return `${missingAudioCount} POI audio incomplet${missingAudioCount > 1 ? "s" : ""}`;
  }

  if (missingTextCount > 0) {
    return `${missingTextCount} texte${missingTextCount > 1 ? "s" : ""} FR manquant${
      missingTextCount > 1 ? "s" : ""
    }`;
  }

  return "A completer";
}

async function readPagedRows<T>(
  readPage: (from: number, to: number) => PromiseLike<unknown> | unknown
): Promise<{ rows: T[] | null; error: string | null }> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const response = (await readPage(from, to)) as {
      data?: unknown;
      error?: { message?: string | null } | null;
    };
    const data = (response?.data ?? null) as T[] | null;
    const errorMessage = response?.error?.message ?? null;

    if (isNonEmptyString(errorMessage)) {
      return {
        rows: null,
        error: errorMessage,
      };
    }

    const pageRows = data ?? [];
    rows.push(...pageRows);

    if (pageRows.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return {
    rows,
    error: null,
  };
}

function countCoveredByCity(
  coveredPoiIds: Set<string>,
  cityIdByPoiId: Map<string, string>
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const poiId of coveredPoiIds) {
    const cityId = cityIdByPoiId.get(poiId);

    if (!cityId) {
      continue;
    }

    counts.set(cityId, (counts.get(cityId) ?? 0) + 1);
  }

  return counts;
}

function buildBrainBuckets(input: {
  entities: KnowledgeEntityRow[];
  itemRows: KnowledgeItemRow[];
}): Map<string, BrainSlugBucket> {
  const knowledgeByEntityId = new Map<string, Set<string>>();

  for (const row of input.itemRows) {
    if (!isNonEmptyString(row.entity_id) || !isNonEmptyString(row.definition_id)) {
      continue;
    }

    const bucket = knowledgeByEntityId.get(row.entity_id) ?? new Set<string>();
    bucket.add(row.definition_id);
    knowledgeByEntityId.set(row.entity_id, bucket);
  }

  const buckets = new Map<string, BrainSlugBucket>();

  for (const entity of input.entities) {
    if (!isNonEmptyString(entity.id) || !isNonEmptyString(entity.slug)) {
      continue;
    }

    const normalizedSlug = normalizeSlug(entity.slug);

    if (!normalizedSlug) {
      continue;
    }

    const existing = buckets.get(normalizedSlug);
    const rawName = isNonEmptyString(entity.name) ? entity.name.trim() : titleCaseSlug(normalizedSlug);

    if (!existing) {
      const knowledgeCount = knowledgeByEntityId.get(entity.id)?.size ?? 0;
      const entityTypes = isNonEmptyString(entity.entity_type) ? [entity.entity_type] : [];

      buckets.set(normalizedSlug, {
        slug: normalizedSlug,
        displayName: rawName,
        entityIds: [entity.id],
        entityTypes,
        knowledgeCount,
      });
      continue;
    }

    if (!existing.entityIds.includes(entity.id)) {
      existing.entityIds.push(entity.id);
    }

    if (isNonEmptyString(entity.entity_type) && !existing.entityTypes.includes(entity.entity_type)) {
      existing.entityTypes.push(entity.entity_type);
    }

    const entityKnowledgeCount = knowledgeByEntityId.get(entity.id)?.size ?? 0;
    existing.knowledgeCount = Math.max(existing.knowledgeCount, entityKnowledgeCount);

    if (existing.displayName === "Ville inconnue" && rawName !== "Ville inconnue") {
      existing.displayName = rawName;
    }
  }

  return buckets;
}

async function readAudioPremiumRows(): Promise<{ rows: AudioPremiumRow[] | null; error: string | null }> {
  const supabase = await createServerAuthSupabaseClient();

  const primary = await readPagedRows<AudioPremiumRow>(async (from, to) => {
    const response = await supabase
      .from("audio_premium")
      .select("poi_id,language,status")
      .eq("status", "active")
      .range(from, to);

    return {
      data: (response.data ?? null) as AudioPremiumRow[] | null,
      error: response.error ? { message: response.error.message } : null,
    };
  });

  if (primary.rows) {
    return primary;
  }

  const fallback = await readPagedRows<AudioPremiumRow>(async (from, to) => {
    const response = await supabase
      .from("audio_premium")
      .select("poi_id,language")
      .range(from, to);

    return {
      data: (response.data ?? null) as AudioPremiumRow[] | null,
      error: response.error ? { message: response.error.message } : null,
    };
  });

  return fallback;
}

export async function readStudioProductionSnapshot(): Promise<StudioProductionSnapshot> {
  const errors: string[] = [];
  const queryPlan = [
    "knowledge_entities (all entity_type)",
    "knowledge_items (all definitions)",
    "cities",
    "destinations",
    "poi active",
    "poi_texts fr active",
    "poi_images active",
    "audios active mode=pieton",
    "audio_premium",
  ];

  const supabase = await createServerAuthSupabaseClient();

  const [
    entitiesResult,
    itemsResult,
    citiesResult,
    destinationsResult,
    poiResult,
    poiTextsResult,
    poiImagesResult,
    audiosResult,
    premiumResult,
  ] = await Promise.all([
    readPagedRows<KnowledgeEntityRow>((from, to) =>
      supabase
        .from("knowledge_entities")
        .select("id,name,slug,entity_type")
        .order("slug", { ascending: true })
        .range(from, to)
    ),
    readPagedRows<KnowledgeItemRow>((from, to) =>
      supabase
        .from("knowledge_items")
        .select("entity_id,definition_id")
        .range(from, to)
    ),
    readPagedRows<CityRow>((from, to) =>
      supabase.from("cities").select("id,name,slug,status").order("name", { ascending: true }).range(from, to)
    ),
    readPagedRows<DestinationRow>((from, to) =>
      supabase.from("destinations").select("id,city_id").range(from, to)
    ),
    readPagedRows<PoiRow>((from, to) =>
      supabase
        .from("poi")
        .select("id,city_id,status,is_active")
        .eq("status", "active")
        .eq("is_active", true)
        .not("city_id", "is", null)
        .range(from, to)
    ),
    readPagedRows<PoiTextRow>((from, to) =>
      supabase
        .from("poi_texts")
        .select("poi_id,language_code,status")
        .eq("language_code", "fr")
        .eq("status", "active")
        .range(from, to)
    ),
    readPagedRows<PoiImageRow>((from, to) =>
      supabase
        .from("poi_images")
        .select("poi_id,status")
        .eq("status", "active")
        .range(from, to)
    ),
    readPagedRows<AudioRow>((from, to) =>
      supabase
        .from("audios")
        .select("poi_id,status,mode,language_id")
        .eq("status", "active")
        .eq("mode", "pieton")
        .range(from, to)
    ),
    readAudioPremiumRows(),
  ]);

  const requiredResults: Array<{ rows: unknown[] | null; error: string | null; label: string }> = [
    { rows: entitiesResult.rows, error: entitiesResult.error, label: "knowledge_entities" },
    { rows: itemsResult.rows, error: itemsResult.error, label: "knowledge_items" },
    { rows: citiesResult.rows, error: citiesResult.error, label: "cities" },
    { rows: destinationsResult.rows, error: destinationsResult.error, label: "destinations" },
    { rows: poiResult.rows, error: poiResult.error, label: "poi" },
    { rows: poiTextsResult.rows, error: poiTextsResult.error, label: "poi_texts" },
    { rows: poiImagesResult.rows, error: poiImagesResult.error, label: "poi_images" },
    { rows: audiosResult.rows, error: audiosResult.error, label: "audios" },
    { rows: premiumResult.rows, error: premiumResult.error, label: "audio_premium" },
  ];

  for (const result of requiredResults) {
    if (result.error) {
      errors.push(`${result.label}: ${result.error}`);
    }
  }

  if (errors.length > 0) {
    return {
      rows: [],
      kpis: {
        ready: 0,
        toComplete: 0,
        poiToGenerate: 0,
        toProduce: 0,
        toCreate: 0,
        anomalies: 0,
      },
      errors,
      queryPlan,
    };
  }

  const entities = entitiesResult.rows ?? [];
  const items = itemsResult.rows ?? [];
  const cities = citiesResult.rows ?? [];
  const destinations = destinationsResult.rows ?? [];
  const poiRows = poiResult.rows ?? [];
  const poiTexts = poiTextsResult.rows ?? [];
  const poiImages = poiImagesResult.rows ?? [];
  const audios = audiosResult.rows ?? [];
  const premiumRows = premiumResult.rows ?? [];

  const brainBySlug = buildBrainBuckets({
    entities,
    itemRows: items,
  });
  const brainKnowledgeTotal = Array.from(
    new Set(
      items
        .map((row) => row.definition_id)
        .filter((definitionId): definitionId is string => isNonEmptyString(definitionId))
    )
  ).length;

  const validCities = cities
    .filter((row) => isNonEmptyString(row.id) && isNonEmptyString(row.slug))
    .map((row) => ({
      id: row.id as string,
      slug: normalizeSlug(row.slug as string),
      name: isNonEmptyString(row.name) ? row.name.trim() : titleCaseSlug(normalizeSlug(row.slug as string)),
      status: isNonEmptyString(row.status) ? row.status.trim() : "",
    }));

  const cityIdsBySlug = new Map<string, string[]>();

  for (const city of validCities) {
    const bucket = cityIdsBySlug.get(city.slug) ?? [];

    if (!bucket.includes(city.id)) {
      bucket.push(city.id);
    }

    cityIdsBySlug.set(city.slug, bucket);
  }

  const destinationIdsByCityId = new Map<string, string[]>();

  for (const destination of destinations) {
    if (!isNonEmptyString(destination.id) || !isNonEmptyString(destination.city_id)) {
      continue;
    }

    const bucket = destinationIdsByCityId.get(destination.city_id) ?? [];

    if (!bucket.includes(destination.id)) {
      bucket.push(destination.id);
    }

    destinationIdsByCityId.set(destination.city_id, bucket);
  }

  const activePoiIdsByCityId = new Map<string, Set<string>>();
  const cityIdByPoiId = new Map<string, string>();

  for (const poi of poiRows) {
    if (!isNonEmptyString(poi.id) || !isNonEmptyString(poi.city_id)) {
      continue;
    }

    cityIdByPoiId.set(poi.id, poi.city_id);
    const bucket = activePoiIdsByCityId.get(poi.city_id) ?? new Set<string>();
    bucket.add(poi.id);
    activePoiIdsByCityId.set(poi.city_id, bucket);
  }

  const activePoiIds = new Set(cityIdByPoiId.keys());

  const textCoveredPoiIds = new Set<string>();

  for (const row of poiTexts) {
    if (!isNonEmptyString(row.poi_id)) {
      continue;
    }

    if (!activePoiIds.has(row.poi_id)) {
      continue;
    }

    textCoveredPoiIds.add(row.poi_id);
  }

  const imageCoveredPoiIds = new Set<string>();

  for (const row of poiImages) {
    if (!isNonEmptyString(row.poi_id)) {
      continue;
    }

    if (!activePoiIds.has(row.poi_id)) {
      continue;
    }

    imageCoveredPoiIds.add(row.poi_id);
  }

  const audioLanguagesByPoiId = new Map<string, Set<string>>();

  for (const row of audios) {
    if (!isNonEmptyString(row.poi_id) || !isNonEmptyString(row.language_id)) {
      continue;
    }

    if (!activePoiIds.has(row.poi_id)) {
      continue;
    }

    const language = row.language_id.trim().toLowerCase();
    const bucket = audioLanguagesByPoiId.get(row.poi_id) ?? new Set<string>();
    bucket.add(language);
    audioLanguagesByPoiId.set(row.poi_id, bucket);
  }

  const audioCompletePoiIds = new Set<string>();

  for (const [poiId, languages] of audioLanguagesByPoiId.entries()) {
    const isComplete = EXPECTED_AUDIO_LANGUAGES.every((language) => languages.has(language));

    if (isComplete) {
      audioCompletePoiIds.add(poiId);
    }
  }

  const premiumPoiIdsByCityId = new Map<string, Set<string>>();
  const premiumAudioCountByCityId = new Map<string, number>();

  for (const row of premiumRows) {
    if (!isNonEmptyString(row.poi_id) || !isNonEmptyString(row.language)) {
      continue;
    }

    if (!activePoiIds.has(row.poi_id)) {
      continue;
    }

    const cityId = cityIdByPoiId.get(row.poi_id);

    if (!cityId) {
      continue;
    }

    premiumAudioCountByCityId.set(cityId, (premiumAudioCountByCityId.get(cityId) ?? 0) + 1);

    const poiBucket = premiumPoiIdsByCityId.get(cityId) ?? new Set<string>();
    poiBucket.add(row.poi_id);
    premiumPoiIdsByCityId.set(cityId, poiBucket);
  }

  const textCoveredByCityId = countCoveredByCity(textCoveredPoiIds, cityIdByPoiId);
  const imageCoveredByCityId = countCoveredByCity(imageCoveredPoiIds, cityIdByPoiId);
  const audioCoveredByCityId = countCoveredByCity(audioCompletePoiIds, cityIdByPoiId);

  const rows: StudioProductionRow[] = [];
  const cityScopedRows: StudioProductionRow[] = [];

  for (const city of validCities) {
    const destinationIds = destinationIdsByCityId.get(city.id) ?? [];
    const poiIds = activePoiIdsByCityId.get(city.id) ?? new Set<string>();
    const activePoiCount = poiIds.size;
    const textFrCoveredCount = textCoveredByCityId.get(city.id) ?? 0;
    const imageCoveredCount = imageCoveredByCityId.get(city.id) ?? 0;
    const audioCoveredCount = audioCoveredByCityId.get(city.id) ?? 0;
    const premiumPoiCount = premiumPoiIdsByCityId.get(city.id)?.size ?? 0;
    const premiumAudioCount = premiumAudioCountByCityId.get(city.id) ?? 0;
    const missingTextCount = Math.max(0, activePoiCount - textFrCoveredCount);
    const missingImageCount = Math.max(0, activePoiCount - imageCoveredCount);
    const missingAudioCount = Math.max(0, activePoiCount - audioCoveredCount);
    const brainBucket = brainBySlug.get(city.slug);
    const brainKnown = Boolean(brainBucket);
    const brainEntityIds = brainBucket?.entityIds ?? [];
    const brainKnowledgeCount = brainBucket?.knowledgeCount ?? 0;
    const hasDestination = destinationIds.length > 0;
    const hasActivePoi = activePoiCount > 0;
    const hasProductionAssets =
      textFrCoveredCount > 0 ||
      imageCoveredCount > 0 ||
      audioCoveredCount > 0 ||
      premiumPoiCount > 0 ||
      premiumAudioCount > 0;

    if (!brainKnown && !hasDestination && !hasActivePoi && !hasProductionAssets) {
      continue;
    }

    let baseStatus: ProductionStatus = "ready";

    if (destinationIds.length === 0) {
      baseStatus = "to_produce";
    } else if (activePoiCount === 0) {
      baseStatus = "poi_to_generate";
    } else if (missingTextCount > 0 || missingImageCount > 0 || missingAudioCount > 0) {
      baseStatus = "to_complete";
    }

    cityScopedRows.push({
      key: city.id,
      cityName: city.name,
      citySlug: city.slug,
      cityId: city.id,
      duplicateSlug: false,
      duplicateCityIds: [],
      brainKnown,
      brainEntityIds,
      brainKnowledgeCount,
      brainKnowledgeTotal,
      destinationIds,
      activePoiCount,
      textFrCoveredCount,
      imageCoveredCount,
      audioCoveredCount,
      premiumPoiCount,
      premiumAudioCount,
      missingTextCount,
      missingImageCount,
      missingAudioCount,
      baseStatus,
      actionLabel: actionLabelFromRow({
        status: baseStatus,
        missingTextCount,
        missingImageCount,
        missingAudioCount,
      }),
    });
  }

  const scopedCityIdsBySlug = new Map<string, string[]>();

  for (const row of cityScopedRows) {
    if (!isNonEmptyString(row.cityId)) {
      continue;
    }

    const bucket = scopedCityIdsBySlug.get(row.citySlug) ?? [];

    if (!bucket.includes(row.cityId)) {
      bucket.push(row.cityId);
    }

    scopedCityIdsBySlug.set(row.citySlug, bucket);
  }

  for (const row of cityScopedRows) {
    const duplicateCityIds = scopedCityIdsBySlug.get(row.citySlug) ?? [];
    row.duplicateCityIds = duplicateCityIds;
    row.duplicateSlug = duplicateCityIds.length > 1;
    rows.push(row);
  }

  for (const [slug, brainBucket] of brainBySlug.entries()) {
    const cityIds = cityIdsBySlug.get(slug) ?? [];

    if (cityIds.length > 0) {
      continue;
    }

    if (!isEligibleBrainOnlyBucket(brainBucket)) {
      continue;
    }

    rows.push({
      key: `brain-only-${slug}`,
      cityName: brainBucket.displayName,
      citySlug: slug,
      cityId: null,
      duplicateSlug: false,
      duplicateCityIds: [],
      brainKnown: true,
      brainEntityIds: brainBucket.entityIds,
      brainKnowledgeCount: brainBucket.knowledgeCount,
      brainKnowledgeTotal,
      destinationIds: [],
      activePoiCount: 0,
      textFrCoveredCount: 0,
      imageCoveredCount: 0,
      audioCoveredCount: 0,
      premiumPoiCount: 0,
      premiumAudioCount: 0,
      missingTextCount: 0,
      missingImageCount: 0,
      missingAudioCount: 0,
      baseStatus: "to_create",
      actionLabel: "Creer la ville",
    });
  }

  rows.sort((left, right) => {
    const rankDelta = statusRank(left.baseStatus) - statusRank(right.baseStatus);

    if (rankDelta !== 0) {
      return rankDelta;
    }

    const brainDelta = right.brainKnowledgeCount - left.brainKnowledgeCount;

    if (brainDelta !== 0) {
      return brainDelta;
    }

    return left.cityName.localeCompare(right.cityName, "fr", { sensitivity: "base" });
  });

  const kpis = {
    ready: rows.filter((row) => row.baseStatus === "ready").length,
    toComplete: rows.filter((row) => row.baseStatus === "to_complete").length,
    poiToGenerate: rows.filter((row) => row.baseStatus === "poi_to_generate").length,
    toProduce: rows.filter((row) => row.baseStatus === "to_produce").length,
    toCreate: rows.filter((row) => row.baseStatus === "to_create").length,
    anomalies: rows.filter((row) => row.duplicateSlug).length,
  };

  return {
    rows,
    kpis,
    errors,
    queryPlan,
  };
}
