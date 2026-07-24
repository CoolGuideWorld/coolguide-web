import Image from "next/image";

const supportedLanguages = [
  { flagSrc: "/flags/fr.svg", name: "Français", flagAlt: "Drapeau français", flagLabel: "Drapeau français" },
  { flagSrc: "/flags/gb.svg", name: "English", flagAlt: "Drapeau britannique", flagLabel: "Drapeau britannique" },
  { flagSrc: "/flags/es.svg", name: "Español", flagAlt: "Drapeau espagnol", flagLabel: "Drapeau espagnol" },
  { flagSrc: "/flags/de.svg", name: "Deutsch", flagAlt: "Drapeau allemand", flagLabel: "Drapeau allemand" },
  { flagSrc: "/flags/it.svg", name: "Italiano", flagAlt: "Drapeau italien", flagLabel: "Drapeau italien" },
  { flagSrc: "/flags/jp.svg", name: "日本語", flagAlt: "Drapeau japonais", flagLabel: "Drapeau japonais" },
  { flagSrc: "/flags/cn.svg", name: "中文", flagAlt: "Drapeau chinois", flagLabel: "Drapeau chinois" },
];

export default function LanguagesSection() {
  return (
    <section
      className="benefitsSection"
      aria-labelledby="languages-section-title"
      style={{
        paddingBottom: "clamp(1.6rem, 3vw, 2.3rem)",
      }}
    >
      <div
        className="benefitsInner"
        style={{
          display: "grid",
          justifyItems: "center",
        }}
      >
        <div
          className="benefitsHeader"
          style={{
            textAlign: "center",
            marginBottom: "clamp(0.85rem, 1.8vw, 1.15rem)",
          }}
        >
          <p>Comprenez chaque lieu dans votre langue</p>
          <h2 id="languages-section-title">Où que vous soyez, l'histoire vous accompagne.</h2>
        </div>

        <p
          className="storyLead"
          style={{
            textAlign: "center",
            maxWidth: "640px",
            marginBottom: "clamp(0.95rem, 2vw, 1.25rem)",
          }}
        >
          Choisissez votre langue et profitez d'une expérience naturelle, fluide et immersive. Chaque histoire est racontée comme si elle avait été pensée pour vous.
        </p>

        <div
          className="languageRail"
          role="region"
          aria-label="Langues disponibles dans CoolGuide"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            paddingInline: "clamp(0.1rem, 0.6vw, 0.4rem)",
          }}
        >
          <ul
            className="languageList"
            role="list"
            style={{
              justifyContent: "center",
              marginInline: "auto",
            }}
          >
            {supportedLanguages.map((language) => (
              <li className="languageItem" key={language.name}>
                <div
                  className="languageMedallionWrap"
                  tabIndex={0}
                  aria-label={`${language.name} - ${language.flagLabel}`}
                >
                  {Array.from({ length: 50 }, (_, index) => (
                    <span
                      className="languageDust"
                      aria-hidden="true"
                      key={`${language.name}-dust-${index}`}
                    />
                  ))}

                  <span className="languageMedallion" aria-hidden="true">
                    <Image
                      src={language.flagSrc}
                      alt={language.flagAlt}
                      fill
                      sizes="(max-width: 1024px) 70px, 76px"
                      className="languageFlagImage"
                    />
                  </span>
                </div>

                <p className="languageName">{language.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
