import Image from "next/image";

type ExperienceLanguagesStatsProps = {
  availableAudioCount: number | null;
  availablePoiCount: number | null;
};

const EXPERIENCE_LANGUAGES = [
  { flagSrc: "/flags/fr.svg", name: "Bienvenue", flagAlt: "Drapeau français" },
  { flagSrc: "/flags/gb.svg", name: "Welcome", flagAlt: "Drapeau britannique" },
  { flagSrc: "/flags/es.svg", name: "Bienvenido", flagAlt: "Drapeau espagnol" },
  { flagSrc: "/flags/de.svg", name: "Willkommen", flagAlt: "Drapeau allemand" },
  { flagSrc: "/flags/it.svg", name: "Benvenuto", flagAlt: "Drapeau italien" },
  { flagSrc: "/flags/jp.svg", name: "ようこそ", flagAlt: "Drapeau japonais" },
  { flagSrc: "/flags/cn.svg", name: "欢迎", flagAlt: "Drapeau chinois" },
];

export default function ExperienceLanguagesStats({
  availableAudioCount,
  availablePoiCount,
}: ExperienceLanguagesStatsProps) {
  const formattedAudioCount =
    availableAudioCount !== null
      ? availableAudioCount.toLocaleString("fr-FR")
      : "De nombreux";

  const formattedPoiCount =
    availablePoiCount !== null
      ? availablePoiCount.toLocaleString("fr-FR")
      : "De nombreux";

  const stats = [
    { value: "7", label: "Langues disponibles" },
    { value: formattedAudioCount, label: "Audios disponibles" },
    { value: formattedPoiCount, label: "Points d'intérêt" },
    { value: "2", label: "Modes de découverte" },
    { value: "GPS", label: "Déclenchement automatique" },
  ];

  return (
    <section className="howItWorksSection experienceLanguagesStats" aria-labelledby="experience-languages-stats-title">
      <div className="howItWorksInner">
        <div className="howItWorksHeader experienceLanguagesStatsHeader">
          <h2 id="experience-languages-stats-title">Le patrimoine n&apos;a plus de frontière.</h2>
        </div>

        <ul className="experienceLanguagesBadgeList" aria-label="Langues disponibles dans l&apos;expérience CoolGuide">
          {EXPERIENCE_LANGUAGES.map((language) => (
            <li className="experienceLanguageBadge" key={language.name}>
              <Image
                src={language.flagSrc}
                alt={language.flagAlt}
                width={18}
                height={13}
                className="languageFlagImage experienceLanguageBadgeFlag"
              />
              <span>{language.name}</span>
            </li>
          ))}
        </ul>

        <ul className="experienceStatsGrid" aria-label="Statistiques de l&apos;expérience CoolGuide">
          {stats.map((item) => (
            <li className="experienceStatItem" key={item.label}>
              <div className="experienceStatCapsule">{item.value}</div>
              <p>{item.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
