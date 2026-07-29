import styles from "./city.module.css";

type CityIntroductionProps = {
  shortDescription?: string | null;
  introduction?: string | null;
};

function normalizeText(value: string): string {
  return value.trim();
}

function splitIntoParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/g)
    .map(normalizeText)
    .filter((paragraph) => paragraph.length > 0);
}

export default function CityIntroduction({
  shortDescription,
  introduction,
}: CityIntroductionProps) {
  const hasShortDescription = typeof shortDescription === "string" && shortDescription.trim().length > 0;
  const hasIntroduction = typeof introduction === "string" && introduction.trim().length > 0;

  if (!hasShortDescription && !hasIntroduction) {
    return null;
  }

  return (
    <section className={styles.section} aria-label="Introduction de la destination">
      <div className={styles.introBlock}>
        {hasShortDescription ? (
          <p className={styles.introLead}>{normalizeText(shortDescription)}</p>
        ) : null}

        {hasIntroduction ? (
          <div className={styles.introText}>
            {splitIntoParagraphs(introduction).map((paragraph) => (
              <p key={paragraph} className={styles.introParagraph}>
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}