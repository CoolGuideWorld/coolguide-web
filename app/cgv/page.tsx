import type { Metadata } from "next";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata: Metadata = {
  title: "CGV | CoolGuide World",
  description: "Page temporaire des conditions générales de vente de CoolGuide World.",
};

export default function CgvPage() {
  return (
    <PublicPageShell
      title="Conditions générales de vente"
      message="Cette page sera construite prochainement."
    />
  );
}