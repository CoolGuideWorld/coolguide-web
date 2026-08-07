import Image from "next/image";
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
          {isNonEmptyString(circuit.heroImage?.imageUrl) ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                minHeight: "clamp(280px, 28vw, 360px)",
                display: "grid",
                alignItems: "end",
                overflow: "hidden",
                borderRadius: "24px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                }}
              >
                <Image
                  src={circuit.heroImage.imageUrl}
                  alt={circuit.heroImage.altText || circuit.content.title}
                  width={1536}
                  height={1024}
                  priority
                  sizes="100vw"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: circuit.heroImage.displayMode === "contain" ? "contain" : "cover",
                    objectPosition: circuit.heroImage.focalPosition || "center",
                  }}
                />
              </div>

              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(12, 18, 28, 0.1) 0%, rgba(12, 18, 28, 0.58) 100%)",
                }}
              />

              <div
                className={styles.introBlock}
                style={{
                  position: "relative",
                  zIndex: 1,
                  color: "#ffffff",
                  padding:
                    "clamp(1rem, 2.7vw, 1.9rem) clamp(1.2rem, 3.2vw, 2.4rem) clamp(1.7rem, 4vw, 2.8rem)",
                  display: "grid",
                  gap: "clamp(0.55rem, 1.2vw, 0.85rem)",
                  maxWidth: "min(100%, 780px)",
                  textAlign: "left",
                  margin: 0,
                }}
              >
                <p
                  className={styles.heroMeta}
                  style={{
                    margin: 0,
                    fontSize: "clamp(0.92rem, 1vw, 1.02rem)",
                    color: "rgba(255, 255, 255, 0.9)",
                    letterSpacing: "0.03em",
                  }}
                >
                  Circuit CoolGuide
                </p>

                <h1
                  id="circuit-title"
                  className={styles.sectionTitle}
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "clamp(3rem, 3.8vw, 3.5rem)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "normal",
                  }}
                >
                  {circuit.content.title}
                </h1>

                {isNonEmptyString(circuit.content.subtitle) ? (
                  <p
                    className={styles.introLead}
                    style={{
                      margin: 0,
                      fontSize: "clamp(1rem, 1.45vw, 1.2rem)",
                      lineHeight: 1.55,
                      color: "rgba(255, 255, 255, 0.97)",
                    }}
                  >
                    {circuit.content.subtitle}
                  </p>
                ) : null}

                <span
                  className={styles.guideBadge}
                  style={{
                    color: "#ffffff",
                    backgroundColor: "rgba(255, 255, 255, 0.14)",
                    border: "1px solid rgba(255, 255, 255, 0.26)",
                    borderRadius: "999px",
                    padding: "0.35rem 0.72rem",
                    fontSize: "clamp(0.78rem, 0.88vw, 0.9rem)",
                    fontWeight: 500,
                    lineHeight: 1.2,
                    letterSpacing: "0.01em",
                    width: "fit-content",
                    boxShadow: "none",
                  }}
                >
                  Durée : {circuit.content.estimatedDuration}
                </span>
              </div>
            </div>
          ) : null}

          {!isNonEmptyString(circuit.heroImage?.imageUrl) ? (
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
          ) : null}
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
