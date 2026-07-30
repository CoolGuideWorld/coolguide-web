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

const SITE_URL = "https://coolguideworld.com";

const getCityCached = cache(async (slug: string) => getCity(slug));

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

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

  const supabase = createServerSupabaseClient();
  const cityId = (cityData as { id?: string | null }).id ?? null;

  const destinationContext = cityId
    ? await getDestinationContext(supabase, cityId, "fr")
    : null;

  const destinationSeo = await getDestinationSeo(
    supabase,
    destinationContext
  );

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

  const destinationUrl = `${SITE_URL}/${slug}`;
  const destinationId = `${destinationUrl}#destination`;
  const heroImageId = `${destinationUrl}#hero-image`;
  const breadcrumbId = `${destinationUrl}#breadcrumb`;
  const faqId = `${destinationUrl}#faq`;

  const destinationDescription =
    cityData.shortDescription ||
    cityData.introduction ||
    cityData.hero.tagline ||
    `Découvrez ${cityData.hero.name} avec CoolGuide.`;

  const badgeKeywords = cityData.badges
    .map((badge) => badge.label.trim())
    .filter(Boolean);

  const validFaqItems = cityData.faq.filter(
    (item) =>
      isNonEmptyString(item.question) &&
      isNonEmptyString(item.answer)
  );

  const attractionNodes = cityData.highlights.map(
    (highlight, index) => {
      const attractionId = `${destinationUrl}#attraction-${index + 1}`;

      return {
        "@type": "TouristAttraction",
        "@id": attractionId,
        name: highlight.name,
        description: [highlight.category, highlight.duration]
          .filter(isNonEmptyString)
          .join(" — "),
        ...(isNonEmptyString(highlight.imageSrc)
          ? {
              image: {
                "@type": "ImageObject",
                url: highlight.imageSrc,
                contentUrl: highlight.imageSrc,
                ...(isNonEmptyString(highlight.imageAlt)
                  ? {
                      caption: highlight.imageAlt,
                    }
                  : {}),
              },
            }
          : {}),
        isPartOf: {
          "@id": destinationId,
        },
      };
    }
  );

  const destinationJsonLd = {
    "@type": "TouristDestination",
    "@id": destinationId,
    name: cityData.hero.name,
    description: destinationDescription,
    url: destinationUrl,
    mainEntityOfPage: destinationUrl,
    inLanguage: "fr-FR",
    ...(isNonEmptyString(cityData.hero.location)
      ? {
          address: cityData.hero.location,
        }
      : {}),
    ...(cityData.hero.imageSrc
      ? {
          image: {
            "@id": heroImageId,
          },
        }
      : {}),
    ...(badgeKeywords.length > 0
      ? {
          keywords: badgeKeywords.join(", "),
        }
      : {}),
    ...(attractionNodes.length > 0
      ? {
          includesAttraction: attractionNodes.map((attraction) => ({
            "@id": attraction["@id"],
          })),
        }
      : {}),
    ...(validFaqItems.length > 0
      ? {
          subjectOf: {
            "@id": faqId,
          },
        }
      : {}),
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  const heroImageJsonLd = cityData.hero.imageSrc
    ? {
        "@type": "ImageObject",
        "@id": heroImageId,
        url: cityData.hero.imageSrc,
        contentUrl: cityData.hero.imageSrc,
        caption:
          cityData.hero.imageAlt ||
          `Vue de ${cityData.hero.name}`,
        representativeOfPage: true,
        about: {
          "@id": destinationId,
        },
      }
    : null;

  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Destinations",
        item: `${SITE_URL}/destinations`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cityData.hero.name,
        item: destinationUrl,
      },
    ],
  };

  const faqJsonLd =
    validFaqItems.length > 0
      ? {
          "@type": "FAQPage",
          "@id": faqId,
          url: destinationUrl,
          inLanguage: "fr-FR",
          mainEntity: validFaqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
          about: {
            "@id": destinationId,
          },
        }
      : null;

  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      destinationJsonLd,
      ...(heroImageJsonLd ? [heroImageJsonLd] : []),
      breadcrumbJsonLd,
      ...(faqJsonLd ? [faqJsonLd] : []),
      ...attractionNodes,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLdGraph),
        }}
      />

      <CityDestinationPage cityData={cityData} />
    </>
  );
}