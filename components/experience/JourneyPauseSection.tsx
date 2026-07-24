import Image from "next/image";

export default function JourneyPauseSection() {
  return (
    <section className="journeyPause respirationSection">
      <div className="journeyPauseImageLayer">
        <Image
          src="/hero/hero-06-bridge.jpg"
          alt=""
          fill
          className="journeyPauseImage"
        />
      </div>

      <div className="journeyPauseContent">
        <p>{"Prenez le temps.\nLe monde vous le rendra."}</p>
      </div>
    </section>
  );
}
