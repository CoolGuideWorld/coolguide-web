import styles from "@/app/studio/studio.module.css";

type MetricCardProps = {
  label: string;
  value: string;
  tone?: "default" | "positive";
  note?: string;
  compact?: boolean;
};

export default function MetricCard({
  label,
  value,
  tone = "default",
  note,
  compact = false,
}: MetricCardProps) {
  const toneClass = tone === "positive" ? styles.metricCardPositive : "";
  const compactClass = compact ? styles.metricCardCompact : "";

  return (
    <article className={`${styles.metricCard} ${toneClass} ${compactClass}`.trim()}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
      {note ? <p className={styles.metricNote}>{note}</p> : null}
    </article>
  );
}
