export type CityHeroData = {
  name: string;
  location: string;
  tagline: string;
  imageSrc: string | null;
  imageAlt: string;
};

export type CityStatItem = {
  key: string;
  label: string;
  value: string;
  detail?: string;
};

export type CityBadgeItem = {
  emoji: string;
  label: string;
};

export type CityHighlightItem = {
  name: string;
  category: string;
  duration: string;
  imageSrc: string;
  imageAlt: string;
  hasAudioguide: boolean;
};

export type CityPracticalItem = {
  title: string;
  answer: string;
};

export type CityItineraryItem = {
  title: string;
  duration: string;
  summary: string;
  content: string;
};

export type CityFaqItem = {
  question: string;
  answer: string;
};

export type CityCTAData = {
  title: string;
  text: string;
  linkLabel: string;
  linkHref: string;
};

export type CityNearbyDestinationItem = {
  slug: string;
  name: string;
  href: string;
  distance: string | null;
  image: string | null;
  administrativeArea?: string | null;
};

export type CityPageData = {
  hero: CityHeroData;
  shortDescription?: string | null;
  introduction?: string | null;
  stats: CityStatItem[];
  badges: CityBadgeItem[];
  highlights: CityHighlightItem[];
  nearbyDestinations: CityNearbyDestinationItem[];
  practical: CityPracticalItem[];
  itineraries: CityItineraryItem[];
  faq: CityFaqItem[];
  cta: CityCTAData;
};
