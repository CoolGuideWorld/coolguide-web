import Image from "next/image";

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

export default function HowItWorksSection() {
  return (
    <section
      className="howItWorksSection"
      id="experience"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #ffffff 12%, #f4ede2 22%, #f4ede2 82%, #f8f3ea 92%, #ffffff 100%)",
        paddingTop: "clamp(1.45rem, 2.7vw, 2.35rem)",
        paddingBottom: "clamp(1.5rem, 3vw, 2.45rem)",
      }}
    >
      <div className="howItWorksInner">
        <div
          className="howItWorksHeader"
          style={{ marginBottom: "clamp(0.55rem, 1.1vw, 0.8rem)" }}
        >
          <p style={{ marginBottom: "clamp(0.55rem, 1vw, 0.8rem)" }}>La promesse prend vie pendant votre trajet.</p>
          <h2 style={{ maxWidth: "18ch", fontSize: "clamp(1.5rem, 2.55vw, 2.65rem)", lineHeight: 1.05 }}>
            Vous voyagez. CoolGuide s'occupe du reste.
          </h2>
        </div>

        <div className="howItWorksGrid" style={{ gap: "clamp(0.55rem, 1vw, 0.82rem)" }}>
          {howItWorksSteps.map((step, index) => (
            <article
              className="howItWorksStep"
              key={step.title}
              style={{
                alignItems: "center",
                textAlign: "center",
                gap: "0.18rem",
              }}
            >
              <div
                className="howPlaceholder"
                aria-hidden="true"
                style={{
                  width: "min(100%, clamp(176px, 13.4vw, 202px))",
                }}
              >
                <Image
                  src={step.image}
                  alt=""
                  fill
                  sizes="(max-width: 700px) min(100vw - 2.5rem, 280px), (max-width: 1100px) min((100vw - 6rem) / 2, 202px), 202px"
                  className="howPlaceholderImage"
                />
              </div>

              <p className="howStepIndex">Étape {index + 1}</p>
              <h3 style={{ fontSize: "clamp(1.1rem, 1.55vw, 1.35rem)", lineHeight: 1.16 }}>{step.title}</h3>
              <p style={{ fontSize: "clamp(0.92rem, 1.18vw, 1.02rem)", lineHeight: 1.5 }}>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
