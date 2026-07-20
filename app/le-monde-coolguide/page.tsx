import type { Metadata } from "next";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Le Monde CoolGuide | CoolGuide World",
  description: "Page de présentation temporaire du Monde CoolGuide.",
};

export default function LeMondeCoolGuidePage() {
  return (
    <PublicPageShell
      title="Le Monde CoolGuide"
      message="Cette page sera construite prochainement."
      localLinks={[
        {
          href: "/le-monde-coolguide/gardiens-du-patrimoine",
          label: "Les Gardiens du Patrimoine",
        },
      ]}
    />
  );
}