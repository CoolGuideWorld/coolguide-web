import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCity, isCityPublishable } from "@/services/cities";
import styles from "./france.module.css";

export const metadata: Metadata = {
  title: "France | CoolGuideWorld",
  description: "Découvrez les villes où CoolGuide est déjà disponible en France.",
};

export const revalidate = 3600;

type CountryRow = {
  id: string;
  name: string;
};

type RelationRow = {
  name: string;
};

type FranceCityRow = {
  id: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  administrative_areas: RelationRow | RelationRow[] | null;
};

type FranceDestinationCard = {
  slug: string;
  href: string;
  name: string;
  tagline: string;
  imageSrc: string | null;
  imageAlt: string;
  administrativeArea: string | null;
  latitude: number | null;
  longitude: number | null;
};

function readRelationName(
  relation: RelationRow | RelationRow[] | null
): string | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0]?.name ?? null;
  }

  return relation.name;
}

function projectFrancePoint(longitude: number, latitude: number) {
  const minLongitude = -5.5;
  const maxLongitude = 8.8;
  const minLatitude = 41;
  const maxLatitude = 51.5;
  const width = 220;
  const height = 240;

  const x = ((longitude - minLongitude) / (maxLongitude - minLongitude)) * width;
  const y = height - ((latitude - minLatitude) / (maxLatitude - minLatitude)) * height;

  return {
    x: Math.max(0, Math.min(width, x)),
    y: Math.max(0, Math.min(height, y)),
  };
}

function FranceSilhouette({
  points,
}: {
  points: Array<{ slug: string; x: number; y: number }>;
}) {
  return (
    <svg
      viewBox="0 0 220 240"
      className={styles.franceMap}
      aria-hidden="true"
      focusable="false"
    >
      <path
        className={styles.franceMapShape}
        d="M66 27 98 17 130 27 149 49 172 58 187 85 181 116 191 143 174 171 154 188 146 213 118 224 92 217 75 197 51 186 35 162 29 136 17 114 26 89 41 72 45 49 66 27Z"
      />

      {points.map((point) => (
        <g key={point.slug} transform={`translate(${point.x} ${point.y})`}>
          <circle className={styles.franceMapPulse} r="6" />
          <circle className={styles.franceMapPoint} r="2.6" />
        </g>
      ))}
    </svg>
  );
}

async function getFranceDestinations(): Promise<FranceDestinationCard[]> {
  try {
    const supabase = createServerSupabaseClient();

    const { data: franceCountry, error: franceCountryError } = await supabase
      .from("countries")
      .select("id, name")
      .eq("name", "France")
      .maybeSingle<CountryRow>();

    if (franceCountryError) {
      console.error(
        `Supabase France country query failed: ${franceCountryError.message}`
      );
      return [];
    }

    if (!franceCountry) {
      console.warn('Country "France" not found in Supabase.');
      return [];
    }

    const { data: cityRows, error: cityRowsError } = await supabase
      .from("cities")
      .select(
        `
          id,
          name,
          slug,
          latitude,
          longitude,
          status,
          administrative_areas!cities_administrative_area_id_fkey(name)
        `
      )
      .eq("country_id", franceCountry.id)
      .eq("status", "active")
      .order("name", { ascending: true });

    if (cityRowsError) {
      console.error(
        `Supabase France cities query failed: ${cityRowsError.message}`
      );
      return [];
    }

    const typedCityRows = (cityRows ?? []) as FranceCityRow[];
    const cards: Array<FranceDestinationCard | null> = await Promise.all(
      typedCityRows.map(async (row) => {
        const cityData = await getCity(row.slug);

        if (!cityData || !isCityPublishable(cityData)) {
          return null;
        }

        return {
          slug: row.slug,
          href: `/${row.slug}`,
          name: cityData.hero.name,
          tagline: cityData.hero.tagline,
          imageSrc: cityData.hero.imageSrc,
          imageAlt: cityData.hero.imageAlt,
          administrativeArea: readRelationName(row.administrative_areas),
          latitude: row.latitude,
          longitude: row.longitude,
        } satisfies FranceDestinationCard;
      })
    );

    return cards.filter((card): card is FranceDestinationCard => Boolean(card));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`France destinations page query failed: ${message}`);
    return [];
  }
}

export default async function FrancePage() {
  const destinations = await getFranceDestinations();
  const destinationCountLabel = `${destinations.length} destination${
    destinations.length > 1 ? "s" : ""
  } disponible${destinations.length > 1 ? "s" : ""}`;
  const mappedPoints = destinations
    .filter(
      (destination) =>
        typeof destination.latitude === "number" &&
        typeof destination.longitude === "number"
    )
    .map((destination) => ({
      slug: destination.slug,
      ...projectFrancePoint(destination.longitude as number, destination.latitude as number),
    }));

  return (
    <>
      <SiteHeader initialSolid />

      <main className={styles.page}>
        <section className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <nav aria-label="Fil d'Ariane" className={styles.breadcrumb}>
                <span>Destinations</span>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span aria-current="page">France</span>
              </nav>

              <h1 className={styles.title}>France</h1>

              <p className={styles.subtitle}>
                Découvrez les villes où CoolGuide est déjà disponible.
              </p>

              <p className={styles.counter}>{destinationCountLabel}</p>
            </div>

            <div className={styles.mapPanel}>
              <FranceSilhouette points={mappedPoints} />
            </div>
          </div>

          <section className={styles.section} aria-labelledby="france-destinations-title">
            <div className={styles.sectionHeading}>
              <h2 id="france-destinations-title" className={styles.sectionTitle}>
                Villes disponibles
              </h2>
            </div>

            {destinations.length > 0 ? (
              <div className={styles.cityGrid}>
                {destinations.map((destination) => (
                  <Link key={destination.slug} href={destination.href} className={styles.cityCard}>
                    {destination.imageSrc ? (
                      <div className={styles.cityVisual}>
                        <Image
                          src={destination.imageSrc}
                          alt={destination.imageAlt}
                          fill
                          className={styles.cityImage}
                          sizes="(max-width: 767px) 100vw, (max-width: 1180px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className={styles.cityVisualFallback} aria-hidden="true" />
                    )}

                    <div className={styles.cityBody}>
                      <div className={styles.cityHeader}>
                        <h3 className={styles.cityName}>{destination.name}</h3>
                        {destination.administrativeArea ? (
                          <p className={styles.cityArea}>{destination.administrativeArea}</p>
                        ) : null}
                      </div>

                      <p className={styles.citySummary}>{destination.tagline}</p>

                      <span className={styles.cityLink}>Découvrir</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Aucune destination n’est encore publiée pour la France.</p>
              </div>
            )}
          </section>

          <section className={styles.closingNote} aria-labelledby="france-soon-title">
            <h2 id="france-soon-title" className={styles.closingTitle}>
              D&apos;autres destinations arrivent bientôt.
            </h2>
            <p className={styles.closingText}>
              CoolGuide s&apos;étend progressivement à de nouvelles villes et régions.
            </p>
          </section>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}