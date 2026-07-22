import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import CityDestinationPage from "@/components/cities/CityDestinationPage";
import { getCity, isCityPublishable } from "@/services/cities";

export const revalidate = 3600;

type CitySlugParams = {
  slug: string;
};

type CitySlugPageProps = {
  params: Promise<CitySlugParams>;
};

const getCityCached = cache(async (slug: string) => getCity(slug));

export async function generateMetadata(
  props: CitySlugPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const cityData = await getCityCached(slug);

  if (!cityData || !isCityPublishable(cityData)) {
    return {
      title: "Destination introuvable | CoolGuide World",
      description: "Cette destination n'est pas disponible pour le moment.",
    };
  }

  return {
    title: `${cityData.hero.name} | CoolGuide World`,
    description:
      cityData.hero.tagline ||
      `Decouvrez ${cityData.hero.name} avec CoolGuide.`,
  };
}

export default async function CitySlugPage(props: CitySlugPageProps) {
  const { slug } = await props.params;
  const cityData = await getCityCached(slug);

  if (!cityData || !isCityPublishable(cityData)) {
    notFound();
  }

  return <CityDestinationPage cityData={cityData} />;
}
