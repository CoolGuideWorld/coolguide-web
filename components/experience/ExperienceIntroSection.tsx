import Image from "next/image";

export default function ExperienceIntroSection() {
  return (
    <section
      className="whyCoolGuide"
      style={{
        marginTop: 0,
        paddingTop: "calc(var(--header-height, 76px) + clamp(0.8rem, 1.8vh, 1.2rem))",
        paddingBottom: "clamp(1.2rem, 2.4vh, 1.8rem)",
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
          gap: "clamp(1.4rem, 3vw, 2.8rem)",
          alignItems: "center",
          minHeight: "clamp(420px, 58svh, 600px)",
        }}
      >
        <div
          style={{
            maxWidth: "740px",
          }}
        >
          <p
            className="whyCoolGuideKicker"
            style={{
              marginBottom: "clamp(1.25rem, 2.2vh, 1.75rem)",
            }}
          >
            LE VOYAGE COMMENCE ICI
          </p>
          <h2
            style={{
              maxWidth: "24ch",
              marginBottom: "clamp(1.75rem, 3.4vh, 2.25rem)",
            }}
          >
            Êtes-vous déjà passé devant un lieu sans savoir ce qu'il avait à raconter ?
          </h2>
          <p style={{ maxWidth: "620px", marginBottom: "clamp(1.35rem, 2.8vh, 1.85rem)" }}>
            Les histoires sont souvent invisibles, éparpillées et parfois racontées dans une langue que l'on ne comprend pas.
          </p>
          <p style={{ maxWidth: "620px", marginTop: 0 }}>
            CoolGuide les rend enfin accessibles.
          </p>
        </div>

        <div
          aria-hidden="true"
          style={{
            justifySelf: "end",
            width: "100%",
            maxWidth: "clamp(375px, 31.5vw, 488px)",
            minWidth: 0,
          }}
        >
          <Image
            src="/images/gardiens/experience/intro-traveler-rome.jpg"
            alt=""
            width={1200}
            height={1800}
            priority
            sizes="(max-width: 900px) 100vw, (max-width: 1400px) 31.5vw, 488px"
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
