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
          <h2
            style={{
              maxWidth: "22ch",
              fontSize: "clamp(1.5rem, 3vw, 2.65rem)",
              lineHeight: 1.05,
              marginBottom: "clamp(1.2rem, 2.4vh, 1.65rem)",
            }}
          >
            Êtes-vous déjà passé devant un lieu sans savoir ce qu'il avait à raconter ?
          </h2>
          <p style={{ maxWidth: "620px", marginBottom: "clamp(0.95rem, 2vh, 1.35rem)" }}>
            Les histoires sont souvent invisibles, éparpillées et parfois racontées dans une langue que l'on ne comprend pas.
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
