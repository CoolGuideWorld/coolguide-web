import styles from "./city.module.css";
import type { CityStatItem } from "@/data/cities/nimes";

type CityStatsProps = {
  title: string;
  stats: CityStatItem[];
};

export default function CityStats({ title, stats }: CityStatsProps) {
  return (
    <section className={styles.section} aria-labelledby="city-stats-title">
      <h2 id="city-stats-title" className={styles.sectionTitle}>
        {title}
      </h2>

      <div className={styles.statsGrid}>
        {stats.map((item) => (
          <article key={item.key} className={styles.statCard}>
            <p className={styles.statLabel}>{item.label}</p>
            <p className={styles.statValue}>{item.value}</p>
            {item.detail ? <p className={styles.statDetail}>{item.detail}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
