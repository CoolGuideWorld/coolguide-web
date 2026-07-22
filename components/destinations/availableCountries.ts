export type AvailableCountry = {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  searchTerms?: string[];
};

export const AVAILABLE_DESTINATION_COUNTRIES: AvailableCountry[] = [
  {
    name: "France",
    slug: "france",
    latitude: 46.603354,
    longitude: 1.888334,
    searchTerms: ["france"],
  },
];

export function normalizeCountryQuery(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function findAvailableCountryByQuery(query: string): AvailableCountry | null {
  const normalizedQuery = normalizeCountryQuery(query);

  if (!normalizedQuery) {
    return null;
  }

  return (
    AVAILABLE_DESTINATION_COUNTRIES.find((country) => {
      const terms = [country.name, ...(country.searchTerms ?? [])];
      return terms.some((term) => normalizeCountryQuery(term) === normalizedQuery);
    }) ?? null
  );
}
