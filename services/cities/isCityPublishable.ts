import type { CityHighlightItem, CityPageData } from "@/types/city";

export type CityPublicationCheck = {
  publishable: boolean;
  missing: string[];
  hasCompleteHero: boolean;
  validHighlightsCount: number;
  statsCount: number;
  badgesCount: number;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidHighlight(
  highlight: CityHighlightItem | null | undefined
): highlight is CityHighlightItem {
  return Boolean(
    highlight &&
      isNonEmptyString(highlight.name) &&
      isNonEmptyString(highlight.category) &&
      isNonEmptyString(highlight.duration) &&
      isNonEmptyString(highlight.imageSrc) &&
      isNonEmptyString(highlight.imageAlt) &&
      typeof highlight.hasAudioguide === "boolean"
  );
}

function hasMainDestinationContent(cityData: CityPageData): boolean {
  return (
    isNonEmptyString(cityData?.hero?.name) &&
    isNonEmptyString(cityData?.hero?.tagline)
  );
}

function hasCompletePracticalContent(cityData: CityPageData): boolean {
  if (!Array.isArray(cityData?.practical) || cityData.practical.length === 0) {
    return false;
  }

  return cityData.practical.every(
    (item) => isNonEmptyString(item?.title) && isNonEmptyString(item?.answer)
  );
}

function hasCompleteItinerariesContent(cityData: CityPageData): boolean {
  if (!Array.isArray(cityData?.itineraries) || cityData.itineraries.length === 0) {
    return false;
  }

  return cityData.itineraries.every(
    (item) =>
      isNonEmptyString(item?.title) &&
      isNonEmptyString(item?.duration) &&
      isNonEmptyString(item?.summary) &&
      isNonEmptyString(item?.content)
  );
}

function getHighlightsCompleteness(cityData: CityPageData): {
  hasHighlights: boolean;
  allHighlightsComplete: boolean;
  validHighlights: CityHighlightItem[];
} {
  const highlights = Array.isArray(cityData?.highlights) ? cityData.highlights : [];
  const validHighlights = highlights.filter(isValidHighlight);

  return {
    hasHighlights: highlights.length > 0,
    allHighlightsComplete: highlights.length > 0 && validHighlights.length === highlights.length,
    validHighlights,
  };
}

export function getCityPublicationCheck(
  cityData: CityPageData
): CityPublicationCheck {
  const heroTitle = cityData?.hero?.name;
  const heroTagline = cityData?.hero?.tagline;
  const heroImage = cityData?.hero?.imageSrc;

  const hasCompleteHero =
    isNonEmptyString(heroTitle) &&
    isNonEmptyString(heroTagline) &&
    isNonEmptyString(heroImage);

  const { hasHighlights, allHighlightsComplete, validHighlights } =
    getHighlightsCompleteness(cityData);

  const hasDestinationContent = hasMainDestinationContent(cityData);
  const hasPracticalContent = hasCompletePracticalContent(cityData);
  const hasItinerariesContent = hasCompleteItinerariesContent(cityData);

  const validStats = Array.isArray(cityData?.stats)
    ? cityData.stats.filter(
        (item) =>
          isNonEmptyString(item?.key) &&
          isNonEmptyString(item?.label) &&
          isNonEmptyString(item?.value)
      )
    : [];

  const validBadges = Array.isArray(cityData?.badges)
    ? cityData.badges.filter(
        (badge) =>
          isNonEmptyString(badge?.label) &&
          isNonEmptyString(badge?.emoji)
      )
    : [];

  const missing: string[] = [];

  if (!hasDestinationContent) {
    missing.push("destination_contents");
  }

  if (!hasPracticalContent) {
    missing.push("practical");
  }

  if (!hasItinerariesContent) {
    missing.push("itineraries");
  }

  if (!hasHighlights || !allHighlightsComplete) {
    missing.push("highlights.complete");
  }

  return {
    publishable: missing.length === 0,
    missing,
    hasCompleteHero,
    validHighlightsCount: validHighlights.length,
    statsCount: validStats.length,
    badgesCount: validBadges.length,
  };
}

export function isCityPublishable(cityData: CityPageData): boolean {
  return getCityPublicationCheck(cityData).publishable;
}
