import Image from "next/image";

const worldJourney = [
  {
    image: "/world/01-carcassonne.jpg",
    title: "Remonter le temps.",
    place: "Carcassonne",
  },
  {
    image: "/world/02-arenes-nimes.jpg",
    title: "Comprendre.",
    place: "Les Arènes de Nîmes",
  },
  {
    image: "/world/03-vannes.jpg",
    title: "Flâner.",
    place: "Vannes",
  },
  {
    image: "/world/04-grece.jpg",
    title: "S’imprégner.",
    place: "Îles grecques",
  },
  {
    image: "/world/05-debarquement.jpg",
    title: "Se souvenir.",
    place: "Plages du Débarquement",
  },
  {
    image: "/world/06-stonehenge.jpg",
    title: "S’interroger.",
    place: "Stonehenge",
  },
  {
    image: "/world/07-pyramides.jpg",
    title: "S’émerveiller.",
    place: "Pyramides de Gizeh",
  },
  {
    image: "/world/08-tour-eiffel.jpg",
    title: "Lever les yeux.",
    place: "Tour Eiffel",
  },
];

export default function WorldJourneySection() {
  return (
    <section className="worldJourney" id="discover">
      <div className="worldJourneyHeader">
        <p>LE MONDE VOUS ATTEND</p>
        <h2>Partout, des histoires prennent vie.</h2>
      </div>

      {worldJourney.map((item) => (
        <article className="worldCard" key={item.image}>
          <Image
            src={item.image}
            alt={item.place}
            fill
            className="worldImage"
          />

          <div className="worldOverlay" />

          <div className="worldContent">
            <p className="worldPlace">{item.place}</p>

            <h3 className="worldEmotion">{item.title}</h3>
          </div>
        </article>
      ))}
    </section>
  );
}
