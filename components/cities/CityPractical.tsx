import styles from "./city.module.css";
import type { CityPracticalItem } from "@/data/cities/nimes";

type CityPracticalProps = {
  title: string;
  items: CityPracticalItem[];
};

export default function CityPractical({ title, items }: CityPracticalProps) {
  return (
    <section className={styles.section} aria-labelledby="city-practical-title">
      <h2 id="city-practical-title" className={styles.sectionTitle}>
        {title}
      </h2>

      <div className={styles.practicalGrid}>
        {items.map((item) => (
          <article key={item.title} className={styles.practicalCard}>
            <h3 className={styles.practicalTitle}>{item.title}</h3>
            <p className={styles.practicalText}>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
