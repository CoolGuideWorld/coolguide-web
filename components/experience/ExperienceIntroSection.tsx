import Image from "next/image";

export default function ExperienceIntroSection() {
  return (
    <section
      className="whyCoolGuide"
      style={{
        marginTop: 0,
        paddingTop: "calc(var(--header-height, 76px) + clamp(0.55rem, 1.2vh, 0.85rem))",
        paddingBottom: "clamp(0.85rem, 1.6vh, 1.25rem)",
      }}
    >
      <div
        className="whyCoolGuideInner"
        style={{
          width: "100%",
          maxWidth: "1260px",
          margin: "0 auto",
          paddingInline: "clamp(1rem, 4vw, 3rem)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
          gap: "clamp(1rem, 2.1vw, 2.1rem)",
          alignItems: "center",
          minHeight: "clamp(330px, 46svh, 470px)",
        }}
      >
        <div
          style={{
            maxWidth: "680px",
          }}
        >
          <p
            className="whyCoolGuideKicker"
            style={{
              marginBottom: "clamp(0.9rem, 1.7vh, 1.25rem)",
            }}
          >
            LE VOYAGE COMMENCE ICI
          </p>
          <h1
            style={{
              maxWidth: "22ch",
              fontSize: "clamp(1.5rem, 3vw, 2.65rem)",
              lineHeight: 1.05,
              marginBottom: "clamp(1.2rem, 2.4vh, 1.65rem)",
            }}
          >
            L’application qui raconte les lieux autour de vous
          </h1>
          <p
            style={{
              maxWidth: "24ch",
              fontSize: "clamp(1.2rem, 2.35vw, 2rem)",
              lineHeight: 1.1,
              margin: "0 0 clamp(1.05rem, 2vh, 1.4rem)",
              color: "#1f1a17",
            }}
          >
            Êtes-vous déjà passé devant un lieu sans savoir ce qu&apos;il avait à raconter ?
          </p>
          <p style={{ maxWidth: "620px", marginBottom: "clamp(0.95rem, 2vh, 1.35rem)" }}>
            Une application de découverte audio qui raconte automatiquement les lieux autour de vous, à pied comme en voiture.
          </p>
          <p style={{ maxWidth: "620px", marginTop: "clamp(0.65rem, 1.2vh, 0.9rem)" }}>
            CoolGuide les rend enfin accessibles.
          </p>
        </div>

        <div
          aria-hidden="true"
          style={{
            justifySelf: "end",
            width: "100%",
            maxWidth: "clamp(300px, 25vw, 380px)",
            minWidth: 0,
          }}
        >
          <Image
            src="/images/gardiens/experience/intro-traveler-rome.jpg"
            alt=""
            width={1200}
            height={1800}
            priority
            sizes="(max-width: 900px) 100vw, (max-width: 1400px) 25vw, 380px"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "18px",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </section>
  );
}
