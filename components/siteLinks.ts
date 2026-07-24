export const STUDIO_URL = "https://studio.coolguideworld.com";

export type HeaderLink = {
  href: string;
  label: string;
};

export type HeaderDropdownConfig = {
  label: string;
  href: string;
  allowDirectNavigation: boolean;
};

export const headerLinks = [
  { href: "/#discover", label: "Découvrir" },
  { href: "/experience", label: "Expérience" },
  { href: "/destinations", label: "Destinations" },
] satisfies HeaderLink[];

export const coolGuideWorldLinks = [
  { href: "/le-monde-coolguide", label: "Le Monde CoolGuide" },
  {
    href: "/le-monde-coolguide/gardiens-du-patrimoine",
    label: "Les Gardiens du Patrimoine",
  },
] satisfies HeaderLink[];

export const coolGuideWorldDropdownConfig = {
  label: "Le Monde CoolGuide",
  href: "/le-monde-coolguide",
  allowDirectNavigation: true,
} satisfies HeaderDropdownConfig;

export const footerLinks = [
  { href: "/le-monde-coolguide", label: "Le Monde CoolGuide" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/contact", label: "Contact" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
  { href: "/cgv", label: "CGV" },
  { href: STUDIO_URL, label: "Accès Studio" },
];

export const socialLinks = [
  { href: "https://www.instagram.com", label: "Instagram", shortLabel: "IG" },
  { href: "https://www.facebook.com", label: "Facebook", shortLabel: "FB" },
  { href: "https://www.linkedin.com", label: "LinkedIn", shortLabel: "IN" },
];