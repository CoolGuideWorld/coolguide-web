import Image from "next/image";

export default function AppRevealSection() {
  return (
    <section className="appReveal">
      <div className="appRevealLead">
        <h2>Et si ces histoires vous accompagnaient partout où vous voyagez ?</h2>
      </div>

      <div className="appRevealVisualWrap">
        <div className="appRevealVisual">
          <Image
            src="/reveal/experience-reveal.jpg"
            alt="Voyageuse vivant l'expérience CoolGuide"
            fill
            sizes="(max-width: 900px) calc(100vw - 2.5rem), min(90vw, 1560px)"
            className="appRevealVisualImage"
          />
        </div>
      </div>

      <div className="appRevealClosing">
        <p>CoolGuide les raconte au bon moment.</p>
      </div>
    </section>
  );
}
