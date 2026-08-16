import MetricCard from "@/components/studio/MetricCard";
import styles from "../studio.module.css";

export default function StudioHomePage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Tableau de bord</h1>
        <p className={styles.pageDescription}>
          Vue d&apos;ensemble de l&apos;activité Studio et des modules à suivre.
        </p>
      </header>

      <section className={styles.panel} aria-label="Vue d'ensemble">
        <h2 className={styles.panelTitle}>Vue d&apos;ensemble</h2>
        <div className={styles.metricGrid}>
          <MetricCard label="Destinations" value="Connexion des données à venir" />
          <MetricCard label="Circuits" value="Connexion des données à venir" />
          <MetricCard label="Brain" value="Connexion des données à venir" />
          <MetricCard label="Production" value="Connexion des données à venir" />
        </div>
      </section>

      <section className={styles.panel} aria-label="Priorités">
        <h2 className={styles.panelTitle}>Priorités</h2>
        <p className={styles.emptyMessage}>Les priorités de production apparaîtront ici.</p>
      </section>

      <section className={styles.panel} aria-label="Activité récente">
        <h2 className={styles.panelTitle}>Activité récente</h2>
        <p className={styles.emptyMessage}>Les dernières activités du Brain apparaîtront ici.</p>
      </section>
    </>
  );
}
