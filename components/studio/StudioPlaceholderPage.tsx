import styles from "@/app/studio/studio.module.css";

type StudioPlaceholderPageProps = {
  title: string;
  description: string;
};

export default function StudioPlaceholderPage({ title, description }: StudioPlaceholderPageProps) {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageDescription}>{description}</p>
      </header>

      <section className={styles.panel} aria-label={`${title} en préparation`}>
        <p className={styles.placeholderBadge}>Module en préparation</p>
        <p className={styles.emptyMessage}>
          Cette section sera enrichie lors des prochaines étapes de développement.
        </p>
      </section>
    </>
  );
}
