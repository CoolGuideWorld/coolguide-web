import type { Metadata } from "next";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Les Gardiens du Patrimoine | CoolGuide World",
  description: "Page temporaire dédiée aux titres de progression CoolGuide.",
};

export default function GardiensDuPatrimoinePage() {
  return (
    <PublicPageShell
      title="Les Gardiens du Patrimoine"
      message="Découvrez les différents titres qui accompagnent votre progression à travers le patrimoine du monde. Cette page sera prochainement développée."
    />
  );
}