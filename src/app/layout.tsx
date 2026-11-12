import type { Metadata } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import {
  HOME_DESCRIPTION,
  HOME_OG_DESCRIPTION,
  HOME_OG_TITLE,
  HOME_TITLE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
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
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  // Sin canonical ni og:url aquí: cada página declara los suyos (pageMetadata).
  // Un canonical en el layout raíz lo heredarían todas las rutas.
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: HOME_OG_TITLE,
    description: HOME_OG_DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      "name": "Diego Alejandro Muñoz Arcos",
      "alternateName": "Diego Muñoz",
      "jobTitle": "Software Developer",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cali",
        "addressRegion": "Valle del Cauca",
        "addressCountry": "CO",
      },
      "url": SITE_URL,
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
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "Diego Alejandro Muñoz — Software Developer",
      "publisher": {
        "@id": `${SITE_URL}/#person`,
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
