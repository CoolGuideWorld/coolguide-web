import MetricCard from "@/components/studio/MetricCard";
import StudioBrainCoverage from "@/components/studio/StudioBrainCoverage";
import { readBrainCoverageData } from "@/lib/studio/brainCoverage";
import styles from "../../studio.module.css";

const numberFormatter = new Intl.NumberFormat("fr-FR");

function formatMetric(value: number | null): string {
  if (typeof value !== "number") {
    return "Indisponible";
  }

  return numberFormatter.format(value);
}

export default async function StudioBrainPage() {
  const { data, error } = await readBrainCoverageData();
  const kpiKnown = data?.kpis.known ?? null;
  const kpiComplete = data?.kpis.complete ?? null;
  const kpiPartial = data?.kpis.partial ?? null;
  const kpiEmpty = data?.kpis.empty ?? null;

  return (
    <div className={styles.dashboardStack}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Brain</h1>
        <p className={styles.pageDescription}>
          Couverture de connaissances des villes et destinations connues par le Brain.
        </p>
      </header>

      <section className={`${styles.panel} ${styles.dashboardPanel}`} aria-label="Synthèse Brain">
        <h2 className={styles.panelTitle}>Synthèse</h2>
        <div className={`${styles.metricGrid} ${styles.dashboardMetricGrid}`}>
          <MetricCard
            label="Connues"
            value={formatMetric(kpiKnown)}
            note={error ? "Lecture indisponible" : undefined}
            compact
          />
          <MetricCard
            label="Complètes"
            value={formatMetric(kpiComplete)}
            tone="positive"
            note={error ? "Lecture indisponible" : undefined}
            compact
          />
          <MetricCard
            label="Partielles"
            value={formatMetric(kpiPartial)}
            note={error ? "Lecture indisponible" : undefined}
            compact
          />
          <MetricCard
            label="Vides"
            value={formatMetric(kpiEmpty)}
            note={error ? "Lecture indisponible" : undefined}
            compact
          />
        </div>
      </section>

      <section className={`${styles.panel} ${styles.dashboardPanel}`} aria-label="Villes connues du Brain">
        {data ? (
          <StudioBrainCoverage
            rows={data.rows}
            definitions={data.definitions}
            kpis={data.kpis}
          />
        ) : (
          <p className={styles.networkUnavailable}>Données Brain indisponibles</p>
        )}
      </section>
    </div>
  );
}
