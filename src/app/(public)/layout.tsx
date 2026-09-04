import { SiteRail } from "@/components/layout/site-rail";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:pl-60">
      <PageViewTracker />
      <SiteRail />
      <main>{children}</main>
    </div>
  );
}
