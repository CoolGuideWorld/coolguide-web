import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import CityDestinationPage from "@/components/cities/CityDestinationPage";
import type { CityPageData } from "@/data/cities/nimes";
import { getCity, isCityPublishable } from "@/services/cities";
import { getDestination } from "@/services/destinations/getDestination";

export const revalidate = 3600;

type CitySlugParams = {
  slug: string;
};

type CitySlugPageProps = {
  params: Promise<CitySlugParams>;
};

const getCityCached = cache(async (slug: string) => getCity(slug));
const getDestinationCached = cache(async (slug: string) =>
  getDestination({ slug, languageCode: "fr" })
);

function formatDuration(minutes: number | null): string {
  if (minutes === null || !Number.isFinite(minutes) || minutes <= 0) {
    return "";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  if (minutes === 60) {
    return "1 h";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes}`;
}

function buildLocationFromDestinationData(data: Awaited<ReturnType<typeof getDestination>>): string | null {
  if (!data) {
    return null;
  }

  const pieces = [data.city?.name, data.administrativeArea?.name, data.country?.name]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);

  if (pieces.length === 0) {
    return null;
  }

  return pieces.join(", ");
}

function mergeCityDataWithDestination(
  cityData: CityPageData,
  destinationData: Awaited<ReturnType<typeof getDestination>>
): CityPageData {
  const destinationTitle = destinationData?.content?.title?.trim() ?? "";
  const destinationSubtitle = destinationData?.content?.subtitle?.trim() ?? "";
  const destinationLocation = buildLocationFromDestinationData(destinationData);

  const destinationHighlights = destinationData?.highlights ?? [];

  const mergedHighlights =
    destinationHighlights.length > 0
      ? destinationHighlights.map((highlight) => {
          const fallbackHighlight = cityData.highlights.find(
            (cityHighlight) =>
              cityHighlight.name.trim().toLowerCase() ===
              highlight.name.trim().toLowerCase()
          );

          return {
            name: highlight.name,
            category: highlight.category,
            duration: formatDuration(highlight.durationMinutes),
            imageSrc: highlight.imageSrc ?? fallbackHighlight?.imageSrc ?? cityData.hero.imageSrc,
            imageAlt: highlight.imageAlt,
            hasAudioguide: highlight.hasAudioguide,
          };
        })
      : cityData.highlights;

  const destinationPractical = destinationData?.practical ?? [];

  const mergedPractical =
    destinationPractical.length > 0
      ? destinationPractical.map(({ title, answer }) => ({
          title,
          answer,
        }))
      : cityData.practical;

  const destinationItineraries = destinationData?.itineraries ?? [];

  const mergedItineraries =
    destinationItineraries.length > 0
      ? destinationItineraries.map(({ title, duration, summary, stops }) => ({
          title,
          duration,
          summary,
          stops,
        }))
      : cityData.itineraries;

  const destinationFaq = destinationData?.faq ?? [];

  const mergedFaq =
    destinationFaq.length > 0
      ? destinationFaq.map(({ question, answer }) => ({
          question,
          answer,
        }))
      : cityData.faq;

  return {
    ...cityData,
    hero: {
      ...cityData.hero,
      name: destinationTitle || cityData.hero.name,
      tagline: destinationSubtitle || cityData.hero.tagline,
      location: destinationLocation || cityData.hero.location,
    },
    highlights: mergedHighlights,
    practical: mergedPractical,
    itineraries: mergedItineraries,
    faq: mergedFaq,
  };
}

export async function generateMetadata(
  props: CitySlugPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const [cityData, destinationData] = await Promise.all([
    getCityCached(slug),
    getDestinationCached(slug),
  ]);

  if (!cityData || !isCityPublishable(cityData)) {
    return {
      title: "Destination introuvable | CoolGuide World",
      description: "Cette destination n'est pas disponible pour le moment.",
    };
  }

  const mergedCityData = mergeCityDataWithDestination(cityData, destinationData);
  const seoTitle = destinationData?.content?.seoTitle?.trim() ?? "";
  const seoDescription = destinationData?.content?.seoDescription?.trim() ?? "";
  const shortDescription = destinationData?.content?.shortDescription?.trim() ?? "";
  const introduction = destinationData?.content?.introduction?.trim() ?? "";

  return {
    title: seoTitle || `${mergedCityData.hero.name} | CoolGuide World`,
    description:
      seoDescription ||
      shortDescription ||
      introduction ||
      mergedCityData.hero.tagline ||
      `Decouvrez ${mergedCityData.hero.name} avec CoolGuide.`,
  };
}

export default async function CitySlugPage(props: CitySlugPageProps) {
  const { slug } = await props.params;
  const [cityData, destinationData] = await Promise.all([
    getCityCached(slug),
    getDestinationCached(slug),
  ]);

  if (!cityData || !isCityPublishable(cityData)) {
    notFound();
  }

  const mergedCityData = mergeCityDataWithDestination(cityData, destinationData);

  return <CityDestinationPage cityData={mergedCityData} />;
}
