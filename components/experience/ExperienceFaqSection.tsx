"use client";

import { useState } from "react";

const faqItems = [
  {
    question: "Comment CoolGuide fonctionne-t-il pendant une visite ?",
    answer:
      "CoolGuide détecte automatiquement les lieux qui vous entourent grâce à votre position. Lorsqu'un monument, un quartier ou un paysage mérite d'être découvert, l'histoire démarre au bon moment, sans que vous ayez à chercher quoi que ce soit.",
  },
  {
    question: "Dois-je suivre un itinéraire précis ?",
    answer:
      "Non. Vous restez libre de vos déplacements. Que vous vous promeniez à pied ou que vous exploriez une région en voiture, CoolGuide s'adapte à votre parcours.",
  },
  {
    question: "Dans quelles langues les visites sont-elles disponibles ?",
    answer:
      "Les contenus sont disponibles en plusieurs langues afin que chacun puisse découvrir le patrimoine dans sa langue maternelle. De nouvelles langues sont ajoutées progressivement.",
  },
  {
    question: "Les traductions sont-elles fiables ?",
    answer:
      "Oui. Chaque histoire est d'abord rédigée en français, puis traduite par intelligence artificielle avant d'être adaptée pour offrir une écoute naturelle dans chaque langue.",
  },
  {
    question: "Dois-je garder mon téléphone à la main ?",
    answer:
      "Non. Une fois la visite commencée, vous pouvez simplement profiter du paysage. Les histoires sont diffusées automatiquement lorsque vous arrivez au bon endroit.",
  },
  {
    question: "Puis-je utiliser CoolGuide avec des écouteurs ?",
    answer:
      "Oui. Vous pouvez écouter les histoires avec des écouteurs, dans votre voiture ou directement avec le haut-parleur de votre téléphone.",
  },
  {
    question: "L'application est-elle gratuite ?",
    answer:
      "Oui. CoolGuide peut être téléchargée gratuitement. Certaines fonctionnalités ou expériences plus complètes pourront être proposées avec une offre Premium.",
  },
  {
    question: "Pourquoi avoir créé CoolGuide ?",
    answer:
      "Parce que nous trouvions dommage de visiter des lieux extraordinaires sans pouvoir comprendre leur histoire, simplement parce qu'elle n'était pas racontée dans notre langue. Nous avons créé CoolGuide pour que chacun puisse découvrir les bonnes histoires, dans sa langue maternelle, au bon endroit et au bon moment.",
  },
];

export default function ExperienceFaqSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="howItWorksSection experienceFaqSection" aria-labelledby="experience-faq-title">
      <div className="howItWorksInner">
        <div className="howItWorksHeader">
          <p>Questions fréquentes</p>
          <h2 id="experience-faq-title">Tout ce que vous devez savoir avant de commencer votre première visite avec CoolGuide.</h2>
        </div>

        <div className="experienceFaqList" role="list">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `experience-faq-panel-${index}`;
            const buttonId = `experience-faq-button-${index}`;

            return (
              <article className={`experienceFaqItem${isOpen ? " isOpen" : ""}`} key={item.question} role="listitem">
                <h3 className="experienceFaqItemTitle">
                  <button
                    id={buttonId}
                    className="experienceFaqTrigger"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                  >
                    <span>{item.question}</span>
                    <span className={`experienceFaqIcon${isOpen ? " isOpen" : ""}`} aria-hidden="true">
                      <span className="experienceFaqIconBar experienceFaqIconBarHorizontal" />
                      <span className="experienceFaqIconBar experienceFaqIconBarVertical" />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  className={`experienceFaqPanel${isOpen ? " isOpen" : ""}`}
                  role="region"
                  aria-labelledby={buttonId}
                >
                  <div className="experienceFaqPanelInner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .experienceFaqSection {
          background: #ffffff;
        }

        .experienceFaqList {
          display: grid;
          gap: clamp(0.7rem, 1.2vw, 1rem);
        }

        .experienceFaqItem {
          border: 1px solid rgba(31, 26, 23, 0.1);
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(31, 26, 23, 0.05);
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            border-color 220ms ease;
          overflow: clip;
        }

        .experienceFaqItem:hover,
        .experienceFaqItem:focus-within {
          transform: translateY(-2px);
          border-color: rgba(31, 26, 23, 0.16);
          box-shadow: 0 8px 20px rgba(31, 26, 23, 0.08);
        }

        .experienceFaqItemTitle {
          margin: 0;
        }

        .experienceFaqTrigger {
          width: 100%;
          border: 0;
          background: transparent;
          color: #1f1a17;
          font: inherit;
          text-align: left;
          cursor: pointer;
          min-height: 64px;
          padding: clamp(1rem, 1.7vw, 1.25rem) clamp(1rem, 2.2vw, 1.4rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .experienceFaqTrigger span:first-child {
          font-size: clamp(1.04rem, 1.35vw, 1.12rem);
          font-weight: 500;
          line-height: 1.4;
          letter-spacing: -0.01em;
          max-width: 60ch;
        }

        .experienceFaqTrigger:focus-visible {
          outline: 2px solid rgba(31, 26, 23, 0.55);
          outline-offset: -2px;
        }

        .experienceFaqIcon {
          position: relative;
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          border-radius: 999px;
          transform: rotate(0deg);
          transition: transform 220ms ease;
        }

        .experienceFaqIconBar {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 12px;
          height: 1.5px;
          background: rgba(31, 26, 23, 0.78);
          transform: translate(-50%, -50%);
          transform-origin: center;
          transition:
            opacity 220ms ease,
            transform 220ms ease,
            background-color 220ms ease;
        }

        .experienceFaqIconBarVertical {
          transform: translate(-50%, -50%) rotate(90deg);
        }

        .experienceFaqIcon.isOpen {
          transform: rotate(90deg);
        }

        .experienceFaqIcon.isOpen .experienceFaqIconBarVertical {
          opacity: 0;
          transform: translate(-50%, -50%) rotate(90deg) scaleX(0.6);
        }

        .experienceFaqPanel {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 280ms ease;
        }

        .experienceFaqPanel.isOpen {
          grid-template-rows: 1fr;
        }

        .experienceFaqPanelInner {
          overflow: hidden;
        }

        .experienceFaqPanel p {
          margin: 0;
          color: #4d433a;
          font-size: clamp(0.98rem, 1.25vw, 1.06rem);
          line-height: 1.68;
          max-width: 76ch;
          padding: 0 clamp(1rem, 2.2vw, 1.4rem) clamp(1.05rem, 2vw, 1.35rem);
        }

        @media (max-width: 900px) {
          .experienceFaqTrigger {
            min-height: 62px;
            padding: 0.95rem 1rem;
          }

          .experienceFaqPanel p {
            padding: 0 1rem 1rem;
          }
        }
      `}</style>
    </section>
  );
}
