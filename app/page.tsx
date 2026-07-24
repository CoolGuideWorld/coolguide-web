import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import AppRevealSection from "@/components/experience/AppRevealSection";
import DownloadSection from "@/components/experience/DownloadSection";
import ExperienceIntroSection from "@/components/experience/ExperienceIntroSection";
import ExperienceSequenceSection from "@/components/experience/ExperienceSequenceSection";
import HowItWorksSection from "@/components/experience/HowItWorksSection";
import JourneyPauseSection from "@/components/experience/JourneyPauseSection";
import LanguagesSection from "@/components/experience/LanguagesSection";
import TranslationSection from "@/components/experience/TranslationSection";
import WorldJourneySection from "@/components/experience/WorldJourneySection";

export const metadata = {
  title: "CoolGuide | CoolGuide World",
  description: "CoolGuide World - la marque mère et les pages publiques CoolGuide.",
};

export default function Home() {
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

  return (
    <>
      <SiteHeader />

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

      <ExperienceIntroSection />

      <LanguagesSection />

      <TranslationSection />

      <JourneyPauseSection />

      <ExperienceSequenceSection />

      <WorldJourneySection />

      <AppRevealSection />

      <HowItWorksSection />

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

      <DownloadSection />

      <SiteFooter />
    </>
  );
}