import Image from "next/image";
import Link from "next/link";
import { STUDIO_PATH, socialLinks } from "./siteLinks";

export default function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="siteFooterInner">
        <div className="siteFooterBrand">
          <Link href="/#top" className="siteFooterLogo" aria-label="Retour en haut de page">
            <Image
              src="/logo/coolguide-logo.png"
              alt="CoolGuide"
              width={170}
              height={42}
              className="siteFooterLogoImage"
            />
          </Link>
        </div>

        <nav className="siteFooterNav" aria-label="Footer">
          <div style={{ display: "grid", gap: "0.6rem" }}>
            <p style={{ margin: 0, color: "#1f1a17", fontSize: "0.95rem", fontWeight: 600 }}>
              CoolGuide
            </p>
            <Link href="/le-monde-coolguide">Le Monde CoolGuide</Link>
            <Link href="/contact">Contact</Link>
            <Link href={STUDIO_PATH}>CoolGuide Studio</Link>
          </div>

          <div style={{ display: "grid", gap: "0.6rem" }}>
            <p style={{ margin: 0, color: "#1f1a17", fontSize: "0.95rem", fontWeight: 600 }}>
              Informations légales
            </p>
            <Link href="/privacy-policy">Politique de confidentialité</Link>
            <Link href="/terms-of-use">Conditions d&apos;utilisation (CGU)</Link>
            <Link href="/delete-account">Suppression du compte</Link>
            <Link href="/legal-notice">Mentions légales</Link>
          </div>
        </nav>

        <div className="siteFooterSocials" aria-label="Réseaux sociaux">
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-label={link.label}
              target="_blank"
              rel="noreferrer"
            >
              <span aria-hidden="true">{link.shortLabel}</span>
            </a>
          ))}
        </div>

        <p className="siteFooterCopyright">© 2026 CoolGuide — Tous droits réservés.</p>
      </div>
    </footer>
  );
}