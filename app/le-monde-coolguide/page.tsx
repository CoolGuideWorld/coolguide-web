import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import styles from "./page.module.css";

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
          padding: "calc(clamp(4.25rem, 8.5vw, 6.8rem) + 36px) 0 clamp(3.4rem, 6.8vw, 5.1rem)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "none",
            margin: 0,
          }}
        >
          <section
            className={`${styles.lmSection} ${styles.lmCream} ${styles.lmReveal}`}
            style={{
              paddingBottom: "clamp(2.55rem, 6vw, 4.25rem)",
            }}
          >
            <div className={styles.lmInner}>
            <h1
              className={styles.lmTitle}
              style={{
                margin: 0,
                fontSize: "clamp(2rem, 4.9vw, 4.6rem)",
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: "-0.05em",
                color: "#10243d",
              }}
            >
              Pourquoi CoolGuide existe
            </h1>
            <div className={styles.lmTitleRule} aria-hidden="true" />

            <figure
              className={`${styles.lmPhotoWrap} ${styles.lmReveal}`}
              style={{ marginTop: "1.25rem", marginBottom: "1.45rem" }}
            >
              <img
                className={styles.lmPhoto}
                src="/monde-coolguide/touristes-devant-panneau-monument.jpg"
                alt=""
                loading="lazy"
              />
            </figure>

            <div
              className={styles.lmTextBlock}
              style={{
                marginTop: 0,
                fontSize: "clamp(1.05rem, 1.7vw, 1.28rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}><span className={styles.lmDropCap} aria-hidden="true">P</span>endant des années, j&apos;ai parcouru des villes sans imaginer toutes les histoires qui se cachaient autour de moi.</p>
              <p style={{ margin: "1.5rem 0 0" }}>J&apos;admirais les monuments, je prenais quelques photos et, quand c&apos;était possible, je m&apos;arrêtais pour lire les panneaux explicatifs.</p>

              <p style={{ margin: "1.5rem 0 0" }}>Mais ce n&apos;était pas toujours aussi simple.</p>

              <p style={{ margin: "1.5rem 0 0" }}>À l&apos;étranger, les explications étaient souvent uniquement dans la langue du pays ou parfois seulement en anglais. Même avec un traducteur sur son téléphone, la visite perdait de sa spontanéité. Il fallait sortir son téléphone, prendre le panneau en photo, attendre la traduction, puis essayer de retrouver le fil de l&apos;histoire.</p>
              <p style={{ margin: "0.9rem 0 0" }}>En France, les panneaux sont généralement en français, mais là encore ce n&apos;était pas toujours évident. Quand on voyage en famille ou entre amis, on ne peut pas demander à tout le monde d&apos;attendre plusieurs minutes devant chaque panneau. Les enfants veulent continuer, quelqu&apos;un a envie d&apos;aller boire un café, d&apos;autres préfèrent poursuivre la visite.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Et puis il y a ces monuments où l&apos;on aimerait simplement lire quelques lignes, mais où une dizaine de personnes est déjà regroupée devant le panneau. On attend un peu, on essaie d&apos;apercevoir quelques phrases par-dessus les épaules des autres, puis on finit par repartir.</p>
              <p style={{ margin: "1.5rem 0 0" }}>Parfois, il n&apos;y avait tout simplement aucune explication.</p>

              <p style={{ margin: "1.5rem 0 0" }}>Je repartais avec de belles photos, mais avec la sensation d&apos;être passé à côté de quelque chose.</p>

              <p style={{ margin: "1.5rem 0 0" }}>Les monuments étaient magnifiques. Les villes étaient magnifiques. Pourtant, je ne connaissais pas vraiment leur histoire.</p>

              <p style={{ margin: "1.5rem 0 0" }}>Je m&apos;en suis rendu compte encore davantage pendant les longs trajets en voiture.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Pendant des années, j&apos;ai traversé des centaines de villes, de villages et de paysages en écoutant souvent les mêmes stations de radio ou les mêmes musiques. Je trouvais dommage de parcourir autant de kilomètres sans savoir ce qui m&apos;entourait.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Combien de fois suis-je passé à quelques kilomètres d&apos;un château, d&apos;un village remarquable ou d&apos;un monument exceptionnel sans même le savoir ?</p>

              <p style={{ margin: "1.5rem 0 0" }}>Des milliers d&apos;histoires défilaient devant moi.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Et je ne les entendais jamais.</p>
            </div>
            </div>
          </section>

          <figure className={`${styles.lmPhotoWrap} ${styles.lmReveal}`}>
            <div className={styles.lmInner}>
            <img
              className={styles.lmPhoto}
              src="/monde-coolguide/famille-audioguide-vannes-porte-saint-vincent.jpg"
              alt=""
              loading="lazy"
            />
            </div>
          </figure>

          <section
            className={`${styles.lmSection} ${styles.lmWhite} ${styles.lmCreamToWhite} ${styles.lmReveal}`}
            style={{
              padding: "clamp(2.55rem, 6vw, 4.25rem) 0",
            }}
          >
            <div className={styles.lmInner}>
            <p
              className={styles.lmTitle}
              style={{
                margin: 0,
                fontSize: "clamp(1.75rem, 3.8vw, 3.5rem)",
                fontWeight: 600,
                lineHeight: 1.14,
                letterSpacing: "-0.05em",
                color: "#10243d",
              }}
            >
              Une question ne me quittait plus
            </p>
            <div className={styles.lmTitleRule} aria-hidden="true" />

            <div
              className={styles.lmTextBlock}
              style={{
                marginTop: "1.2rem",
                fontSize: "clamp(1.02rem, 1.65vw, 1.2rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>Au fil des voyages, je retrouvais toujours les mêmes difficultés. Je cherchais des informations sur Internet avant de partir, je traduisais les panneaux lorsque je ne comprenais pas la langue, je consultais plusieurs applications ou je finissais parfois par lire l&apos;histoire d&apos;un monument une fois rentré chez moi, alors que le moment était déjà passé.</p>
              <p style={{ margin: "0.9rem 0 0" }}>À force de revivre les mêmes situations, une question est revenue à chacun de mes voyages.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Pourquoi fallait-il toujours chercher l&apos;histoire d&apos;un lieu alors que nous étions déjà devant lui ?</p>
              <p style={{ margin: "0.9rem 0 0" }}>Pourquoi était-il si facile d&apos;écouter de la musique partout dans le monde, mais si compliqué d&apos;écouter l&apos;histoire d&apos;une ville ou d&apos;un monument au moment même où nous le découvrions ?</p>
              <p style={{ margin: "0.9rem 0 0" }}>Je ne comprenais pas pourquoi la technologie nous permettait d&apos;accéder instantanément à presque tout, mais pas aux histoires qui se trouvaient pourtant juste sous nos yeux.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Cette idée est restée longtemps dans un coin de ma tête, sans que je sache encore qu&apos;elle allait un jour devenir CoolGuide.</p>
            </div>
            </div>
          </section>

          <section
            className={`${styles.lmSection} ${styles.lmCream} ${styles.lmWhiteToCream} ${styles.lmReveal}`}
            style={{
              padding: "clamp(2.55rem, 6vw, 4.25rem) 0",
            }}
          >
            <div className={styles.lmInner}>
            <p
              className={styles.lmTitle}
              style={{
                margin: 0,
                fontSize: "clamp(1.68rem, 3.4vw, 3.15rem)",
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "-0.05em",
                color: "#10243d",
              }}
            >
              C&apos;est ainsi qu&apos;est née CoolGuide
            </p>
            <div className={styles.lmTitleRule} aria-hidden="true" />

            <div
              className={styles.lmTextBlock}
              style={{
                marginTop: "1.2rem",
                fontSize: "clamp(1.02rem, 1.65vw, 1.2rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>Pendant longtemps, cette idée est restée dans un coin de ma tête. Elle revenait à chaque voyage, à chaque monument, à chaque trajet en voiture. J&apos;avais le sentiment qu&apos;il devait exister une manière plus simple et plus naturelle de découvrir le patrimoine, sans avoir à chercher des informations au bon moment.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Puis un jour, tout est devenu évident.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Et si ce n&apos;était plus au voyageur de chercher l&apos;histoire d&apos;un lieu ? Et si c&apos;était le lieu lui-même qui venait à sa rencontre ?</p>
              <p style={{ margin: "0.9rem 0 0" }}>Je me suis alors mis à imaginer une application d&apos;audioguide capable d&apos;accompagner les voyageurs partout où ils vont. Une application qui reconnaîtrait l&apos;endroit où l&apos;on se trouve et qui commencerait simplement à raconter son histoire lorsque le moment est venu, sans interrompre la visite et sans détourner le regard des monuments ou des paysages.</p>
              <p style={{ margin: "0.9rem 0 0" }}>C&apos;est ainsi qu&apos;est née CoolGuide.</p>
              <p style={{ margin: "0.9rem 0 0" }}>J&apos;ai voulu créer un audioguide GPS capable de raconter automatiquement l&apos;histoire des villes, des villages, des monuments et des autres lieux de patrimoine, dans plusieurs langues, afin que chacun puisse découvrir un pays avec la même facilité, quelle que soit sa langue.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Très vite, l&apos;idée a dépassé les simples visites à pied. Pourquoi ne pas accompagner également les longs trajets en voiture ? Pourquoi laisser défiler des centaines de kilomètres de paysages, de villages et de sites remarquables sans jamais connaître leur histoire ? C&apos;est ainsi qu&apos;est né le mode voiture, aux côtés du mode piéton, pour transformer chaque voyage en une découverte permanente.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Depuis le premier jour, mon objectif est resté le même : faire en sorte que la technologie s&apos;efface. Qu&apos;elle ne soit plus une distraction, mais un lien discret entre les voyageurs et les histoires qui les entourent.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Au fond, je n&apos;ai jamais voulu créer une application de plus. J&apos;ai simplement voulu créer celle que j&apos;aurais aimé avoir avec moi pendant toutes ces années de voyage.</p>
            </div>
            </div>
          </section>

          <figure className={`${styles.lmPhotoWrap} ${styles.lmReveal}`}>
            <div className={styles.lmInner}>
            <img
              className={styles.lmPhoto}
              src="/monde-coolguide/couple-audioguide-gps-voiture-cathedrale.jpg"
              alt=""
              loading="lazy"
            />
            </div>
          </figure>

          <section
            className={`${styles.lmSection} ${styles.lmWhite} ${styles.lmCreamToWhite} ${styles.lmReveal}`}
            style={{
              padding: "clamp(3.4rem, 7.65vw, 5.95rem) 0",
            }}
          >
            <div className={styles.lmInner}>
            <p
              className={styles.lmTitle}
              style={{
                margin: 0,
                fontSize: "clamp(1.75rem, 4.15vw, 3.6rem)",
                fontWeight: 600,
                lineHeight: 1.14,
                letterSpacing: "-0.05em",
                color: "#10243d",
              }}
            >
              Bien plus qu&apos;une application
            </p>
            <div className={styles.lmTitleRule} aria-hidden="true" />

            <div
              className={styles.lmTextBlock}
              style={{
                marginTop: "1.2rem",
                fontSize: "clamp(1.02rem, 1.65vw, 1.2rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>Lorsque les premiers essais ont commencé, je me suis rapidement rendu compte que je n&apos;étais pas en train de créer un simple audioguide.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Ce qui changeait réellement, ce n&apos;était pas la façon d&apos;utiliser son téléphone. C&apos;était la façon de voyager.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Au lieu de s&apos;arrêter devant un panneau, de sortir son téléphone ou de chercher des informations sur Internet, il suffisait désormais de marcher, de regarder autour de soi et d&apos;écouter. Les monuments reprenaient leur place au centre de la visite, tandis que la technologie devenait presque invisible.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Je me suis souvent imaginé quelqu&apos;un assis face aux Arènes de Nîmes, écoutant leur histoire sans quitter le monument des yeux. Ou une famille découvrant une petite ruelle, un village ou une église sans avoir besoin de se demander où trouver des explications. Ou encore un couple traversant une région en voiture, laissant simplement les paysages défiler pendant que les histoires des lieux apparaissent naturellement au fil du trajet.</p>
              <p style={{ margin: "0.9rem 0 0" }}>C&apos;est cette simplicité que je recherchais depuis le début.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Je voulais que chacun puisse découvrir le patrimoine à son rythme, sans préparation, sans recherche interminable et sans avoir à manipuler son téléphone toutes les quelques minutes.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Aujourd&apos;hui encore, c&apos;est cette idée qui guide chaque évolution de CoolGuide : permettre à chacun de voyager autrement, de découvrir les villes, les villages et les monuments avec un regard nouveau, tout en laissant la technologie s&apos;effacer derrière les histoires.</p>
            </div>
            </div>
          </section>

          <section
            className={`${styles.lmSection} ${styles.lmCream} ${styles.lmWhiteToCream} ${styles.lmReveal}`}
            style={{
              padding: "clamp(2.55rem, 6vw, 4.25rem) 0",
            }}
          >
            <div className={styles.lmInner}>
            <h2
              className={styles.lmTitle}
              style={{
                margin: 0,
                fontSize: "clamp(1.84rem, 4vw, 3.95rem)",
                fontWeight: 600,
                lineHeight: 1.12,
                letterSpacing: "-0.05em",
                color: "#10243d",
              }}
            >
              L&apos;aventure continue
            </h2>
            <div className={styles.lmTitleRule} aria-hidden="true" />

            <div
              className={styles.lmTextBlock}
              style={{
                marginTop: "1.15rem",
                fontSize: "clamp(1.02rem, 1.65vw, 1.2rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>Aujourd&apos;hui encore, cette aventure continue chaque jour.</p>
              <p style={{ margin: "0.9rem 0 0" }}>CoolGuide est développé à deux, entre le Gard et le Morbihan. Deux régions très différentes, mais qui ont un point commun : elles sont riches d&apos;un patrimoine exceptionnel et rappellent chaque jour pourquoi ce projet est né.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Une grande partie de nos idées naît au fil de nos promenades, de nos voyages et de nos visites. Nous observons ce qui fonctionne, ce qui manque encore, les questions que se posent les voyageurs et toutes ces petites situations que l&apos;on ne remarque vraiment que lorsque l&apos;on prend le temps de découvrir un lieu.</p>
            </div>

            <div
              className={styles.lmTextBlock}
              style={{
                marginTop: "1.5rem",
                display: "grid",
                gap: "0.85rem",
                fontSize: "clamp(1.02rem, 1.55vw, 1.12rem)",
                lineHeight: 1.7,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>Chaque nouvelle ville, chaque monument et chaque itinéraire sont l&apos;occasion d&apos;améliorer l&apos;application. Nous continuons à enrichir les contenus, à développer de nouvelles fonctionnalités et à rendre l&apos;expérience toujours plus simple, afin que chacun puisse découvrir le patrimoine dans les meilleures conditions.</p>
              <p style={{ margin: 0 }}>Nous savons que CoolGuide évoluera encore longtemps. Il reste tant de villes à explorer, tant de villages à raconter et tant d&apos;histoires à faire découvrir.</p>
              <p style={{ margin: 0 }}>Et c&apos;est probablement ce qui nous motive le plus.</p>
              <p style={{ margin: 0 }}>Parce qu&apos;au fond, nous n&apos;avons jamais eu l&apos;ambition de créer l&apos;application la plus impressionnante.</p>
              <p style={{ margin: 0 }}>Nous voulons simplement créer celle que nous aurions aimé emporter avec nous à chacun de nos voyages.</p>
            </div>
            </div>
          </section>

          <figure className={`${styles.lmPhotoWrap} ${styles.lmReveal}`}>
            <div className={styles.lmInner}>
            <img
              className={styles.lmPhoto}
              src="/monde-coolguide/audioguide-carrieres-ocres-roussillon.jpg"
              alt=""
              loading="lazy"
            />
            </div>
          </figure>

          <section
            className={`${styles.lmSection} ${styles.lmWhite} ${styles.lmCreamToWhite} ${styles.lmWhiteToCreamFooter} ${styles.lmReveal}`}
            style={{
              padding: "clamp(2.55rem, 6vw, 4.25rem) 0 0",
            }}
          >
            <div className={styles.lmInner}>
            <p
              className={styles.lmTitle}
              style={{
                margin: 0,
                fontSize: "clamp(1.08rem, 1.7vw, 1.5rem)",
                lineHeight: 1.4,
                color: "#10243d",
                fontWeight: 600,
              }}
            >
              Notre conviction
            </p>
            <div className={styles.lmTitleRule} aria-hidden="true" />

            <div
              className={styles.lmTextBlock}
              style={{
                margin: "1.5rem 0 0",
                fontSize: "clamp(1.08rem, 1.75vw, 1.26rem)",
                lineHeight: 1.85,
                color: "#3f362f",
              }}
            >
              <p style={{ margin: 0 }}>Au fil de cette aventure, une chose n&apos;a jamais changé.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Nous sommes convaincus que le patrimoine ne prend tout son sens que lorsqu&apos;il est compris, écouté et partagé. Derrière chaque monument, chaque village et chaque paysage se cache une histoire qui mérite d&apos;être transmise.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Nous n&apos;avons pas créé CoolGuide pour que les voyageurs passent davantage de temps devant leur téléphone.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Nous l&apos;avons créé pour qu&apos;ils lèvent les yeux, prennent le temps d&apos;observer et redécouvrent le plaisir d&apos;écouter l&apos;histoire des lieux qui les entourent.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Parce que nous croyons que le monde est déjà extraordinaire.</p>
              <p style={{ margin: "0.9rem 0 0" }}>Il suffit parfois d&apos;apprendre à le regarder autrement.</p>
            </div>

            <div className={styles.lmSignature}>
              <p className={styles.lmSignatureLead}>Merci d&apos;avoir pris le temps de découvrir notre histoire.</p>
              <p className={styles.lmSignatureNames}>Arnaud &amp; Laurent Caron</p>
              <p className={styles.lmSignatureText}>Deux frères à l&apos;origine de CoolGuide.</p>
              <p className={styles.lmSignatureText}>À bientôt sur les routes du patrimoine.</p>
            </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}