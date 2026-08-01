import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "@/components/cities/city.module.css";
import pageStyles from "./page.module.css";

export const metadata: Metadata = {
  title: "Explorer la France | CoolGuide World",
  description:
    "Découvrez les circuits, villes et lieux incontournables de France avec CoolGuide.",
  alternates: {
    canonical: "/france",
  },
};

export default function FrancePage() {
  return (
    <>
      <SiteHeader initialSolid />

      <main className={styles.main}>
        <div className={styles.stack}>
          <section className={styles.section} aria-labelledby="france-hero-title">
            <div className={styles.introBlock}>
              <h1 id="france-hero-title" className={styles.sectionTitle}>
                Explorer la France
              </h1>
              <p className={styles.introLead}>
                Découvrez les circuits et destinations de France avec CoolGuide.
              </p>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="france-orientation-title">
            <h2 id="france-orientation-title" className={styles.sectionTitle}>
              Choisissez votre exploration
            </h2>

            <div className={pageStyles.cardsGrid}>
              <Link
                href="/circuits/france"
                className={`${styles.itineraryCard} ${pageStyles.choiceCard}`}
                aria-label="Explorer les circuits"
              >
                <div className={pageStyles.choiceCardInner}>
                  <p className={pageStyles.choiceLabel}>CIRCUITS</p>
                  <h3 className={styles.itineraryTitle}>Explorer les circuits</h3>
                  <p className={styles.itinerarySummary}>
                    Découvrez les circuits et parcours de France
                  </p>
                  <p className={pageStyles.choiceMeta}>Routes • Road trips • Escapades</p>
                </div>

                <span className={pageStyles.choiceArrow} aria-hidden="true">
                  →
                </span>
              </Link>

              <Link
                href="/destinations/france"
                className={`${styles.itineraryCard} ${pageStyles.choiceCard}`}
                aria-label="Explorer les destinations"
              >
                <div className={pageStyles.choiceCardInner}>
                  <p className={pageStyles.choiceLabel}>DESTINATIONS</p>
                  <h3 className={styles.itineraryTitle}>Explorer les destinations</h3>
                  <p className={styles.itinerarySummary}>
                    Découvrez les villes et lieux incontournables de France
                  </p>
                  <p className={pageStyles.choiceMeta}>Villes • Villages • Monuments</p>
                </div>

                <span className={pageStyles.choiceArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
