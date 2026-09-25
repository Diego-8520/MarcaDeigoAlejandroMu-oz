import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Work_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://diegoalejandromunoz.com",
  ),
  title: {
    default: "Diego Alejandro Muñoz — Software Developer · Web & Automatización",
    template: "%s | Diego Alejandro Muñoz",
  },
  description:
    "Desarrollador de software en Cali, Colombia. Construyo aplicaciones web con Next.js, React, TypeScript y C# .NET, bases de datos PostgreSQL y automatizaciones prácticas.",
  keywords: [
    "Diego Alejandro Muñoz",
    "Software Developer",
    "Next.js",
    "React",
    "TypeScript",
    "C# .NET",
    "PostgreSQL",
    "Supabase",
    "Automatización",
    "Cali Colombia",
  ],
  authors: [{ name: "Diego Alejandro Muñoz", url: "https://diegoalejandromunoz.com" }],
  creator: "Diego Alejandro Muñoz",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://diegoalejandromunoz.com",
    title: "Diego Alejandro Muñoz — Software Developer",
    description:
      "Desarrollador de software en Cali, Colombia. Construcción de aplicaciones web completas, herramientas a medida y automatización de procesos.",
    siteName: "Diego Alejandro Muñoz",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://diegoalejandromunoz.com/#person",
      "name": "Diego Alejandro Muñoz Arcos",
      "alternateName": "Diego Muñoz",
      "jobTitle": "Software Developer",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cali",
        "addressRegion": "Valle del Cauca",
        "addressCountry": "CO",
      },
      "url": "https://diegoalejandromunoz.com",
      "sameAs": [
        "https://github.com/Diego-8520",
        "https://www.linkedin.com/in/dalejandromunoz",
      ],
      "knowsAbout": [
        "Software Engineering",
        "Next.js",
        "React",
        "TypeScript",
        "C#",
        ".NET",
        "PostgreSQL",
        "Supabase",
        "Process Automation",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://diegoalejandromunoz.com/#website",
      "url": "https://diegoalejandromunoz.com",
      "name": "Diego Alejandro Muñoz — Software Developer",
      "publisher": {
        "@id": "https://diegoalejandromunoz.com/#person",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${plexMono.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
