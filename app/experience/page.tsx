import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import DownloadSection from "@/components/experience/DownloadSection";
import ExperienceFaqSection from "@/components/experience/ExperienceFaqSection";
import ExperienceIntroSection from "@/components/experience/ExperienceIntroSection";
import ExperienceLanguagesStats from "@/components/experience/ExperienceLanguagesStats";
import HowItWorksSection from "@/components/experience/HowItWorksSection";
import LanguagesSection from "@/components/experience/LanguagesSection";
import OnboardingJourneySection from "@/components/experience/OnboardingJourneySection";
import TranslationSection from "@/components/experience/TranslationSection";
import { getExperienceStats } from "@/services/experience";

export const revalidate = 3600;

export default async function ExperiencePage() {
  const stats = await getExperienceStats();

  return (
    <>
      <SiteHeader compact />

      <main className="experiencePageMain">
        <ExperienceIntroSection />

        <LanguagesSection />

        <div className="experienceCreamBand">
          <TranslationSection />
        </div>

        <OnboardingJourneySection />

        <div className="experienceCreamBand">
          <HowItWorksSection />
        </div>

        <ExperienceFaqSection />

        <div className="experienceCreamBand">
          <ExperienceLanguagesStats availableAudioCount={stats.availableAudioCount} />
        </div>

        <div className="experienceCreamBand">
          <DownloadSection />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
