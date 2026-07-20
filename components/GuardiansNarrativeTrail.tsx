"use client";

import { useEffect, useRef } from "react";

type GuardianRank = {
  title: string;
  points: string;
  phrase: string;
  imagePath: string;
};

const guardianRanks: GuardianRank[] = [
  {
    title: "Messager du Patrimoine",
    points: "0 points",
    phrase: "Tout voyage commence par une première histoire.",
    imagePath: "/guardians/guardian-rank-01.jpg",
  },
  {
    title: "Arpenteur de Ruines",
    points: "2 000 points",
    phrase: "Vous apprenez à voir ce que le temps a laissé derrière lui.",
    imagePath: "/guardians/guardian-rank-02.jpg",
  },
  {
    title: "Éclaireur de Vestiges",
    points: "6 000 points",
    phrase: "Les traces du passé deviennent peu à peu visibles.",
    imagePath: "/guardians/guardian-rank-03.jpg",
  },
  {
    title: "Chercheur de Merveilles",
    points: "15 000 points",
    phrase: "Vous découvrez que les plus grands trésors sont souvent invisibles.",
    imagePath: "/guardians/guardian-rank-04.jpg",
  },
  {
    title: "Découvreur de Monuments",
    points: "35 000 points",
    phrase: "Chaque monument révèle une histoire que le temps n'a jamais effacée.",
    imagePath: "/guardians/guardian-rank-05.jpg",
  },
  {
    title: "Explorateur des Horizons",
    points: "70 000 points",
    phrase: "Votre regard dépasse désormais les monuments pour embrasser le monde.",
    imagePath: "/guardians/guardian-rank-06.jpg",
  },
  {
    title: "Héritier du Patrimoine",
    points: "130 000 points",
    phrase: "Vous comprenez que cet héritage appartient à tous ceux qui le découvrent.",
    imagePath: "/guardians/guardian-rank-07.jpg",
  },
  {
    title: "Passeur de Mémoires",
    points: "220 000 points",
    phrase: "Les histoires que vous écoutez deviennent celles que vous transmettrez.",
    imagePath: "/guardians/guardian-rank-08.jpg",
  },
  {
    title: "Ambassadeur des Civilisations",
    points: "350 000 points",
    phrase: "Chaque culture enrichit votre regard et rapproche les peuples.",
    imagePath: "/guardians/guardian-rank-09.jpg",
  },
  {
    title: "Gardien de l'Héritage",
    points: "500 000 points",
    phrase: "Vous voyagez désormais avec la conviction que le patrimoine est un bien commun à préserver et transmettre.",
    imagePath: "/guardians/guardian-rank-10.jpg",
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

        return (
          <article
            key={rank.title}
            className={`guardianTrailRow guardianTrailReveal${isReversed ? " isReversed" : ""}`}
          >
            <div className="guardianTrailMedia" data-image-path={rank.imagePath} aria-hidden="true">
              <div className="guardianTrailPlaceholder" />
            </div>

            <div className="guardianTrailContent">
              <h2 className="guardianTrailTitle">{rank.title}</h2>
              <p className="guardianTrailPoints">{rank.points}</p>
              <p className="guardianTrailPhrase">{rank.phrase}</p>
            </div>
          </article>
        );
      })}

      <section className="guardianFinalSection guardianTrailReveal" aria-label="Conclusion du voyage">
        <div className="guardianTrailMedia guardianFinalMedia" data-image-path="/guardians/guardian-final.jpg" aria-hidden="true">
          <div className="guardianTrailPlaceholder" />
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
