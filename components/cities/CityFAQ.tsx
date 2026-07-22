import styles from "./city.module.css";
import type { CityFaqItem } from "@/data/cities/nimes";

type CityFAQProps = {
  title: string;
  items: CityFaqItem[];
};

export default function CityFAQ({ title, items }: CityFAQProps) {
  return (
    <section className={styles.section} aria-labelledby="city-faq-title">
      <h2 id="city-faq-title" className={styles.sectionTitle}>
        {title}
      </h2>

      <div className={styles.faqList}>
        {items.map((item) => (
          <details key={item.question} className={styles.faqItem}>
            <summary>{item.question}</summary>
            <p className={styles.faqAnswer}>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
