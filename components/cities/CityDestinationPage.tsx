import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CityHero from "@/components/cities/CityHero";
import CityStats from "@/components/cities/CityStats";
import CityBadges from "@/components/cities/CityBadges";
import CityHighlights from "@/components/cities/CityHighlights";
import DestinationInsights from "@/components/cities/DestinationInsights";
import LocalGuidesSection from "@/components/cities/LocalGuidesSection";
import DestinationCircuit from "@/components/circuits/DestinationCircuit";
import CityNearbyDestinations from "@/components/cities/CityNearbyDestinations";
import LocalCreatorsSection from "@/components/cities/LocalCreatorsSection";
import CityIntroduction from "@/components/cities/CityIntroduction";
import CityPractical from "@/components/cities/CityPractical";
import CityItineraries from "@/components/cities/CityItineraries";
import CityFAQ from "@/components/cities/CityFAQ";
import CityCTA from "@/components/cities/CityCTA";
import type { CityPageData } from "@/types/city";
import type { DestinationCircuitContext } from "@/types/circuit";
import styles from "@/components/cities/city.module.css";

type CityDestinationPageProps = {
  cityData: CityPageData;
  destinationCircuitContexts?: DestinationCircuitContext[];
};

function hasRenderableCTA(cta: CityPageData["cta"]): boolean {
  return (
    typeof cta?.title === "string" &&
    cta.title.trim().length > 0 &&
    typeof cta?.text === "string" &&
    cta.text.trim().length > 0 &&
    typeof cta?.linkLabel === "string" &&
    cta.linkLabel.trim().length > 0 &&
    typeof cta?.linkHref === "string" &&
    cta.linkHref.trim().length > 0
  );
}

export default function CityDestinationPage({
  cityData,
  destinationCircuitContexts = [],
}: CityDestinationPageProps) {
  return (
    <div className={styles.page}>
      <SiteHeader initialSolid />

      <main className={styles.main}>
        <div className={styles.stack}>
          <CityHero hero={cityData.hero} />
          {typeof cityData.shortDescription === "string" || typeof cityData.introduction === "string" ? (
            <CityIntroduction
              shortDescription={cityData.shortDescription}
              introduction={cityData.introduction}
            />
          ) : null}
          {cityData.stats.length > 0 ? (
            <CityStats title="En un coup d'oeil" stats={cityData.stats} />
          ) : null}
          {cityData.badges.length > 0 ? (
            <CityBadges badges={cityData.badges} />
          ) : null}
          {cityData.highlights.length > 0 ? (
            <CityHighlights
              title="Les incontournables"
              highlights={cityData.highlights}
            />
          ) : null}
          {Array.isArray(cityData.insights) && cityData.insights.length > 0 ? (
            <DestinationInsights cityName={cityData.hero.name} items={cityData.insights} />
          ) : null}
          <LocalGuidesSection cityName={cityData.hero.name} />
          <DestinationCircuit contexts={destinationCircuitContexts} />
          <CityNearbyDestinations
            cityName={cityData.hero.name}
            destinations={cityData.nearbyDestinations}
          />
          <LocalCreatorsSection cityName={cityData.hero.name} />
          {cityData.practical.length > 0 ? (
            <CityPractical title="Preparer votre visite" items={cityData.practical} />
          ) : null}
          {cityData.itineraries.length > 0 ? (
            <CityItineraries
              title="Combien de temps avez-vous ?"
              items={cityData.itineraries}
            />
          ) : null}
          {cityData.faq.length > 0 ? (
            <CityFAQ title="Questions frequentes" items={cityData.faq} />
          ) : null}
          {hasRenderableCTA(cityData.cta) ? (
            <CityCTA cta={cityData.cta} />
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
