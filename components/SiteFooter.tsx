import Image from "next/image";
import { footerLinks, socialLinks } from "./siteLinks";

export default function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="siteFooterInner">
        <div className="siteFooterBrand">
          <a href="/#top" className="siteFooterLogo" aria-label="Retour en haut de page">
            <Image
              src="/logo/coolguide-logo.png"
              alt="CoolGuide"
              width={170}
              height={42}
              className="siteFooterLogoImage"
            />
          </a>

          <p className="siteFooterStatement">
            Le monde est déjà extraordinaire.
            <br />
            Il suffit d'apprendre à le regarder.
          </p>
        </div>

        <nav className="siteFooterNav" aria-label="Footer">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
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

        <p className="siteFooterCopyright">© 2026 CoolGuide. Tous droits réservés.</p>
      </div>
    </footer>
  );
}