import type { Metadata } from "next";
import StudioLoginForm from "@/components/studio/StudioLoginForm";
import styles from "../studio.module.css";

type StudioLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toSingleValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function StudioLoginPage({ searchParams }: StudioLoginPageProps) {
  const params = await searchParams;
  const queryError = toSingleValue(params.error).trim();
  const queryMessage = toSingleValue(params.message).trim();

  return (
    <main className={styles.authShell}>
      <StudioLoginForm queryError={queryError} queryMessage={queryMessage} />
    </main>
  );
}
