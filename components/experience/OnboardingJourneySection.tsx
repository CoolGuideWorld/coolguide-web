"use client";

import Image from "next/image";
import onboardingMode from "./images/onboarding-mode.png";
import onboardingLocation from "./images/onboarding-location.png";
import onboardingDiscovery from "./images/onboarding-discovery.png";
import onboardingAudio from "./images/onboarding-audio.png";

const onboardingSteps = [
  {
    image: onboardingMode,
    label: "Choisissez votre mode",
    alt: "Écran d'onboarding : choix du mode de découverte",
  },
  {
    image: onboardingLocation,
    label: "Autorisez votre position",
    alt: "Écran d'onboarding : autorisation de la localisation",
  },
  {
    image: onboardingDiscovery,
    label: "Découvrez les lieux autour de vous",
    alt: "Écran d'onboarding : détection des lieux à proximité",
  },
  {
    image: onboardingAudio,
    label: "Écoutez les histoires",
    alt: "Écran d'onboarding : écoute des récits audio",
  },
];

export default function OnboardingJourneySection() {
  return (
    <section className="onboardingJourneySection" aria-labelledby="onboarding-journey-title">
      <div className="onboardingJourneyInner">
        <div className="onboardingJourneyHeader">
          <p>VOTRE PREMIÈRE VISITE</p>
          <h2 id="onboarding-journey-title">Quelques secondes suffisent pour préparer votre voyage.</h2>
          <p>
            Choisissez votre mode de découverte, autorisez la géolocalisation et laissez CoolGuide vous accompagner automatiquement tout au long de votre visite.
          </p>
        </div>

        <ol className="onboardingJourneyTrack" aria-label="Parcours de premiere visite">
          {onboardingSteps.map((step, index) => (
            <li className="onboardingStep" key={step.label}>
              <div className="onboardingStepImageWrap">
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={540}
                  height={1170}
                  className="onboardingStepImage"
                  sizes="(max-width: 700px) min(100vw - 3rem, 320px), (max-width: 1100px) min((100vw - 5rem) / 2, 260px), clamp(220px, 18vw, 270px)"
                />
              </div>
              <p className="onboardingStepLabel">{step.label}</p>
              {index < onboardingSteps.length - 1 ? <span className="onboardingConnector" aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>
      </div>

      <style jsx>{`
        .onboardingJourneySection {
          padding: clamp(2rem, 3.8vw, 3rem) clamp(1rem, 4vw, 3rem);
        }

        .onboardingJourneyInner {
          max-width: 1320px;
          margin: 0 auto;
          display: grid;
          gap: clamp(1rem, 2.4vw, 1.8rem);
        }

        .onboardingJourneyHeader {
          max-width: 860px;
        }

        .onboardingJourneyHeader > p:first-child {
          margin: 0 0 0.75rem;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7d6f60;
        }

        .onboardingJourneyHeader h2 {
          margin: 0;
          color: #1f1a17;
          font-size: clamp(1.7rem, 3vw, 2.6rem);
          font-weight: 300;
          line-height: 1.08;
          letter-spacing: -0.02em;
          max-width: 20ch;
        }

        .onboardingJourneyHeader > p:last-child {
          margin: clamp(0.95rem, 2vw, 1.25rem) 0 0;
          color: #4d433a;
          font-size: clamp(0.98rem, 1.25vw, 1.08rem);
          line-height: 1.6;
          max-width: 72ch;
        }

        .onboardingJourneyTrack {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          flex-wrap: nowrap;
        }

        .onboardingStep {
          position: relative;
          width: clamp(220px, 18vw, 270px);
          display: grid;
          justify-items: center;
          gap: 0.7rem;
        }

        .onboardingStep + .onboardingStep {
          margin-left: -14px;
        }

        .onboardingStepImageWrap {
          width: 100%;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(31, 26, 23, 0.14);
          background: transparent;
        }

        .onboardingStepImage {
          width: 100%;
          height: auto;
          display: block;
        }

        .onboardingStep:nth-child(1) .onboardingStepImageWrap {
          transform: rotate(-2deg);
        }

        .onboardingStep:nth-child(2) .onboardingStepImageWrap {
          transform: rotate(1deg);
        }

        .onboardingStep:nth-child(3) .onboardingStepImageWrap {
          transform: rotate(-1deg);
        }

        .onboardingStep:nth-child(4) .onboardingStepImageWrap {
          transform: rotate(2deg);
        }

        .onboardingStepLabel {
          margin: 0;
          color: #4d433a;
          font-size: 0.94rem;
          line-height: 1.35;
          text-align: center;
          max-width: 22ch;
        }

        .onboardingConnector {
          position: absolute;
          top: 42%;
          right: -16px;
          width: 14px;
          height: 1px;
          background: rgba(31, 26, 23, 0.28);
          transform: translateY(-50%);
          z-index: 2;
        }

        .onboardingConnector::after {
          content: "";
          position: absolute;
          right: -3px;
          top: 50%;
          width: 5px;
          height: 5px;
          border-top: 1px solid rgba(31, 26, 23, 0.28);
          border-right: 1px solid rgba(31, 26, 23, 0.28);
          transform: translateY(-50%) rotate(45deg);
        }

        @media (max-width: 1100px) {
          .onboardingJourneyTrack {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            justify-items: center;
            gap: 1.2rem 1rem;
          }

          .onboardingStep {
            width: min(100%, 260px);
          }

          .onboardingStep + .onboardingStep {
            margin-left: 0;
          }

          .onboardingConnector {
            display: none;
          }
        }

        @media (max-width: 700px) {
          .onboardingJourneySection {
            padding: 1.8rem 1rem 2rem;
          }

          .onboardingJourneyTrack {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .onboardingStep {
            width: min(100%, 320px);
          }

          .onboardingStepImageWrap {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
