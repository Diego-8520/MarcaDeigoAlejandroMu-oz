import type { Metadata } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Activa el modo de movimiento antes del primer pintado. Sin JS o con
// prefers-reduced-motion el contenido queda visible y estático.
const motionBootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-motion')}var a=sessionStorage.getItem('audience_mode');if(a==='recruiter'||a==='client'){d.dataset.audience=a}}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://diegoalejandromunoz.com",
  ),
  title: {
    default: "Diego Alejandro Muñoz — Software Developer · Web & Automatización",
    template: "%s | Diego Alejandro Muñoz",
  },
  description:
    "Software Developer en Cali, Colombia. Desarrollo aplicaciones web, paneles administrativos e integraciones con Next.js, React, TypeScript y Supabase/PostgreSQL.",
  keywords: [
    "Diego Alejandro Muñoz",
    "Software Developer",
    "Next.js",
    "React",
    "TypeScript",
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
    title: "Diego Alejandro Muñoz — Software Developer · Next.js & TypeScript",
    description:
      "Desarrollador de software en Cali, Colombia. Aplicaciones web funcionales, paneles administrativos, datos consistentes e integraciones prácticas.",
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
      className={`${archivo.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
      data-audience="all"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
      </head>
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
