import type { Metadata } from "next";
import Image from "next/image";
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
        style={{
          background: "#f4ede2",
          color: "#1f1a17",
          padding: "clamp(4.8rem, 9vw, 7.8rem) clamp(1.1rem, 4vw, 2.25rem) clamp(3.8rem, 7vw, 6rem)",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "920px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              margin: 0,
              textAlign: "center",
              fontSize: "clamp(2.2rem, 5vw, 4.9rem)",
              fontWeight: 300,
              lineHeight: 1.04,
              letterSpacing: "-0.05em",
            }}
          >
            Les Gardiens du Patrimoine
          </h1>

          <div
            style={{
              marginTop: "clamp(2.1rem, 5vw, 3rem)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              alignItems: "center",
              gap: "4rem",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                src="/guardians/guardians-emblem.png"
                alt="Embleme des Gardiens du Patrimoine"
                width={430}
                height={430}
                style={{
                  width: "100%",
                  maxWidth: "430px",
                  height: "auto",
                  display: "block",
                  marginInline: "auto",
                }}
              />
            </div>

            <div
              style={{
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

              <blockquote
                style={{
                  margin: "2.25rem auto 0",
                  maxWidth: "34ch",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.1rem, 1.8vw, 1.36rem)",
                    lineHeight: 1.72,
                    color: "#2a241f",
                    fontStyle: "italic",
                  }}
                >
                  « Le véritable trésor n'est pas le lieu que vous découvrez. C'est le regard que vous portez désormais sur le monde. »
                </p>
              </blockquote>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}