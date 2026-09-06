"use client";

import Link from "next/link";
import styles from "./city.module.css";
import type { CityCTAData } from "@/types/city";

type CityCTAProps = {
  cta: CityCTAData;
};

export default function CityCTA({ cta }: CityCTAProps) {
  const isExternalLink = /^https?:\/\//.test(cta.linkHref);
  const openRecruitmentPopup = () => {
    const recruitmentButton = document.querySelector<HTMLButtonElement>(
      'button[aria-controls="download-recruitment-dialog"]'
    );

    recruitmentButton?.click();
  };

  return (
    <section className={styles.appBlock} aria-label="Application CoolGuide">
      <h2 className={styles.appTitle}>{cta.title}</h2>
      <p className={styles.appText}>{cta.text}</p>
      <div className={styles.appActions} aria-label="Choisir une plateforme beta">
        {isExternalLink ? (
          <a
            className={styles.appLink}
            href={cta.linkHref}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${cta.linkLabel} (ouvre un nouvel onglet)`}
          >
            {cta.linkLabel}
          </a>
        ) : (
          <Link className={styles.appLink} href={cta.linkHref}>
            {cta.linkLabel}
          </Link>
        )}
        {typeof cta.linkNote === "string" && cta.linkNote.trim().length > 0 ? (
          <p className={styles.appNote}>{cta.linkNote}</p>
        ) : null}
        <div className={styles.appChoice}>
          <button type="button" className={styles.appButton} onClick={openRecruitmentPopup}>
            Tester CoolGuide sur Android
          </button>
          <p className={styles.appNote}>Acces beta sur invitation Google Play</p>
        </div>
      </div>
    </section>
  );
}
