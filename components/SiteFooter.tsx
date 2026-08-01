import Image from "next/image";
import Link from "next/link";
import { footerLinks, socialLinks } from "./siteLinks";

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
          {footerLinks.map((link) => (
            link.href.startsWith("http") ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            )
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