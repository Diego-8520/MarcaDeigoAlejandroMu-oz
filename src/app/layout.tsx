import type { Metadata } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { graph, personRef, websiteNode } from "@/lib/schema";
import { JsonLd } from "@/components/seo/json-ld";

// Las tres familias aparecen en la primera pantalla (titular, rol en serif,
// datos en mono), así que las tres se precargan: medido con Lighthouse móvil,
// quitar la precarga de serif y mono subía el FCP ~0,4 s y causaba CLS por el
// cambio de fuente. Lo que sí se recorta son estilos y pesos sin uso.
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
  // En el sitio solo aparece en cursiva (acentos de titulares, citas, capitulares).
  style: "italic",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  // Pesos realmente usados en etiquetas y datos.
  weight: ["400", "500"],
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
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  // Sin canonical ni og:url aquí: cada página declara los suyos (pageMetadata).
  // Un canonical en el layout raíz lo heredarían todas las rutas.
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

// En todas las páginas: el sitio y una referencia a su autor. Cada página
// añade su propio grafo (perfil, servicios, caso de estudio, migas).
const jsonLd = graph(websiteNode(), personRef());

// Google Tag Manager se carga en src/app/(public)/layout.tsx, no aquí,
// para que panel y login no envíen datos a GA4.

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
        <JsonLd data={jsonLd} />
        {children}
      </body>
    </html>
  );
}
