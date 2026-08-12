import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import CountryHubTemplate from "@/components/countries/CountryHubTemplate";

export const metadata: Metadata = {
  title: "Explorer la France avec CoolGuide",
  description: "Choisissez votre façon de découvrir les plus beaux lieux de France.",
  alternates: {
    canonical: "/france",
  },
};

export default function FrancePage() {
  return (
    <>
      <SiteHeader initialSolid />

      <CountryHubTemplate
        title="Explorer la France avec CoolGuide"
        lead="Choisissez votre façon de découvrir les plus beaux lieux de France."
        circuitsCard={{
          href: "/circuits/france",
          ariaLabel: "Explorer les circuits",
          imageSrc: "/heroes/france-circuits-hero-v2.webp",
          imageAlt: "Vue illustrée pour explorer les circuits de France",
          buttonLabel: "Explorer les circuits",
          title: "Découvrez les circuits et parcours de France",
          text: "Road trips, escapades et itinéraires pour explorer les plus beaux territoires de France.",
          meta: "Routes • Road trips • Escapades",
          priority: true,
        }}
        destinationsCard={{
          href: "/destinations/france",
          ariaLabel: "Explorer les destinations",
          imageSrc: "/heroes/france-destinations-hero.webp",
          imageAlt: "Vue illustrée pour explorer les destinations de France",
          buttonLabel: "Explorer les destinations",
          title: "Découvrez les villes et lieux incontournables",
          text: "Explorez les villes, villages, monuments et sites emblématiques de France.",
          meta: "Villes • Villages • Monuments",
        }}
        signatureTitle="Explorer la France autrement"
        signatureText="Découvrez des circuits thématiques et des destinations sélectionnées pour vivre les plus belles expériences."
      />

      <SiteFooter />
    </>
  );
}
