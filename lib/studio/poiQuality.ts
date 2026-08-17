import { createServerAuthSupabaseClient } from "@/lib/supabase/auth-server";

export type CounterResult = {
  value: number | null;
  error: string | null;
};

export type PoiQualityMetricKey = "text_fr" | "images" | "audio_pieton";

export type PoiQualityMetricCityPoi = {
  id: string;
  name: string;
};

export type PoiQualityMetricCity = {
  cityId: string;
  cityName: string;
  missingCount: number;
  pois: PoiQualityMetricCityPoi[];
};

export type PoiQualityMetric = {
  key: PoiQualityMetricKey;
  label: "Texte FR" | "Images" | "Audio piéton";
  covered: number | null;
  total: number | null;
  percent: number | null;
  missing: number | null;
  error: string | null;
  cities: PoiQualityMetricCity[];
  citiesCount: number | null;
  cityMissingTotal: number | null;
};

export type PoiQualityData = {
  population: CounterResult;
  metrics: PoiQualityMetric[];
};

export type CanonicalPoiRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  isActive: boolean;
  cityId: string;
  cityName: string;
  citySlug: string;
  latitude: number | null;
  longitude: number | null;
};

export type PoiQualityRow = CanonicalPoiRow & {
  textFrOk: boolean;
  imageOk: boolean;
  audioPedestrianFrOk: boolean;
  complete: boolean;
  qualityScore: 0 | 1 | 2 | 3;
};

export type PoiQualityCitySummary = {
  cityId: string;
  cityName: string;
  citySlug: string;
  total: number;
  complete: number;
  incomplete: number;
  missingText: number;
  missingImage: number;
  missingAudio: number;
};

export type PoiQualitySnapshot = {
  population: CounterResult;
  metrics: PoiQualityMetric[];
  rows: PoiQualityRow[];
  citySummaries: PoiQualityCitySummary[];
  summary: {
    tracked: number | null;
    complete: number | null;
    incomplete: number | null;
    missingText: number | null;
    missingImage: number | null;
    missingAudio: number | null;
  };
  error: string | null;
};

const PAGE_SIZE = 1000;

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

function buildPoiQualityMetric(
  key: PoiQualityMetric["key"],
  label: PoiQualityMetric["label"],
  total: number | null,
  covered: number | null,
  error: string | null,
  cities: PoiQualityMetricCity[] = []
): PoiQualityMetric {
  if (typeof total !== "number" || typeof covered !== "number" || error) {
    return {
      key,
      label,
      covered: null,
      total,
      percent: null,
      missing: null,
      error: error ?? "metric_unavailable",
      cities,
      citiesCount: null,
      cityMissingTotal: null,
    };
  }

  const normalizedCovered = Math.max(0, Math.min(covered, total));
  const missing = Math.max(0, total - normalizedCovered);
  const percent = total > 0 ? Math.round((normalizedCovered / total) * 100) : 0;

  return {
    key,
    label,
    covered: normalizedCovered,
    total,
    percent,
    missing,
    error: null,
    cities,
    citiesCount: cities.length,
    cityMissingTotal: cities.reduce((sum, city) => sum + city.missingCount, 0),
  };
}

function buildMissingCities(
  canonicalPoiRows: CanonicalPoiRow[],
  coveredPoiIds: Set<string>
): PoiQualityMetricCity[] {
  const cityBuckets = new Map<
    string,
    {
      cityName: string;
      pois: PoiQualityMetricCityPoi[];
    }
  >();

  for (const poi of canonicalPoiRows) {
    if (coveredPoiIds.has(poi.id)) {
      continue;
    }

    const existing = cityBuckets.get(poi.cityId);

    if (existing) {
      existing.pois.push({
        id: poi.id,
        name: poi.name,
      });
      continue;
    }

    cityBuckets.set(poi.cityId, {
      cityName: poi.cityName,
      pois: [
        {
          id: poi.id,
          name: poi.name,
        },
      ],
    });
  }

  return Array.from(cityBuckets.entries())
    .map(([cityId, bucket]) => {
      const pois = [...bucket.pois].sort((left, right) =>
        left.name.localeCompare(right.name, "fr", { sensitivity: "base" })
      );

      return {
        cityId,
        cityName: bucket.cityName,
        missingCount: pois.length,
        pois,
      } satisfies PoiQualityMetricCity;
    })
    .sort((left, right) => {
      if (right.missingCount !== left.missingCount) {
        return right.missingCount - left.missingCount;
      }

      return left.cityName.localeCompare(right.cityName, "fr", {
        sensitivity: "base",
      });
    });
}

async function readCanonicalPoiPopulation(): Promise<{
  rows: CanonicalPoiRow[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const poiRows: CanonicalPoiRow[] = [];
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("poi")
        .select("id,name,slug,status,is_active,city_id,latitude,longitude,cities!inner(id,name,slug,status)")
        .eq("status", "active")
        .eq("is_active", true)
        .not("city_id", "is", null)
        .eq("cities.status", "active")
        .range(from, to);

      if (error) {
        return {
          rows: null,
          error: error.message,
        };
      }

      const rows = (data ?? []) as Array<{
        id: string | null;
        name: string | null;
        slug: string | null;
        status: string | null;
        is_active: boolean | null;
        city_id: string | null;
        latitude: number | null;
        longitude: number | null;
        cities:
          | {
              id: string | null;
              name: string | null;
              slug: string | null;
              status: string | null;
            }
          | Array<{
              id: string | null;
              name: string | null;
              slug: string | null;
              status: string | null;
            }>
          | null;
      }>;

      for (const row of rows) {
        const city = readSingleRelation(row.cities);

        if (
          isNonEmptyString(row.id) &&
          isNonEmptyString(row.city_id) &&
          isNonEmptyString(city?.name)
        ) {
          poiRows.push({
            id: row.id,
            name: isNonEmptyString(row.name) ? row.name.trim() : "POI sans nom",
            slug: isNonEmptyString(row.slug) ? row.slug.trim() : "",
            status: row.status === "active" ? "active" : row.status ?? "",
            isActive: row.is_active === true,
            cityId: row.city_id,
            cityName: city.name.trim(),
            citySlug: isNonEmptyString(city.slug) ? city.slug.trim() : "",
            latitude: typeof row.latitude === "number" ? row.latitude : null,
            longitude: typeof row.longitude === "number" ? row.longitude : null,
          });
        }
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    const deduplicated = Array.from(
      new Map(poiRows.map((row) => [row.id, row])).values()
    );

    return {
      rows: deduplicated,
      error: null,
    };
  } catch (error) {
    return {
      rows: null,
      error: error instanceof Error ? error.message : "unexpected_poi_population_error",
    };
  }
}

async function readCoveredPoiIdsForTextFr(): Promise<{
  ids: Set<string> | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const coveredIds = new Set<string>();
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("poi_texts")
        .select("poi_id,short_description,content")
        .eq("status", "active")
        .eq("is_current", true)
        .eq("language_code", "fr")
        .range(from, to);

      if (error) {
        return {
          ids: null,
          error: error.message,
        };
      }

      const rows = (data ?? []) as Array<{
        poi_id: string | null;
        short_description: string | null;
        content: string | null;
      }>;

      for (const row of rows) {
        if (
          isNonEmptyString(row.poi_id) &&
          isNonEmptyString(row.short_description) &&
          isNonEmptyString(row.content)
        ) {
          coveredIds.add(row.poi_id);
        }
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    return {
      ids: coveredIds,
      error: null,
    };
  } catch (error) {
    return {
      ids: null,
      error: error instanceof Error ? error.message : "unexpected_poi_text_quality_error",
    };
  }
}

async function readCoveredPoiIdsForImages(): Promise<{
  ids: Set<string> | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const coveredIds = new Set<string>();
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("poi_images")
        .select("poi_id,image_url,storage_path")
        .eq("status", "active")
        .range(from, to);

      if (error) {
        return {
          ids: null,
          error: error.message,
        };
      }

      const rows = (data ?? []) as Array<{
        poi_id: string | null;
        image_url: string | null;
        storage_path: string | null;
      }>;

      for (const row of rows) {
        if (
          isNonEmptyString(row.poi_id) &&
          (isNonEmptyString(row.image_url) || isNonEmptyString(row.storage_path))
        ) {
          coveredIds.add(row.poi_id);
        }
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    return {
      ids: coveredIds,
      error: null,
    };
  } catch (error) {
    return {
      ids: null,
      error: error instanceof Error ? error.message : "unexpected_poi_image_quality_error",
    };
  }
}

async function readCoveredPoiIdsForPedestrianAudioFr(): Promise<{
  ids: Set<string> | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerAuthSupabaseClient();
    const coveredIds = new Set<string>();
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("audios")
        .select("poi_id,audio_url,storage_path")
        .eq("status", "active")
        .eq("mode", "pieton")
        .eq("language_id", "fr")
        .range(from, to);

      if (error) {
        return {
          ids: null,
          error: error.message,
        };
      }

      const rows = (data ?? []) as Array<{
        poi_id: string | null;
        audio_url: string | null;
        storage_path: string | null;
      }>;

      for (const row of rows) {
        if (
          isNonEmptyString(row.poi_id) &&
          (isNonEmptyString(row.audio_url) || isNonEmptyString(row.storage_path))
        ) {
          coveredIds.add(row.poi_id);
        }
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    return {
      ids: coveredIds,
      error: null,
    };
  } catch (error) {
    return {
      ids: null,
      error: error instanceof Error ? error.message : "unexpected_poi_audio_quality_error",
    };
  }
}

function buildCitySummaries(rows: PoiQualityRow[]): PoiQualityCitySummary[] {
  const cityMap = new Map<string, PoiQualityCitySummary>();

  for (const row of rows) {
    const current = cityMap.get(row.cityId);

    if (!current) {
      cityMap.set(row.cityId, {
        cityId: row.cityId,
        cityName: row.cityName,
        citySlug: row.citySlug,
        total: 1,
        complete: row.complete ? 1 : 0,
        incomplete: row.complete ? 0 : 1,
        missingText: row.textFrOk ? 0 : 1,
        missingImage: row.imageOk ? 0 : 1,
        missingAudio: row.audioPedestrianFrOk ? 0 : 1,
      });
      continue;
    }

    current.total += 1;
    if (row.complete) {
      current.complete += 1;
    } else {
      current.incomplete += 1;
    }
    if (!row.textFrOk) {
      current.missingText += 1;
    }
    if (!row.imageOk) {
      current.missingImage += 1;
    }
    if (!row.audioPedestrianFrOk) {
      current.missingAudio += 1;
    }
  }

  return Array.from(cityMap.values()).sort((left, right) =>
    left.cityName.localeCompare(right.cityName, "fr", { sensitivity: "base" })
  );
}

export async function readPoiQualitySnapshot(): Promise<PoiQualitySnapshot> {
  const population = await readCanonicalPoiPopulation();

  if (!population.rows) {
    return {
      population: {
        value: null,
        error: population.error,
      },
      metrics: [
        buildPoiQualityMetric("text_fr", "Texte FR", null, null, population.error),
        buildPoiQualityMetric("images", "Images", null, null, population.error),
        buildPoiQualityMetric("audio_pieton", "Audio piéton", null, null, population.error),
      ],
      rows: [],
      citySummaries: [],
      summary: {
        tracked: null,
        complete: null,
        incomplete: null,
        missingText: null,
        missingImage: null,
        missingAudio: null,
      },
      error: population.error,
    };
  }

  const total = population.rows.length;
  const canonicalPoiIds = new Set(population.rows.map((row) => row.id));

  const [textCoverage, imageCoverage, audioCoverage] = await Promise.all([
    readCoveredPoiIdsForTextFr(),
    readCoveredPoiIdsForImages(),
    readCoveredPoiIdsForPedestrianAudioFr(),
  ]);

  const textCovered = textCoverage.ids
    ? new Set(Array.from(textCoverage.ids).filter((id) => canonicalPoiIds.has(id)))
    : null;
  const imageCovered = imageCoverage.ids
    ? new Set(Array.from(imageCoverage.ids).filter((id) => canonicalPoiIds.has(id)))
    : null;
  const audioCovered = audioCoverage.ids
    ? new Set(Array.from(audioCoverage.ids).filter((id) => canonicalPoiIds.has(id)))
    : null;

  const textCities = textCovered ? buildMissingCities(population.rows, textCovered) : [];
  const imageCities = imageCovered ? buildMissingCities(population.rows, imageCovered) : [];
  const audioCities = audioCovered ? buildMissingCities(population.rows, audioCovered) : [];

  const metrics: PoiQualityMetric[] = [
    buildPoiQualityMetric(
      "text_fr",
      "Texte FR",
      total,
      textCovered ? textCovered.size : null,
      textCoverage.error,
      textCities
    ),
    buildPoiQualityMetric(
      "images",
      "Images",
      total,
      imageCovered ? imageCovered.size : null,
      imageCoverage.error,
      imageCities
    ),
    buildPoiQualityMetric(
      "audio_pieton",
      "Audio piéton",
      total,
      audioCovered ? audioCovered.size : null,
      audioCoverage.error,
      audioCities
    ),
  ];

  if (!textCovered || !imageCovered || !audioCovered) {
    return {
      population: {
        value: total,
        error: population.error,
      },
      metrics,
      rows: [],
      citySummaries: [],
      summary: {
        tracked: total,
        complete: null,
        incomplete: null,
        missingText: null,
        missingImage: null,
        missingAudio: null,
      },
      error:
        textCoverage.error ??
        imageCoverage.error ??
        audioCoverage.error ??
        "poi_quality_unavailable",
    };
  }

  const rows: PoiQualityRow[] = population.rows.map((poi) => {
    const textFrOk = textCovered.has(poi.id);
    const imageOk = imageCovered.has(poi.id);
    const audioPedestrianFrOk = audioCovered.has(poi.id);
    const qualityScore = Number(textFrOk) + Number(imageOk) + Number(audioPedestrianFrOk);

    return {
      ...poi,
      textFrOk,
      imageOk,
      audioPedestrianFrOk,
      complete: qualityScore === 3,
      qualityScore: qualityScore as 0 | 1 | 2 | 3,
    };
  });

  const complete = rows.filter((row) => row.complete).length;
  const incomplete = rows.length - complete;
  const missingText = rows.filter((row) => !row.textFrOk).length;
  const missingImage = rows.filter((row) => !row.imageOk).length;
  const missingAudio = rows.filter((row) => !row.audioPedestrianFrOk).length;

  return {
    population: {
      value: total,
      error: population.error,
    },
    metrics,
    rows,
    citySummaries: buildCitySummaries(rows),
    summary: {
      tracked: total,
      complete,
      incomplete,
      missingText,
      missingImage,
      missingAudio,
    },
    error: null,
  };
}

export async function readPoiQualityData(): Promise<PoiQualityData> {
  const snapshot = await readPoiQualitySnapshot();

  return {
    population: snapshot.population,
    metrics: snapshot.metrics,
  };
}