import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import CityDestinationPage from "@/components/cities/CityDestinationPage";
import { getCity, isCityPublishable } from "@/services/cities";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDestinationContext } from "@/services/destinations/getDestinationContext";
import { getDestinationSeo } from "@/services/destinations/getDestinationSeo";

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
      alternates: {
        canonical: `/${slug}`,
      },
    };
  }

  const supabase = createServerSupabaseClient();
  const cityId = (cityData as { id?: string | null }).id ?? null;
  const destinationContext = cityId
    ? await getDestinationContext(supabase, cityId, "fr")
    : null;

  const destinationSeo = await getDestinationSeo(supabase, destinationContext);

  const seoTitle = destinationSeo.seoTitle ?? "";
  const seoDescription = destinationSeo.seoDescription ?? "";
  const shortDescription = destinationSeo.shortDescription ?? "";
  const introduction = destinationSeo.introduction ?? "";

  return {
    title: seoTitle || cityData.hero.name,
    description:
      seoDescription ||
      shortDescription ||
      introduction ||
      cityData.hero.tagline ||
      `Découvrez ${cityData.hero.name} avec CoolGuide.`,
    alternates: {
      canonical: `/${slug}`,
    },
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