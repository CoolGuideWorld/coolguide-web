import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CountryHubTemplate from "@/components/countries/CountryHubTemplate";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCountryCircuits } from "@/services/circuits/getCountryCircuits";
import { getCountryBySlug, getCountryCatalogData } from "@/services/destinations";

export const revalidate = 3600;

type CountryParams = {
  country: string;
};

type CountryPageProps = {
  params: Promise<CountryParams>;
};

const GENERIC_DESTINATIONS_FALLBACK_IMAGE = "/world/earth-land-ocean-ice-2048.jpg";
const GENERIC_CIRCUITS_FALLBACK_IMAGE = "/hero/hero-06-bridge.jpg";
const FRENCH_REGION_DISPLAY_NAMES =
  typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["fr"], { type: "region" })
    : null;

function getLocalizedCountryName(name: string, isoCode: string | null | undefined): string {
  const normalizedIsoCode =
    typeof isoCode === "string" ? isoCode.trim().toUpperCase() : "";

  if (normalizedIsoCode.length !== 2 || FRENCH_REGION_DISPLAY_NAMES === null) {
    return name;
  }

  const localized = FRENCH_REGION_DISPLAY_NAMES.of(normalizedIsoCode);

  if (
    typeof localized === "string" &&
    localized.trim().length > 0 &&
    !/unknown|inconnu/i.test(localized)
  ) {
    return localized;
  }

  return name;
}

function isUsableHeroImageUrl(value: string | null | undefined): value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "example.com";
  } catch {
    return false;
  }
}

export async function generateMetadata(props: CountryPageProps): Promise<Metadata> {
  const { country } = await props.params;
  const countryData = await getCountryBySlug(country);

  if (!countryData) {
    return {
      title: "Pays introuvable | CoolGuideWorld",
      description: "Ce pays n'est pas disponible pour le moment.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const localizedCountryName = getLocalizedCountryName(countryData.name, countryData.isoCode);

  return {
    title: `${localizedCountryName} | Explorer`,
    description: `Choisissez votre facon d'explorer ${localizedCountryName} avec CoolGuideWorld.`,
    alternates: {
      canonical: `/countries/${countryData.slug}`,
    },
  };
}

export default async function CountryHubPage(props: CountryPageProps) {
  const { country } = await props.params;
  const countryData = await getCountryBySlug(country);

  if (!countryData) {
    notFound();
  }

  const catalogData = await getCountryCatalogData({
    countrySlug: countryData.slug,
    page: 1,
    q: "",
    administrativeArea: "",
    sort: "az",
  });

  if (!catalogData) {
    notFound();
  }

  const circuits = (await getCountryCircuits(countryData.slug)) ?? [];
  const localizedCountryName = getLocalizedCountryName(countryData.name, countryData.isoCode);
  const destinationsCount = catalogData.total;
  const hasDestinations = destinationsCount > 0;
  const hasCircuits = circuits.length > 0;

  const firstDestinationWithImage = catalogData.cards.find(
    (card) => typeof card.imageSrc === "string" && card.imageSrc.trim().length > 0
  );
  const destinationsImageSrc = firstDestinationWithImage?.imageSrc ?? GENERIC_DESTINATIONS_FALLBACK_IMAGE;
  const destinationsImageAlt =
    firstDestinationWithImage?.imageAlt ?? `Vue representative des destinations en ${localizedCountryName}`;

  const firstCircuitWithHero = circuits.find((circuit) =>
    isUsableHeroImageUrl(circuit.heroImage?.imageUrl)
  );
  const circuitsImageSrc =
    firstCircuitWithHero?.heroImage?.imageUrl ?? GENERIC_CIRCUITS_FALLBACK_IMAGE;
  const circuitsImageAlt =
    firstCircuitWithHero?.heroImage?.altText?.trim() ||
    `Vue representative des circuits en ${localizedCountryName}`;

  return (
    <>
      <SiteHeader initialSolid />

      <CountryHubTemplate
        title={`Explorer ${localizedCountryName} avec CoolGuide`}
        lead={`Choisissez votre facon de decouvrir les plus beaux lieux de ${localizedCountryName}.`}
        destinationsCard={
          hasDestinations
            ? {
                href: `/destinations/${countryData.slug}`,
                ariaLabel: `Explorer les destinations en ${localizedCountryName}`,
                imageSrc: destinationsImageSrc,
                imageAlt: destinationsImageAlt,
                buttonLabel: "Explorer les destinations",
                title: `Decouvrez les villes et lieux incontournables de ${localizedCountryName}`,
                text: "Explorez les villes, villages, monuments et sites emblematiques disponibles.",
                meta: `Destinations disponibles: ${destinationsCount}`,
                priority: !hasCircuits,
              }
            : null
        }
        circuitsCard={
          hasCircuits
            ? {
                href: `/circuits/${countryData.slug}`,
              ariaLabel: `Explorer les circuits en ${localizedCountryName}`,
                imageSrc: circuitsImageSrc,
                imageAlt: circuitsImageAlt,
                buttonLabel: "Explorer les circuits",
              title: `Decouvrez les circuits et parcours de ${localizedCountryName}`,
                text: "Road trips, escapades et itineraires pour explorer le pays par etapes.",
                meta: `Circuits disponibles: ${circuits.length}`,
                priority: true,
              }
            : null
        }
        signatureTitle={`Explorer ${localizedCountryName} autrement`}
        signatureText="Decouvrez des circuits thematiques et des destinations selectionnees pour vivre les plus belles experiences."
      />

      <SiteFooter />
    </>
  );
}