import { SiteRail } from "@/components/layout/site-rail";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { AudienceProvider } from "@/components/layout/audience-context";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AudienceProvider>
      <div className="min-h-screen bg-paper text-ink selection:bg-signal/30 lg:pl-64">
        <PageViewTracker />
        <SiteRail />
        <main id="main" className="min-h-screen">
          {children}
        </main>
      </div>
    </AudienceProvider>
  );
}
