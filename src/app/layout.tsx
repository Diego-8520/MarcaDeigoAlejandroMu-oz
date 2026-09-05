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
  title: "Diego Alejandro Muñoz — Software Engineer · AI · Automation",
  description:
    "Construyo productos digitales, soluciones con IA y automatizaciones que resuelven problemas reales.",
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
