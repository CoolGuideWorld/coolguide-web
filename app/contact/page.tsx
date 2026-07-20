import type { Metadata } from "next";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Contact | CoolGuide World",
  description: "Page de contact temporaire de CoolGuide World.",
};

export default function ContactPage() {
  return (
    <PublicPageShell
      title="Contact"
      message="Cette page sera construite prochainement."
    />
  );
}