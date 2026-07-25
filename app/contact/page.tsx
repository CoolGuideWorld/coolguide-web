import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactReasonsFormSection from "@/components/contact/ContactReasonsFormSection";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact | CoolGuide",
  description:
    "Contactez l’équipe CoolGuide pour une question, une suggestion, un partenariat ou pour proposer une destination.",
};

const faqItems = [
  {
    question: "Quel est votre délai de réponse ?",
    answer:
      "Nous faisons notre maximum pour répondre à chaque message dans un délai de 24 à 48 heures ouvrées.",
  },
  {
    question: "Puis-je proposer une destination ou un monument ?",
    answer:
      "Oui. Nous sommes toujours heureux de découvrir de nouveaux lieux et de nouvelles idées. N’hésitez pas à nous écrire.",
  },
  {
    question:
      "Je représente une collectivité ou un professionnel du tourisme. Puis-je vous contacter ?",
    answer:
      "Bien sûr. Que vous soyez une ville, un office de tourisme, un musée ou un autre acteur du patrimoine, nous serons ravis d’échanger avec vous.",
  },
  {
    question: "Comment signaler une erreur dans un contenu ?",
    answer:
      "Malgré toute l’attention que nous portons à nos contenus, une erreur peut arriver. Vos remarques nous aident à améliorer CoolGuide et sont toujours les bienvenues.",
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader initialSolid />

      <main className={styles.contactPageMain}>
        <section className={styles.contactHero} aria-labelledby="contact-page-title">
          <div className={`${styles.contactContainer} ${styles.contactHeroInner}`}>
            <div className={styles.contactHeroContent}>
              <h1 id="contact-page-title">Contactez-nous</h1>
              <p>
                Une question, une suggestion ou un projet ? Nous sommes toujours heureux d’échanger
                avec les personnes qui partagent notre passion du patrimoine et du voyage.
              </p>
              <a href="#contact-form" className={styles.contactPrimaryButton}>
                Nous écrire
              </a>
            </div>

            <div className={styles.contactHeroVisual} aria-hidden="true">
              <Image
                src="/hero/hero-06-bridge.jpg"
                alt=""
                fill
                sizes="(max-width: 960px) 100vw, 38vw"
                className={styles.contactHeroImage}
              />
            </div>
          </div>
        </section>

        <ContactReasonsFormSection />

        <section className={styles.contactLocations} aria-labelledby="contact-reach-us-title">
          <div className={`${styles.contactContainer} ${styles.contactLocationsInner}`}>
            <aside className={styles.contactReachUs} aria-labelledby="contact-reach-us-title">
              <h3 id="contact-reach-us-title">Nous contacter</h3>
              <ul>
                <li>
                  <a href="mailto:contact.coolguide@gmail.com">E-mail : contact.coolguide@gmail.com</a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/coolguide_world/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/laurent-caron-0604b5416/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.tiktok.com/@_coolguide_"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    TikTok
                  </a>
                </li>
              </ul>
              <p>
                Vous pouvez également suivre l’évolution de CoolGuide et découvrir les coulisses du projet
                sur nos réseaux sociaux.
              </p>
            </aside>
          </div>
        </section>

        <section className={styles.contactFaq} aria-labelledby="contact-faq-title">
          <div className={styles.contactContainer}>
            <h2 id="contact-faq-title">Questions fréquentes</h2>
            <div className={styles.contactFaqGrid}>
              {faqItems.map((item) => (
                <article key={item.question} className={styles.contactFaqItem}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.contactFinalCta} aria-labelledby="contact-cta-title">
          <div className={`${styles.contactContainer} ${styles.contactCtaInner}`}>
            <h2 id="contact-cta-title">Le prochain voyage commence peut-être aujourd’hui.</h2>
            <p>
              Téléchargez CoolGuide et laissez les histoires des lieux vous accompagner, où que vous voyagiez.
            </p>
            <Link href="/#download" className={styles.contactPrimaryButton}>
              Télécharger CoolGuide
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}