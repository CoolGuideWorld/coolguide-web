import {
  nimesCityData,
} from "@/data/cities/nimes";
import type {
  CityBadgeItem,
  CityNearbyDestinationItem,
  CityHighlightItem,
  CityPageData,
} from "@/types/city";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getDestinationContentForCity,
  type DestinationContentSupabaseRow,
} from "@/services/destinations/getDestinationContent";
import { getDestinationContext } from "@/services/destinations/getDestinationContext";
import { getDestinationFaq } from "@/services/destinations/getDestinationFaq";
import { getDestinationHighlights } from "@/services/destinations/getDestinationHighlights";
import { getDestinationItineraries } from "@/services/destinations/getDestinationItineraries";
import { getDestinationPractical } from "@/services/destinations/getDestinationPractical";

type CityRelationRow = {
  name: string;
};

type CitySupabaseRow = {
  id: string;
  name: string;
  slug: string;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  population: number | null;
  ideal_visit_duration: string | null;
  best_visit_period: string | null;
  recommended_city_slugs: unknown;
  country_id: string;
  administrative_area_id: string | null;
  countries: CityRelationRow | CityRelationRow[] | null;
  administrative_areas: CityRelationRow | CityRelationRow[] | null;
};

type NearbyCitySupabaseRow = {
  id: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  administrative_area_id: string | null;
};

type AdministrativeAreaSupabaseRow = {
  id: string;
  name: string;
};

type CityHeroImageSupabaseRow = {
  city_id: string;
  image_url: string;
};

type CityImageSupabaseRow = {
  image_url: string;
  alt_text: string | null;
  display_mode: "cover" | "contain";
  focal_position: "center" | "left" | "right" | "top" | "bottom";
  credit: string | null;
};

type HighlightCategorySupabaseRow = {
  name: string;
};

type HighlightPoiSupabaseRow = {
  name: string;
  category: HighlightCategorySupabaseRow | HighlightCategorySupabaseRow[] | null;
};

type HighlightImageSupabaseRow = {
  image_url: string;
};

type CityHighlightSupabaseRow = {
  position: number;
  visit_duration_minutes: number;
  image_alt: string | null;
  poi_id: string;
  poi: HighlightPoiSupabaseRow | HighlightPoiSupabaseRow[] | null;
  image: HighlightImageSupabaseRow | HighlightImageSupabaseRow[] | null;
};

type AudioSupabaseRow = {
  poi_id: string | null;
  language_id: string | null;
};

type TagSupabaseRow = {
  name: string | null;
  icon: string | null;
  status: string | null;
};

type CityTagSupabaseRow = {
  position: number;
  is_active: boolean;
  tag: TagSupabaseRow | TagSupabaseRow[] | null;
};

type ComputedCityStats = {
  population: string | null;
  places: number | null;
  audioguides: number | null;
  languages: number | null;
  idealVisitDuration: string | null;
  bestVisitPeriod: string | null;
};

function readRelationName(
  relation: CityRelationRow | CityRelationRow[] | null
): string | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0]?.name ?? null;
  }

  return relation.name;
}

function formatPopulation(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatVisitDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  if (minutes % 60 === 0) {
    return `${minutes / 60} h`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const paddedRemaining = String(remainingMinutes).padStart(2, "0");

  return `${hours} h ${paddedRemaining}`;
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeCitySlug(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function parseRecommendedCitySlugs(
  rawValue: unknown,
  currentCitySlug: string
): string[] {
  if (!Array.isArray(rawValue)) {
    return [];
  }

  const uniqueSlugs = new Set<string>();
  const normalizedCurrentSlug = currentCitySlug.trim().toLowerCase();

  for (const value of rawValue) {
    if (!isNonEmptyString(value)) {
      continue;
    }

    const normalizedSlug = value.trim().toLowerCase();

    if (!normalizedSlug || normalizedSlug === normalizedCurrentSlug) {
      continue;
    }

    if (uniqueSlugs.has(normalizedSlug)) {
      continue;
    }

    uniqueSlugs.add(normalizedSlug);
  }

  return Array.from(uniqueSlugs);
}

function haversineDistanceKm(
  originLatitude: number,
  originLongitude: number,
  destinationLatitude: number,
  destinationLongitude: number
): number {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLatitude = toRadians(destinationLatitude - originLatitude);
  const deltaLongitude = toRadians(destinationLongitude - originLongitude);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(originLatitude)) *
      Math.cos(toRadians(destinationLatitude)) *
      Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function formatNearbyDistance(
  originLatitude: number | null,
  originLongitude: number | null,
  destinationLatitude: number | null,
  destinationLongitude: number | null
): string | null {
  if (
    originLatitude === null ||
    originLongitude === null ||
    destinationLatitude === null ||
    destinationLongitude === null
  ) {
    return null;
  }

  const distanceKm = haversineDistanceKm(
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude
  );

  return `${Math.round(distanceKm)} km`;
}

function readSingleRelation<T>(
  relation: T | T[] | null
): T | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function mapSupabaseHighlights(
  highlights: CityHighlightSupabaseRow[],
  poiIdsWithAudio: Set<string>
): CityHighlightItem[] {
  const mapped: CityHighlightItem[] = [];

  for (const highlight of highlights) {
    const poi = readSingleRelation(highlight.poi);
    const categoryRelation = readSingleRelation(poi?.category ?? null);
    const poiImage = readSingleRelation(highlight.image);

    if (!poi?.name || !categoryRelation?.name || !poiImage?.image_url) {
      return [];
    }

    mapped.push({
      name: poi.name,
      category: categoryRelation.name,
      duration: formatVisitDuration(highlight.visit_duration_minutes),
      imageSrc: poiImage.image_url,
      imageAlt: highlight.image_alt ?? `Vue de ${poi.name}`,
      hasAudioguide: poiIdsWithAudio.has(highlight.poi_id),
    });
  }

  return mapped;
}

function mapSupabaseBadges(
  rows: CityTagSupabaseRow[]
): CityBadgeItem[] {
  const mapped: CityBadgeItem[] = [];

  for (const row of rows) {
    const tag = readSingleRelation(row.tag);

    if (!tag?.name || !tag?.icon) {
      continue;
    }

    mapped.push({
      emoji: tag.icon,
      label: tag.name,
    });
  }

  return mapped;
}

function buildLocation(city: CitySupabaseRow): string {
  const administrativeAreaName = readRelationName(
    city.administrative_areas
  );
  const countryName = readRelationName(city.countries);

  if (administrativeAreaName && countryName) {
    return `${administrativeAreaName}, ${countryName}`;
  }

  if (countryName) {
    return countryName;
  }

  return "";
}

function mapComputedStatsToItems(
  computedStats: ComputedCityStats
): CityPageData["stats"] {
  const stats: CityPageData["stats"] = [];

  if (computedStats.population !== null) {
    stats.push({
      key: "population",
      label: "Population",
      value: computedStats.population,
    });
  }

  if (computedStats.places !== null) {
    stats.push({
      key: "places",
      label: "Nombre de lieux",
      value: String(computedStats.places),
    });
  }

  if (computedStats.audioguides !== null) {
    stats.push({
      key: "audioguides",
      label: "Audioguides",
      value: String(computedStats.audioguides),
    });
  }

  if (computedStats.languages !== null) {
    stats.push({
      key: "languages",
      label: "Langues",
      value: `${computedStats.languages}`,
    });
  }

  if (isNonEmptyString(computedStats.idealVisitDuration)) {
    stats.push({
      key: "ideal-duration",
      label: "Duree ideale",
      value: computedStats.idealVisitDuration,
    });
  }

  if (isNonEmptyString(computedStats.bestVisitPeriod)) {
    stats.push({
      key: "best-period",
      label: "Meilleure periode",
      value: computedStats.bestVisitPeriod,
    });
  }

  return stats;
}

function resolveHeroName(
  cityName: string,
  destinationContent: DestinationContentSupabaseRow | null
): string {
  return firstNonEmptyString(destinationContent?.title, cityName) ?? cityName;
}

function resolveHeroTagline(
  destinationContent: DestinationContentSupabaseRow | null,
  fallbackTagline: string | null
): string {
  return firstNonEmptyString(destinationContent?.subtitle, fallbackTagline) ?? "";
}

function resolveHeroImage(
  heroImage: CityImageSupabaseRow | null,
  fallbackHighlights: CityHighlightItem[]
): {
  imageSrc: string | null;
  imageAlt: string | null;
} {
  if (isNonEmptyString(heroImage?.image_url)) {
    return {
      imageSrc: heroImage.image_url.trim(),
      imageAlt: firstNonEmptyString(heroImage?.alt_text) ?? null,
    };
  }

  const fallbackHighlight = fallbackHighlights[0] ?? null;

  if (fallbackHighlight && isNonEmptyString(fallbackHighlight.imageSrc)) {
    return {
      imageSrc: fallbackHighlight.imageSrc.trim(),
      imageAlt: firstNonEmptyString(fallbackHighlight.imageAlt) ?? null,
    };
  }

  return {
    imageSrc: null,
    imageAlt: null,
  };
}

function buildCityCta(cityName: string): CityPageData["cta"] {
  return {
    title: "CoolGuide dans votre poche",
    text: `Retrouvez les lieux, les histoires audio et les parcours de ${cityName} dans l'application, au rythme de votre visite.`,
    linkLabel: "Découvrir CoolGuide",
    linkHref: "/experience",
  };
}

function buildUniversalCityData(
  city: CitySupabaseRow,
  destinationContent: DestinationContentSupabaseRow | null,
  heroImage: CityImageSupabaseRow | null,
  supabaseBadges: CityBadgeItem[],
  supabaseHighlights: CityHighlightItem[],
  destinationFaq: CityPageData["faq"],
  destinationItineraries: CityPageData["itineraries"],
  destinationPractical: CityPageData["practical"],
  nearbyDestinations: CityNearbyDestinationItem[],
  computedStats: ComputedCityStats
): CityPageData {
  const resolvedHeroImage = resolveHeroImage(heroImage, supabaseHighlights);
  const fallbackHeroTagline = firstNonEmptyString(
    computedStats.bestVisitPeriod,
    computedStats.idealVisitDuration
  );
  const shortDescription = firstNonEmptyString(destinationContent?.short_description);
  const introduction = firstNonEmptyString(destinationContent?.introduction);
  const localFaq: CityPageData["faq"] = [];
  const localItineraries: CityPageData["itineraries"] = [];

  return {
    hero: {
      name: resolveHeroName(city.name, destinationContent),
      location: buildLocation(city),
      tagline: resolveHeroTagline(destinationContent, fallbackHeroTagline),
      imageSrc: resolvedHeroImage.imageSrc,
      imageAlt: resolvedHeroImage.imageAlt as string,
    },
    shortDescription,
    introduction,
    stats: mapComputedStatsToItems(computedStats),
    badges: supabaseBadges,
    highlights: supabaseHighlights,
    nearbyDestinations,
    practical:
      destinationPractical.length > 0
        ? destinationPractical
        : [],
    itineraries:
      destinationItineraries.length > 0
        ? destinationItineraries
        : localItineraries,
    faq:
      destinationFaq.length > 0
        ? destinationFaq
        : localFaq,
    cta: buildCityCta(city.name),
  };
}

function mergeWithLocalCityData(
  localCityData: Omit<
    CityPageData,
    "cta" | "nearbyDestinations" | "badges" | "stats" | "hero" | "highlights"
  > & {
    hero: Omit<CityPageData["hero"], "imageSrc">;
  },
  city: CitySupabaseRow,
  destinationContent: DestinationContentSupabaseRow | null,
  heroImage: CityImageSupabaseRow | null,
  supabaseBadges: CityBadgeItem[],
  supabaseHighlights: CityHighlightItem[],
  destinationFaq: CityPageData["faq"],
  destinationItineraries: CityPageData["itineraries"],
  destinationPractical: CityPageData["practical"],
  nearbyDestinations: CityNearbyDestinationItem[],
  computedStats: ComputedCityStats
): CityPageData {
  const resolvedHeroImage = resolveHeroImage(heroImage, supabaseHighlights);
  const fallbackHeroTagline = firstNonEmptyString(
    localCityData.hero.tagline,
    computedStats.bestVisitPeriod,
    computedStats.idealVisitDuration
  );
  const localFaq = localCityData.faq;
  const localItineraries = localCityData.itineraries;
  const shortDescription = firstNonEmptyString(destinationContent?.short_description);
  const introduction = firstNonEmptyString(destinationContent?.introduction);

  return {
    ...localCityData,

    hero: {
      ...localCityData.hero,

      name: resolveHeroName(city.name, destinationContent),

      tagline: resolveHeroTagline(destinationContent, fallbackHeroTagline),

      location: buildLocation(city),

      imageSrc: resolvedHeroImage.imageSrc,

      imageAlt: (resolvedHeroImage.imageAlt ?? localCityData.hero.imageAlt) as string,
    },

    shortDescription,

    introduction,

    stats: mapComputedStatsToItems(computedStats),

    badges: supabaseBadges,

    highlights: supabaseHighlights,

    practical:
      destinationPractical.length > 0
        ? destinationPractical
        : localCityData.practical,

    itineraries:
      destinationItineraries.length > 0
        ? destinationItineraries
        : localItineraries,

    faq:
      destinationFaq.length > 0
        ? destinationFaq
        : localFaq,

    cta: buildCityCta(city.name),

    nearbyDestinations,
  };
}

export async function getCity(
  slug: string
): Promise<CityPageData | null> {
  const normalizedSlug = normalizeCitySlug(slug);

  if (!normalizedSlug) {
    console.warn("getCity called with an empty slug.");
    return null;
  }

  try {
    const supabase = createServerSupabaseClient();

    /*
     * 1. Lecture de la ville
     */
    const { data: city, error: cityError } = await supabase
      .from("cities")
      .select(
        `
          id,
          name,
          slug,
          status,
          latitude,
          longitude,
          population,
          ideal_visit_duration,
          best_visit_period,
          recommended_city_slugs,
          country_id,
          administrative_area_id,
          countries!cities_country_id_fkey(name),
          administrative_areas!cities_administrative_area_id_fkey(name)
        `
      )
      .eq("slug", normalizedSlug)
      .maybeSingle<CitySupabaseRow>();

    if (cityError) {
      console.error(
        `Supabase getCity query failed for slug "${normalizedSlug}": ${cityError.message}`
      );

      return null;
    }

    if (!city) {
      console.warn(`No city found in Supabase for slug "${normalizedSlug}".`);
      return null;
    }

    const destinationContext = await getDestinationContext(
      supabase,
      city.id,
      "fr"
    );

    // Lecture editoriale du site via l'architecture destinations (FR).
    const destinationContent = await getDestinationContentForCity(
      supabase,
      destinationContext
    );

    const destinationHighlights = await getDestinationHighlights(
      supabase,
      destinationContext
    );

    const destinationPractical = await getDestinationPractical(
      supabase,
      destinationContext
    );

    const destinationFaq = await getDestinationFaq(
      supabase,
      destinationContext
    );

    const destinationItineraries = await getDestinationItineraries(
      supabase,
      destinationContext
    );

    /*
     * 2. Lecture de l'image Hero
     *
     * Si aucune image n'est disponible, la page continue d'utiliser
     * l'image locale présente dans nimes.ts.
     */
    const { data: heroImage, error: heroImageError } = await supabase
      .from("city_images")
      .select(
        `
          image_url,
          alt_text,
          display_mode,
          focal_position,
          credit
        `
      )
      .eq("city_id", city.id)
      .eq("image_type", "hero")
      .eq("is_active", true)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle<CityImageSupabaseRow>();

    if (heroImageError) {
      console.error(
        `Supabase hero image query failed for city "${normalizedSlug}": ${heroImageError.message}`
      );
    }

    const { data: cityTagRows, error: cityTagsError } = await supabase
      .from("city_tags")
      .select(
        `
          position,
          is_active,
          tag:tags!city_tags_tag_id_fkey(
            name,
            icon,
            status
          )
        `
      )
      .eq("city_id", city.id)
      .eq("is_active", true)
      .order("position", { ascending: true });

    let supabaseBadges: CityBadgeItem[] = [];

    if (cityTagsError) {
      console.error(
        `Supabase city tags query failed for city "${normalizedSlug}": ${cityTagsError.message}`
      );
    } else if (!cityTagRows || cityTagRows.length === 0) {
      console.warn(
        `No active city tags found in Supabase for city "${normalizedSlug}".`
      );
    } else {
      const typedCityTagRows = cityTagRows as CityTagSupabaseRow[];
      supabaseBadges = mapSupabaseBadges(typedCityTagRows);

      if (supabaseBadges.length === 0) {
        console.warn(
          `Supabase city tags mapping incomplete for city "${normalizedSlug}", falling back to local badges.`
        );
      }
    }

    let nearbyDestinations: CityNearbyDestinationItem[] = [];

    try {
      const editorialNearbySlugs = parseRecommendedCitySlugs(
        city.recommended_city_slugs,
        city.slug
      );

      if (editorialNearbySlugs.length > 0) {
        const { data: nearbyCityRows, error: nearbyCitiesError } = await supabase
          .from("cities")
          .select(
            `
              id,
              name,
              slug,
              latitude,
              longitude,
              status,
              administrative_area_id
            `
          )
          .in("slug", editorialNearbySlugs);

        if (nearbyCitiesError) {
          console.error(
            `Supabase nearby cities query failed for city "${normalizedSlug}": ${nearbyCitiesError.message}`
          );
        } else {
          const validNearbyCities = (nearbyCityRows ?? []).filter(
            (row): row is NearbyCitySupabaseRow => {
              return (
                row !== null &&
                row !== undefined &&
                isNonEmptyString(row.slug) &&
                isNonEmptyString(row.name) &&
                String(row.status).toLowerCase() === "active"
              );
            }
          );

          const nearbyCityBySlug = new Map<string, NearbyCitySupabaseRow>();

          for (const nearbyCity of validNearbyCities) {
            nearbyCityBySlug.set(nearbyCity.slug.toLowerCase(), nearbyCity);
          }

          const orderedNearbyCities = editorialNearbySlugs
            .map((nearbySlug) => nearbyCityBySlug.get(nearbySlug))
            .filter((row): row is NearbyCitySupabaseRow => Boolean(row));

          if (orderedNearbyCities.length > 0) {
            const administrativeAreaIds = Array.from(
              new Set(
                orderedNearbyCities
                  .map((row) => row.administrative_area_id)
                  .filter((id): id is string => isNonEmptyString(id))
              )
            );

            const nearbyCityIds = orderedNearbyCities.map((row) => row.id);
            let administrativeAreaNameById = new Map<string, string>();
            const heroImageByCityId = new Map<string, string>();

            if (administrativeAreaIds.length > 0) {
              const { data: areaRows, error: areasError } = await supabase
                .from("administrative_areas")
                .select("id,name")
                .in("id", administrativeAreaIds);

              if (areasError) {
                console.error(
                  `Supabase nearby administrative areas query failed for city "${normalizedSlug}": ${areasError.message}`
                );
              } else {
                administrativeAreaNameById = new Map(
                  ((areaRows ?? []) as AdministrativeAreaSupabaseRow[]).map((row) => [
                    row.id,
                    row.name,
                  ])
                );
              }
            }

            if (nearbyCityIds.length > 0) {
              const { data: imageRows, error: imagesError } = await supabase
                .from("city_images")
                .select("city_id,image_url")
                .in("city_id", nearbyCityIds)
                .eq("image_type", "hero")
                .eq("is_active", true)
                .order("position", { ascending: true });

              if (imagesError) {
                console.error(
                  `Supabase nearby hero images query failed for city "${normalizedSlug}": ${imagesError.message}`
                );
              } else {
                for (const row of (imageRows ?? []) as CityHeroImageSupabaseRow[]) {
                  if (!heroImageByCityId.has(row.city_id) && isNonEmptyString(row.image_url)) {
                    heroImageByCityId.set(row.city_id, row.image_url);
                  }
                }
              }
            }

            nearbyDestinations = orderedNearbyCities.map((nearbyCity) => ({
              slug: nearbyCity.slug,
              name: nearbyCity.name,
              href: `/${nearbyCity.slug}`,
              distance: formatNearbyDistance(
                city.latitude,
                city.longitude,
                nearbyCity.latitude,
                nearbyCity.longitude
              ),
              image: heroImageByCityId.get(nearbyCity.id) ?? null,
              administrativeArea:
                nearbyCity.administrative_area_id !== null
                  ? administrativeAreaNameById.get(nearbyCity.administrative_area_id) ?? null
                  : null,
            }));
          }
        }
      }
    } catch (nearbyError) {
      const message =
        nearbyError instanceof Error ? nearbyError.message : "Unknown nearby destinations error";

      console.error(
        `Supabase nearby destinations setup failed for city "${normalizedSlug}": ${message}`
      );
      nearbyDestinations = [];
    }

    let placesCount: number | null = null;
    let audioguidesCount: number | null = null;
    let languagesCount: number | null = null;

    const {
      data: activePoiRows,
      count: activePoiCount,
      error: activePoiError,
    } = await supabase
      .from("poi")
      .select("id", { count: "exact" })
      .eq("city_id", city.id)
      .eq("status", "active");

    if (activePoiError) {
      console.error(
        `Supabase active POI query failed for city "${normalizedSlug}": ${activePoiError.message}`
      );
    } else {
      placesCount = activePoiCount ?? null;

      const activePoiIds = (activePoiRows ?? [])
        .map((poi) => poi.id)
        .filter((poiId): poiId is string => Boolean(poiId));

      if (activePoiIds.length > 0) {
        const { data: cityAudioRows, error: cityAudioError } = await supabase
          .from("audios")
          .select("poi_id,language_id")
          .in("poi_id", activePoiIds)
          .eq("status", "active")
          .not("audio_url", "is", null);

        if (cityAudioError) {
          console.error(
            `Supabase city audios query failed for city "${normalizedSlug}": ${cityAudioError.message}`
          );
        } else {
          const typedCityAudioRows = (cityAudioRows ?? []) as AudioSupabaseRow[];

          audioguidesCount = new Set(
            typedCityAudioRows
              .map((audio) => audio.poi_id)
              .filter((poiId): poiId is string => Boolean(poiId))
          ).size;

          languagesCount = new Set(
            typedCityAudioRows
              .map((audio) => audio.language_id)
              .filter((languageId): languageId is string => Boolean(languageId))
          ).size;
        }
      }
    }

    const { data: highlightRows, error: highlightsError } = await supabase
      .from("city_highlights")
      .select(
        `
          position,
          visit_duration_minutes,
          image_alt,
          poi_id,
          poi:poi!city_highlights_poi_id_fkey(
            name,
            category:categories!poi_category_id_fkey(name)
          ),
          image:poi_images!city_highlights_poi_image_id_fkey(
            image_url
          )
        `
      )
      .eq("city_id", city.id)
      .eq("is_active", true)
      .order("position", { ascending: true });

    let supabaseHighlights: CityHighlightItem[] = [];

    if (highlightsError) {
      console.error(
        `Supabase highlights query failed for city "${normalizedSlug}": ${highlightsError.message}`
      );
    } else if (!highlightRows || highlightRows.length === 0) {
      console.warn(
        `No active highlights found in Supabase for city "${normalizedSlug}".`
      );
    } else {
      const typedHighlightRows = highlightRows as CityHighlightSupabaseRow[];
      const poiIds = Array.from(
        new Set(
          typedHighlightRows
            .map((row) => row.poi_id)
            .filter((poiId): poiId is string => Boolean(poiId))
        )
      );

      let poiIdsWithAudio = new Set<string>();

      if (poiIds.length > 0) {
        const { data: audioRows, error: audioError } = await supabase
          .from("audios")
          .select("poi_id")
          .in("poi_id", poiIds)
          .eq("status", "active")
          .not("audio_url", "is", null);

        if (audioError) {
          console.error(
            `Supabase audios query failed for city "${normalizedSlug}": ${audioError.message}`
          );
        } else {
          poiIdsWithAudio = new Set(
            ((audioRows ?? []) as AudioSupabaseRow[])
              .map((audio) => audio.poi_id)
              .filter((poiId): poiId is string => Boolean(poiId))
          );
        }
      }

      supabaseHighlights = mapSupabaseHighlights(
        typedHighlightRows,
        poiIdsWithAudio
      );

      if (supabaseHighlights.length === 0) {
        console.warn(
          `Supabase highlights mapping incomplete for city "${normalizedSlug}".`
        );
      }
    }

    const resolvedHighlights =
      destinationHighlights.length > 0
        ? destinationHighlights
        : supabaseHighlights;

    const computedStats: ComputedCityStats = {
      population:
        city.population !== null ? formatPopulation(city.population) : null,
      places: placesCount,
      audioguides: audioguidesCount,
      languages: languagesCount,
      idealVisitDuration: city.ideal_visit_duration,
      bestVisitPeriod: city.best_visit_period,
    };

    /*
     * Nîmes utilise encore son contenu éditorial local comme squelette.
     * Les données Supabase remplacent progressivement les données locales.
     */
    if (normalizedSlug === "nimes") {
      return mergeWithLocalCityData(
        nimesCityData,
        city,
        destinationContent,
        heroImageError ? null : heroImage,
        supabaseBadges,
        resolvedHighlights,
        destinationFaq,
        destinationItineraries,
        destinationPractical,
        nearbyDestinations,
        computedStats
      );
    }

    return buildUniversalCityData(
      city,
      destinationContent,
      heroImageError ? null : heroImage,
      supabaseBadges,
      resolvedHighlights,
      destinationFaq,
      destinationItineraries,
      destinationPractical,
      nearbyDestinations,
      computedStats
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error(
      `Supabase getCity setup failed for slug "${normalizedSlug}": ${message}`
    );

    return null;
  }
}
