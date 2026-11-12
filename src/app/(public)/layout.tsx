import { GoogleTagManager } from "@next/third-parties/google";
import { AudienceProvider } from "@/components/layout/audience-context";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { GridOverlay } from "@/components/site/grid-overlay";

// GTM solo en el sitio público: panel y login (fuera de este grupo de rutas)
// no lo cargan, así GA4 no recibe tráfico administrativo. GA4 (G-2QBM904L7R)
// se configura dentro del contenedor; aquí no va gtag.js ni el ID de medición.
const GTM_ID = "GTM-TBMRZW9Z";
// Solo producción de Vercel, para no mezclar tráfico local y de previews.
// Para probar en local: GTM_ENABLED=true.
const gtmEnabled = process.env.VERCEL_ENV === "production" || process.env.GTM_ENABLED === "true";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AudienceProvider>
      {gtmEnabled && <GoogleTagManager gtmId={GTM_ID} />}
      <MotionProvider>
        <div className="flex min-h-[100dvh] flex-col bg-paper text-ink">
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
        </div>
        <div aria-hidden="true" className="grain" />
        <GridOverlay />
      </MotionProvider>
    </AudienceProvider>
  );
}
