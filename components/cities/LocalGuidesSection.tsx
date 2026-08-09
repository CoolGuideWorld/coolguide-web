import styles from "./city.module.css";

type LocalGuidesSectionProps = {
  cityName: string;
};

export default function LocalGuidesSection({
  cityName,
}: LocalGuidesSectionProps) {
  return (
    <section
      className={`${styles.section} ${styles.guidesSection}`}
      aria-labelledby="city-local-guides-title"
    >
      <div className={styles.introBlock}>
        <h2 id="city-local-guides-title" className={styles.sectionTitle}>
          Découvrir {cityName} avec un guide
        </h2>

        <p className={styles.introParagraph}>
          Vous souhaitez aller plus loin dans votre découverte de {cityName} ?
          Retrouvez ici des guides locaux pour découvrir son histoire, son
          patrimoine et ses lieux emblématiques.
        </p>

        <div className={`${styles.appBlock} ${styles.guidesEmptyState}`}>
          <p className={styles.appText}>
            Nos premiers guides partenaires à {cityName} seront bientôt
            présentés ici.
          </p>
          <p className={styles.guidesSecondaryText}>
            Guides-conférenciers · Visites privées · Expériences locales
          </p>
        </div>
      </div>
    </section>
  );
}
