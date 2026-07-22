import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import DestinationsSearchClient from "./DestinationsSearchClient";
import styles from "./destinations.module.css";

export const metadata: Metadata = {
  title: "Destinations | CoolGuideWorld",
  description: "Explorez les pays et les destinations où CoolGuide est disponible.",
};

export default function DestinationsPage() {
  return (
    <>
      <SiteHeader initialSolid />

      <main className={styles.page}>
        <section className={styles.container}>
          <p className={styles.kicker}>
            LE MONDE COOLGUIDE
          </p>

          <h1 className={styles.title}>
            Explorez le monde.
          </h1>

          <p className={styles.intro}>
            Entrez dans une lecture sensible du monde. Chaque point lumineux represente
            un pays ou CoolGuide est deja disponible.
          </p>

          <DestinationsSearchClient />

          <p className={styles.caption}>
            Chaque lumiere represente un pays ou CoolGuide est disponible. La lumiere
            de la France est deja active. D'autres commencements suivront.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
