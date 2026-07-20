import type { Metadata } from "next";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata: Metadata = {
  title: "CGU | CoolGuide World",
  description: "Page temporaire des conditions générales d'utilisation de CoolGuide World.",
};

export default function CguPage() {
  return (
    <PublicPageShell
      title="Conditions générales d’utilisation"
      message="Cette page sera construite prochainement."
    />
  );
}