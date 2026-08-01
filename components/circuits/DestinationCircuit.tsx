import Link from "next/link";
import styles from "@/components/cities/city.module.css";
import circuitStyles from "@/components/circuits/circuit.module.css";
import type { DestinationCircuitContext } from "@/types/circuit";

type DestinationCircuitProps = {
  contexts: DestinationCircuitContext[];
};

export default function DestinationCircuit({
  contexts,
}: DestinationCircuitProps) {
  if (contexts.length === 0) {
    return null;
  }

  return (
    <section
      className={circuitStyles.destinationCircuitsStack}
      aria-label="Circuits contenant cette destination"
    >
      {contexts.map((context) => (
        <article
          key={context.circuit.id}
          className={styles.section}
          aria-labelledby={`destination-circuit-title-${context.circuit.id}`}
        >
          <div className={styles.introBlock}>
            <p className={styles.heroMeta}>
              Cette destination fait partie du circuit
            </p>

            <h2
              id={`destination-circuit-title-${context.circuit.id}`}
              className={styles.sectionTitle}
            >
              <Link
                className={styles.appLink}
                href={`/circuits/${context.circuit.slug}`}
              >
                {context.circuit.title}
              </Link>
            </h2>

            <p className={styles.introParagraph}>
              Durée estimée: {context.circuit.estimatedDuration}
            </p>

            {context.currentStep ? (
              <p className={styles.itineraryDuration}>
                Étape {context.currentStep.position} sur {context.totalSteps}
              </p>
            ) : null}
          </div>

          <nav
            aria-label={`Frise du circuit ${context.circuit.title}`}
            className={circuitStyles.destinationTimelineNav}
          >
            <ol className={circuitStyles.timelineList}>
              {context.steps.map((step, index) => {
                const isLast = index === context.steps.length - 1;
                const isCurrent = context.currentStep?.id === step.id;

                return (
                  <li
                    key={`destination-circuit-step-${context.circuit.id}-${step.id}`}
                    className={circuitStyles.timelineItem}
                  >
                    <div className={circuitStyles.timelineTopRow}>
                      <Link
                        href={`/${step.slug}`}
                        aria-label={`Étape ${step.position} : ${step.title}`}
                        aria-current={isCurrent ? "step" : undefined}
                        className={`${circuitStyles.timelinePoint} ${
                          isCurrent ? circuitStyles.timelinePointCurrent : ""
                        }`}
                      >
                        {step.position}
                      </Link>

                      {!isLast ? (
                        <span
                          aria-hidden="true"
                          className={circuitStyles.timelineConnector}
                        />
                      ) : null}
                    </div>

                    <Link
                      className={`${styles.appLink} ${
                        isCurrent ? circuitStyles.timelineStepLinkCurrent : ""
                      }`}
                      href={`/${step.slug}`}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      {step.title}
                    </Link>

                    {isCurrent ? (
                      <p className={circuitStyles.currentStepHint}>
                        Vous êtes ici
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>

          <nav
            aria-label={`Navigation entre les étapes du circuit ${context.circuit.title}`}
            className={circuitStyles.stepNav}
          >
            {context.previousStep ? (
              <Link
                className={styles.appLink}
                href={`/${context.previousStep.slug}`}
                aria-label={`Étape précédente : ${context.previousStep.title}`}
              >
                Précédent: {context.previousStep.title}
              </Link>
            ) : null}

            {context.nextStep ? (
              <Link
                className={styles.appLink}
                href={`/${context.nextStep.slug}`}
                aria-label={`Étape suivante : ${context.nextStep.title}`}
              >
                Suivant: {context.nextStep.title}
              </Link>
            ) : null}
          </nav>
        </article>
      ))}
    </section>
  );
}