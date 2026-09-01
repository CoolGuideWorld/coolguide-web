"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { createPortal } from "react-dom";
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
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const closeDialogButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSolid(solidByDefault || window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [solidByDefault]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isDownloadDialogOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isDownloadDialogOpen, isMenuOpen]);

  useEffect(() => {
    const root = document.documentElement;

    if (isMenuOpen) {
      root.classList.add("mobile-menu-open");
    } else {
      root.classList.remove("mobile-menu-open");
    }

    return () => {
      root.classList.remove("mobile-menu-open");
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
        setIsDownloadDialogOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isDownloadDialogOpen) {
      return;
    }

    closeDialogButtonRef.current?.focus();
  }, [isDownloadDialogOpen]);

  const handleNavClick = () => {
    setIsMenuOpen(false);
    setOpenDesktopMenu(null);
  };

  const openDownloadDialog = () => {
    setIsMenuOpen(false);
    setOpenDesktopMenu(null);
    setIsDownloadDialogOpen(true);
  };

  const closeDownloadDialog = () => {
    setIsDownloadDialogOpen(false);
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

  const mobileMenuPanel = (
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

      <button
        type="button"
        className="mobileMenuButton"
        aria-haspopup="dialog"
        aria-expanded={isDownloadDialogOpen}
        aria-controls="download-recruitment-dialog"
        onClick={openDownloadDialog}
      >
        Télécharger
      </button>
    </div>
  );

  const downloadDialog = (
    <div className="downloadDialogLayer" role="presentation">
      <button
        type="button"
        className="downloadDialogBackdrop"
        aria-label="Fermer la fenetre de recrutement TestFlight"
        onClick={closeDownloadDialog}
      />
      <div
        id="download-recruitment-dialog"
        className="downloadDialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-recruitment-title"
        aria-describedby="download-recruitment-description"
      >
        <div className="downloadDialogHeader">
          <p className="downloadDialogEyebrow">Beta iPhone via TestFlight</p>
          <button
            ref={closeDialogButtonRef}
            type="button"
            className="downloadDialogClose"
            aria-label="Fermer la fenetre de recrutement TestFlight"
            onClick={closeDownloadDialog}
          >
            Fermer
          </button>
        </div>
        <h2 id="download-recruitment-title" className="downloadDialogTitle">
          DEVENEZ TESTEUR COOLGUIDE
        </h2>
        <p id="download-recruitment-description" className="downloadDialogText">
          Vous habitez dans une ville deja presente sur CoolGuide ou vous la connaissez bien ?
        </p>
        <p className="downloadDialogText">
          Testez l&apos;application sur iPhone et aidez-nous a ameliorer l&apos;experience, les contenus et les decouvertes locales.
        </p>
        <a
          href="https://testflight.apple.com/join/N7EGZakr"
          className="downloadDialogCta"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Tester CoolGuide sur iPhone avec TestFlight, ouverture dans un nouvel onglet"
        >
          Tester CoolGuide sur iPhone
        </a>
        <p className="downloadDialogMeta">Version beta gratuite via TestFlight</p>
      </div>
    </div>
  );

  return (
    <header
      className={`siteHeader${compact ? " isCompact" : ""}${
        isHeaderSolid || isMenuOpen ? " isSolid" : ""
      }`}
    >
      <div className="siteHeaderInner">
        <Link href="/#top" className="siteLogo" onClick={handleNavClick}>
          <Image
            src="/logo/coolguide-logo.png"
            alt="CoolGuide"
            width={170}
            height={42}
            priority
            className="siteLogoImage"
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

          <button
            type="button"
            className="siteNavButton"
            aria-haspopup="dialog"
            aria-expanded={isDownloadDialogOpen}
            aria-controls="download-recruitment-dialog"
            onClick={openDownloadDialog}
          >
            Télécharger
          </button>
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

      {typeof document !== "undefined" ? createPortal(mobileMenuPanel, document.body) : null}
      {typeof document !== "undefined" && isDownloadDialogOpen
        ? createPortal(downloadDialog, document.body)
        : null}
    </header>
  );
}