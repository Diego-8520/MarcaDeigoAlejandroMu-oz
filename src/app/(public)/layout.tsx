import { AudienceProvider } from "@/components/layout/audience-context";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { GridOverlay } from "@/components/site/grid-overlay";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AudienceProvider>
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
