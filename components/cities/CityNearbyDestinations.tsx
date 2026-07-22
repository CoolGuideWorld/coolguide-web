import Image from "next/image";
import Link from "next/link";
import type { CityNearbyDestinationItem } from "@/data/cities/nimes";
import styles from "./city.module.css";

type CityNearbyDestinationsProps = {
  cityName: string;
  destinations: CityNearbyDestinationItem[];
};

export default function CityNearbyDestinations({
  cityName,
  destinations,
}: CityNearbyDestinationsProps) {
  if (destinations.length === 0) {
    return null;
  }

  const visibleDestinations = destinations.slice(0, 6);

  return (
    <section className={styles.section} aria-labelledby="city-nearby-title">
      <h2 id="city-nearby-title" className={styles.sectionTitle}>
        A decouvrir autour de {cityName}
      </h2>

      <div className={styles.nearbyGrid}>
        {visibleDestinations.map((destination) => (
          <article
            key={destination.slug}
            className={`${styles.nearbyCard} ${
              destination.image ? "" : styles.nearbyCardNoImage
            }`}
          >
            {destination.image ? (
              <div className={styles.nearbyVisual}>
                <Image
                  className={styles.nearbyImage}
                  src={destination.image}
                  alt={`Vue de ${destination.name}`}
                  fill
                  sizes="(max-width: 560px) 100vw, (max-width: 1100px) 50vw, 33vw"
                />
              </div>
            ) : (
              <div className={styles.nearbyVisualSurface} aria-hidden="true" />
            )}

            <div className={styles.nearbyBody}>
              <h3 className={styles.nearbyName}>{destination.name}</h3>

              {destination.administrativeArea ? (
                <p className={styles.nearbyArea}>{destination.administrativeArea}</p>
              ) : null}

              {destination.distance ? (
                <p className={styles.nearbyDistance}>{destination.distance}</p>
              ) : null}

              <Link className={styles.nearbyLink} href={destination.href}>
                Voir la destination
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
