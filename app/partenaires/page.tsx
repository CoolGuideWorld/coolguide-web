import type { Metadata } from "next";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Partenaires | CoolGuide World",
  description: "Page de présentation temporaire des partenaires CoolGuide.",
};

export default function PartenairesPage() {
  return (
    <PublicPageShell
      title="Partenaires"
      message="Cette page sera construite prochainement."
    />
  );
}