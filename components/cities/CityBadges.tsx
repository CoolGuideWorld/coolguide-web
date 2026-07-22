import styles from "./city.module.css";
import type { CityBadgeItem } from "@/data/cities/nimes";

type CityBadgesProps = {
  badges: CityBadgeItem[];
};

export default function CityBadges({ badges }: CityBadgesProps) {
  return (
    <section className={styles.section} aria-label="Caracteristiques de la destination">
      <div className={styles.badgeList}>
        {badges.map((badge) => (
          <span key={badge.label} className={styles.badgeItem}>
            <span className={styles.badgeEmoji} aria-hidden="true">
              {badge.emoji}
            </span>
            <span>{badge.label}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
