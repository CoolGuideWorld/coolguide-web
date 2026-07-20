import type { Metadata } from "next";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Politique de confidentialité | CoolGuide World",
  description: "Page temporaire de la politique de confidentialité CoolGuide World.",
};

export default function ConfidentialitePage() {
  return (
    <PublicPageShell
      title="Politique de confidentialité"
      message="Cette page sera construite prochainement."
    />
  );
}