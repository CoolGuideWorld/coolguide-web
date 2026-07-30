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
  metadataBase: new URL("https://coolguideworld.com"),
  title: {
    default: "CoolGuide World",
    template: "%s | CoolGuide World",
  },
  description:
    "Découvrez des destinations, des histoires et des expériences culturelles avec CoolGuide.",
  alternates: {
    canonical: "/",
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
    "@id": "https://coolguideworld.com/#organization",
    name: "CoolGuide",
    alternateName: "CoolGuide World",
    url: "https://coolguideworld.com",
    logo: {
      "@type": "ImageObject",
      "@id": "https://coolguideworld.com/#logo",
      url: "https://coolguideworld.com/logo/coolguide-logo.png",
      contentUrl: "https://coolguideworld.com/logo/coolguide-logo.png",
      caption: "CoolGuide",
    },
    email: "mailto:contact.coolguide@gmail.com",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://coolguideworld.com/#website",
    url: "https://coolguideworld.com",
    name: "CoolGuide World",
    alternateName: "CoolGuide",
    inLanguage: "fr-FR",
    publisher: {
      "@id": "https://coolguideworld.com/#organization",
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