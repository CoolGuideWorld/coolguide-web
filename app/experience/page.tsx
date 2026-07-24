import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import AppRevealSection from "@/components/experience/AppRevealSection";
import DownloadSection from "@/components/experience/DownloadSection";
import ExperienceIntroSection from "@/components/experience/ExperienceIntroSection";
import ExperienceSequenceSection from "@/components/experience/ExperienceSequenceSection";
import HowItWorksSection from "@/components/experience/HowItWorksSection";
import JourneyPauseSection from "@/components/experience/JourneyPauseSection";
import LanguagesSection from "@/components/experience/LanguagesSection";
import OnboardingJourneySection from "@/components/experience/OnboardingJourneySection";
import TranslationSection from "@/components/experience/TranslationSection";
import WorldJourneySection from "@/components/experience/WorldJourneySection";

export default function ExperiencePage() {
  return (
    <>
      <SiteHeader compact />

      <main>
        <ExperienceIntroSection />

        <LanguagesSection />

        <TranslationSection />

        <OnboardingJourneySection />

        <HowItWorksSection />

        <JourneyPauseSection />

        <ExperienceSequenceSection />

        <AppRevealSection />

        <DownloadSection />

        <WorldJourneySection />
      </main>

      <SiteFooter />
    </>
  );
}
