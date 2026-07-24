type ExperienceLanguagesStatsProps = {
  availableAudioCount: number | null;
};

const EXPERIENCE_LANGUAGES = [
  "Bienvenue",
  "Welcome",
  "Bienvenido",
  "Willkommen",
  "Benvenuto",
  "ようこそ",
  "欢迎",
];

export default function ExperienceLanguagesStats({
  availableAudioCount,
}: ExperienceLanguagesStatsProps) {
  const formattedAudioCount =
    availableAudioCount !== null
      ? availableAudioCount.toLocaleString("fr-FR")
      : "De nombreux";

  const stats = [
    { value: "7", label: "Langues disponibles" },
    { value: formattedAudioCount, label: "Audios disponibles" },
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
            <li className="experienceLanguageBadge" key={language}>
              {language}
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
