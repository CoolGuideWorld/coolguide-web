import Image from "next/image";
import Link from "next/link";
import styles from "@/components/cities/city.module.css";
import pageStyles from "@/app/france/page.module.css";

type CountryHubCard = {
  href: string;
  ariaLabel: string;
  imageSrc: string;
  imageAlt: string;
  buttonLabel: string;
  title: string;
  text: string;
  meta: string;
  priority?: boolean;
};

type CountryHubTemplateProps = {
  title: string;
  lead: string;
  destinationsCard: CountryHubCard | null;
  circuitsCard: CountryHubCard | null;
  signatureTitle: string;
  signatureText: string;
};

export default function CountryHubTemplate({
  title,
  lead,
  destinationsCard,
  circuitsCard,
  signatureTitle,
  signatureText,
}: CountryHubTemplateProps) {
  return (
    <main className={`${styles.main} ${pageStyles.pageMain}`}>
      <section
        className={pageStyles.explorationSection}
        aria-labelledby="country-exploration-title"
      >
        <div className={pageStyles.heroInner}>
          <h1 id="country-exploration-title" className={`${styles.sectionTitle} ${pageStyles.heroTitle}`}>
            {title}
          </h1>
          <p className={`${styles.introLead} ${pageStyles.heroLead}`}>{lead}</p>
        </div>

        <div className={pageStyles.cardsGrid}>
          {circuitsCard ? (
            <Link
              href={circuitsCard.href}
              className={pageStyles.choiceCard}
              aria-label={circuitsCard.ariaLabel}
            >
              <div className={pageStyles.choiceMedia}>
                <Image
                  src={circuitsCard.imageSrc}
                  alt={circuitsCard.imageAlt}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className={pageStyles.choiceImage}
                  priority={circuitsCard.priority}
                />
                <div className={pageStyles.choiceOverlay} />
                <span className={pageStyles.choiceButton}>{circuitsCard.buttonLabel}</span>
              </div>

              <div className={pageStyles.choiceCardBody}>
                <h3 className={pageStyles.choiceTitle}>{circuitsCard.title}</h3>
                <p className={pageStyles.choiceText}>{circuitsCard.text}</p>
                <p className={pageStyles.choiceMeta}>{circuitsCard.meta}</p>
              </div>
            </Link>
          ) : null}

          {destinationsCard ? (
            <Link
              href={destinationsCard.href}
              className={pageStyles.choiceCard}
              aria-label={destinationsCard.ariaLabel}
            >
              <div className={pageStyles.choiceMedia}>
                <Image
                  src={destinationsCard.imageSrc}
                  alt={destinationsCard.imageAlt}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className={pageStyles.choiceImage}
                  priority={destinationsCard.priority}
                />
                <div className={pageStyles.choiceOverlay} />
                <span className={pageStyles.choiceButton}>{destinationsCard.buttonLabel}</span>
              </div>

              <div className={pageStyles.choiceCardBody}>
                <h3 className={pageStyles.choiceTitle}>{destinationsCard.title}</h3>
                <p className={pageStyles.choiceText}>{destinationsCard.text}</p>
                <p className={pageStyles.choiceMeta}>{destinationsCard.meta}</p>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <section className={pageStyles.signatureBand} aria-labelledby="country-signature-title">
        <div className={pageStyles.signatureInner}>
          <h2 id="country-signature-title" className={pageStyles.signatureTitle}>
            {signatureTitle}
          </h2>
          <p className={pageStyles.signatureText}>{signatureText}</p>
          <Link
            href="/#download"
            className={`siteNavButton ${pageStyles.signatureButton}`}
            aria-label="Télécharger l'application"
          >
            Télécharger l&apos;application
          </Link>
        </div>
      </section>
    </main>
  );
}