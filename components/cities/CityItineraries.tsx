import styles from "./city.module.css";
import type { CityItineraryItem } from "@/data/cities/nimes";

type CityItinerariesProps = {
  title: string;
  items: CityItineraryItem[];
};

export default function CityItineraries({ title, items }: CityItinerariesProps) {
  return (
    <section className={styles.section} aria-labelledby="city-itineraries-title">
      <h2 id="city-itineraries-title" className={styles.sectionTitle}>
        {title}
      </h2>

      <div className={styles.itinerariesGrid}>
        {items.map((item) => (
          <article key={item.title} className={styles.itineraryCard}>
            <h3 className={styles.itineraryTitle}>{item.title}</h3>
            <p className={styles.itineraryDuration}>{item.duration}</p>
            <p className={styles.itinerarySummary}>{item.summary}</p>
            <ul className={styles.itineraryStops}>
              {item.stops.map((stop) => (
                <li key={stop}>{stop}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
