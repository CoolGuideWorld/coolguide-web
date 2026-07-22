export type CityHeroData = {
  name: string;
  location: string;
  tagline: string;
  imageSrc: string;
  imageAlt: string;
};

export type CityStatItem = {
  key: string;
  label: string;
  value: string;
  detail?: string;
};

export type CityBadgeItem = {
  emoji: string;
  label: string;
};

export type CityHighlightItem = {
  name: string;
  category: string;
  duration: string;
  imageSrc: string;
  imageAlt: string;
  hasAudioguide: boolean;
};

export type CityPracticalItem = {
  title: string;
  answer: string;
};

export type CityItineraryItem = {
  title: string;
  duration: string;
  summary: string;
  stops: string[];
};

export type CityFaqItem = {
  question: string;
  answer: string;
};

export type CityCTAData = {
  title: string;
  text: string;
  linkLabel: string;
  linkHref: string;
};

export type CityNearbyDestinationItem = {
  slug: string;
  name: string;
  href: string;
  distance: string | null;
  image: string | null;
  administrativeArea?: string | null;
};

export type CityPageData = {
  hero: CityHeroData;
  stats: CityStatItem[];
  badges: CityBadgeItem[];
  highlights: CityHighlightItem[];
  nearbyDestinations: CityNearbyDestinationItem[];
  practical: CityPracticalItem[];
  itineraries: CityItineraryItem[];
  faq: CityFaqItem[];
  cta: CityCTAData;
};

export const nimesCityData: CityPageData = {
  hero: {
    name: "Nimes",
    location: "Occitanie • France",
    tagline: "La ville romaine la mieux conservee de France.",
    imageSrc: "/world/02-arenes-nimes.jpg",
    imageAlt: "Vue des arenes de Nimes au coucher du soleil",
  },
  stats: [
    { key: "population", label: "Population", value: "149 633", detail: "Insee 2021" },
    { key: "places", label: "Nombre de lieux", value: "42", detail: "Monuments et points d'interet" },
    { key: "audioguides", label: "Audioguides", value: "36", detail: "Disponible dans l'app" },
    { key: "languages", label: "Langues", value: "FR • EN • ES", detail: "Extension en cours" },
    { key: "ideal-duration", label: "Duree ideale", value: "2 jours", detail: "Version complete" },
    { key: "best-period", label: "Meilleure periode", value: "Avril a octobre", detail: "Lumiere et festivals" },
  ],
  badges: [
    { emoji: "🏛", label: "Ville romaine" },
    { emoji: "👨‍👩‍👧", label: "Famille" },
    { emoji: "🚶", label: "Accessible a pied" },
    { emoji: "🍷", label: "Gastronomie" },
    { emoji: "🎭", label: "Festivals" },
    { emoji: "🏺", label: "Patrimoine" },
  ],
  highlights: [
    {
      name: "Arenes de Nimes",
      category: "Monument romain",
      duration: "1 h 30",
      imageSrc: "/world/02-arenes-nimes.jpg",
      imageAlt: "Facade des arenes de Nimes",
      hasAudioguide: true,
    },
    {
      name: "Maison Carree",
      category: "Temple antique",
      duration: "45 min",
      imageSrc: "/hero/hero-03-past.jpg",
      imageAlt: "Colonnades et architecture antique",
      hasAudioguide: true,
    },
    {
      name: "Jardins de la Fontaine",
      category: "Parc historique",
      duration: "1 h",
      imageSrc: "/hero/hero-06-bridge.jpg",
      imageAlt: "Promenade verdoyante et bassin",
      hasAudioguide: true,
    },
    {
      name: "Tour Magne",
      category: "Point de vue",
      duration: "50 min",
      imageSrc: "/world/03-vannes.jpg",
      imageAlt: "Tour dominante sur la ville",
      hasAudioguide: false,
    },
    {
      name: "Musee de la Romanite",
      category: "Musee",
      duration: "1 h 30",
      imageSrc: "/world/04-grece.jpg",
      imageAlt: "Espace museal contemporain",
      hasAudioguide: true,
    },
    {
      name: "Ecusson et halles",
      category: "Centre ancien",
      duration: "1 h",
      imageSrc: "/world/08-tour-eiffel.jpg",
      imageAlt: "Ruelles animees en centre-ville",
      hasAudioguide: false,
    },
  ],
  nearbyDestinations: [],
  practical: [
    {
      title: "Quand venir",
      answer: "Le printemps et l'automne offrent la meilleure lumiere et une frequentation plus douce.",
    },
    {
      title: "Ou se garer",
      answer: "Visez les parkings relais autour du centre puis rejoignez les sites majeurs a pied.",
    },
    {
      title: "Comment se deplacer",
      answer: "Le coeur historique se parcourt facilement a pied; prevoir de bonnes chaussures.",
    },
    {
      title: "Avec des enfants",
      answer: "Commencez par les arenes, alternez avec les jardins et prevoyez des pauses fraiches.",
    },
    {
      title: "Que faire gratuitement",
      answer: "Explorer l'Ecusson, les places historiques et les points de vue des Jardins de la Fontaine.",
    },
    {
      title: "Que faire quand il pleut",
      answer: "Privilegier les musees et les halles, puis reprendre les parcours exterieurs entre deux averses.",
    },
  ],
  itineraries: [
    {
      title: "Une demi-journee",
      duration: "3 a 4 heures",
      summary: "Un concentré romain et un point de vue pour capter l'essentiel.",
      stops: ["Arenes", "Maison Carree", "Pause cafe en centre ancien"],
    },
    {
      title: "Une journee",
      duration: "7 a 8 heures",
      summary: "L'itineraire ideal pour equilibrer patrimoine, respiration et vie locale.",
      stops: ["Arenes", "Musee de la Romanite", "Jardins de la Fontaine", "Tour Magne"],
    },
    {
      title: "Deux jours",
      duration: "Week-end complet",
      summary: "Approfondir les lieux majeurs et prendre le temps de l'atmosphere nimoise.",
      stops: ["Jour 1: coeur romain", "Jour 2: quartiers, halles, experiences culturelles"],
    },
  ],
  faq: [
    {
      question: "Nimes se visite-t-elle facilement sans voiture ?",
      answer: "Oui. Les principaux incontournables sont proches les uns des autres et accessibles a pied.",
    },
    {
      question: "Combien de temps prevoir pour une premiere visite ?",
      answer: "Une journee permet de voir l'essentiel, deux jours offrent une experience plus sereine et complete.",
    },
    {
      question: "Les monuments sont-ils adaptes aux familles ?",
      answer: "Oui, surtout les Arenes et les Jardins de la Fontaine. Alternez visites et temps de pause.",
    },
    {
      question: "Quelle est la meilleure saison ?",
      answer: "Avril a juin puis septembre-octobre pour profiter de temperatures agreables et d'une belle lumiere.",
    },
    {
      question: "Y a-t-il assez de choses a faire en cas de pluie ?",
      answer: "Oui, entre musees, halles et espaces couverts, la visite reste riche meme par temps humide.",
    },
  ],
  cta: {
    title: "CoolGuide dans votre poche",
    text: "Retrouvez les lieux, les audioguides et les parcours de Nimes dans l'application, au rythme de votre visite.",
    linkLabel: "Voir l'univers CoolGuide",
    linkHref: "/le-monde-coolguide",
  },
};
