import styles from "./city.module.css";

type LocalCreatorsSectionProps = {
  cityName: string;
};

export default function LocalCreatorsSection({
  cityName,
}: LocalCreatorsSectionProps) {
  return (
    <section
      className={`${styles.section} ${styles.creatorsSection}`}
      aria-labelledby="city-local-creators-title"
    >
      <div className={styles.introBlock}>
        <h2 id="city-local-creators-title" className={styles.sectionTitle}>
          Ils font vivre {cityName}
        </h2>

        <p className={styles.introParagraph}>
          Photographes, créateurs de contenu et passionnés du territoire :
          découvrez celles et ceux qui partagent au quotidien leur regard sur
          {" "}
          {cityName} et ses environs.
        </p>

        <div className={styles.creatorsEmptyState}>
          <p className={styles.creatorsEmptyLead}>
            De nouveaux regards sur {cityName} arrivent bientôt.
          </p>
          <p className={styles.creatorsSecondaryText}>
            Nous préparons cet espace avec des créateurs et passionnés qui font
            découvrir leur territoire au quotidien.
          </p>
        </div>
      </div>
    </section>
  );
}
