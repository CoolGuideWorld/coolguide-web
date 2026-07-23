import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  CATALOG_SORT_VALUES,
  getCountryBySlug,
  getCountryCatalogData,
  parseCatalogPage,
  parseCatalogSort,
  type CatalogSortValue,
} from "@/services/destinations";
import CountryDestinationsFiltersClient from "./CountryDestinationsFiltersClient";
import styles from "./country.module.css";

export const revalidate = 3600;

type SearchParams = Record<string, string | string[] | undefined>;

type CountryParams = {
  country: string;
};

type CountryPageProps = {
  params: Promise<CountryParams>;
  searchParams: Promise<SearchParams>;
};

function toSingleValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function buildQueryString(params: {
  page?: number;
  q: string;
  region: string;
  sort: CatalogSortValue;
}): string {
  const query = new URLSearchParams();

  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }

  if (params.q) {
    query.set("q", params.q);
  }

  if (params.region) {
    query.set("region", params.region);
  }

  if (params.sort !== "az") {
    query.set("sort", params.sort);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function getPaginationPages(currentPage: number, totalPages: number): number[] {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  for (let value = currentPage - 2; value <= currentPage + 2; value += 1) {
    if (value >= 1 && value <= totalPages) {
      pages.add(value);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function generateMetadata(props: CountryPageProps): Promise<Metadata> {
  const { country } = await props.params;
  const countryData = await getCountryBySlug(country);

  if (!countryData) {
    return {
      title: "Destination introuvable | CoolGuideWorld",
      description: "Ce pays n'est pas disponible pour le moment.",
    };
  }

  return {
    title: `${countryData.name} | CoolGuideWorld`,
    description: `Decouvrez les villes ou CoolGuide est deja disponible en ${countryData.name}.`,
  };
}

export default async function CountryDestinationsPage(props: CountryPageProps) {
  const { country } = await props.params;
  const searchParams = await props.searchParams;

  const rawQ = toSingleValue(searchParams.q).trim();
  const rawRegion = toSingleValue(searchParams.region).trim();
  const rawSort = toSingleValue(searchParams.sort).trim().toLowerCase();
  const rawPage = toSingleValue(searchParams.page);

  const sort = parseCatalogSort(rawSort);
  const page = parseCatalogPage(rawPage);

  const catalogData = await getCountryCatalogData({
    countrySlug: country,
    page,
    q: rawQ,
    administrativeArea: rawRegion,
    sort,
  });

  if (!catalogData) {
    notFound();
  }

  const {
    country: resolvedCountry,
    administrativeAreas,
    selectedAdministrativeArea,
    cards,
    total,
    totalPages,
    page: safePage,
  } = catalogData;

  const hasActiveFilters =
    Boolean(rawQ) || Boolean(selectedAdministrativeArea) || sort !== CATALOG_SORT_VALUES[0];

  const countryCountLabel = `${total} ville${total > 1 ? "s" : ""} disponible${
    total > 1 ? "s" : ""
  }`;
  const resultCountLabel = `${total} ville${total > 1 ? "s" : ""} trouvee${
    total > 1 ? "s" : ""
  }`;

  const paginationPages = getPaginationPages(safePage, totalPages);
  const basePath = `/destinations/${resolvedCountry.slug}`;

  return (
    <>
      <SiteHeader initialSolid />

      <main className={styles.page}>
        <section className={styles.container}>
          <header className={styles.compactHeader}>
            <nav aria-label="Fil d'Ariane" className={styles.breadcrumb}>
              <Link href="/destinations" className={styles.breadcrumbLink}>
                Destinations
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span aria-current="page">{resolvedCountry.name}</span>
            </nav>

            <h1 className={styles.title}>{resolvedCountry.name}</h1>

            <p className={styles.subtitle}>
              Trouvez une ville et decouvrez les experiences CoolGuide disponibles.
            </p>

            <p className={styles.counter}>{countryCountLabel}</p>
          </header>

          <section className={styles.controlsSection} aria-labelledby="country-search-title">
            <h2 id="country-search-title" className={styles.sectionSrOnly}>
              Recherche et filtres
            </h2>

            <CountryDestinationsFiltersClient
              initialQ={rawQ}
              initialAdministrativeArea={selectedAdministrativeArea}
              initialSort={sort}
              administrativeAreas={administrativeAreas}
              basePath={basePath}
            />
          </section>

          <section className={styles.resultsSection} aria-labelledby="country-results-title">
            <div className={styles.resultsMeta}>
              <h2 id="country-results-title" className={styles.resultsCount}>
                {resultCountLabel}
              </h2>
              <p className={styles.resultsSortText}>Tri: {sort === "az" ? "A → Z" : "Z → A"}</p>
            </div>

            {cards.length > 0 ? (
              <div className={styles.cityGrid}>
                {cards.map((destination) => (
                  <article key={destination.slug} className={styles.cityCard}>
                    <Link href={destination.href} className={styles.cityVisualLink}>
                      {destination.imageSrc ? (
                        <div className={styles.cityVisual}>
                          <Image
                            src={destination.imageSrc}
                            alt={destination.imageAlt}
                            fill
                            className={styles.cityImage}
                            sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          />
                        </div>
                      ) : (
                        <div className={styles.cityVisualFallback} aria-hidden="true" />
                      )}
                    </Link>

                    <div className={styles.cityBody}>
                      <h3 className={styles.cityName}>{destination.name}</h3>
                      <p className={styles.cityArea}>
                        {destination.administrativeArea ?? "Region non renseignee"}
                      </p>
                      <Link href={destination.href} className={styles.cityLink}>
                        Decouvrir
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Aucune ville ne correspond a votre recherche.</p>
                {hasActiveFilters ? (
                  <Link href={basePath} className={styles.resetInlineLink}>
                    Reinitialiser les filtres
                  </Link>
                ) : null}
              </div>
            )}
          </section>

          <nav className={styles.pagination} aria-label="Pagination des villes">
            <Link
              href={`${basePath}${buildQueryString({
                page: Math.max(1, safePage - 1),
                q: rawQ,
                region: selectedAdministrativeArea,
                sort,
              })}`}
              aria-disabled={safePage <= 1}
              className={`${styles.paginationButton} ${
                safePage <= 1 ? styles.paginationButtonDisabled : ""
              }`}
            >
              Precedent
            </Link>

            <div className={styles.paginationNumbers}>
              {paginationPages.map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={`${basePath}${buildQueryString({
                    page: pageNumber,
                    q: rawQ,
                    region: selectedAdministrativeArea,
                    sort,
                  })}`}
                  aria-current={pageNumber === safePage ? "page" : undefined}
                  className={`${styles.paginationNumber} ${
                    pageNumber === safePage ? styles.paginationNumberActive : ""
                  }`}
                >
                  {pageNumber}
                </Link>
              ))}
            </div>

            <Link
              href={`${basePath}${buildQueryString({
                page: Math.min(totalPages, safePage + 1),
                q: rawQ,
                region: selectedAdministrativeArea,
                sort,
              })}`}
              aria-disabled={safePage >= totalPages}
              className={`${styles.paginationButton} ${
                safePage >= totalPages ? styles.paginationButtonDisabled : ""
              }`}
            >
              Suivant
            </Link>
          </nav>

          <p className={styles.compactClosingNote}>
            D&apos;autres destinations seront ajoutees progressivement.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
