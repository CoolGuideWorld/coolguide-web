"use client";

import { FormEvent, RefObject, useEffect, useMemo, useState } from "react";
import styles from "./contactForm.module.css";

type ContactFormProps = {
  prefilledSubject?: string;
  subjectSelectionVersion?: number;
  messageRef?: RefObject<HTMLTextAreaElement | null>;
};

type FormStatus = {
  type: "idle" | "success" | "error" | "info";
  message: string;
};

const initialStatus: FormStatus = {
  type: "idle",
  message: "",
};

export default function ContactForm({
  prefilledSubject = "",
  subjectSelectionVersion = 0,
  messageRef,
}: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>(initialStatus);

  const emailIsValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email), [email]);

  useEffect(() => {
    if (subjectSelectionVersion === 0) {
      return;
    }

    setSubject(prefilledSubject);
  }, [prefilledSubject, subjectSelectionVersion]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setStatus({
        type: "error",
        message: "Merci de renseigner tous les champs obligatoires.",
      });
      return;
    }

    if (!emailIsValid) {
      setStatus({
        type: "error",
        message: "Merci de saisir une adresse e-mail valide.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(initialStatus);

    try {
      const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

      if (!endpoint) {
        // Connect real message delivery here (API route or external email provider).
        setStatus({
          type: "info",
          message:
            "Le formulaire est prêt, mais l'envoi réel n'est pas encore connecté. Votre message n'a pas été envoyé.",
        });
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("request_failed");
      }

      setStatus({
        type: "success",
        message: "Votre message a bien été envoyé. Merci pour votre confiance.",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus({
        type: "error",
        message: "L'envoi a échoué. Merci de réessayer dans quelques instants.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.contactFormGrid}>
        <label className={styles.contactField} htmlFor="contact-name">
          <span>Nom</span>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className={styles.contactField} htmlFor="contact-email">
          <span>Adresse e-mail</span>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
      </div>

      <label className={styles.contactField} htmlFor="contact-subject">
        <span>Sujet</span>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </label>

      <label className={styles.contactField} htmlFor="contact-message">
        <span>Message</span>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          value={message}
          ref={messageRef}
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>

      {status.type !== "idle" ? (
        <p
          className={`${styles.contactStatus} ${styles[`contactStatus-${status.type}`]}`}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}

      <button type="submit" className={styles.contactSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Envoi en cours..." : "Envoyer mon message"}
      </button>
    </form>
  );
}
