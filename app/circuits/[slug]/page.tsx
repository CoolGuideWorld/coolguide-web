import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CircuitPage from "@/components/circuits/CircuitPage";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCircuit } from "@/services/circuits/getCircuit";

type CircuitSlugParams = {
  slug: string;
};

type CircuitSlugPageProps = {
  params: Promise<CircuitSlugParams>;
};

const SITE_URL = "https://www.coolguideworld.com";

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function buildCircuitJsonLd(circuit: Awaited<ReturnType<typeof getCircuit>>) {
  if (!circuit) {
    return null;
  }

  const circuitUrl = `${SITE_URL}/circuits/${circuit.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${circuitUrl}#breadcrumb`,
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
            name: "Circuits",
            item: `${SITE_URL}/circuits/france`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: circuit.content.title,
            item: circuitUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${circuitUrl}#steps`,
        name: circuit.content.title,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: circuit.destinations.length,
        itemListElement: circuit.destinations.map((destination) => ({
          "@type": "ListItem",
          position: destination.position,
          name: destination.title,
          url: `${SITE_URL}/${destination.slug}`,
          ...(isNonEmptyString(destination.shortDescription)
            ? { description: destination.shortDescription }
            : {}),
        })),
      },
    ],
  };
}

export async function generateMetadata(
  props: CircuitSlugPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const circuit = await getCircuit(slug, "fr");

  if (!circuit) {
    return {
      title: "Circuit introuvable",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const metadataTitle = circuit.content.seoTitle || circuit.content.title;
  const metadataDescription =
    circuit.content.seoDescription || circuit.content.shortDescription;
  const circuitUrl = `${SITE_URL}/circuits/${circuit.slug}`;
  const heroImageUrl = isNonEmptyString(circuit.heroImage?.imageUrl)
    ? circuit.heroImage.imageUrl
    : null;
  const heroImageAlt = isNonEmptyString(circuit.heroImage?.altText)
    ? circuit.heroImage.altText
    : circuit.content.title;

  const openGraphImages = heroImageUrl
    ? [
        {
          url: heroImageUrl,
          alt: heroImageAlt,
        },
      ]
    : undefined;

  return {
    title: metadataTitle,
    description: metadataDescription,
    alternates: {
      canonical: `/circuits/${circuit.slug}`,
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: circuitUrl,
      siteName: "CoolGuide World",
      title: metadataTitle,
      description: metadataDescription,
      ...(openGraphImages ? { images: openGraphImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: metadataTitle,
      description: metadataDescription,
      ...(heroImageUrl ? { images: [heroImageUrl] } : {}),
    },
  };
}

export default async function CircuitSlugPage(
  props: CircuitSlugPageProps
) {
  const { slug } = await props.params;
  const circuit = await getCircuit(slug, "fr");

  if (!circuit) {
    notFound();
  }

  const circuitJsonLd = buildCircuitJsonLd(circuit);

  return (
    <>
      {circuitJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(circuitJsonLd),
          }}
        />
      ) : null}

      <SiteHeader initialSolid />
      <CircuitPage circuit={circuit} />
      <SiteFooter />
    </>
  );
}
