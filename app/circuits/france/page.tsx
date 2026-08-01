import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCountryCircuits } from "@/services/circuits/getCountryCircuits";
import pageStyles from "./page.module.css";

export const revalidate = 3600;

const COUNTRY_SLUG = "france";
const HERO_IMAGE = "/heroes/france-circuits-hero-v2.webp";
// Temporary fallback until circuit_images architecture is available in catalog data.
const CIRCUIT_FALLBACK_IMAGE = "/heroes/france-destinations-hero.webp";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Les plus beaux circuits de France",
    description:
      "Découvrez les plus beaux circuits, road trips et itinéraires culturels de France avec CoolGuide.",
    alternates: {
      canonical: "/circuits/france",
    },
  };
}

export default async function FranceCircuitsPage() {
  const circuits = (await getCountryCircuits(COUNTRY_SLUG)) ?? [];
  const featuredCircuits = circuits.slice(0, 4);

  return (
    <>
      <SiteHeader initialSolid />

      <main className={pageStyles.pageMain}>
        <section className={pageStyles.heroSection} aria-labelledby="country-circuits-hero-title">
          <div className={pageStyles.sectionInner}>
            <div className={pageStyles.heroPanel}>
              <div className={pageStyles.heroMedia}>
                <Image
                  src={HERO_IMAGE}
                  alt="Paysages de France pour inspirer votre prochain circuit"
                  fill
                  priority
                  quality={90}
                  sizes="(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1440px"
                  className={pageStyles.heroImage}
                />
                <div className={pageStyles.heroOverlay} />
              </div>

              <div className={pageStyles.heroContent}>
                <h1 id="country-circuits-hero-title" className={pageStyles.heroTitle}>
                  Les plus beaux circuits de France
                </h1>
                <p className={pageStyles.heroSubtitle}>
                  Découvrez des itinéraires conçus pour explorer les paysages, les villes et le patrimoine français.
                </p>
                <p className={pageStyles.heroMeta}>Road trips • Circuits culturels • Escapades</p>
                <a href="#circuits-disponibles" className={pageStyles.heroAnchorLink}>
                  Découvrir les circuits
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={pageStyles.featuredSection} aria-labelledby="featured-circuits-title">
          <div className={pageStyles.sectionInner}>
            <div className={pageStyles.sectionIntro}>
              <h2 id="featured-circuits-title" className={pageStyles.sectionTitle}>
                Les incontournables
              </h2>
              <p className={pageStyles.sectionLead}>
                Les plus belles expériences pour commencer votre découverte de la France.
              </p>
            </div>

            <div className={pageStyles.circuitsGrid}>
              {featuredCircuits.map((circuit) => (
                <Link
                  key={`featured-${circuit.slug}`}
                  href={`/circuits/${circuit.slug}`}
                  className={pageStyles.circuitCard}
                  aria-label={`Ouvrir le circuit ${circuit.title}`}
                >
                  <div className={pageStyles.cardMedia}>
                    <Image
                      src={CIRCUIT_FALLBACK_IMAGE}
                      alt={`Illustration du circuit ${circuit.title}`}
                      fill
                      sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
                      className={pageStyles.cardImage}
                    />
                  </div>

                  <div className={pageStyles.cardBody}>
                    <h3 className={pageStyles.cardTitle}>{circuit.title}</h3>
                    <p className={pageStyles.cardSubtitle}>{circuit.subtitle}</p>
                    <p className={pageStyles.cardMeta}>
                      {circuit.destination_count} étape
                      {circuit.destination_count > 1 ? "s" : ""} • {circuit.estimated_duration}
                    </p>
                  </div>

                  <p className={pageStyles.cardLinkLabel}>Découvrir le circuit →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="circuits-disponibles" className={pageStyles.circuitsSection}>
          <div className={pageStyles.sectionInner}>
            <div className={pageStyles.sectionIntro}>
              <h2 className={pageStyles.sectionTitle}>Toutes les escapades</h2>
              <p className={pageStyles.sectionLead}>
                Explorez tous nos itinéraires classés par région, durée et thème.
              </p>
            </div>

            {circuits.length > 0 ? (
              <div className={pageStyles.circuitsGrid}>
                {circuits.map((circuit) => (
                  <Link
                    key={circuit.slug}
                    href={`/circuits/${circuit.slug}`}
                    className={pageStyles.circuitCard}
                    aria-label={`Ouvrir le circuit ${circuit.title}`}
                  >
                    <div className={pageStyles.cardMedia}>
                      <Image
                        src={CIRCUIT_FALLBACK_IMAGE}
                        alt={`Illustration du circuit ${circuit.title}`}
                        fill
                        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                        className={pageStyles.cardImage}
                      />
                    </div>

                    <div className={pageStyles.cardBody}>
                      <h3 className={pageStyles.cardTitle}>{circuit.title}</h3>
                      <p className={pageStyles.cardSubtitle}>{circuit.subtitle}</p>
                      <p className={pageStyles.cardMeta}>
                        {circuit.destination_count} étape
                        {circuit.destination_count > 1 ? "s" : ""} • {circuit.estimated_duration}
                      </p>
                    </div>

                    <p className={pageStyles.cardLinkLabel}>Découvrir le circuit →</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={pageStyles.emptyState}>
                <p className={pageStyles.emptyStateText}>Aucun circuit n&apos;est disponible pour le moment.</p>
              </div>
            )}
          </div>
        </section>

        <section className={pageStyles.inspirationSection} aria-labelledby="france-inspiration-title">
          <div className={pageStyles.sectionInner}>
            <div className={pageStyles.sectionIntro}>
              <h2 id="france-inspiration-title" className={pageStyles.sectionTitle}>
                Explorer par thème
              </h2>
              <p className={pageStyles.sectionLead}>Choisissez l’ambiance de votre prochain voyage.</p>
            </div>

            {/* Cette section éditoriale sera reliée ultérieurement aux tags des circuits. */}
            <div className={pageStyles.editorialGrid}>
              <article className={pageStyles.editorialCard}>
                <h3 className={pageStyles.editorialTitle}>Patrimoine et histoire</h3>
                <p className={pageStyles.editorialText}>Monuments, grandes civilisations et lieux emblématiques.</p>
              </article>

              <article className={pageStyles.editorialCard}>
                <h3 className={pageStyles.editorialTitle}>Gastronomie et terroirs</h3>
                <p className={pageStyles.editorialText}>Routes gourmandes, terroirs vivants et traditions locales.</p>
              </article>

              <article className={pageStyles.editorialCard}>
                <h3 className={pageStyles.editorialTitle}>Nature et paysages</h3>
                <p className={pageStyles.editorialText}>Montagnes, littoraux et grands espaces à découvrir.</p>
              </article>

              <article className={pageStyles.editorialCard}>
                <h3 className={pageStyles.editorialTitle}>Villages et escapades</h3>
                <p className={pageStyles.editorialText}>Villages de caractère et parenthèse hors des sentiers battus.</p>
              </article>

              <article className={pageStyles.editorialCard}>
                <h3 className={pageStyles.editorialTitle}>Road trips</h3>
                <p className={pageStyles.editorialText}>Grandes routes panoramiques et itinéraires au long cours.</p>
              </article>

              <article className={pageStyles.editorialCard}>
                <h3 className={pageStyles.editorialTitle}>Famille</h3>
                <p className={pageStyles.editorialText}>Parcours accessibles et découvertes ludiques à partager.</p>
              </article>
            </div>
          </div>
        </section>

        <section className={pageStyles.finalCtaSection} aria-labelledby="france-circuits-download-title">
          <div className={pageStyles.sectionInner}>
            <div className={pageStyles.finalCtaCard}>
              <h2 id="france-circuits-download-title" className={pageStyles.finalCtaTitle}>
                Préparez votre voyage avec CoolGuide
              </h2>
              <p className={pageStyles.finalCtaText}>
                Retrouvez les histoires audio et la navigation GPS directement dans l&apos;application.
              </p>
              <Link href="/#download" className={`siteNavButton ${pageStyles.finalCtaButton}`}>
                Télécharger l&apos;application
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
