"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginStudioAction, type StudioLoginState } from "@/app/studio/login/actions";
import styles from "@/app/studio/studio.module.css";

const initialState: StudioLoginState = {
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.primaryButton} disabled={pending}>
      {pending ? "Connexion en cours..." : "Se connecter"}
    </button>
  );
}

type StudioLoginFormProps = {
  queryError: string;
  queryMessage: string;
};

function getQueryErrorMessage(value: string): string {
  if (value === "access-denied") {
    return "Accès refusé. Ce compte n'a pas d'accès administrateur actif.";
  }

  return "";
}

function getQueryInfoMessage(value: string): string {
  if (value === "signed-out") {
    return "Vous êtes déconnecté du Studio.";
  }

  return "";
}

export default function StudioLoginForm({ queryError, queryMessage }: StudioLoginFormProps) {
  const [state, formAction] = useActionState(loginStudioAction, initialState);

  const actionError = state.error;
  const routeError = getQueryErrorMessage(queryError);
  const routeInfo = getQueryInfoMessage(queryMessage);

  return (
    <form action={formAction} className={styles.authCard}>
      <header>
        <h1 className={styles.authTitle}>CoolGuide Studio</h1>
        <p className={styles.authSubtitle}>Espace d&apos;administration CoolGuide</p>
      </header>

      {routeError ? <p className={styles.authError}>{routeError}</p> : null}
      {routeInfo ? <p className={styles.authInfo}>{routeInfo}</p> : null}
      {actionError ? <p className={styles.authError}>{actionError}</p> : null}

      <div className={styles.fieldGroup}>
        <label htmlFor="studio-email" className={styles.fieldLabel}>
          Adresse e-mail
        </label>
        <input
          id="studio-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={styles.fieldInput}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="studio-password" className={styles.fieldLabel}>
          Mot de passe
        </label>
        <input
          id="studio-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={styles.fieldInput}
        />
      </div>

      <SubmitButton />
    </form>
  );
}
