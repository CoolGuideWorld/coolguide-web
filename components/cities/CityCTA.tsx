import Link from "next/link";
import styles from "./city.module.css";
import type { CityCTAData } from "@/data/cities/nimes";

type CityCTAProps = {
  cta: CityCTAData;
};

export default function CityCTA({ cta }: CityCTAProps) {
  return (
    <section className={styles.appBlock} aria-label="Application CoolGuide">
      <h2 className={styles.appTitle}>{cta.title}</h2>
      <p className={styles.appText}>{cta.text}</p>
      <Link className={styles.appLink} href={cta.linkHref}>
        {cta.linkLabel}
      </Link>
    </section>
  );
}
