import StudioDestinationsMapClient from "@/components/studio/StudioDestinationsMapClient";
import { readStudioDestinationNetworkData } from "@/services/destinations/getDestinationNetworkMap";
import styles from "@/app/studio/studio.module.css";

export default async function StudioDestinationsPage() {
  const { markers, routeCandidateCities } = await readStudioDestinationNetworkData();

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Destinations</h1>
        <p className={styles.pageDescription}>
          Vue géographique du réseau CoolGuide et des opportunités d’expansion.
        </p>
      </header>

      <section className={styles.panel} aria-label="Carte du réseau CoolGuide">
        <h2 className={styles.panelTitle}>Carte du réseau CoolGuide</h2>
        <StudioDestinationsMapClient markers={markers} routeCandidateCities={routeCandidateCities} />
      </section>
    </>
  );
}
