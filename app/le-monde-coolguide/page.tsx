import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Le Monde CoolGuide | CoolGuide World",
  description: "La page narrative qui raconte la vision de CoolGuide.",
};

export default function LeMondeCoolGuidePage() {
  return (
    <>
      <SiteHeader initialSolid />

      <main
        style={{
          background: "#f4ede2",
          color: "#1f1a17",
          padding: "clamp(5rem, 10vw, 8rem) clamp(1.1rem, 4vw, 2.25rem) clamp(4rem, 8vw, 6rem)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "920px",
            margin: "0 auto",
          }}
        >
          <section
            style={{
              paddingBottom: "clamp(3rem, 7vw, 5rem)",
            }}
          >
            <p
              style={{
                margin: "0 0 0.9rem",
                fontSize: "0.9rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#7d6f60",
              }}
            >
              Chapitre 1
            </p>
            <h1
              style={{
                margin: 0,
                maxWidth: "11ch",
                fontSize: "clamp(2.45rem, 6vw, 5.6rem)",
                fontWeight: 300,
                lineHeight: 1.02,
                letterSpacing: "-0.05em",
              }}
            >
              Et si vous ne voyiez qu’une partie de l’histoire ?
            </h1>

            <div
              style={{
                marginTop: "1.5rem",
                maxWidth: "40rem",
                fontSize: "clamp(1.05rem, 1.7vw, 1.28rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>Nous traversons souvent des lieux extraordinaires sans vraiment comprendre ce qu’ils ont vécu.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Nous regardons.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Nous photographions.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Puis nous repartons.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Mais ce que nous voyons n’est parfois qu’une petite partie de leur histoire.</p>
            </div>
          </section>

          <section
            style={{
              padding: "clamp(3rem, 7vw, 5rem) 0",
            }}
          >
            <p
              style={{
                margin: 0,
                maxWidth: "13ch",
                fontSize: "clamp(2.1rem, 4.5vw, 4.25rem)",
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "-0.05em",
              }}
            >
              Le passé n’est pas derrière nous.
              <br />
              Il est autour de nous.
            </p>

            <div
              style={{
                marginTop: "1.45rem",
                maxWidth: "41rem",
                fontSize: "clamp(1.02rem, 1.65vw, 1.2rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>Les lieux conservent la mémoire de celles et ceux qui les ont façonnés.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Leurs histoires sont encore là.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Présentes dans une pierre, une rue, un paysage ou un détail que l’on n’aurait peut-être jamais remarqué.</p>
            </div>
          </section>

          <section
            style={{
              padding: "clamp(3rem, 7vw, 5rem) 0",
            }}
          >
            <p
              style={{
                margin: 0,
                maxWidth: "15ch",
                fontSize: "clamp(2rem, 4vw, 3.8rem)",
                fontWeight: 300,
                lineHeight: 1.12,
                letterSpacing: "-0.05em",
              }}
            >
              Les lieux parlent à ceux qui prennent le temps de les écouter.
            </p>

            <div
              style={{
                marginTop: "1.4rem",
                maxWidth: "42rem",
                fontSize: "clamp(1.02rem, 1.65vw, 1.2rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>CoolGuide est né de cette conviction.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Un lieu ne devient vraiment vivant que lorsque l’on comprend ce qu’il raconte.</p>
              <p style={{ margin: "0.9rem 0 0" }}>L’application ne cherche pas à détourner le regard vers un écran.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Elle aide simplement à mieux regarder ce qui se trouve déjà devant nous.</p>
            </div>
          </section>

          <section
            style={{
              padding: "clamp(4rem, 9vw, 7rem) 0",
            }}
          >
            <p
              style={{
                margin: 0,
                maxWidth: "14ch",
                fontSize: "clamp(2.1rem, 5vw, 4.4rem)",
                fontWeight: 300,
                lineHeight: 1.08,
                letterSpacing: "-0.05em",
              }}
            >
              Un guide ne montre pas le chemin.
              <br />
              Il révèle ce que les autres ne voient pas.
            </p>
          </section>

          <section
            style={{
              padding: "clamp(3rem, 7vw, 5rem) 0",
            }}
          >
            <p
              style={{
                margin: "0 0 0.9rem",
                fontSize: "0.9rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#7d6f60",
              }}
            >
              Le Monde CoolGuide
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "clamp(2.2rem, 4.8vw, 4.8rem)",
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: "-0.05em",
              }}
            >
              Le Monde CoolGuide
            </h2>

            <div
              style={{
                marginTop: "1.35rem",
                maxWidth: "42rem",
                fontSize: "clamp(1.02rem, 1.65vw, 1.2rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>Le Monde CoolGuide n’est pas un produit.</p>
              <p style={{ margin: "0.9rem 0 0" }}>C’est un écosystème.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Une façon de voyager.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Une façon de regarder le monde.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Une façon de rencontrer les autres.</p>
            </div>

            <div
              style={{
                marginTop: "1.75rem",
                maxWidth: "50rem",
                display: "grid",
                gap: "0.85rem",
                fontSize: "clamp(1.02rem, 1.55vw, 1.12rem)",
                lineHeight: 1.7,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>On voyage pour comprendre, pas seulement pour collectionner des photos.</p>
              <p style={{ margin: 0 }}>On respecte les lieux autant qu’on les admire.</p>
              <p style={{ margin: 0 }}>On s’intéresse aux habitants autant qu’aux monuments.</p>
              <p style={{ margin: 0 }}>On partage ses découvertes pour donner envie aux autres.</p>
              <p style={{ margin: 0 }}>On reste curieux toute sa vie.</p>
              <p style={{ margin: 0 }}>Chaque voyage nous change un peu.</p>
            </div>
          </section>

          <section
            style={{
              padding: "clamp(3rem, 7vw, 5rem) 0 0",
            }}
          >
            <p
              style={{
                margin: 0,
                maxWidth: "46rem",
                fontSize: "clamp(1.28rem, 2vw, 1.8rem)",
                lineHeight: 1.6,
                color: "#2a241f",
              }}
            >
              CoolGuide ne dit pas :
              <br />
              <br />
              “Regardez comme nous sommes extraordinaires.”
              <br />
              <br />
              CoolGuide dit :
              <br />
              <br />
              “Regardez comme le monde est extraordinaire.”
            </p>

            <p
              style={{
                margin: "1.75rem 0 0",
                maxWidth: "40rem",
                fontSize: "clamp(1.08rem, 1.75vw, 1.26rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              Le monde est déjà extraordinaire.
              <br />
              Il suffit d’apprendre à le regarder.
            </p>

            <div style={{ marginTop: "2rem" }}>
              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "44px",
                  padding: "0.9rem 1.25rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(31, 26, 23, 0.14)",
                  background: "rgba(255, 255, 255, 0.28)",
                  color: "#1f1a17",
                  textDecoration: "none",
                  fontSize: "0.98rem",
                }}
              >
                Découvrir CoolGuide
              </a>
            </div>

            <div style={{ marginTop: "1.6rem" }}>
              <a
                href="/le-monde-coolguide/gardiens-du-patrimoine"
                style={{
                  display: "inline-block",
                  color: "#5f5449",
                  textDecoration: "underline",
                  textUnderlineOffset: "0.22em",
                  fontSize: "0.98rem",
                  lineHeight: 1.6,
                }}
              >
                Découvrir les Gardiens du Patrimoine
              </a>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}