"use client";

import { useRef, useState } from "react";
import ContactForm from "@/components/contact/ContactForm";
import styles from "@/app/contact/contact.module.css";

type ReasonKey = "coolguide" | "destination" | "tourism" | "other";

const reasons = [
  {
    key: "coolguide" as const,
    title: "J’utilise CoolGuide",
    text: "Une question sur l’application, un problème ou une suggestion d’amélioration.",
    subject: "Question sur l’application",
  },
  {
    key: "destination" as const,
    title: "Je souhaite proposer une destination",
    text: "Vous connaissez un lieu qui mérite d’être raconté ? Nous sommes toujours curieux de découvrir de nouveaux patrimoines.",
    subject: "Proposition de destination",
  },
  {
    key: "tourism" as const,
    title: "Je représente un acteur du tourisme",
    text: "Ville, musée, monument, office de tourisme, hébergeur ou professionnel du voyage : discutons ensemble.",
    subject: "Partenariat tourisme",
  },
  {
    key: "other" as const,
    title: "Autre demande",
    text: "Toutes les idées et toutes les questions sont les bienvenues.",
    subject: "Autre demande",
  },
];

export default function ContactReasonsFormSection() {
  const [selectedReason, setSelectedReason] = useState<ReasonKey | null>(null);
  const [subject, setSubject] = useState("");
  const [subjectSelectionVersion, setSubjectSelectionVersion] = useState(0);
  const formSectionRef = useRef<HTMLElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const focusTimeoutRef = useRef<number | null>(null);

  const handleReasonSelect = (reasonKey: ReasonKey, nextSubject: string) => {
    setSelectedReason(reasonKey);
    setSubject(nextSubject);
    setSubjectSelectionVersion((version) => version + 1);
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (focusTimeoutRef.current) {
      window.clearTimeout(focusTimeoutRef.current);
    }

    focusTimeoutRef.current = window.setTimeout(() => {
      messageRef.current?.focus({ preventScroll: true });
    }, 350);
  };

  return (
    <>
      <section className={styles.contactReasons} aria-labelledby="contact-reasons-title">
        <div className={styles.contactContainer}>
          <h2 id="contact-reasons-title">Une seule page, plusieurs raisons de nous contacter</h2>
          <div className={styles.contactReasonsGrid}>
            {reasons.map((reason) => {
              const isSelected = selectedReason === reason.key;

              return (
                <button
                  key={reason.key}
                  type="button"
                  className={styles.contactReasonCardButton}
                  data-selected={isSelected ? "true" : "false"}
                  aria-pressed={isSelected}
                  onClick={() => handleReasonSelect(reason.key, reason.subject)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleReasonSelect(reason.key, reason.subject);
                    }
                  }}
                >
                  <span className={styles.contactReasonCardTitle}>{reason.title}</span>
                  <span className={styles.contactReasonCardText}>{reason.text}</span>
                  <span className={styles.contactReasonCardArrow} aria-hidden="true">
                    →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className={styles.contactFormSection}
        id="contact-form"
        aria-labelledby="contact-form-title"
        ref={formSectionRef}
      >
        <div className={styles.contactContainer}>
          <h2 id="contact-form-title">Formulaire</h2>
          <ContactForm
            prefilledSubject={subject}
            subjectSelectionVersion={subjectSelectionVersion}
            messageRef={messageRef}
          />
        </div>
      </section>
    </>
  );
}
