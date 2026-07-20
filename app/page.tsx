"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [isHeaderSolid, setIsHeaderSolid] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const heroSlides = [
    {
      image: "/hero/hero-01-extraordinary.jpg",
      text: "Le monde est déjà extraordinaire.",
    },
    {
      image: "/hero/hero-02-look-closer.jpg",
      text: "Il suffit d'apprendre à le regarder.",
    },
    {
      image: "/hero/hero-03-past.jpg",
      text: "Le passé n'est pas derrière nous.\nIl est autour de nous.",
    },
    {
      image: "/hero/hero-04-listen.jpg",
      text: "Les lieux parlent à ceux qui prennent le temps de les écouter.",
    },
    {
      image: "/hero/hero-05-story.jpg",
      text: "Chaque lieu a une histoire.\nCoolGuide la raconte au bon moment.",
    },
  ];

  const worldJourney = [
    {
      image: "/world/01-carcassonne.jpg",
      title: "Remonter le temps.",
      place: "Carcassonne",
    },
    {
      image: "/world/02-arenes-nimes.jpg",
      title: "Comprendre.",
      place: "Les Arènes de Nîmes",
    },
    {
      image: "/world/03-vannes.jpg",
      title: "Flâner.",
      place: "Vannes",
    },
    {
      image: "/world/04-grece.jpg",
      title: "S’imprégner.",
      place: "Îles grecques",
    },
    {
      image: "/world/05-debarquement.jpg",
      title: "Se souvenir.",
      place: "Plages du Débarquement",
    },
    {
      image: "/world/06-stonehenge.jpg",
      title: "S’interroger.",
      place: "Stonehenge",
    },
    {
      image: "/world/07-pyramides.jpg",
      title: "S’émerveiller.",
      place: "Pyramides de Gizeh",
    },
    {
      image: "/world/08-tour-eiffel.jpg",
      title: "Lever les yeux.",
      place: "Tour Eiffel",
    },
  ];

  const howItWorksSteps = [
    {
      image: "/how-it-works/step-01-explore.jpg",
      title: "Vous avancez.",
      text: "CoolGuide détecte les lieux autour de vous.",
    },
    {
      image: "/how-it-works/step-02-detect.jpg",
      title: "Vous approchez.",
      text: "Lorsqu'un lieu mérite votre attention, son récit apparaît naturellement.",
    },
    {
      image: "/how-it-works/step-03-listen.jpg",
      title: "Vous écoutez.",
      text: "Découvrez le patrimoine dans votre langue, à votre rythme.",
    },
  ];

  const benefits = [
    {
      icon: "📍",
      title: "Au bon endroit",
      text: "Les découvertes apparaissent lorsque les lieux prennent tout leur sens.",
    },
    {
      icon: "🎧",
      title: "À votre rythme",
      text: "Écoutez, faites une pause et continuez librement.",
    },
    {
      icon: "🌍",
      title: "Dans votre langue",
      text: "Profitez pleinement de vos voyages.",
    },
    {
      icon: "✨",
      title: "Sans chercher",
      text: "Le voyage reste au centre de votre attention.",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSolid(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const navLinks = [
    { href: "#discover", label: "Découvrir" },
    { href: "#experience", label: "Expérience" },
    { href: "#destinations", label: "Destinations" },
    { href: "#about", label: "À propos" },
  ];

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`siteHeader${isHeaderSolid || isMenuOpen ? " isSolid" : ""}`}>
        <div className="siteHeaderInner">
          <a href="#top" className="siteLogo" onClick={handleNavClick}>
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
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="siteNavLink">
                {link.label}
              </a>
            ))}

            <a href="#download" className="siteNavButton">
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
            {navLinks.map((link) => (
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

          <a
            href="#download"
            className="mobileMenuButton"
            onClick={handleNavClick}
          >
            Télécharger
          </a>
        </div>
      </header>

      <main className="hero" id="top">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.image}
            className="heroSlide"
            style={{ animationDelay: `${index * 5}s` }}
          >
            <div className="heroImageLayer">
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                className="heroImage"
                style={{ animationDelay: `${index * 5}s` }}
              />
            </div>

            <div className="heroOverlay"></div>

            <div className="heroContent">
              <h1 style={{ animationDelay: `${index * 5 + 0.7}s` }}>{slide.text}</h1>
            </div>
          </div>
        ))}
      </main>

      <section className="whyCoolGuide">
        <div className="whyCoolGuideInner">
          <p className="whyCoolGuideKicker">Pourquoi CoolGuide</p>
          <h2>Nous traversons souvent des lieux sans vraiment les voir.</h2>
          <p>
            Derrière une façade, une pierre ou un paysage se cachent des histoires que rien ne révèle au premier regard. CoolGuide redonne une voix aux lieux pour transformer une simple visite en véritable découverte.
          </p>
        </div>
      </section>

      <section className="journeyPause respirationSection">
        <div className="journeyPauseImageLayer">
          <Image
            src="/hero/hero-06-bridge.jpg"
            alt=""
            fill
            className="journeyPauseImage"
          />
        </div>

        <div className="journeyPauseContent">
          <p>{"Prenez le temps.\nLe monde vous le rendra."}</p>
        </div>
      </section>

      <section className="experienceSequence" aria-label="L'experience CoolGuide">
        <div className="experienceBeat">
          <p>Vous marchez.</p>
        </div>

        <div className="experienceBeat">
          <p>Vous levez les yeux.</p>
        </div>

        <div className="experienceBeat">
          <p>Vous écoutez.</p>
        </div>

        <div className="experienceBeat">
          <p>Une histoire commence.</p>
        </div>
      </section>

      <section className="worldJourney" id="discover">
        <div className="worldJourneyHeader">
          <p>LE MONDE VOUS ATTEND</p>
          <h2>Partout, des histoires prennent vie.</h2>
        </div>

        {worldJourney.map((item) => (
          <article className="worldCard" key={item.image}>
            <Image
              src={item.image}
              alt={item.place}
              fill
              className="worldImage"
            />

            <div className="worldOverlay" />

            <div className="worldContent">
              <p className="worldPlace">{item.place}</p>

              <h3 className="worldEmotion">{item.title}</h3>
            </div>
          </article>
        ))}

      </section>

      <section className="appReveal">
        <div className="appRevealLead">
          <h2>Et si ces histoires vous accompagnaient partout où vous voyagez ?</h2>
        </div>

        <div className="appRevealVisualWrap">
          <div className="appRevealVisual">
            <Image
              src="/reveal/experience-reveal.jpg"
              alt="Voyageuse vivant l'expérience CoolGuide"
              fill
              sizes="(max-width: 900px) calc(100vw - 2.5rem), min(90vw, 1560px)"
              className="appRevealVisualImage"
            />
          </div>
        </div>

        <div className="appRevealClosing">
          <p>CoolGuide les raconte au bon moment.</p>
        </div>
      </section>

      <section className="howItWorksSection" id="experience">
        <div className="howItWorksInner">
          <div className="howItWorksHeader">
            <p>Commencez votre voyage.</p>
            <h2>CoolGuide s'occupe du reste.</h2>
          </div>

          <div className="howItWorksGrid">
            {howItWorksSteps.map((step, index) => (
              <article className="howItWorksStep" key={step.title}>
                <div className="howPlaceholder" aria-hidden="true">
                  <Image
                    src={step.image}
                    alt=""
                    fill
                    sizes="(max-width: 700px) calc(100vw - 2.5rem), (max-width: 1100px) calc((100vw - 6rem) / 2), calc((100vw - 8rem) / 3)"
                    className="howPlaceholderImage"
                  />
                </div>

                <p className="howStepIndex">Étape {index + 1}</p>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="benefitsSection" id="destinations">
        <div className="benefitsInner">
          <div className="benefitsHeader">
            <p>Une autre façon de voyager.</p>
            <h2>Une lecture simple, à la bonne vitesse.</h2>
          </div>

          <div className="benefitsGrid">
            {benefits.map((benefit) => (
              <article className="benefitItem" key={benefit.title}>
                <p className="benefitIcon" aria-hidden="true">
                  {benefit.icon}
                </p>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="conclusionSection" id="download">
        <div className="conclusionInner">
          <p className="conclusionLead">
            Le monde est déjà extraordinaire.
            <br />
            Il suffit de réapprendre à le regarder.
          </p>

          <div className="storeButtons" aria-label="Boutons de téléchargement">
            <a href="#" className="storeButton">
              App Store
            </a>
            <a href="#" className="storeButton">
              Google Play
            </a>
          </div>
        </div>
      </section>

      <footer className="siteFooter" id="about">
        <div className="siteFooterInner">
          <div className="siteFooterBrand">
            <a href="#top" className="siteFooterLogo" aria-label="Retour en haut de page">
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
            <a href="#about">À propos</a>
            <a href="#">Contact</a>
            <a href="#">Confidentialité</a>
            <a href="#">Conditions Générales d'Utilisation</a>
            <a href="#">Conditions Générales de Vente</a>
            <a href="#">Partenaires</a>
          </nav>

          <div className="siteFooterSocials" aria-label="Réseaux sociaux">
            <a href="#" aria-label="Instagram">
              <span aria-hidden="true">IG</span>
            </a>
            <a href="#" aria-label="Facebook">
              <span aria-hidden="true">FB</span>
            </a>
            <a href="#" aria-label="LinkedIn">
              <span aria-hidden="true">IN</span>
            </a>
          </div>

          <p className="siteFooterCopyright">© 2026 CoolGuide. Tous droits réservés.</p>
        </div>
      </footer>
    </>
  );
}