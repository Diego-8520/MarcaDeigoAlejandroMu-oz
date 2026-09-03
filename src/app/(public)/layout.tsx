import { SiteRail } from "@/components/layout/site-rail";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:pl-60">
      <SiteRail />
      <main>{children}</main>
    </div>
  );
}
