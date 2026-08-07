import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "@/components/cities/city.module.css";
import pageStyles from "./page.module.css";

export const metadata: Metadata = {
  title: "Explorer la France avec CoolGuide",
  description: "Choisissez votre façon de découvrir les plus beaux lieux de France.",
  alternates: {
    canonical: "/france",
  },
};

export default function FrancePage() {
  return (
    <>
      <SiteHeader initialSolid />

      <main className={`${styles.main} ${pageStyles.pageMain}`}>
        <section
          className={pageStyles.explorationSection}
          aria-labelledby="france-exploration-title"
        >
          <div className={pageStyles.heroInner}>
            <h1 id="france-exploration-title" className={`${styles.sectionTitle} ${pageStyles.heroTitle}`}>
              Explorer la France avec CoolGuide
            </h1>
            <p className={`${styles.introLead} ${pageStyles.heroLead}`}>
              Choisissez votre façon de découvrir les plus beaux lieux de France.
            </p>
          </div>

          <div className={pageStyles.cardsGrid}>
            <Link
              href="/circuits/france"
              className={pageStyles.choiceCard}
              aria-label="Explorer les circuits"
            >
              <div className={pageStyles.choiceMedia}>
                <Image
                  src="/heroes/france-circuits-hero-v2.webp"
                  alt="Vue illustrée pour explorer les circuits de France"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className={pageStyles.choiceImage}
                  priority
                />
                <div className={pageStyles.choiceOverlay} />
                <span className={pageStyles.choiceButton}>Explorer les circuits</span>
              </div>

              <div className={pageStyles.choiceCardBody}>
                <h3 className={pageStyles.choiceTitle}>Découvrez les circuits et parcours de France</h3>
                <p className={pageStyles.choiceText}>
                  Road trips, escapades et itinéraires pour explorer les plus beaux territoires de France.
                </p>
                <p className={pageStyles.choiceMeta}>Routes • Road trips • Escapades</p>
              </div>
            </Link>

            <Link
              href="/destinations/france"
              className={pageStyles.choiceCard}
              aria-label="Explorer les destinations"
            >
              <div className={pageStyles.choiceMedia}>
                <Image
                  src="/heroes/france-destinations-hero.webp"
                  alt="Vue illustrée pour explorer les destinations de France"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className={pageStyles.choiceImage}
                />
                <div className={pageStyles.choiceOverlay} />
                <span className={pageStyles.choiceButton}>Explorer les destinations</span>
              </div>

              <div className={pageStyles.choiceCardBody}>
                <h3 className={pageStyles.choiceTitle}>Découvrez les villes et lieux incontournables</h3>
                <p className={pageStyles.choiceText}>
                  Explorez les villes, villages, monuments et sites emblématiques de France.
                </p>
                <p className={pageStyles.choiceMeta}>Villes • Villages • Monuments</p>
              </div>
            </Link>
          </div>
        </section>
        <section
          className={pageStyles.signatureBand}
          aria-labelledby="france-signature-title"
        >
          <div className={pageStyles.signatureInner}>
            <h2 id="france-signature-title" className={pageStyles.signatureTitle}>
              Explorer la France autrement
            </h2>
            <p className={pageStyles.signatureText}>
              Découvrez des circuits thématiques et des destinations sélectionnées pour vivre les plus belles expériences.
            </p>
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

      <SiteFooter />
    </>
  );
}
