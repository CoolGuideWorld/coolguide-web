import styles from "./city.module.css";
import type { CityItineraryItem } from "@/types/city";

type CityItinerariesProps = {
  title: string;
  items: CityItineraryItem[];
};

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getContentLines(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

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
            {normalizeText(item.content).length > 0 &&
            normalizeText(item.content) !== normalizeText(item.summary) ? (
              <ul className={styles.itineraryStops}>
                {getContentLines(item.content).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
