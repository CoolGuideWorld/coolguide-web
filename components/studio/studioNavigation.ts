export type StudioNavItemConfig = {
  href: string;
  label: string;
};

export const studioMainNav: StudioNavItemConfig[] = [
  { href: "/studio", label: "Tableau de bord" },
  { href: "/studio/brain", label: "Brain" },
  { href: "/studio/reseau", label: "Réseau" },
  { href: "/studio/circuits", label: "Circuits" },
  { href: "/studio/destinations", label: "Destinations" },
  { href: "/studio/poi", label: "Points d'intérêt" },
  { href: "/studio/production", label: "Production" },
  { href: "/studio/statistiques", label: "Statistiques" },
];

export const studioAdminNav: StudioNavItemConfig[] = [
  { href: "/studio/administration", label: "Administration" },
];
