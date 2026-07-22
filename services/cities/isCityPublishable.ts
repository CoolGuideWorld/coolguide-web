import type { CityHighlightItem, CityPageData } from "@/data/cities/nimes";

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

  const validHighlights = Array.isArray(cityData?.highlights)
    ? cityData.highlights.filter(isValidHighlight)
    : [];

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

  if (!hasCompleteHero) {
    if (!isNonEmptyString(heroTitle)) {
      missing.push("hero.title");
    }

    if (!isNonEmptyString(heroTagline)) {
      missing.push("hero.tagline");
    }

    if (!isNonEmptyString(heroImage)) {
      missing.push("hero.image");
    }
  }

  if (validHighlights.length < 3) {
    missing.push("highlights.minimum_3");
  }

  if (validStats.length === 0) {
    missing.push("stats");
  }

  if (validBadges.length === 0) {
    missing.push("badges");
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
