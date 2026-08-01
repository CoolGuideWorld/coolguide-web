import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCountryCircuits } from "@/services/circuits/getCountryCircuits";
import styles from "@/components/cities/city.module.css";
import pageStyles from "./page.module.css";

export const revalidate = 3600;

const COUNTRY_SLUG = "france";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Les circuits de France",
    description: "Découvrez les circuits et itinéraires de France avec CoolGuide.",
    alternates: {
      canonical: "/circuits/france",
    },
  };
}

export default async function FranceCircuitsPage() {
  const circuits = (await getCountryCircuits(COUNTRY_SLUG)) ?? [];

  return (
    <>
      <SiteHeader initialSolid />

      <main className={styles.main}>
        <div className={styles.stack}>
          <section className={styles.section} aria-labelledby="country-circuits-hero-title">
            <div className={styles.introBlock}>
              <h1 id="country-circuits-hero-title" className={styles.sectionTitle}>
                Les circuits de France
              </h1>
              <p className={styles.introLead}>
                Découvrez les plus beaux itinéraires à explorer avec CoolGuide.
              </p>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="country-circuits-list-title">
            <h2 id="country-circuits-list-title" className={styles.sectionTitle}>
              Tous les circuits
            </h2>

            {circuits.length > 0 ? (
              <div className={`${styles.itinerariesGrid} ${pageStyles.circuitsGrid}`}>
                {circuits.map((circuit) => (
                  <Link
                    key={circuit.slug}
                    href={`/circuits/${circuit.slug}`}
                    className={`${styles.itineraryCard} ${pageStyles.circuitCard}`}
                    aria-label={`Ouvrir le circuit ${circuit.title}`}
                  >
                    <div className={pageStyles.circuitCardInner}>
                      <h3 className={styles.itineraryTitle}>{circuit.title}</h3>
                      {circuit.subtitle ? (
                        <p className={styles.itinerarySummary}>{circuit.subtitle}</p>
                      ) : null}
                      <p className={styles.itinerarySummary}>
                        {circuit.destination_count} étape
                        {circuit.destination_count > 1 ? "s" : ""} • {circuit.estimated_duration}
                      </p>
                    </div>

                    <span className={pageStyles.circuitArrow} aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={styles.introLead}>Aucun circuit disponible pour le moment.</p>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
