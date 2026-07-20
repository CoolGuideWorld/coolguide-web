"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { headerLinks } from "./siteLinks";

type SiteHeaderProps = {
  initialSolid?: boolean;
};

export default function SiteHeader({ initialSolid = false }: SiteHeaderProps) {
  const [isHeaderSolid, setIsHeaderSolid] = useState(initialSolid);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSolid(initialSolid || window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [initialSolid]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`siteHeader${isHeaderSolid || isMenuOpen ? " isSolid" : ""}`}>
      <div className="siteHeaderInner">
        <a href="/#top" className="siteLogo" onClick={handleNavClick}>
          <Image
            src="/logo/coolguide-logo.png"
            alt="CoolGuide"
            width={170}
            height={42}
            priority
            className="siteLogoImage"
          />
        </a>

        <nav className="siteNav" aria-label="Navigation principale">
          {headerLinks.map((link) => (
            <a key={link.href} href={link.href} className="siteNavLink">
              {link.label}
            </a>
          ))}

          <a href="/#download" className="siteNavButton">
            Télécharger
          </a>
        </nav>

        <button
          type="button"
          className="siteMenuButton"
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`mobileMenu${isMenuOpen ? " isOpen" : ""}`}
      >
        <nav className="mobileMenuNav" aria-label="Navigation mobile">
          {headerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobileMenuLink"
              onClick={handleNavClick}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a href="/#download" className="mobileMenuButton" onClick={handleNavClick}>
          Télécharger
        </a>
      </div>
    </header>
  );
}