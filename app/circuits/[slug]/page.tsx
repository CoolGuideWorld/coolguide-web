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

  return {
    title: circuit.content.seoTitle || circuit.content.title,
    description:
      circuit.content.seoDescription || circuit.content.shortDescription,
    alternates: {
      canonical: `/circuits/${circuit.slug}`,
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

  return (
    <>
      <SiteHeader initialSolid />
      <CircuitPage circuit={circuit} />
      <SiteFooter />
    </>
  );
}
