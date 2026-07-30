import type { MetadataRoute } from "next";
import {
  getCountryCatalogData,
  getPublishedDestinationCountries,
} from "@/services/destinations";

const CANONICAL_ORIGIN = "https://coolguideworld.com";

const STATIC_PATHS = [
  "/",
  "/experience",
  "/contact",
  "/destinations",
  "/le-monde-coolguide",
  "/le-monde-coolguide/gardiens-du-patrimoine",
] as const;

function buildPath(...segments: string[]): string {
  const encodedSegments = segments
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment));

  return `/${encodedSegments.join("/")}`;
}

function toAbsoluteUrl(pathname: string): string {
  if (pathname === "/") {
    return new URL("/", CANONICAL_ORIGIN).toString();
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalized, CANONICAL_ORIGIN).toString();
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function collectDynamicUrls(): Promise<Set<string>> {
  const dynamicUrls = new Set<string>();
  const countries = await getPublishedDestinationCountries();

  for (const country of countries) {
    const countrySlug = safeString(country.slug);

    if (!countrySlug) {
      continue;
    }

    dynamicUrls.add(toAbsoluteUrl(buildPath("destinations", countrySlug)));

    try {
      const firstPage = await getCountryCatalogData({
        countrySlug,
        page: 1,
        q: "",
        administrativeArea: "",
        sort: "az",
      });

      if (!firstPage) {
        continue;
      }

      for (const card of firstPage.cards) {
        const destinationSlug = safeString(card.slug);

        if (destinationSlug) {
          dynamicUrls.add(toAbsoluteUrl(buildPath(destinationSlug)));
        }
      }

      for (let page = 2; page <= firstPage.totalPages; page += 1) {
        const pageData = await getCountryCatalogData({
          countrySlug,
          page,
          q: "",
          administrativeArea: "",
          sort: "az",
        });

        if (!pageData) {
          continue;
        }

        for (const card of pageData.cards) {
          const destinationSlug = safeString(card.slug);

          if (destinationSlug) {
            dynamicUrls.add(toAbsoluteUrl(buildPath(destinationSlug)));
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown country sitemap error";
      console.error(`[sitemap] Failed to build dynamic URLs for country \"${countrySlug}\": ${message}`);
    }
  }

  return dynamicUrls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls = new Set<string>();

  for (const path of STATIC_PATHS) {
    urls.add(toAbsoluteUrl(path));
  }

  try {
    const dynamicUrls = await collectDynamicUrls();

    for (const url of dynamicUrls) {
      urls.add(url);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sitemap error";
    console.error(`[sitemap] Failed to load dynamic routes: ${message}`);
  }

  return Array.from(urls)
    .sort((left, right) => left.localeCompare(right))
    .map((url) => ({ url }));
}
