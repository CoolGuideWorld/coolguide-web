import type { Metadata } from "next";
import Image from "next/image";
import GuardiansNarrativeTrail from "@/components/GuardiansNarrativeTrail";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Les Gardiens du Patrimoine | CoolGuide World",
  description: "La philosophie des Gardiens du Patrimoine dans l'univers CoolGuide.",
};

export default function GardiensDuPatrimoinePage() {
  return (
    <>
      <SiteHeader initialSolid />

      <main
        className="guardiansPage"
        style={{
          background: "#f4ede2",
          color: "#1f1a17",
          padding: "calc(clamp(7.2rem, 10vw, 9.4rem) + 34px) clamp(1.1rem, 4vw, 2.25rem) clamp(2.8rem, 5.6vw, 4.2rem)",
        }}
      >
        <section
          className="guardiansSection"
          style={{
            width: "100%",
            maxWidth: "1120px",
            margin: "0 auto",
          }}
        >
          <h1
            className="guardiansTitle"
            style={{
              margin: 0,
              textAlign: "center",
              fontSize: "clamp(1.95rem, 4.4vw, 4.2rem)",
              fontWeight: 300,
              lineHeight: 1.04,
              letterSpacing: "-0.05em",
            }}
          >
            Les Gardiens du Patrimoine
          </h1>

          <div
            className="guardiansGrid"
            style={{
              marginTop: "clamp(2.1rem, 5vw, 3rem)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              alignItems: "start",
              gap: "3rem",
            }}
          >
            <div
              className="guardiansVisualCol"
              aria-hidden="true"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <Image
                className="guardiansEmblem"
                src="/guardians/guardians-emblem.png"
                alt="Embleme des Gardiens du Patrimoine"
                width={650}
                height={650}
                style={{
                  width: "100%",
                  maxWidth: "clamp(280px, 56vw, 650px)",
                  height: "auto",
                  display: "block",
                  marginInline: "auto",
                }}
              />

              <blockquote className="guardiansQuote">
                <p>
                  « Le véritable trésor n'est pas le lieu que vous découvrez. C'est le regard que vous portez désormais sur le monde. »
                </p>
              </blockquote>
            </div>

            <div
              className="guardiansTextCol"
              style={{
                maxWidth: "34rem",
                color: "#3f362f",
                fontSize: "clamp(1.02rem, 1.6vw, 1.16rem)",
                lineHeight: 1.82,
              }}
            >
              <p>Voyager, ce n'est pas seulement découvrir de nouveaux lieux.</p>
              <p>C'est apprendre à les regarder autrement.</p>
              <p>Chaque monument, chaque paysage, chaque histoire entendue change un peu notre regard sur le monde.</p>
              <p>Les Gardiens du Patrimoine ne récompensent pas la vitesse, ni le nombre de kilomètres parcourus.</p>
              <p>Ils célèbrent une autre forme de progression.</p>
              <p>Une progression intérieure.</p>
              <p>Au fil de vos découvertes, la curiosité devient connaissance, la connaissance devient compréhension, puis la compréhension laisse place à la sagesse.</p>
              <p>Chaque titre représente une étape de ce voyage.</p>
              <p>Non pas vers une destination, mais vers une nouvelle manière de voir le monde.</p>
            </div>
          </div>
        </section>

        <GuardiansNarrativeTrail />
      </main>

      <SiteFooter />
    </>
  );
}