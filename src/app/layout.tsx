import type { Metadata } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
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

// GA4 (G-2QBM904L7R) se configura dentro del contenedor de GTM: no se añade
// gtag.js ni el ID de medición aquí para no duplicar page views.
const GTM_ID = "GTM-TBMRZW9Z";
// Solo producción de Vercel, para no mezclar tráfico de local y previews en GA4.
// Para probar en local: GTM_ENABLED=true en .env.local.
const gtmEnabled = process.env.VERCEL_ENV === "production" || process.env.GTM_ENABLED === "true";

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
      {gtmEnabled && <GoogleTagManager gtmId={GTM_ID} />}
      <body className="min-h-full bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
