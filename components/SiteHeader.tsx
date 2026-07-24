"use client";

import { useEffect, useState, type CSSProperties, type FocusEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  coolGuideWorldDropdownConfig,
  coolGuideWorldLinks,
  headerLinks,
} from "./siteLinks";

type SiteHeaderProps = {
  initialSolid?: boolean;
  compact?: boolean;
};

export default function SiteHeader({ initialSolid = false, compact = false }: SiteHeaderProps) {
  const solidByDefault = initialSolid || compact;
  const [isHeaderSolid, setIsHeaderSolid] = useState(solidByDefault);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<"world" | null>(null);

  const headerStyle: CSSProperties | undefined = compact
    ? { ["--header-height" as string]: "clamp(64px, 8.6vw, 80px)" }
    : undefined;

  const headerInnerStyle: CSSProperties | undefined = compact
    ? {
      padding: "0 clamp(0.85rem, 2.2vw, 1.5rem)",
      gap: "clamp(0.8rem, 1.4vw, 1.2rem)",
    }
    : undefined;

  const logoStyle: CSSProperties | undefined = compact
    ? {
      width: "clamp(95px, 11vw, 120px)",
      height: "auto",
      display: "block",
    }
    : undefined;

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSolid(solidByDefault || window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [solidByDefault]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (!target.closest(".siteNavDropdown")) {
        setOpenDesktopMenu(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setOpenDesktopMenu(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavClick = () => {
    setIsMenuOpen(false);
    setOpenDesktopMenu(null);
  };

  const toggleDesktopMenu = (menu: "world") => {
    setOpenDesktopMenu((currentMenu) => (currentMenu === menu ? null : menu));
  };

  const closeDesktopMenu = () => {
    setOpenDesktopMenu(null);
  };

  const handleDropdownFocus = (menu: "world") => {
    setOpenDesktopMenu(menu);
  };

  const handleDropdownBlur = (
    event: FocusEvent<HTMLElement>,
    menu: "world"
  ) => {
    const relatedTarget = event.relatedTarget;

    if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) {
      return;
    }

    setOpenDesktopMenu((currentMenu) => (currentMenu === menu ? null : currentMenu));
  };

  return (
    <header className={`siteHeader${isHeaderSolid || isMenuOpen ? " isSolid" : ""}`} style={headerStyle}>
      <div className="siteHeaderInner" style={headerInnerStyle}>
        <Link href="/#top" className="siteLogo" onClick={handleNavClick}>
          <Image
            src="/logo/coolguide-logo.png"
            alt="CoolGuide"
            width={170}
            height={42}
            priority
            className="siteLogoImage"
            style={logoStyle}
          />
        </Link>

        <nav
          className="siteNav"
          aria-label="Navigation principale"
          onMouseLeave={closeDesktopMenu}
        >
          {headerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="siteNavLink"
              onClick={handleNavClick}
            >
              {link.label}
            </Link>
          ))}

          <div
            className="siteNavDropdown"
            onMouseEnter={() => setOpenDesktopMenu("world")}
            onMouseOver={() => setOpenDesktopMenu("world")}
            onFocusCapture={() => handleDropdownFocus("world")}
            onBlur={(event) => handleDropdownBlur(event, "world")}
          >
            <div className="siteNavDropdownHead">
              <Link
                href={coolGuideWorldDropdownConfig.href}
                className="siteNavDropdownPrimaryLink"
                onClick={handleNavClick}
              >
                {coolGuideWorldDropdownConfig.label}
              </Link>

              <button
                type="button"
                className="siteNavDropdownChevronButton"
                aria-label={`Ouvrir le menu ${coolGuideWorldDropdownConfig.label}`}
                aria-haspopup="menu"
                aria-expanded={openDesktopMenu === "world"}
                aria-controls="desktop-world-menu"
                onClick={() => toggleDesktopMenu("world")}
              >
                <span
                  className={`siteNavChevron${openDesktopMenu === "world" ? " isOpen" : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
            </div>

            <div
              id="desktop-world-menu"
              className={`siteNavDropdownMenu siteNavDropdownMenuWide${
                openDesktopMenu === "world" ? " isOpen" : ""
              }`}
              role="menu"
              aria-label="Le Monde CoolGuide"
            >
              {coolGuideWorldLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="siteNavDropdownLink"
                  role="menuitem"
                  onClick={handleNavClick}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/#download" className="siteNavButton" onClick={handleNavClick}>
            Télécharger
          </Link>
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
            <Link
              key={link.href}
              href={link.href}
              className="mobileMenuLink"
              onClick={handleNavClick}
            >
              {link.label}
            </Link>
          ))}

          <div className="mobileMenuGroup" aria-label="Le Monde CoolGuide">
            <p className="mobileMenuGroupTitle">Le Monde CoolGuide</p>
            <div className="mobileMenuSubLinks">
              {coolGuideWorldLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mobileMenuSubLink"
                  onClick={handleNavClick}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <Link href="/#download" className="mobileMenuButton" onClick={handleNavClick}>
          Télécharger
        </Link>
      </div>
    </header>
  );
}