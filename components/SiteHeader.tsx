"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type FormEvent,
} from "react";
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
  type AndroidSubmissionState = "idle" | "submitting" | "success" | "alreadyRegistered" | "error";

  const solidByDefault = initialSolid || compact;
  const hasHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const [isHeaderSolid, setIsHeaderSolid] = useState(solidByDefault);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<"world" | null>(null);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [downloadDialogView, setDownloadDialogView] = useState<"choice" | "android">("choice");
  const [androidEmail, setAndroidEmail] = useState("");
  const [androidSubmissionState, setAndroidSubmissionState] = useState<AndroidSubmissionState>("idle");
  const [androidStatusMessage, setAndroidStatusMessage] = useState("");
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
    setDownloadDialogView("choice");
    setAndroidEmail("");
    setAndroidSubmissionState("idle");
    setAndroidStatusMessage("");
    setIsDownloadDialogOpen(true);
  };

  const closeDownloadDialog = () => {
    setIsDownloadDialogOpen(false);
    setDownloadDialogView("choice");
    setAndroidEmail("");
    setAndroidSubmissionState("idle");
    setAndroidStatusMessage("");
  };

  const showAndroidDownloadView = () => {
    setDownloadDialogView("android");
    setAndroidSubmissionState("idle");
    setAndroidStatusMessage("");
  };

  const showDownloadChoiceView = () => {
    setDownloadDialogView("choice");
    setAndroidSubmissionState("idle");
    setAndroidStatusMessage("");
  };

  const handleAndroidAccessRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (androidSubmissionState === "submitting") {
      return;
    }

    setAndroidSubmissionState("submitting");
    setAndroidStatusMessage("");

    try {
      const response = await fetch("/api/beta-testers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: androidEmail }),
      });

      if (response.status === 201) {
        setAndroidSubmissionState("success");
        return;
      }

      if (response.status === 409) {
        setAndroidSubmissionState("alreadyRegistered");
        setAndroidStatusMessage("Cette adresse est deja inscrite au programme de test Android.");
        return;
      }

      if (response.status === 400) {
        setAndroidSubmissionState("error");
        setAndroidStatusMessage("Veuillez saisir une adresse e-mail valide.");
        return;
      }

      setAndroidSubmissionState("error");
      setAndroidStatusMessage(
        "Impossible d'enregistrer votre demande pour le moment. Veuillez reessayer."
      );
    } catch {
      setAndroidSubmissionState("error");
      setAndroidStatusMessage(
        "Impossible d'enregistrer votre demande pour le moment. Veuillez reessayer."
      );
    }
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
        aria-describedby={
          downloadDialogView === "android"
            ? "download-recruitment-android-description"
            : "download-recruitment-choice-description"
        }
      >
        <div className="downloadDialogHeader">
          <p className="downloadDialogEyebrow">
            {downloadDialogView === "android" ? "Beta Android" : "Beta CoolGuide"}
          </p>
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
        {downloadDialogView === "android" ? (
          <>
            <h2 id="download-recruitment-title" className="downloadDialogTitle">
              REJOINDRE LE TEST ANDROID
            </h2>
            <p id="download-recruitment-android-description" className="downloadDialogText">
              Google Play necessite que votre compte Google soit autorise avant de pouvoir installer la version beta de CoolGuide.
            </p>
            <p className="downloadDialogText">
              Entrez l&apos;adresse Google utilisee sur votre telephone Android.
            </p>
            {androidSubmissionState === "success" ? (
              <>
                <p
                  className="downloadDialogMeta downloadDialogStatus downloadDialogSuccessBanner"
                  role="status"
                  aria-live="polite"
                >
                  ✓ Votre demande est bien enregistree !
                </p>
                <p className="downloadDialogText">
                  Nous allons maintenant autoriser votre adresse Google pour acceder a la version beta de CoolGuide.
                </p>
                <p className="downloadDialogText downloadDialogSuccessHighlight">
                  Vous recevrez votre lien d&apos;installation Google Play par e-mail des que votre acces sera active.
                </p>
                <p className="downloadDialogText">
                  Vous pouvez fermer cette fenetre.
                </p>
                <button type="button" className="downloadDialogCta" onClick={closeDownloadDialog}>
                  Fermer
                </button>
              </>
            ) : (
              <form className="downloadDialogForm" onSubmit={handleAndroidAccessRequest} noValidate>
                <div className="downloadDialogField">
                  <label className="downloadDialogLabel" htmlFor="android-beta-email">
                    Adresse Google
                  </label>
                  <input
                    id="android-beta-email"
                    className="downloadDialogInput"
                    type="email"
                    placeholder="votre.adresse@gmail.com"
                    value={androidEmail}
                    onChange={(event) => setAndroidEmail(event.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="downloadDialogCta"
                  disabled={androidSubmissionState === "submitting"}
                >
                  {androidSubmissionState === "submitting" ? "Envoi en cours..." : "Demander mon acces"}
                </button>
              </form>
            )}
            {androidStatusMessage ? (
              <p className="downloadDialogMeta downloadDialogStatus" role="status" aria-live="polite">
                {androidStatusMessage}
              </p>
            ) : null}
            {androidSubmissionState !== "success" ? (
              <button type="button" className="downloadDialogBackButton" onClick={showDownloadChoiceView}>
                ← Retour
              </button>
            ) : null}
          </>
        ) : (
          <>
            <h2 id="download-recruitment-title" className="downloadDialogTitle">
              DEVENEZ TESTEUR COOLGUIDE
            </h2>
            <p id="download-recruitment-choice-description" className="downloadDialogText">
              Vous habitez dans une ville deja presente sur CoolGuide ou vous la connaissez bien ?
            </p>
            <p className="downloadDialogText">
              Testez l&apos;application et aidez-nous a ameliorer l&apos;experience, les contenus et les decouvertes locales.
            </p>
            <div className="downloadDialogChoices" aria-label="Choisir une plateforme beta">
              <div className="downloadDialogChoice">
                <a
                  href="https://testflight.apple.com/join/N7EGZakr"
                  className="downloadDialogCta"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Tester CoolGuide sur iPhone avec TestFlight, ouverture dans un nouvel onglet"
                >
                  Tester CoolGuide sur iPhone
                </a>
                <p className="downloadDialogMeta">Installation via TestFlight</p>
              </div>
              <div className="downloadDialogChoice">
                <button
                  type="button"
                  className="downloadDialogSecondaryCta"
                  onClick={showAndroidDownloadView}
                >
                  Tester CoolGuide sur Android
                </button>
                <p className="downloadDialogMeta">Acces beta sur invitation Google Play</p>
              </div>
            </div>
          </>
        )}
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

      {hasHydrated ? createPortal(mobileMenuPanel, document.body) : null}
      {hasHydrated && isDownloadDialogOpen
        ? createPortal(downloadDialog, document.body)
        : null}
    </header>
  );
}