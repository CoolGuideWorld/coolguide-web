export type CircuitDestinationType =
  | "city"
  | "poi"
  | "administrative_area"
  | "country"
  | "unknown";

export type CircuitDestination = {
  id: string;
  slug: string;
  position: number;
  type: CircuitDestinationType;
  title: string;
  subtitle?: string | null;
  shortDescription?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl?: string | null;
};

export type CircuitContent = {
  title: string;
  subtitle: string;
  shortDescription: string;
  introduction: string;
  estimatedDuration: string;
  seoTitle: string;
  seoDescription: string;
};

export type CircuitHeroImage = {
  imageUrl: string;
  altText: string;
  displayMode: string;
  focalPosition: string;
};

export type Circuit = {
  id: string;
  slug: string;
  countryId: string;
  heroImage: CircuitHeroImage | null;
  content: CircuitContent;
  destinations: CircuitDestination[];
};

export type DestinationCircuitSummary = {
  id: string;
  slug: string;
  title: string;
  countryId: string;
  estimatedDuration: string;
};

export type CountryCircuitSummary = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  estimated_duration: string;
  heroImage: CircuitHeroImage | null;
  country_slug: string;
  country_name: string;
  destination_count: number;
};

export type DestinationCircuitContext = {
  circuit: DestinationCircuitSummary;
  steps: CircuitDestination[];
  currentStep: CircuitDestination | null;
  previousStep: CircuitDestination | null;
  nextStep: CircuitDestination | null;
  totalSteps: number;
};
