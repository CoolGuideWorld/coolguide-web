import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.coolguideworld.com"),

  title: {
    default: "CoolGuide World",
    template: "%s | CoolGuide World",
  },

  description:
    "Découvrez le monde grâce à des audioguides géolocalisés, des histoires et des itinéraires culturels dans votre langue.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "CoolGuide World",
    title: "CoolGuide World",
    description:
      "Découvrez le monde grâce à des audioguides géolocalisés, des histoires et des itinéraires culturels dans votre langue.",

    images: [
      {
        url: "/og/coolguide-world.jpg",
        width: 1200,
        height: 630,
        alt: "CoolGuide World",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CoolGuide World",
    description:
      "Découvrez le monde grâce à des audioguides géolocalisés, des histoires et des itinéraires culturels dans votre langue.",

    images: ["/og/coolguide-world.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.coolguideworld.com/#organization",
    name: "CoolGuide",
    alternateName: "CoolGuide World",
    url: "https://www.coolguideworld.com",
    description:
      "CoolGuide est une application gratuite de découverte du patrimoine proposant des guides audio géolocalisés en 7 langues, des itinéraires de voyage et des contenus culturels pour explorer les destinations à pied ou en voiture.",
    logo: {
      "@type": "ImageObject",
      "@id": "https://www.coolguideworld.com/#logo",
      url: "https://www.coolguideworld.com/logo/coolguide-logo.png",
      contentUrl: "https://www.coolguideworld.com/logo/coolguide-logo.png",
      caption: "CoolGuide",
    },
    email: "mailto:contact.coolguide@gmail.com",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.coolguideworld.com/#website",
    url: "https://www.coolguideworld.com",
    name: "CoolGuide World",
    alternateName: "CoolGuide",
    inLanguage: "fr-FR",
    publisher: {
      "@id": "https://www.coolguideworld.com/#organization",
    },
  };

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(organizationJsonLd),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(websiteJsonLd),
          }}
        />

        {children}
      </body>
    </html>
  );
}