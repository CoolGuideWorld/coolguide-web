import Link from "next/link";
import styles from "@/components/cities/city.module.css";
import circuitStyles from "@/components/circuits/circuit.module.css";
import type { Circuit } from "@/types/circuit";

type CircuitPageProps = {
  circuit: Circuit;
};

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function splitIntoParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

export default function CircuitPage({ circuit }: CircuitPageProps) {
  const introductionParagraphs = splitIntoParagraphs(circuit.content.introduction);

  return (
    <main className={styles.main}>
      <div className={styles.stack}>
        <section className={styles.section} aria-labelledby="circuit-title">
          <div className={styles.introBlock}>
            <p className={styles.heroMeta}>Circuit CoolGuide</p>

            <h1 id="circuit-title" className={styles.sectionTitle}>
              {circuit.content.title}
            </h1>

            {isNonEmptyString(circuit.content.subtitle) ? (
              <p className={styles.introLead}>{circuit.content.subtitle}</p>
            ) : null}

            <span className={styles.guideBadge}>
              Durée estimée: {circuit.content.estimatedDuration}
            </span>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="circuit-journey-title">
          <h2 id="circuit-journey-title" className={styles.sectionTitle}>
            Le voyage
          </h2>

          <div className={styles.introText}>
            {introductionParagraphs.length > 0
              ? introductionParagraphs.map((paragraph) => (
                  <p key={paragraph} className={styles.introParagraph}>
                    {paragraph}
                  </p>
                ))
              : (
                <p className={styles.introParagraph}>{circuit.content.introduction}</p>
              )}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="circuit-steps-title">
          <h2 id="circuit-steps-title" className={styles.sectionTitle}>
            Les étapes du voyage
          </h2>

          <p className={styles.introParagraph}>
            {circuit.destinations.length} étapes à découvrir
          </p>

          <nav aria-label="Frise des étapes du voyage">
            <ol className={circuitStyles.timelineList}>
              {circuit.destinations.map((destination, index) => {
                const isLast = index === circuit.destinations.length - 1;

                return (
                  <li key={`timeline-${destination.id}`} className={circuitStyles.timelineItem}>
                    <div className={circuitStyles.timelineTopRow}>
                      <Link
                        href={`/${destination.slug}`}
                        aria-label={`Étape ${destination.position} : ${destination.title}`}
                        className={circuitStyles.timelinePoint}
                      >
                        {destination.position}
                      </Link>

                      {!isLast ? <span aria-hidden="true" className={circuitStyles.timelineConnector} /> : null}
                    </div>

                    <Link className={styles.appLink} href={`/${destination.slug}`}>
                      {destination.title}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className={styles.itinerariesGrid}>
            {circuit.destinations.map((destination) => (
              <article key={destination.id} className={styles.itineraryCard}>
                <p className={styles.itineraryDuration}>Étape {destination.position}</p>
                <h3 className={styles.itineraryTitle}>{destination.title}</h3>

                {destination.type !== "city" ? (
                  <p className={styles.itinerarySummary}>Type: {destination.type}</p>
                ) : null}

                <Link className={styles.appLink} href={`/${destination.slug}`}>
                  Découvrir cette étape
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
