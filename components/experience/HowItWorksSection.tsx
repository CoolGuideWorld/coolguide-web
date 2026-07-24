import Image from "next/image";

const howItWorksSteps = [
  {
    image: "/how-it-works/step-01-explore.jpg",
    title: "Vous avancez.",
    text: "CoolGuide détecte les lieux autour de vous.",
  },
  {
    image: "/how-it-works/step-03-detect.jpg",
    title: "Vous approchez.",
    text: "Lorsqu'un lieu mérite votre attention, son récit apparaît naturellement.",
  },
  {
    image: "/how-it-works/step-02-listen.jpg",
    title: "Vous écoutez.",
    text: "Découvrez le patrimoine dans votre langue, à votre rythme.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      className="howItWorksSection"
      id="experience"
      style={{
        paddingTop: "clamp(1.9rem, 3.6vw, 3.1rem)",
        paddingBottom: "clamp(2rem, 3.9vw, 3.2rem)",
      }}
    >
      <div className="howItWorksInner">
        <div
          className="howItWorksHeader"
          style={{ marginBottom: "clamp(0.7rem, 1.5vw, 1rem)" }}
        >
          <p>La promesse prend vie pendant votre trajet.</p>
          <h2>Vous voyagez. CoolGuide s'occupe du reste.</h2>
        </div>

        <div className="howItWorksGrid" style={{ gap: "clamp(0.7rem, 1.2vw, 1rem)" }}>
          {howItWorksSteps.map((step, index) => (
            <article
              className="howItWorksStep"
              key={step.title}
              style={{
                alignItems: "center",
                textAlign: "center",
                gap: "0.25rem",
              }}
            >
              <div
                className="howPlaceholder"
                aria-hidden="true"
                style={{
                  width: "min(100%, clamp(210px, 16vw, 240px))",
                }}
              >
                <Image
                  src={step.image}
                  alt=""
                  fill
                  sizes="(max-width: 700px) min(100vw - 2.5rem, 280px), (max-width: 1100px) min((100vw - 6rem) / 2, 240px), 240px"
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
  );
}
