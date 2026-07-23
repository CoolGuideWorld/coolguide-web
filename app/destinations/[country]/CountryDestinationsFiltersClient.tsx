"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import styles from "./country.module.css";

type CountryDestinationsFiltersClientProps = {
  initialQ: string;
  initialAdministrativeArea: string;
  initialSort: "az" | "za";
  administrativeAreas: string[];
  basePath: string;
};

export default function CountryDestinationsFiltersClient({
  initialQ,
  initialAdministrativeArea,
  initialSort,
  administrativeAreas,
  basePath,
}: CountryDestinationsFiltersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [administrativeArea, setAdministrativeArea] = useState(initialAdministrativeArea);
  const [sort, setSort] = useState<"az" | "za">(initialSort);

  useEffect(() => {
    setQ(initialQ);
    setAdministrativeArea(initialAdministrativeArea);
    setSort(initialSort);
  }, [initialAdministrativeArea, initialQ, initialSort]);

  const pushFilters = useCallback(
    (nextQ: string, nextAdministrativeArea: string, nextSort: "az" | "za") => {
      const params = new URLSearchParams(searchParams.toString());

      const trimmedQ = nextQ.trim();

      if (trimmedQ) {
        params.set("q", trimmedQ);
      } else {
        params.delete("q");
      }

      if (nextAdministrativeArea) {
        params.set("region", nextAdministrativeArea);
      } else {
        params.delete("region");
      }

      if (nextSort !== "az") {
        params.set("sort", nextSort);
      } else {
        params.delete("sort");
      }

      params.delete("page");

      const queryString = params.toString();
      const href = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const handleQChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextQ = event.target.value;
      setQ(nextQ);
      pushFilters(nextQ, administrativeArea, sort);
    },
    [administrativeArea, pushFilters, sort]
  );

  const handleAdministrativeAreaChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextAdministrativeArea = event.target.value;
      setAdministrativeArea(nextAdministrativeArea);
      pushFilters(q, nextAdministrativeArea, sort);
    },
    [pushFilters, q, sort]
  );

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextSort = event.target.value === "za" ? "za" : "az";
      setSort(nextSort);
      pushFilters(q, administrativeArea, nextSort);
    },
    [administrativeArea, pushFilters, q]
  );

  const hasActiveFilters = Boolean(q.trim()) || Boolean(administrativeArea) || sort !== "az";

  return (
    <form
      className={styles.controlsBar}
      onSubmit={(event) => {
        event.preventDefault();
      }}
      aria-busy={isPending}
    >
      <div className={styles.controlFieldWide}>
        <label htmlFor="country-q" className={styles.controlLabel}>
          Rechercher une ville
        </label>
        <input
          id="country-q"
          name="q"
          type="search"
          value={q}
          onChange={handleQChange}
          placeholder="Rechercher une ville"
          autoComplete="off"
          className={styles.input}
        />
      </div>

      <div className={styles.controlField}>
        <label htmlFor="country-region" className={styles.controlLabel}>
          Region
        </label>
        <select
          id="country-region"
          name="region"
          value={administrativeArea}
          onChange={handleAdministrativeAreaChange}
          className={styles.select}
        >
          <option value="">Toutes les regions</option>
          {administrativeAreas.map((areaName) => (
            <option key={areaName} value={areaName}>
              {areaName}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.controlField}>
        <label htmlFor="country-sort" className={styles.controlLabel}>
          Tri
        </label>
        <select
          id="country-sort"
          name="sort"
          value={sort}
          onChange={handleSortChange}
          className={styles.select}
        >
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
      </div>

      {hasActiveFilters ? (
        <Link href={basePath} className={styles.resetButton}>
          Reinitialiser
        </Link>
      ) : null}
    </form>
  );
}
