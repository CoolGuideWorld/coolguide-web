const translationPromises = [
  {
    title: "Des personnages uniques",
    text: "Les figures historiques gardent leur voix, leur contexte et leur place dans le récit.",
  },
  {
    title: "Un patrimoine respecté",
    text: "Les lieux, les personnages et les événements conservent leur identité et leur contexte historique.",
  },
  {
    title: "Une expérience authentique",
    text: "Chaque traduction est pensée pour transmettre la même émotion, quelle que soit la langue choisie.",
  },
  {
    title: "Une écoute fluide",
    text: "Un style clair et agréable qui accompagne naturellement la découverte.",
  },
];

export default function TranslationSection() {
  return (
    <section className="howItWorksSection" aria-labelledby="translation-section-title">
      <div className="howItWorksInner">
        <div className="howItWorksHeader">
          <p>Une traduction pensée pour les voyageurs</p>
          <h2 id="translation-section-title">Des récits adaptés pour être compris, ressentis et appréciés.</h2>
        </div>

        <div className="benefitsGrid">
          {translationPromises.map((item) => (
            <article className="benefitItem" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
