import type { CityInsightItem } from "@/types/city";
import styles from "./city.module.css";

type DestinationInsightsProps = {
  cityName: string;
  items: CityInsightItem[];
};

export default function DestinationInsights({
  cityName,
  items,
}: DestinationInsightsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className={`${styles.section} ${styles.insightsSection}`}
      aria-labelledby="destination-insights-title"
    >
      <h2
        id="destination-insights-title"
        className={`${styles.sectionTitle} ${styles.insightsSectionTitle}`}
      >
        À savoir sur {cityName}
      </h2>

      <div className={styles.insightsGrid}>
        {items.map((item, index) => (
          <article key={`${item.title}-${index}`} className={styles.insightCard}>
            <h3 className={styles.insightTitle}>{item.title}</h3>
            <p className={styles.insightText}>{item.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
