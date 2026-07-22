import Image from "next/image";
import styles from "./city.module.css";
import type { CityHighlightItem } from "@/data/cities/nimes";

type CityHighlightsProps = {
  title: string;
  highlights: CityHighlightItem[];
};

export default function CityHighlights({ title, highlights }: CityHighlightsProps) {
  return (
    <section className={styles.section} aria-labelledby="city-highlights-title">
      <h2 id="city-highlights-title" className={styles.sectionTitle}>
        {title}
      </h2>

      <div className={styles.highlightsGrid}>
        {highlights.map((highlight) => (
          <article key={highlight.name} className={styles.highlightCard}>
            <div className={styles.highlightVisual}>
              <Image
                className={styles.highlightImage}
                src={highlight.imageSrc}
                alt={highlight.imageAlt}
                fill
                sizes="(max-width: 560px) 100vw, (max-width: 1100px) 50vw, 33vw"
              />
            </div>

            <div className={styles.highlightBody}>
              <h3 className={styles.highlightName}>{highlight.name}</h3>
              <p className={styles.highlightMeta}>{highlight.category}</p>

              <div className={styles.highlightBottom}>
                <p className={styles.highlightDuration}>{highlight.duration}</p>
                {highlight.hasAudioguide ? <span className={styles.guideBadge}>Audioguide</span> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
