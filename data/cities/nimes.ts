import type { CityPageData } from "@/types/city";

export const nimesCityData = {
  hero: {
    name: "Nimes",
    location: "Occitanie • France",
    tagline: "La ville romaine la mieux conservee de France.",
    imageAlt: "Vue des arenes de Nimes au coucher du soleil",
  },
  shortDescription: null,
  introduction: null,
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
      content: "Arenes\nMaison Carree\nPause cafe en centre ancien",
    },
    {
      title: "Une journee",
      duration: "7 a 8 heures",
      summary: "L'itineraire ideal pour equilibrer patrimoine, respiration et vie locale.",
      content: "Arenes\nMusee de la Romanite\nJardins de la Fontaine\nTour Magne",
    },
    {
      title: "Deux jours",
      duration: "Week-end complet",
      summary: "Approfondir les lieux majeurs et prendre le temps de l'atmosphere nimoise.",
      content: "Jour 1: coeur romain\nJour 2: quartiers, halles, experiences culturelles",
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
} satisfies Omit<
  CityPageData,
  "cta" | "nearbyDestinations" | "badges" | "stats" | "hero" | "highlights"
> & {
  hero: Omit<CityPageData["hero"], "imageSrc">;
};
