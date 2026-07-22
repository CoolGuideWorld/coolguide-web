"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImmersiveGlobeExperience, {
  type ImmersiveGlobeExperienceHandle,
} from "@/components/destinations/ImmersiveGlobeExperience";
import {
  findAvailableCountryByQuery,
  type AvailableCountry,
} from "@/components/destinations/availableCountries";
import styles from "./destinations.module.css";

const SEARCH_ERROR_MESSAGE = "Cette destination n'est pas encore disponible.";

export default function DestinationsSearchClient() {
  const router = useRouter();
  const globeRef = useRef<ImmersiveGlobeExperienceHandle | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<AvailableCountry | null>(null);
  const [isFocusingCountry, setIsFocusingCountry] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastValidatedCountry, setLastValidatedCountry] = useState<AvailableCountry | null>(null);

  const searchErrorId = "destinations-search-error";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const matchedCountry = findAvailableCountryByQuery(searchQuery);

    if (!matchedCountry) {
      setSearchError(SEARCH_ERROR_MESSAGE);
      return;
    }

    setSearchError(null);

    const isSameCountryAsSelected = selectedCountry?.slug === matchedCountry.slug;
    const isSameCountryAsLastValidated = lastValidatedCountry?.slug === matchedCountry.slug;

    if (
      isSameCountryAsSelected &&
      isSameCountryAsLastValidated &&
      !isFocusingCountry
    ) {
      router.push(`/destinations/${matchedCountry.slug}`);
      return;
    }

    setSelectedCountry(matchedCountry);
    setLastValidatedCountry(matchedCountry);
    globeRef.current?.focusCountry(matchedCountry);
  };

  return (
    <>
      <form className={styles.searchBlock} onSubmit={handleSubmit} noValidate>
        <label htmlFor="destinations-search" className={styles.searchLabel}>
          Rechercher une destination
        </label>

        <input
          id="destinations-search"
          name="destinations-search"
          type="search"
          placeholder="Rechercher une destination..."
          aria-label="Rechercher une destination"
          aria-invalid={Boolean(searchError)}
          aria-describedby={searchError ? searchErrorId : undefined}
          autoComplete="off"
          className={styles.searchInput}
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            if (searchError) {
              setSearchError(null);
            }
          }}
        />

        <p
          id={searchErrorId}
          role="status"
          aria-live="polite"
          className={styles.searchError}
        >
          {searchError ?? ""}
        </p>
      </form>

      <ImmersiveGlobeExperience
        ref={globeRef}
        activeCountry={selectedCountry}
        onFocusStateChange={setIsFocusingCountry}
      />
    </>
  );
}
