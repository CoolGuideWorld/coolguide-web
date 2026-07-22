"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef } from "react";

type GuardianRank = {
  title: string;
  points: string;
  phrase: string;
};

type GuardianJourneyScene = {
  scene: number;
  src: string;
  alt: string;
};

const guardianRanks: GuardianRank[] = [
  {
    title: "Messager du Patrimoine",
    points: "0 points",
    phrase: "Tout voyage commence par une première histoire.",
  },
  {
    title: "Arpenteur de Ruines",
    points: "2 000 points",
    phrase: "Vous apprenez à voir ce que le temps a laissé derrière lui.",
  },
  {
    title: "Éclaireur de Vestiges",
    points: "6 000 points",
    phrase: "Les traces du passé deviennent peu à peu visibles.",
  },
  {
    title: "Chercheur de Merveilles",
    points: "15 000 points",
    phrase: "Vous découvrez que les plus grands trésors sont souvent invisibles.",
  },
  {
    title: "Découvreur de Monuments",
    points: "35 000 points",
    phrase: "Chaque monument révèle une histoire que le temps n'a jamais effacée.",
  },
  {
    title: "Explorateur des Horizons",
    points: "70 000 points",
    phrase: "Votre regard dépasse désormais les monuments pour embrasser le monde.",
  },
  {
    title: "Héritier du Patrimoine",
    points: "130 000 points",
    phrase: "Vous comprenez que cet héritage appartient à tous ceux qui le découvrent.",
  },
  {
    title: "Passeur de Mémoires",
    points: "220 000 points",
    phrase: "Les histoires que vous écoutez deviennent celles que vous transmettrez.",
  },
  {
    title: "Ambassadeur des Civilisations",
    points: "350 000 points",
    phrase: "Chaque culture enrichit votre regard et rapproche les peuples.",
  },
  {
    title: "Gardien de l'Héritage",
    points: "500 000 points",
    phrase: "Vous voyagez désormais avec la conviction que le patrimoine est un bien commun à préserver et transmettre.",
  },
];

const guardianJourney: GuardianJourneyScene[] = [
  {
    scene: 1,
    src: "/guardians/gardien-01-premier-contact.png",
    alt: "Premier contact avec le patrimoine",
  },
  {
    scene: 2,
    src: "/guardians/gardien-02-premiers-pas.png",
    alt: "Premiers pas dans les vestiges",
  },
  {
    scene: 3,
    src: "/guardians/gardien-03-exploration.png",
    alt: "Exploration des arènes",
  },
  {
    scene: 4,
    src: "/guardians/gardien-04-ville.png",
    alt: "Découverte de la ville",
  },
  {
    scene: 5,
    src: "/guardians/gardien-05-horizon.png",
    alt: "Ouverture vers un territoire plus vaste",
  },
  {
    scene: 6,
    src: "/guardians/gardien-06-monde.png",
    alt: "Découverte du monde",
  },
  {
    scene: 7,
    src: "/guardians/gardien-07-terre.png",
    alt: "Vue de la Terre",
  },
  {
    scene: 8,
    src: "/guardians/gardien-08-fete.png",
    alt: "Rencontre et fête avec les peuples",
  },
  {
    scene: 9,
    src: "/guardians/gardien-09-transmission.png",
    alt: "Retour à Nîmes et transmission",
  },
  {
    scene: 10,
    src: "/guardians/gardien-10-heritage.png",
    alt: "Héritage transmis aux enfants",
  },
];

export default function GuardiansNarrativeTrail() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const revealNodes = Array.from(
      root.querySelectorAll<HTMLElement>(".guardianTrailReveal")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          entry.target.classList.add("isVisible");
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    for (const node of revealNodes) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={rootRef} className="guardiansNarrative" aria-label="Les titres des Gardiens du Patrimoine">
      {guardianRanks.map((rank, index) => {
        const isReversed = index % 2 === 1;
        const scene = guardianJourney[index];
        const isFinalStage = index === guardianRanks.length - 1;

        if (!scene) {
          return null;
        }

        return (
          <Fragment key={rank.title}>
            <article
              className={`guardianTrailRow guardianTrailReveal${isReversed ? " isReversed" : ""}${isFinalStage ? " isFinalStage" : ""}`}
            >
              <div className="guardianTrailMedia" data-image-path={scene.src}>
                <div className="guardianTrailFrame">
                  <Image
                    className="guardianTrailImage"
                    src={scene.src}
                    alt={scene.alt}
                    width={1080}
                    height={1920}
                    sizes="(max-width: 900px) 92vw, (max-width: 1280px) 46vw, 430px"
                    priority={index === 0}
                  />
                </div>
              </div>

              <div className="guardianTrailContent">
                <h2 className="guardianTrailTitle">{rank.title}</h2>
                <p className="guardianTrailPoints">{rank.points}</p>
                <p className="guardianTrailPhrase">{rank.phrase}</p>
              </div>
            </article>

            {index === 4 ? (
              <p className="guardianJourneyBreath guardianTrailReveal" aria-label="Respiration du voyage">
                Chaque découverte élargit un peu notre regard.
              </p>
            ) : null}
          </Fragment>
        );
      })}

      <section className="guardianFinalSection guardianTrailReveal" aria-label="Conclusion du voyage">
        <div className="guardianTrailMedia guardianFinalMedia" data-image-path="/guardians/journey-final.jpg" aria-hidden="true">
          <div className="guardianTrailFrame guardianTrailFrameFinal">
            <Image
              className="guardianTrailImage guardianFinalImage"
              src="/guardians/journey-final.jpg"
              alt=""
              fill
              sizes="(max-width: 900px) calc(100vw - 2rem), 760px"
            />
          </div>
        </div>

        <div className="guardianFinalContent">
          <h2>Le voyage ne s'arrête jamais.</h2>
          <p>Le patrimoine du monde vous attend.</p>
          <a href="/" className="storeButton">
            Commencer l'aventure avec CoolGuide
          </a>
        </div>
      </section>
    </section>
  );
}
