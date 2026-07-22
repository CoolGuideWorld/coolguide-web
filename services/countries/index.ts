import { nimesCityData, type CityPageData } from "@/data/cities/nimes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CityRelationRow = {
  name: string;
};

type CitySupabaseRow = {
  id: string;
  name: string;
  slug: string;
  population: number | null;
  country_id: string;
  administrative_area_id: string | null;
  countries: CityRelationRow | CityRelationRow[] | null;
  administrative_areas: CityRelationRow | CityRelationRow[] | null;
};

type CityImageSupabaseRow = {
  image_url: string;
  alt_text: string | null;
  display_mode: "cover" | "contain";
  focal_position: "center" | "left" | "right" | "top" | "bottom";
  credit: string | null;
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

  return nimesCityData.hero.location;
}

function mergeWithLocalCityData(
  localCityData: CityPageData,
  city: CitySupabaseRow,
  heroImage: CityImageSupabaseRow | null
): CityPageData {
  return {
    ...localCityData,

    hero: {
      ...localCityData.hero,

      name: city.name,

      location: buildLocation(city),

      imageSrc: heroImage?.image_url ?? localCityData.hero.imageSrc,

      imageAlt: heroImage?.alt_text ?? localCityData.hero.imageAlt,
    },

    stats: localCityData.stats.map((item) => {
      if (item.key === "population" && city.population !== null) {
        return {
          ...item,
          value: formatPopulation(city.population),
        };
      }

      return item;
    }),
  };
}

export async function getCity(
  slug: string
): Promise<CityPageData | null> {
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
          population,
          country_id,
          administrative_area_id,
          countries!cities_country_id_fkey(name),
          administrative_areas!cities_administrative_area_id_fkey(name)
        `
      )
      .eq("slug", slug)
      .maybeSingle<CitySupabaseRow>();

    if (cityError) {
      console.error(
        `Supabase getCity query failed for slug "${slug}": ${cityError.message}`
      );

      // Temporary fallback while the Supabase integration is progressive.
      return slug === "nimes" ? nimesCityData : null;
    }

    if (!city) {
      console.warn(`No city found in Supabase for slug "${slug}".`);

      // Temporary fallback while only Nimes has a local editorial dataset.
      return slug === "nimes" ? nimesCityData : null;
    }

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
        `Supabase hero image query failed for city "${slug}": ${heroImageError.message}`
      );
    }

    /*
     * Nîmes utilise encore son contenu éditorial local comme squelette.
     * Les données Supabase remplacent progressivement les données locales.
     */
    if (slug === "nimes") {
      return mergeWithLocalCityData(
        nimesCityData,
        city,
        heroImageError ? null : heroImage
      );
    }

    return null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error(
      `Supabase getCity setup failed for slug "${slug}": ${message}`
    );

    // Temporary fallback while the Supabase connection and content coverage are incomplete.
    return slug === "nimes" ? nimesCityData : null;
  }
}